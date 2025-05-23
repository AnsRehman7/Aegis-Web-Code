import React from 'react';
import { useParams, useOutletContext, Routes, Route, Link } from 'react-router-dom';
import ScreenTime from './Activities/ScreenTime';
import Location from './Activities/Location';
import ContentFiltering from './Activities/ContentFiltering';
import styles from './Activities.module.css';

function Activities() {
  const { childId } = useParams();
  const { selectedChild } = useOutletContext();

  if (!selectedChild) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading child information...</p>
      </div>
    );
  }

  if (selectedChild.id !== childId) {
    return (
      <div className={styles.errorContainer}>
        <p>Child data doesn't match the URL</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <h2 className={styles.childName}>{selectedChild.name}</h2>
          <nav>
            <ul className={styles.navMenu}>
              <li className={styles.navItem}>
                <Link to="screen-time" className={styles.navLink}>
                  Screen Time
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="location" className={styles.navLink}>
                  Location
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="content-filtering" className={styles.navLink}>
                  Content Filtering
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.contentWrapper}>
          <Routes>
            <Route path="screen-time" element={<ScreenTime childId={childId} />} />
           <Route path="location" element={<Location childId={childId} />} />
            <Route path="content-filtering" element={<ContentFiltering childId={childId} />} />
            <Route index element={<ScreenTime childId={childId} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default Activities;