import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { listenToLiveLocation } from "../../../context/Firebase";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "500px",
};

const Location = ({ childId }) => {
  const [parentLocation, setParentLocation] = useState(null);
  const [childLocation, setChildLocation] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  // Get parent's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setParentLocation(newLocation);
          setCenter(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please allow location access.");
        }
      );
    }
  }, []);

  // Listen to child's location from Firebase
  useEffect(() => {
    if (!childId) {
      console.warn("No childId passed to Location component");
      return;
    }

    const unsubscribe = listenToLiveLocation(childId, (location) => {
      if (location?.lat && location?.lng) {
        const newChildLoc = { lat: location.lat, lng: location.lng };
        setChildLocation(newChildLoc);
        setCenter(newChildLoc); // Auto-pan to child
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [childId]);

  const path =
    parentLocation && childLocation
      ? [parentLocation, childLocation]
      : [];

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
      >
        {/* Parent Marker */}
        {parentLocation && (
          <Marker position={parentLocation} label="Parent" />
        )}

        {/* Child Marker */}
        {childLocation && (
          <Marker
            position={childLocation}
            label="Child"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        )}

        {/* Route Line */}
        {path.length === 2 && (
          <Polyline
            path={path}
            options={{
              strokeColor: "#3b82f6",
              strokeOpacity: 1,
              strokeWeight: 3,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Location;
