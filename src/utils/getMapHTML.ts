import { Region, LatLng, SegmentPath } from "../types";
const polyline = require("@mapbox/polyline");

interface GetMapHTMLOptions {
  region: Region;
  route: LatLng[];
  roadPath: LatLng[] | string | LatLng[][] | SegmentPath[];
  polylineColor: string;
  nearbySpots?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    image_url?: string;
  }>;
  nearbyRestaurants?: Array<{
    amenity: string;
    latitude: number;
    longitude: number;
    name: string;
    cuisine?: string;
    image_url?: string;
  }>;
  isRouteGenerated: boolean; // New flag
}

// Static HTML head content (could be moved to a constant file)
const BASE_HTML_HEAD = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }</style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        // Function to generate segment icons
        function getSegmentIcon(type, color) {
          let iconClass;
          switch(type.toLowerCase()) {
            case 'walking':
              iconClass = 'fas fa-walking';
              break;
            case 'bus':
              iconClass = 'fas fa-bus';
              break;
            case 'jeep':
              iconClass = 'fas fa-car';
              break;
            default:
              iconClass = 'fas fa-question';
          }
          return L.divIcon({
            html: \`<div style="background-color: #fff; border: 2px solid \${color}; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;"><i class="\${iconClass}" style="font-size: 8px; color: \${color};"></i></div>\`,
            className: 'segment-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
          });
        }
`;

export const getMapHTML = ({
  region,
  route,
  roadPath,
  polylineColor,
  nearbySpots,
  nearbyRestaurants,
  isRouteGenerated
}: GetMapHTMLOptions): string => {
  // Use arrays to build JavaScript code efficiently
  const markersJS: string[] = [];
  const polylinesJS: string[] = [];

  // Utility function for restaurant icons
  const getIconUrl = (amenity: string): string => {
    const iconMap: { [key: string]: string } = {
      bar: "https://wiki.openstreetmap.org/w/images/9/94/Bar-16.svg",
      cafe: "https://wiki.openstreetmap.org/w/images/d/da/Cafe-16.svg",
      fast_food: "https://wiki.openstreetmap.org/w/images/1/1f/Fast-food-16.svg",
      restaurant: "https://wiki.openstreetmap.org/w/images/b/bb/Restaurant-14.svg",
      biergarten: "https://wiki.openstreetmap.org/w/images/e/e1/Biergarten-16.svg",
      food_court: "https://wiki.openstreetmap.org/w/images/b/bb/Restaurant-14.svg",
      ice_cream: "https://wiki.openstreetmap.org/w/images/0/0f/Ice-cream-14.svg",
      pub: "https://wiki.openstreetmap.org/w/images/5/5d/Pub-16.svg",
    };
    return iconMap[amenity] || "https://wiki.openstreetmap.org/w/images/b/bb/Restaurant-14.svg";
  };

  // Current location and destination markers
  if (route?.length > 0 && !isRouteGenerated) {
    markersJS.push(`
      var originIcon = L.divIcon({
        html: '<div style="background-color: #0000ff; border: 2px solid #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-location-dot" style="color: #fff; font-size: 12px;"></i></div>',
        className: 'origin-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });
      L.marker([${route[0].latitude}, ${route[0].longitude}], { icon: originIcon })
        .addTo(map)
        // .bindPopup("Origin").openPopup();
    `);
  }
  if (route.length >= 2) {
    markersJS.push(`
      var destinationIcon = L.divIcon({
        html: '<div style="background-color: #ff0000; border: 2px solid #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-map-pin" style="color: #fff; font-size: 12px;"></i></div>',
        className: 'destination-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });
      L.marker([${route[1].latitude}, ${route[1].longitude}], { icon: destinationIcon })
        .addTo(map)
        // .bindPopup("Destination").openPopup();
    `);
  }

  // Tourist spot markers
  if (nearbySpots && nearbySpots.length > 0) {
    markersJS.push(`
      var touristIcon = L.divIcon({
        html: '<div style="background-color: #fff; border: 2px solid #28a745; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-sun" style="color: #28a745; font-size: 8px;"></i></div>',
        className: 'custom-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });
    `);
    nearbySpots.forEach((spot) => {
      const escapedName = spot.name.replace(/'/g, "\\'");
      markersJS.push(`
        L.marker([${spot.latitude}, ${spot.longitude}], { icon: touristIcon, isTouristSpot: true })
          .addTo(map)
          .bindPopup(\`
            <div style="max-width: 200px;">
              <b>${escapedName}</b>
              ${spot.image_url
          ? `<img src="${spot.image_url}" style="width: 100%; height: auto; margin-top: 5px; border-radius: 4px; cursor: pointer;" onerror="this.src='https://via.placeholder.com/100x75.png?text=Image+Not+Available';" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'spotClick', name: '${escapedName}' }))" />`
          : '<p style="margin: 5px 0; color: #666;">No image available</p>'}
            </div>
          \`);
      `);
    });
  }

  // Restaurant markers
  if (nearbyRestaurants && nearbyRestaurants.length > 0) {
    nearbyRestaurants.forEach((restaurant) => {
      const escapedName = restaurant.name.replace(/'/g, "\\'");
      markersJS.push(`
        var restaurantIcon = L.divIcon({
          html: '<div style="background-color: #fff; border: 2px solid #dc3545; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;"><img src="${getIconUrl(restaurant.amenity)}" style="width: 12px; height: 12px;" /></div>',
          className: 'restaurant-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        });
        L.marker([${restaurant.latitude}, ${restaurant.longitude}], { icon: restaurantIcon, isRestaurant: true })
          .addTo(map)
          .bindPopup(\`
            <div style="max-width: 200px;">
              <b>${escapedName}</b>
              ${restaurant.cuisine ? `<p style="margin: 2px 0; color: #666;">Cuisine: ${restaurant.cuisine}</p>` : ""}
            </div>
          \`);
      `);
    });
  }

  // Polyline rendering with segment start icons
  if (Array.isArray(roadPath)) {
    if (roadPath.length > 0 && (roadPath[0] as any).coords) {
      polylinesJS.push("window.segmentPolylines = [];");
      polylinesJS.push("window.stepMarkers = [];");
      polylinesJS.push("window.currentSelectedStepMarker = null;");
      (roadPath as SegmentPath[]).forEach((segment, idx) => {
        const firstCoord = segment.coords[0];
        const isOrigin = idx === 0; // Identify the first segment (origin)
        polylinesJS.push(`
          var segment${idx} = L.polyline(${JSON.stringify(segment.coords.map(pt => [pt.latitude, pt.longitude]))}, { color: '${segment.color}', weight: 3 }).addTo(map);
          segment${idx}.options.defaultColor = '${segment.color}';
          window.segmentPolylines.push(segment${idx});
          var icon = getSegmentIcon('${segment.type}', '${segment.color}');
          var marker = L.marker([${firstCoord.latitude}, ${firstCoord.longitude}], { icon: icon }).addTo(map);
          if (${isOrigin}) {
            marker.bindPopup("Origin").openPopup();
          }
        `);

        if (segment.type.toLowerCase() === 'walking' && segment.steps && segment.steps.length > 0) {
          const coords = segment.coords;
          const numSteps = segment.steps.length;
          const pointsPerStep = Math.floor(coords.length / numSteps);
          segment.steps.forEach((step: any, stepIdx: number) => {
            const startIdx = stepIdx * pointsPerStep;
            const startCoord = coords[startIdx] || coords[0];
            if (stepIdx === 0 && idx === 0 && route?.length > 0 &&
              startCoord.latitude === route[0].latitude &&
              startCoord.longitude === route[0].longitude) {
              return;
            }
            const instruction = (step.instruction || `Step ${stepIdx + 1}`).replace(/'/g, "\\'");
            polylinesJS.push(`
              var stepMarker${idx}_${stepIdx} = L.marker([${startCoord.latitude}, ${startCoord.longitude}], {
                icon: L.divIcon({
                  html: '<div style="background-color: #fff; border: 1px solid #6366F1; border-radius: 50%; width: 8px; height: 8px;"></div>',
                  className: 'step-dot',
                  iconSize: [10, 10],
                  iconAnchor: [6, 6]
                }),
                segmentIdx: ${idx},
                stepIdx: ${stepIdx}
              }).addTo(map).bindPopup('${instruction}');
              window.stepMarkers.push({ marker: stepMarker${idx}_${stepIdx}, segmentIdx: ${idx}, stepIdx: ${stepIdx} });
              stepMarker${idx}_${stepIdx}.on('click', function() {
                if (window.currentSelectedStepMarker && window.currentSelectedStepMarker !== this) {
                  window.currentSelectedStepMarker.setIcon(L.divIcon({
                    html: '<div style="background-color: #fff; border: 1px solid #6366F1; border-radius: 50%; width: 8px; height: 8px;"></div>',
                    className: 'step-dot',
                    iconSize: [10, 10],
                    iconAnchor: [6, 6]
                  }));
                }
                this.setIcon(L.divIcon({
                  html: '<div style="background-color: #fff; border: 2px solid #6366F1; border-radius: 50%; width: 12px; height: 12px;"></div>',
                  className: 'step-dot-selected',
                  iconSize: [12, 12],
                  iconAnchor: [9, 9]
                }));
                window.currentSelectedStepMarker = this;
                this.openPopup();
                map.flyTo([this.getLatLng().lat, this.getLatLng().lng], 16, { animate: true, duration: 1 });
              });
            `);
          });
        }
      });
      polylinesJS.push(`
        var group = new L.featureGroup(window.segmentPolylines);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      `);
    } else if (roadPath.length > 0 && Array.isArray(roadPath[0])) {
      // LatLng[][]
      polylinesJS.push("window.segmentPolylines = [];");
      (roadPath as LatLng[][]).forEach((segment, idx) => {
        polylinesJS.push(`
          var segment${idx} = L.polyline(${JSON.stringify(segment.map(pt => [pt.latitude, pt.longitude]))}, { color: '${polylineColor}', weight: 3 }).addTo(map);
          segment${idx}.options.defaultColor = '${polylineColor}';
          window.segmentPolylines.push(segment${idx});
        `);
      });
      polylinesJS.push(`
        var group = new L.featureGroup(window.segmentPolylines);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      `);
    } else if (roadPath.length > 0) {
      // LatLng[]
      const coords = (roadPath as LatLng[]).map(coord => [coord.latitude, coord.longitude]);
      polylinesJS.push(`
        var roadPolyline = L.polyline(${JSON.stringify(coords)}, { color: '${polylineColor}', weight: 3 }).addTo(map);
        map.fitBounds(roadPolyline.getBounds(), { padding: [50, 50] });
      `);
    }
  } else if (typeof roadPath === "string" && roadPath.length > 0) {
    // Polyline string
    const coords = polyline.decode(roadPath).map((coord: number[]) => [coord[0], coord[1]]);
    polylinesJS.push(`
      var roadPolyline = L.polyline(${JSON.stringify(coords)}, { color: '${polylineColor}', weight: 3 }).addTo(map);
      map.fitBounds(roadPolyline.getBounds(), { padding: [50, 50] });
    `);
  }

  const messageListenerJS = `
    function zoomToSegment(bounds, idx) {
      var southWest = L.latLng(bounds.minLat, bounds.minLon);
      var northEast = L.latLng(bounds.maxLat, bounds.maxLon);
      var segmentBounds = L.latLngBounds(southWest, northEast);
      map.fitBounds(segmentBounds, { padding: [50, 50] });
      if (window.segmentPolylines) {
        window.segmentPolylines.forEach((polyline, index) => {
          polyline.setStyle({ weight: index === idx ? 6 : 3, color: polyline.options.defaultColor || '${polylineColor}' });
        });
      }
    }
    function zoomToStep(lat, lng, instruction, segmentIdx, stepIdx) {
      if (window.stepMarkers) {
        const targetMarker = window.stepMarkers.find(m => m.segmentIdx === segmentIdx && m.stepIdx === stepIdx);
        if (targetMarker) {
          const marker = targetMarker.marker;
          if (window.currentSelectedStepMarker && window.currentSelectedStepMarker !== marker) {
            window.currentSelectedStepMarker.setIcon(L.divIcon({
              html: '<div style="background-color: #fff; border: 1px solid #6366F1; border-radius: 50%; width: 8px; height: 8px;"></div>',
              className: 'step-dot',
              iconSize: [10, 10],
              iconAnchor: [6, 6]
            }));
          }
          marker.setIcon(L.divIcon({
            html: '<div style="background-color: #fff; border: 2px solid #6366F1; border-radius: 50%; width: 12px; height: 12px;"></div>',
            className: 'step-dot-selected',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          }));
          window.currentSelectedStepMarker = marker;
          marker.openPopup();
          map.flyTo([lat, lng], 16, { animate: true, duration: 1 });
        }
      }
    }
    document.addEventListener('message', (event) => {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'zoomToSegment') {
          zoomToSegment(data.bounds, data.index);
        } else if (data.type === 'zoomToStep') {
          zoomToStep(data.latitude, data.longitude, data.instruction, data.segmentIdx, data.stepIdx);
        }
      } catch (e) { console.error(e); }
    });
    window.addEventListener('message', (event) => {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'zoomToSegment') {
          zoomToSegment(data.bounds, data.index);
        } else if (data.type === 'zoomToStep') {
          zoomToStep(data.latitude, data.longitude, data.instruction, data.segmentIdx, data.stepIdx);
        }
      } catch (e) { console.error(e); }
    });
  `;

  return `
    ${BASE_HTML_HEAD}
      var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
      window.map = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      ${markersJS.join("\n")}
      ${polylinesJS.join("\n")}
      ${messageListenerJS}
    </script>
  </body>
</html>
  `;
};