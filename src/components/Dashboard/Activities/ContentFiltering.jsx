import React, { useState, useEffect } from 'react';
import styles from './contentfiltering.module.css';
import { useFirebase, firebaseauth, firestore } from '../../../context/Firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function ContentFiltering() {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [urls, setUrls] = useState([]);
  const { addUrlToFirestore, removeUrlFromFirestore } = useFirebase();
  const user = firebaseauth.currentUser;

 useEffect(() => {
    if (!user) return;

    const blockedUrlsRef = collection(firestore, "users", user.uid, "blockedUrls");
    const unsubscribe = onSnapshot(blockedUrlsRef, (snapshot) => {
        const urlsList = snapshot.docs.map(doc => doc.data().host);  // Changed from doc.id
        setUrls(urlsList);
    });

    return () => unsubscribe();
}, [user]);

 const formatUrlForFirebase = (url) => {
    return url
        .replace(/^https?:\/\//, '')
        .replace(/\./g, '_')
        .replace(/\//g, '_')
        .toLowerCase()
        .replace(/^www_/, '');
};
  const handleAddUrl = async () => {
    try {
      const urlToAdd = newUrl?.trim();
      if (!urlToAdd) {
        setError('Please enter a URL');
        return;
      }

      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Format URL for Firebase
     const formattedUrl = formatUrlForFirebase(urlToAdd);
      
      await addUrlToFirestore(user.uid, formattedUrl);
      setNewUrl('');
      setSuccess(`${urlToAdd} added successfully`);
      setError(null);
    } catch (error) {
      setError(`Failed to add URL: ${error.message}`);
      console.error("Add URL error:", error);
    }
  };

  const handleRemoveUrl = async (urlToRemove) => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      await removeUrlFromFirestore(user.uid, urlToRemove);
      setSuccess('URL removed successfully');
      setError(null);
    } catch (error) {
      setError('Failed to remove URL');
      console.error("Remove URL error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddUrl();
    }
  };

  const handleInputChange = (e) => {
    setNewUrl(e.target?.value || '');
  };

  return (
    <div className={styles.container}>
      <h1>Content Filtering</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.addContainer}>
        <input
          type="text"
          value={newUrl}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter URL (e.g., facebook.com)"
          className={styles.input}
        />
        <button 
          onClick={handleAddUrl} 
          className={styles.addButton}
          disabled={!newUrl?.trim()}
        >
          Add URL
        </button>
      </div>

      <div className={styles.urlList}>
        <h2>Blocked Websites</h2>
        {urls.length === 0 ? (
          <p className={styles.empty}>No websites currently added</p>
        ) : (
          <ul className={styles.urlItems}>
            {urls.map((url, index) => (
              <li key={index} className={styles.urlItem}>
                <span className={styles.urlText}>
                  {url.replace(/_/g, '.').replace(/^www_/, 'www.')}
                </span>
                <button 
                  onClick={() => handleRemoveUrl(url)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}