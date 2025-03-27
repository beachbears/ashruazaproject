// MapComponentMemo.tsx
import React from "react";
import MapComponent from "./MapComponent";

const MapComponentMemo = React.memo(
  MapComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.route === nextProps.route &&
      prevProps.roadPath === nextProps.roadPath &&
      prevProps.mapResetKey === nextProps.mapResetKey &&
      prevProps.activeTab === nextProps.activeTab &&
      prevProps.nearbySpots === nextProps.nearbySpots &&
      prevProps.nearbyRestaurants === nextProps.nearbyRestaurants
    );
  }
);

export default MapComponentMemo;