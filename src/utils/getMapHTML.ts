// src/utils/getMapHTML.ts
// import polyline from "@mapbox/polyline";
import { Region, LatLng, SegmentPath } from "../types";
const polyline = require("@mapbox/polyline")
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
}

export const getMapHTML = ({
  region,
  route,
  roadPath,
  polylineColor,
  nearbySpots,
  nearbyRestaurants,
}: GetMapHTMLOptions): string => {
  const fontAwesomeCSS =
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />';
  let markersJS = "";
  function getIconUrl(amenity: any) {
    switch (amenity) {
      case "bar":
        return "https://wiki.openstreetmap.org/w/images/9/94/Bar-16.svg";
      case "cafe":
        return "https://wiki.openstreetmap.org/w/images/d/da/Cafe-16.svg";
      case "fast_food":
        return "https://wiki.openstreetmap.org/w/images/1/1f/Fast-food-16.svg";
      case "restaurant":
        return "https://wiki.openstreetmap.org/w/images/b/bb/Restaurant-14.svg";
      case "biergarten":
        return "https://wiki.openstreetmap.org/w/images/e/e1/Biergarten-16.svg";
      case "food_court":
        return "https://wiki.openstreetmap.org/w/images/b/bb/Restaurant-14.svg";
      case "ice_cream":
        return "https://wiki.openstreetmap.org/w/images/0/0f/Ice-cream-14.svg";
      case "pub":
        return "https://wiki.openstreetmap.org/w/images/5/5d/Pub-16.svg";
      default:
        return "https://wiki.openstreetmap.org/w/images/b/bb/Restaurant-14.svg"; // Default icon
    }
  }

  // Current location marker and destination
  if (route && route.length > 0) {
    markersJS += `
      var currentMarker = L.marker([${route[0].latitude}, ${route[0].longitude}])
        .addTo(map)
        .bindPopup("Current Location").openPopup();
    `;
    if (route.length >= 2) {
      markersJS += `
        var destinationMarker = L.marker([${route[1].latitude}, ${route[1].longitude}])
          .addTo(map)
          .bindPopup("Destination");
      `;
    }
  }

  // Custom icon example for markers
  markersJS += `
    var icon = L.divIcon({
      html: '<div style="background-color: #fff; border: 2px solid #28a745; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-sun" style="color: #28a745; font-size: 16px;"></i></div>',
      className: 'custom-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  `;

  let polylinesJS = "";
  if (
    Array.isArray(roadPath) &&
    roadPath.length > 0 &&
    (roadPath[0] as any).coords !== undefined
  ) {
    polylinesJS += `
      window.segmentPolylines = [];
      ${(roadPath as SegmentPath[])
        .map(
          (segment, idx: number) =>
            `var segment${idx} = L.polyline(${JSON.stringify(
              segment.coords.map((pt) => [pt.latitude, pt.longitude])
            )}, { color: '${segment.color}', weight: 3 }).addTo(map);
         segment${idx}.options.defaultColor = '${segment.color}';
         window.segmentPolylines.push(segment${idx});`
        )
        .join("\n")}
    `;
  } else if (
    Array.isArray(roadPath) &&
    roadPath.length > 0 &&
    Array.isArray(roadPath[0])
  ) {
    polylinesJS += `
      window.segmentPolylines = [];
      ${(roadPath as LatLng[][])
        .map(
          (segment, idx: number) =>
            `var segment${idx} = L.polyline(${JSON.stringify(
              segment.map((pt: LatLng) => [pt.latitude, pt.longitude])
            )}, { color: '${polylineColor}', weight: 3 }).addTo(map);
         segment${idx}.options.defaultColor = '${polylineColor}';
         window.segmentPolylines.push(segment${idx});`
        )
        .join("\n")}
    `;
  } else if (
    (typeof roadPath === "string" && roadPath.length > 0) ||
    (Array.isArray(roadPath) && roadPath.length > 0)
  ) {
    let polylineCoordinates;
    if (typeof roadPath === "string") {
      const decoded = polyline.decode(roadPath);
      polylineCoordinates = decoded.map((coord: number[]) => [coord[0], coord[1]]);
    } else if (Array.isArray(roadPath)) {
      polylineCoordinates = Array.isArray(roadPath[0])
        ? roadPath
        : (roadPath as LatLng[]).map((coord: LatLng) => [coord.latitude, coord.longitude]);
    }
    polylinesJS += `var roadPolyline = L.polyline(${JSON.stringify(
      polylineCoordinates
    )}, { color: '${polylineColor}', weight: 3 }).addTo(map);`;
  }

  let fitBoundsJS = `
  if (window.segmentPolylines && window.segmentPolylines.length > 0) {
    var group = new L.featureGroup(window.segmentPolylines);
  }
  // Initial view set by the selectedSpot useEffect
  `;

  let messageListenerJS = `
    var highlightedIndices = [];
    
    function toggleHighlightSegment(idx) {
      var i = highlightedIndices.indexOf(idx);
      if(i === -1) {
        highlightedIndices.push(idx);
      } else {
        highlightedIndices.splice(i, 1);
      }
      updateSegmentStyles();
    }
    
    function updateSegmentStyles() {
      if(window.segmentPolylines) {
        window.segmentPolylines.forEach(function(polyline, index) {
          var defaultColor = polyline.options.defaultColor || '${polylineColor}';
          if(defaultColor === '#808080'){
            polyline.setStyle({ color: '#808080', weight: (highlightedIndices.indexOf(index) !== -1) ? 6 : 3 });
          } else {
            if(highlightedIndices.indexOf(index) !== -1) {
              polyline.setStyle({ color: '#1D4ED8', weight: 6 });
            } else {
              polyline.setStyle({ color: defaultColor, weight: 3 });
            }
          }
        });
      }
    }
    
    document.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'toggleSegmentHighlight') {
          toggleHighlightSegment(data.index);
        }
      } catch(e) {
        console.error(e);
      }
    });
    
    window.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'toggleSegmentHighlight') {
          toggleHighlightSegment(data.index);
        }
      } catch(e) {
        console.error(e);
      }
    });
  `;

  // Nearby spots markers
  if (nearbySpots && nearbySpots.length > 0) {
    nearbySpots.forEach((spot) => {
      markersJS += `
      var icon = L.divIcon({
        html: '<div style="background-color: #fff; border: 2px solid #28a745; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-mountain-city" style="color: #28a745; font-size: 16px;"></i></div>',
        className: 'custom-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      
      L.marker([${spot.latitude}, ${spot.longitude}], { 
        icon: icon,
        isTouristSpot: true
      })
        .addTo(map)
        .bindPopup(\`
          <div style="max-width: 200px;">
            <b>${spot.name}</b>
            \${${JSON.stringify(spot)}.image_url ? 
              \`<img 
                src="\${${JSON.stringify(spot)}.image_url}" 
                style="width: 100%; height: auto; margin-top: 5px; border-radius: 4px; cursor: pointer;"
                onerror="this.onerror=null;this.src='https://via.placeholder.com/100x75.png?text=Image+Not+Available';"
                onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'spotClick', 
                  name: '${spot.name.replace(/'/g, "\\'")}' 
                }))"
              />\` : 
              '<p style="margin: 5px 0; color: #666;">No image available</p>' 
            }
          </div>
        \`);
      `;
    });
  }

  // Nearby restaurants markers
  if (nearbyRestaurants && nearbyRestaurants.length > 0) {
    nearbyRestaurants.forEach((restaurant) => {
      markersJS += `
        var restaurantIcon = L.divIcon({
          html: '<div style="background-color: #fff; border: 2px solid #dc3545; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"><img src="${getIconUrl(restaurant.amenity)}" style="width: 16px; height: 16px;" /></div>',
          className: 'restaurant-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });
        
        L.marker([${restaurant.latitude}, ${restaurant.longitude}], { 
          icon: restaurantIcon,
          isRestaurant: true
        })
          .addTo(map)
          .bindPopup(\`
            <div style="max-width: 200px;">
              <b>${restaurant.name}</b>
              ${restaurant.cuisine ? `<p style="margin: 2px 0; color: #666;">Cuisine: ${restaurant.cuisine}</p>` : ""}
              \${${JSON.stringify(restaurant)}.image_url ? 
                \`<img 
                  src="\${${JSON.stringify(restaurant)}.image_url}" 
                  style="width: 100%; height: auto; margin-top: 5px; border-radius: 4px; cursor: pointer;"
                  onerror="this.onerror=null;this.src='https://via.placeholder.com/100x75.png?text=Image+Not+Available';"
                  onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'restaurantClick', 
                    name: '${restaurant.name.replace(/'/g, "\\'")}' 
                  }))"
                />\` : 
                '<p style="margin: 5px 0; color: #666;">No image available</p>' 
              }
            </div>
          \`);
      `;
    });
  }

  // Polyline animation if needed
  let polylineJS = "";
  if (
    (typeof roadPath === "string" && roadPath.length > 0) ||
    (Array.isArray(roadPath) && roadPath.length > 0)
  ) {
    let polylineCoordinates;
    if (typeof roadPath === "string") {
      const decoded = polyline.decode(roadPath);
      polylineCoordinates = decoded.map((coord: number[]) => [coord[0], coord[1]]);
    } else {
      polylineCoordinates = roadPath.map((coord: any) =>
        Array.isArray(coord) ? coord : [coord.latitude, coord.longitude]
      );
    }
    if (polylineCoordinates && polylineCoordinates.length > 0) {
      polylineJS = `
      var roadPolyline = L.polyline([], { 
        color: '${polylineColor}', 
        weight: 3,
        smoothFactor: 1
      }).addTo(map);
      
      var coordinates = ${JSON.stringify(polylineCoordinates)};
      var chunkSize = ${Math.max(1, Math.floor(polylineCoordinates.length / 50))};
      var index = 0;
      
      function animatePolyline() {
        if (index >= coordinates.length) {
          map.fitBounds(roadPolyline.getBounds());
          return;
        }
        var chunk = coordinates.slice(0, index + chunkSize);
        roadPolyline.setLatLngs(chunk);
        index += chunkSize;
        setTimeout(animatePolyline, 30);
      }
      animatePolyline();
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        ${fontAwesomeCSS}
        <style>
          html, body { margin: 0; padding: 0; height: 100%; }
          #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
          window.map = map;
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          ${markersJS}
          ${polylinesJS || polylineJS}
          ${fitBoundsJS}
          ${messageListenerJS}
        </script>
      </body>
    </html>
  `;
};
