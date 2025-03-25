// src/components/MapComponent.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, Animated, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { MapComponentProps, LatLng } from "../types";
import { getMapHTML } from "../utils/getMapHTML";

const MapComponent: React.FC<MapComponentProps> = ({
  initialRegion,
  route = [],
  roadPath = [],
  style,
  mapResetKey,
  polylineColor,
  webviewRef,
  nearbySpots,
  selectedSpot,
  isLoading,
  onSpotClick,
  nearbyRestaurants,
  onRestaurantClick,
}) => {
  const mapKey = JSON.stringify({
    initialRegion,
    route,
    roadPath,
    mapResetKey,
    nearbySpots,
    nearbyRestaurants,
  });
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const internalWebViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const handleLoadEnd = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isWebViewReady && selectedSpot) {
      const js = `
      if (window.map) {
        const targetLat = ${selectedSpot.latitude};
        const targetLng = ${selectedSpot.longitude};
        // Reset all tourist spot markers to original color
        window.map.eachLayer(layer => {
          if (layer instanceof L.Marker && layer.options.isTouristSpot) {
            layer.setIcon(
              L.divIcon({
                html: '<div style="background-color: #fff; border: 2px solid #28a745; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-sun" style="color: #28a745; font-size: 16px;"></i></div>',
                className: 'custom-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
              })
            );
          }
        });
        // Fly and highlight selected marker
        window.map.flyTo([targetLat, targetLng], 16, { animate: true, duration: 2 });
        window.map.eachLayer(layer => {
          if (layer instanceof L.Marker && layer.options.isTouristSpot) {
            const latLng = layer.getLatLng();
            if (Math.abs(latLng.lat - targetLat) < 0.000001 && Math.abs(latLng.lng - targetLng) < 0.000001) {
              layer.openPopup();
              layer.setIcon(
                L.divIcon({
                  html: '<div style="background-color: #fff; border: 2px solid #dc3545; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-sun" style="color: #dc3545; font-size: 16px;"></i></div>',
                  className: 'selected-icon',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                })
              );
            }
          }
        });
        // Adjust view after delay
        setTimeout(() => {
          var markerLatLng = L.latLng(targetLat, targetLng);
          var containerPoint = window.map.latLngToContainerPoint(markerLatLng);
          var adjustedPoint = L.point(containerPoint.x, containerPoint.y - 500);
          var adjustedCenter = window.map.containerPointToLatLng(adjustedPoint);
          window.map.setView(adjustedCenter, window.map.getZoom(), { animate: true });
        }, 500);
      }
      `;
      (webviewRef || internalWebViewRef)?.current?.injectJavaScript(js);
    }
  }, [selectedSpot, isWebViewReady, webviewRef]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef || internalWebViewRef}
        key={mapKey}
        originWhitelist={["*"]}
        source={{
          html: getMapHTML({
            region: initialRegion,
            route,
            roadPath,
            polylineColor,
            nearbySpots,
            nearbyRestaurants,
          }),
        }}
        style={style}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          handleLoadEnd();
          setIsWebViewReady(true);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "spotClick" && onSpotClick) {
              onSpotClick(data.name);
            }
            if (data.type === "restaurantClick" && onRestaurantClick) {
              onRestaurantClick(data.name);
            }
          } catch (e) {
            console.error("Error parsing message:", e);
          }
        }}
      />
      {(loading || isLoading) && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: fadeAnim,
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <ActivityIndicator size="large" color="#6366F1" />
        </Animated.View>
      )}
    </View>
  );
};

export default MapComponent;
