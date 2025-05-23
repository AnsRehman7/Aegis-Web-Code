import React, { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";



// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjHP2qALv87W-vdQyOVg9x-wTMPW7peok",
  authDomain: "aegis-parental-app.firebaseapp.com",
  databaseURL: "https://aegis-parental-app-default-rtdb.firebaseio.com",
  projectId: "aegis-parental-app",
  storageBucket: "aegis-parental-app.appspot.com",
  messagingSenderId: "199289602949",
  appId: "1:199289602949:web:6b30b6e5cf9f3d370d7aec",
};

const firebaseApp = initializeApp(firebaseConfig);
export const firebaseauth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const realtimeDB = getDatabase(firebaseApp);

const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

export const saveCodeToFirestore = async (parentId, qrCode, fourDigitCode) => {
  try {
    if (!parentId) {
      console.error("No parentId available");
      return null;
    }

    const pairingData = {
      qrCode,
      fourDigitCode,
      paired: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    };

    const docRef = await addDoc(
      collection(firestore, "users", parentId, "pairingCodes"),
      pairingData
    );

    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const  setupRealtimeScreenTimeListener = (childId, callback) => {
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(firestore, "Children", childId, "screenTime", today);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const getScreenTimeData = async (childId) => {
  try {
    const docRef = doc(firestore, "Children", childId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error getting screen time data:", error);
    throw error;
  }
};

export const setDailyScreenTimeLimit = async (childId, dailyLimitMinutes = null, unlockCode = null) => {
  try {
    const childRef = doc(firestore, "Children", childId);
    const updateData = {};

    if (dailyLimitMinutes !== null) {
      updateData.dailyLimitMinutes = dailyLimitMinutes;
    }

    if (unlockCode !== null) {
      updateData.unlockCode = unlockCode;
    }

    await updateDoc(childRef, updateData);
    return true;
  } catch (error) {
    console.error("Error setting screen time limit:", error);
    throw error;
  }
};

//content filtering

export const addUrlToFirestore = async (userId, url) => {
    const normalizedUrl = url
        .replace(/^https?:\/\/(www\.)?/, '')
        .replace(/\./g, '_')
        .replace(/\//g, '_')
        .toLowerCase();
    
    const urlRef = doc(firestore, "users", userId, "blockedUrls", normalizedUrl);
    await setDoc(urlRef, {
        host: normalizedUrl, // Store both ID and host field
        patterns: ["*"],
        updatedAt: new Date()
    });
};

export const removeUrlFromFirestore = async (userId, url) => {
  try {
    const normalizedUrl = url.toLowerCase().trim();
    const urlRef = doc(firestore, "users", userId, "blockedUrls", normalizedUrl);
    await deleteDoc(urlRef);
  } catch (error) {
    console.error("Error removing URL: ", error);
    throw error;
  }
};

//Location tracking

export const listenToLiveLocation = (childId, callback) => {
  if (!childId || typeof callback !== "function") {
    console.error("Invalid childId or callback");
    return;
  }
  
  const locationRef = dbRef(realtimeDB, `liveLocation/${childId}`);
  return onValue(locationRef, 
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback({
          lat: data.latitude,
          lng: data.longitude,
          timestamp: data.timestamp,
        });
      } else {
        console.log("No data available at this location");
      }
    },
    (error) => {
      console.error("Error listening to location:", error);
    }
  );
};


export const FirebaseProvider = ({ children }) => {
  const loginWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(firebaseauth, email, password);
  };

  const registerWithEmailAndPassword = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseauth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      await setDoc(doc(firestore, "users", userId), {
        username,
        email,
      });

      return userCredential;
    } catch (error) {
      console.error("Error during user registration:", error);
      throw error;
    }
  };

  const listenForPairedChildren = (parentId, callback) => {
    if (!parentId || typeof callback !== "function") {
      console.error("Invalid parentId or callback");
      return () => { };
    }

    const pairedChildrenRef = collection(
      firestore,
      "users",
      parentId,
      "pairedChildren"
    );

    return onSnapshot(pairedChildrenRef, async (snapshot) => {
      try {
        if (snapshot.empty) {
          callback([]);
          return;
        }

        const children = [];
        for (const childDoc of snapshot.docs) {
          const childData = childDoc.data();
          const childId = childDoc.id;

          const childDocRef = doc(firestore, "Children", childId);
          const childSnap = await getDoc(childDocRef);

          if (childSnap.exists()) {
            const childDetails = childSnap.data();
            children.push({
              id: childId,
              name: childDetails.name || childData.name || `Child ${childId.slice(0, 4)}`,
              ...childData,
              ...childDetails
            });
          } else {
            children.push({
              id: childId,
              name: childData.name || `Child ${childId.slice(0, 4)}`,
              ...childData
            });
          }
        }

        callback(children);
      } catch (error) {
        console.error("Error processing children:", error);
        callback([]);
      }
    });
  };

  return (
    <FirebaseContext.Provider
      value={{
        loginWithEmailAndPassword,
        registerWithEmailAndPassword,
        saveCodeToFirestore,
        listenForPairedChildren,
        setupRealtimeScreenTimeListener,
        getScreenTimeData,
        setDailyScreenTimeLimit,
        addUrlToFirestore,
        removeUrlFromFirestore,
        listenToLiveLocation,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
