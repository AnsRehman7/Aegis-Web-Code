import React, { useEffect, useState } from 'react';
import { useFirebase } from '../../../context/Firebase';
import styles from './screentime.module.css';
import {
  FaYoutube, FaPhone, FaWhatsapp, FaInstagram, FaChrome, FaCamera, FaCalculator
} from 'react-icons/fa';
import {
  SiGmail, SiTiktok, SiGooglemaps, SiGooglechrome, SiOpenai
} from 'react-icons/si';
import { WiDayCloudy } from 'react-icons/wi';
import { MdPhoto, MdOutlineApps } from 'react-icons/md';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { GiCash } from 'react-icons/gi';

const appIcons = {
  youtube: <FaYoutube />,
  google: <SiGooglechrome />,
  phone: <FaPhone />,
  whatsapp: <FaWhatsapp />,
  instagram: <FaInstagram />,
  gmail: <SiGmail />,
  tiktok: <SiTiktok />,
  gallery: <MdPhoto />,
  calculator: <FaCalculator />,
  chatgpt: <SiOpenai />,
  weather: <WiDayCloudy />,
  maps: <SiGooglemaps />,
  clock: <AiOutlineClockCircle />,
  chrome: <FaChrome />,
  jazzcash: <GiCash />,
  camera: <FaCamera />,
  default: <MdOutlineApps />
};

export default function ScreenTime({ childId }) {
  const { setupRealtimeScreenTimeListener, getScreenTimeData, setDailyScreenTimeLimit } = useFirebase();
  const [screenTime, setScreenTime] = useState(null);
  const [childSettings, setChildSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoursLimit, setHoursLimit] = useState('');
  const [minutesLimit, setMinutesLimit] = useState('');
  const [unlockCode, setUnlockCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!childId) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch settings once
        const settings = await getScreenTimeData(childId);
        setChildSettings(settings || {});

        // Set up real-time listener for screen time
        const unsubscribe = setupRealtimeScreenTimeListener(childId, (timeData) => {
          setScreenTime(timeData);
          setLoading(false);
        });

        return unsubscribe;

      } catch (err) {
        console.error('Failed to initialize data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const unsubscribe = fetchInitialData();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [childId]);

  // Keep settings update handler
  const handleSaveLimit = async () => {
    const totalMinutes = parseInt(hoursLimit || 0) * 60 + parseInt(minutesLimit || 0);
    if (totalMinutes <= 0) {
      setError('Please enter a valid time limit');
      return;
    }

    setSaving(true);
    try {
      await setDailyScreenTimeLimit(childId, totalMinutes, null);
      setChildSettings(prev => ({ ...prev, dailyLimitMinutes: totalMinutes }));
      setHoursLimit('');
      setMinutesLimit('');
    } catch (err) {
      setError('Failed to save limit');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUnlockCode = async () => {
    if (!/^\d{6}$/.test(unlockCode)) {
      setError('Unlock code must be 6 digits');
      return;
    }

    setSaving(true);
    try {
      await setDailyScreenTimeLimit(childId, null, unlockCode);
      setChildSettings(prev => ({ ...prev, unlockCode }));
      setUnlockCode('');
    } catch (err) {
      setError('Failed to save unlock code');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading screen time data...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const maxUsage = screenTime?.apps?.reduce((max, app) => Math.max(max, app.usageTime), 0) || 1;
  const remainingMinutes = childSettings?.dailyLimitMinutes 
    ? Math.max(0, childSettings.dailyLimitMinutes - Math.floor((screenTime?.total || 0) / 60))
    : null;
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Screen Time Dashboard</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span>Today's Usage:</span>
            <strong>
              {screenTime?.total 
                ? `${Math.floor(screenTime.total / 3600)}h ${Math.floor((screenTime.total % 3600) / 60)}m`
                : 'No data'}
            </strong>
          </div>
          {remainingMinutes !== null && (
            <div className={styles.statItem}>
              <span>Remaining:</span>
              <strong>
                {`${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`}
              </strong>
            </div>
          )}
        </div>
      </header>

      <section className={styles.controls}>
        <div className={styles.controlGroup}>
          <h2>Set Daily Limit</h2>
          <div className={styles.inputGroup}>
            <input
              type="number"
              placeholder="Hours"
              value={hoursLimit}
              onChange={(e) => setHoursLimit(e.target.value.replace(/\D/g, ''))}
              min="0"
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Minutes"
              value={minutesLimit}
              onChange={(e) => setMinutesLimit(e.target.value.replace(/\D/g, ''))}
              min="0"
              max="59"
              className={styles.input}
            />
            <button
              onClick={handleSaveLimit}
              disabled={saving}
              className={styles.button}
            >
              {saving ? 'Saving...' : 'Save Limit'}
            </button>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <h2>Unlock Code</h2>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="6-digit code"
              value={unlockCode}
              onChange={(e) => setUnlockCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={styles.input}
            />
            <button
              onClick={handleSaveUnlockCode}
              disabled={saving || unlockCode.length !== 6}
              className={styles.button}
            >
              {saving ? 'Saving...' : 'Save Code'}
            </button>
          </div>
          {childSettings?.unlockCode && (
            <p className={styles.savedCode}>
              Current code: {childSettings.unlockCode}
            </p>
          )}
        </div>
      </section>

      <section className={styles.appUsage}>
        <h2>App Usage Breakdown</h2>
        {screenTime?.apps?.length ? (
          <ul className={styles.appList}>
            {screenTime.apps.map((app) => (
              <li key={app.package} className={styles.appItem}>
                <div className={styles.appIcon}>
                  {appIcons[app.name.toLowerCase()] || appIcons.default}
                </div>
                <div className={styles.appDetails}>
                  <div className={styles.appName}>{app.name}</div>
                  <div className={styles.usageBar}>
                    <div
                      className={styles.usageFill}
                      style={{ width: `${(app.usageTime / maxUsage) * 100}%` }}
                    />
                  </div>
                  <div className={styles.usageTime}>
                    {Math.floor(app.usageTime / 60)} minutes
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noData}>No app usage data available</p>
        )}
      </section>
    </div>
  );
}



