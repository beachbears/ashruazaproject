import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { View, ActivityIndicator, Animated, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { MapComponentProps, LatLng } from "../types";
import { getMapHTML } from "../utils/getMapHTML";

const MapComponent = memo(
  ({
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
    activeTab,
  }: MapComponentProps) => {
    const mapKey = JSON.stringify({ initialRegion, route, roadPath, mapResetKey });
    const [loading, setLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [isWebViewReady, setIsWebViewReady] = useState(false);

    const handleLoadEnd = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setLoading(false);
        setIsWebViewReady(true);
      });
    };

    const mapHTML = useMemo(() => {
      return getMapHTML({
        region: initialRegion,
        route,
        roadPath,
        polylineColor,
        nearbySpots: activeTab === "Attractions" ? nearbySpots : [],
        nearbyRestaurants: activeTab === "Dining" ? nearbyRestaurants : [],
        isRouteGenerated: roadPath.length > 0,
      });
    }, [initialRegion, route, roadPath, polylineColor, nearbySpots, nearbyRestaurants, activeTab]);

    useEffect(() => {
      if (isWebViewReady && selectedSpot) {
        const js = `
          if (window.map) {
            const targetLat = ${selectedSpot.latitude};
            const targetLng = ${selectedSpot.longitude};
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
            setTimeout(() => {
              var markerLatLng = L.latLng(targetLat, targetLng);
              var containerPoint = window.map.latLngToContainerPoint(markerLatLng);
              var adjustedPoint = L.point(containerPoint.x, containerPoint.y - 500);
              var adjustedCenter = window.map.containerPointToLatLng(adjustedPoint);
              window.map.setView(adjustedCenter, window.map.getZoom(), { animate: true });
            }, 500);
          }
        `;
        webviewRef.current?.injectJavaScript(js);
      }
    }, [selectedSpot, isWebViewReady, webviewRef]);

    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={webviewRef}
          source={{ html: mapHTML }}
          style={style}
          onLoadEnd={handleLoadEnd}
        />
        {(loading || isLoading) && (
          <Animated.View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <ActivityIndicator size="small" color="#6366F1" />
          </Animated.View>
        )}
      </View>
    );
  }
);

export default MapComponent;