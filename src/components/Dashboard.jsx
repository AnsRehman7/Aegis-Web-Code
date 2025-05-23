import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, useParams } from "react-router-dom";
import Sidebar from "./Dashboard/Sidebar";
import { useFirebase } from "../context/Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const { listenForPairedChildren } = useFirebase();
  const [childList, setChildList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { childId } = useParams();
  const isActivitiesRoute = location.pathname.includes('/activities/');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setParentId(user.uid);
      } else {
        navigate("/login");
      }
    });
    return unsubscribeAuth;
  }, [navigate]);

  useEffect(() => {
    if (!parentId) return;

    setLoading(true);
    const unsubscribe = listenForPairedChildren(parentId, (children) => {
      setChildList(children);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setLoading(false);
    };
  }, [parentId, listenForPairedChildren]);

  // Sync selectedChild with URL when childList changes
  useEffect(() => {
    if (childId && childList.length > 0) {
      const child = childList.find(c => c.id === childId);
      if (child) {
        setSelectedChild(child);
      }
    }
  }, [childId, childList]);

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    navigate(`activities/${child.id}`);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {!isActivitiesRoute && (
        <Sidebar
          childList={childList}
          loading={loading}
          onSelectChild={handleSelectChild}
          selectedChild={selectedChild}
        />
      )}

      <main style={{ flexGrow: 1, padding: "20px" }}>
        <Outlet context={{ selectedChild }} />
        {!isActivitiesRoute && !selectedChild && (
          <div className="empty-state">
            <h2>Please select a child to view activities</h2>
            {childList.length === 0 && !loading && (
              <p>No children found. Connect a child device to get started.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;