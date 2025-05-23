import React, { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { getAuth } from "firebase/auth";
import { doc, collection, onSnapshot } from "firebase/firestore"; // Added collection import
import { useNavigate } from "react-router-dom";
import { firestore, saveCodeToFirestore } from "../../context/Firebase";
import styles from "./connect.module.css";

const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const ConnectApp = () => {
  const [code, setCode] = useState(generateCode());
  const [timer, setTimer] = useState(60);
  const [pairingDocId, setPairingDocId] = useState(null);
  const navigation = useNavigate();

  const timerRef = useRef(null);
  const auth = getAuth();
  const parentId = auth.currentUser?.uid;

  const regenerateCode = async () => {
    try {
      const newCode = generateCode();
      setCode(newCode);
      setTimer(60);
  
      if (!parentId) {
        console.error("No parent user is logged in");
        return;
      }
  
      console.log("Regenerating code for parent:", parentId);
      const newDocId = await saveCodeToFirestore(parentId, newCode, newCode);
      if (!newDocId) {
        throw new Error("Failed to get document ID");
      }
      console.log("New document ID:", newDocId);
      setPairingDocId(newDocId);
    } catch (error) {
      console.error("Failed to regenerate code:", error);
    }
  };

  useEffect(() => {
    if (!parentId) return;
  
    const init = async () => {
      const docId = await saveCodeToFirestore(parentId, code, code);
      setPairingDocId(docId);
    };
  
    init();
  
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          regenerateCode();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [parentId, code]);

  // Existing useEffect for listening to pairing document
  useEffect(() => {
    if (!parentId || !pairingDocId) return;

    const docRef = doc(firestore, "users", parentId, "pairingCodes", pairingDocId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.paired) {
        alert("App connected successfully!");
        navigation("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [parentId, pairingDocId, navigation]);

  // NEW useEffect for listening to pairedChildren collection
  useEffect(() => {
    if (!parentId || !pairingDocId) return;

    const pairedChildrenRef = collection(
      firestore,
      "users",
      parentId,
      "pairedChildren"
    );

    const unsubscribe = onSnapshot(pairedChildrenRef, (snapshot) => {
      if (!snapshot.empty) {
        // Check if any of the paired children were recently added
        const newPairings = snapshot.docs.filter(doc => {
          const data = doc.data();
          return data.pairedAt && new Date() - data.pairedAt.toDate() < 60000;
        });

        if (newPairings.length > 0) {
          alert("App connected successfully!");
          navigation("/dashboard");
        }
      }
    });

    return () => unsubscribe();
  }, [parentId, pairingDocId, navigation]);

  return (
    <div className={styles.connectContainer}>
      <div className={styles.connectCard}>
        <h2 className={styles.connectTitle}>Connect App</h2>

        <div className={styles.qrcodeBox}>
          <QRCode value={code} size={180} />
        </div>

        <p className={styles.codeLabel}>4-Digit Code:</p>
        <div className={styles.codeDisplay}>{code}</div>

        <p className={styles.timer}>Expires in: {timer}s</p>

        <p className={styles.waiting}>Waiting for child to connect...</p>

        <button onClick={regenerateCode} className={styles.regenerateBtn}>
          Generate New Code
        </button>
      </div>
    </div>
  );
};

export default ConnectApp;