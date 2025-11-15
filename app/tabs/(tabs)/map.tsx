import React, { useRef, useEffect, useMemo, useCallback, useState } from "react";
import {
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  View,
  PanResponder,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { WebView } from "react-native-webview";
import { useQuery } from "@tanstack/react-query";
import { floodingApi } from "@/lib/api/flooding";
import { RefreshCw } from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MapScreen = () => {
  const webViewRef = useRef<any>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Draggable panel state
  const minHeight = SCREEN_HEIGHT * 0.2; // 20% minimum
  const maxHeight = SCREEN_HEIGHT * 0.8; // 80% maximum
  const initialHeight = SCREEN_HEIGHT * 0.5; // 50% initial
  const panelHeight = useRef(new Animated.Value(initialHeight)).current;
  const [panelHeightValue, setPanelHeightValue] = useState(initialHeight);

  const {
    data: floodingData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["flooding-data"],
    queryFn: () => floodingApi.getChancePercentageByCityTown(),
  });

  useEffect(() => {
    if (isRefetching) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).stop();
    }
  }, [isRefetching, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Pan responder for dragging the panel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        panelHeight.setOffset(panelHeightValue);
        panelHeight.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Smooth real-time dragging without clamping during move
        const newHeight = panelHeightValue - gestureState.dy;
        panelHeight.setValue(newHeight - panelHeightValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        panelHeight.flattenOffset();
        const newHeight = panelHeightValue - gestureState.dy;
        let finalHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
        
        // Snap to nearest snap point if close
        const snapPoints = [
          SCREEN_HEIGHT * 0.2,  // 20%
          SCREEN_HEIGHT * 0.4,  // 40%
          SCREEN_HEIGHT * 0.5,  // 50%
          SCREEN_HEIGHT * 0.6,  // 60%
          SCREEN_HEIGHT * 0.8,  // 80%
        ];
        
        const snapThreshold = 50;
        const closestSnap = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - finalHeight) < Math.abs(prev - finalHeight) ? curr : prev
        );
        
        if (Math.abs(closestSnap - finalHeight) < snapThreshold) {
          finalHeight = closestSnap;
        } else {
          // Clamp to min/max if not snapping
          finalHeight = Math.max(minHeight, Math.min(maxHeight, finalHeight));
        }
        
        Animated.spring(panelHeight, {
          toValue: finalHeight,
          useNativeDriver: false,
          tension: 80,
          friction: 8,
          velocity: gestureState.vy || 0,
        }).start(() => {
          setPanelHeightValue(finalHeight);
        });
        
        setPanelHeightValue(finalHeight);
      },
    })
  ).current;

  const cities = useMemo(() => {
    if (!floodingData?.data) return [];
    return floodingData.data.map((item) => ({
      name: `${item.city} - ${item.township}`,
      city: item.city,
      township: item.township,
      coords: item.coords,
      status: item.status === "High Risk" ? "High risk" : "Moderate risk",
      locals: item.locals,
      chance: item.chance,
      items: Object.entries(item.items).map(
        ([key, value]) => `${key}: ${value}`
      ),
      safePercentage: item.safePercentage,
      unsafePercentage: item.unsafePercentage,
      noresponsePercentage: item.noresponsePercentage,
    }));
  }, [floodingData]);

  const injectCitiesData = useCallback(() => {
    if (cities.length > 0 && webViewRef.current) {
      const citiesJson = JSON.stringify(cities);
      const script = `
        (function() {
          try {
            var citiesData = ${citiesJson};
            if (typeof window.initializeMapWithData === 'function') {
              window.initializeMapWithData(citiesData);
            } else if (typeof initializeMapWithData === 'function') {
              initializeMapWithData(citiesData);
            } else {
              setTimeout(function() {
                if (typeof window.initializeMapWithData === 'function') {
                  window.initializeMapWithData(citiesData);
                } else if (typeof initializeMapWithData === 'function') {
                  initializeMapWithData(citiesData);
                }
              }, 1000);
            }
          } catch(e) {
            console.error('Error injecting data:', e);
          }
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [cities]);

  useEffect(() => {
    if (cities.length > 0) {
      const timer = setTimeout(() => {
        injectCitiesData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cities, injectCitiesData]);

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body, html { margin:0; padding:0; height:100%; width:100%; }
      #map { width:100%; height:100%; }
      
      .enhanced-info-panel {
        position: absolute;
        top: 20px;
        left: 20px;
        background: white;
        border: 3px solid #2c3e50;
        border-radius: 15px;
        padding: 15px;
        font-family: 'Arial', sans-serif;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        width: 280px;
        max-height: 80vh;
        overflow-y: auto;
        display: none;
        z-index: 1000;
        animation: slideIn 0.4s ease-out;
      }
      
      @keyframes slideIn {
        from { transform: translateX(-100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .city-header {
        font-size: 20px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 6px;
        border-bottom: 2px solid #ecf0f1;
        padding-bottom: 6px;
      }
      
      .locals-count {
        font-size: 14px;
        color: #7f8c8d;
        margin-bottom: 12px;
        font-style: italic;
      }
      
      .status-tags {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      
      .status-tag {
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.3px;
        transition: opacity 0.3s ease;
      }
      
      .status-safe { 
        background: #d1fae5; 
        color: #065f46; 
        border: 1px solid #10b981;
      }
      .status-unsafe { 
        background: #fee2e2; 
        color: #991b1b; 
        border: 1px solid #ef4444;
      }
      .status-noresponse { 
        background: #f3f4f6; 
        color: #4b5563; 
        border: 1px solid #d1d5db; 
      }
      
      .pie-chart-section {
        margin: 12px 0;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 3px solid #3498db;
      }
      
      .pie-chart-title {
        font-size: 14px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 8px;
        text-align: center;
      }
      
      .pie-chart-container {
        width: 100%;
        height: 100px;
        position: relative;
        margin: 8px 0;
      }
      
      .pie-chart-legend {
        display: flex;
        justify-content: space-around;
        margin-top: 8px;
        font-size: 10px;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      
      .required-section {
        margin-top: 12px;
      }
      
      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 8px;
      }
      
      .items-list {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 12px;
        border-left: 3px solid #3498db;
        font-size: 13px;
        list-style: none;
        margin: 0;
      }
      
      .items-list li {
        margin-bottom: 0;
        padding: 0;
        color: #34495e;
      }
      
      .items-list li:last-child {
        border-bottom: none !important;
      }
      
      .close-btn {
        position: absolute;
        top: 8px;
        right: 12px;
        background: none;
        border: none;
        font-size: 18px;
        font-weight: bold;
        color: #7f8c8d;
        cursor: pointer;
        padding: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .close-btn:hover {
        background: #ecf0f1;
        color: #e74c3c;
      }

      .city-label {
        font-weight: bold;
        color: #333;
        background: rgba(255,255,255,0.7);
        border-radius: 5px;
        padding: 2px 4px;
        cursor: pointer;
      }

      .map-legend {
        position: absolute;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #2c3e50;
        border-radius: 10px;
        padding: 15px;
        font-family: 'Arial', sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        min-width: 90px;
      }

      .map-legend-title {
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 10px;
        border-bottom: 2px solid #ecf0f1;
        padding-bottom: 5px;
      }

      .map-legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
        color: #34495e;
      }

      .map-legend-circle {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 10px;
      }

      .map-legend-circle.high-risk {
        background: red;
        border-color: darkred;
      }

      .map-legend-circle.moderate-risk {
        background: orange;
        border-color: darkorange;
      }

      @keyframes pulse {
        0% {
          r: 50000;
          opacity: 0.3;
        }
        50% {
          r: 60000;
          opacity: 0.15;
        }
        100% {
          r: 50000;
          opacity: 0.3;
        }
      }

      @keyframes ripple {
        0% {
          r: 50000;
          opacity: 0.4;
        }
        100% {
          r: 80000;
          opacity: 0;
        }
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <div class="map-legend">
      <div class="map-legend-title">Risk Levels</div>
      <div class="map-legend-item">
        <div class="map-legend-circle high-risk"></div>
        <span>High Risk</span>
      </div>
      <div class="map-legend-item">
        <div class="map-legend-circle moderate-risk"></div>
        <span>Moderate Risk</span>
      </div>
    </div>

    <div class="enhanced-info-panel" id="enhancedInfoPanel">
      <button class="close-btn" onclick="closeEnhancedInfo()">×</button>
      <div class="city-header" id="enhancedCityName">City Name</div>
      <div class="locals-count" id="enhancedLocals">aprx total Locals: 1000</div>
      
      <div class="status-tags">
        <span class="status-tag status-safe">Safe</span>
        <span class="status-tag status-unsafe">Unsafe</span>
        <span class="status-tag status-noresponse">No Response</span>
      </div>
      
      <div class="pie-chart-section">
        <div class="pie-chart-title">Safety Status</div>
        <div class="pie-chart-container">
          <canvas id="enhancedPieChart"></canvas>
        </div>
        <div class="pie-chart-legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #10B981"></div>
            <span>Safe</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #e74c3c"></div>
            <span>Unsafe</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #ecf0f1; border: 1px solid #bdc3c7"></div>
            <span>No Response</span>
          </div>
        </div>
      </div>
      
      <div class="required-section">
        <div class="section-title">Required Items</div>
        <ul class="items-list" id="enhancedItemsList">
          <li>Loading items...</li>
        </ul>
      </div>
    </div>

    <script>
  var map = L.map('map', {
    attributionControl: false
  }).setView([20.5, 96.2], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);

  var cities = [];
  var mapInitialized = false;
  var mapReady = false;

  map.whenReady(function() {
    mapReady = true;
    if (cities.length > 0) {
      renderCities();
    }
  });

  window.initializeMapWithData = function(citiesData) {
    console.log('initializeMapWithData called with', citiesData);
    cities = citiesData || [];
    
    if (mapReady) {
      if (!mapInitialized) {
        mapInitialized = true;
        renderCities();
      } else {
        clearMap();
        renderCities();
      }
    } else {
      map.whenReady(function() {
        mapReady = true;
        if (!mapInitialized) {
          mapInitialized = true;
        }
        renderCities();
      });
    }
  };

  function clearMap() {
    animatedCircles.forEach(circleObj => {
      map.removeLayer(circleObj.main);
      circleObj.ripples.forEach(ripple => map.removeLayer(ripple));
      if (circleObj.marker) map.removeLayer(circleObj.marker);
    });
    animatedCircles = [];
  }

  function renderCities() {
  cities.forEach(city => {
    var color = city.status === 'Moderate risk' ? 'orange' : 'red';

    var circle = L.circle(city.coords, {
      color: color,
      fillColor: color,
      fillOpacity: 0.3,
      radius: 50000,
      className: 'animated-circle',
      interactive: true,
      bubblingMouseEvents: true
    }).addTo(map);

    var ripple1 = L.circle(city.coords, {
      color: color,
      fillColor: 'transparent',
      weight: 2,
      opacity: 0.4,
      radius: 50000,
      className: 'ripple-circle',
      interactive: false,
      bubblingMouseEvents: false
    }).addTo(map);

    var ripple2 = L.circle(city.coords, {
      color: color,
      fillColor: 'transparent',
      weight: 2,
      opacity: 0.4,
      radius: 50000,
      className: 'ripple-circle',
      interactive: false,
      bubblingMouseEvents: false
    }).addTo(map);

    circle.bringToFront();

    var marker = L.marker(city.coords, { 
      opacity: 0.1,
      interactive: true 
    });
    marker.addTo(map);

    marker.bindTooltip(city.name, { 
      permanent: true, 
      direction: 'center', 
      className: 'city-label',
      interactive: true 
    });

    circle.on('click', function(e) {
      e.originalEvent.stopPropagation();
      showEnhancedInfo(city);
    });

    marker.on('click', function(e) {
      e.originalEvent.stopPropagation();
      showEnhancedInfo(city);
    });

    setTimeout(() => {
      var tooltip = marker.getElement()?.querySelector('.leaflet-tooltip');
      if (tooltip) {
        tooltip.style.pointerEvents = 'auto';
        tooltip.addEventListener('click', function(e) {
          e.stopPropagation();
          showEnhancedInfo(city);
        });
      }
    }, 100);

      animatedCircles.push({
        main: circle,
        ripples: [ripple1, ripple2],
        marker: marker,
        color: color,
        coords: city.coords
      });
    });
  }

  var animatedCircles = [];
  var enhancedChart;

  function showEnhancedInfo(city) {
    var enhancedPanel = document.getElementById('enhancedInfoPanel');
    document.getElementById('enhancedCityName').textContent = city.name;
    document.getElementById('enhancedLocals').textContent = "Approx total Locals: " + city.locals.toLocaleString();
    
    var statusTags = document.querySelectorAll('.status-tag');
    var safeTag = document.querySelector('.status-safe');
    var unsafeTag = document.querySelector('.status-unsafe');
    var noResponseTag = document.querySelector('.status-noresponse');
    
    statusTags.forEach(tag => {
      tag.style.opacity = '0.4';
      tag.style.transform = 'scale(0.95)';
    });
    
    var safePercent = city.safePercentage || 0;
    var unsafePercent = city.unsafePercentage || 0;
    var noResponsePercent = city.noresponsePercentage || 0;
    
    if (safePercent > 0) {
      safeTag.style.opacity = '1';
      safeTag.style.transform = 'scale(1)';
    }
    if (unsafePercent > 0) {
      unsafeTag.style.opacity = '1';
      unsafeTag.style.transform = 'scale(1)';
    }
    if (noResponsePercent > 0) {
      noResponseTag.style.opacity = '1';
      noResponseTag.style.transform = 'scale(1)';
    }
    
    var enhancedItemsList = document.getElementById('enhancedItemsList');
    enhancedItemsList.innerHTML = "";
    if (city.items && Array.isArray(city.items)) {
    city.items.forEach(item => {
        var parts = item.split(':');
        var itemName = parts[0].trim();
        var itemPercent = parts[1] ? parseFloat(parts[1].trim()) : 0;
        
      var li = document.createElement('li');
        li.style.padding = '10px 0';
        li.style.borderBottom = '1px solid #e5e7eb';
        
        var itemContainer = document.createElement('div');
        itemContainer.style.display = 'flex';
        itemContainer.style.justifyContent = 'space-between';
        itemContainer.style.alignItems = 'center';
        itemContainer.style.marginBottom = '8px';
        
        var nameSpan = document.createElement('span');
        nameSpan.textContent = itemName.charAt(0).toUpperCase() + itemName.slice(1);
        nameSpan.style.fontWeight = '500';
        nameSpan.style.color = '#374151';
        nameSpan.style.fontSize = '13px';
        
        var percentSpan = document.createElement('span');
        percentSpan.textContent = itemPercent + '%';
        percentSpan.style.background = '#3B82F6';
        percentSpan.style.color = 'white';
        percentSpan.style.padding = '4px 10px';
        percentSpan.style.borderRadius = '12px';
        percentSpan.style.fontSize = '11px';
        percentSpan.style.fontWeight = 'bold';
        percentSpan.style.minWidth = '45px';
        percentSpan.style.textAlign = 'center';
        
        itemContainer.appendChild(nameSpan);
        itemContainer.appendChild(percentSpan);
        
        var progressBarContainer = document.createElement('div');
        progressBarContainer.style.width = '100%';
        progressBarContainer.style.height = '6px';
        progressBarContainer.style.background = '#e5e7eb';
        progressBarContainer.style.borderRadius = '3px';
        progressBarContainer.style.overflow = 'hidden';
        progressBarContainer.style.marginTop = '4px';
        
        var progressBar = document.createElement('div');
        progressBar.style.width = itemPercent + '%';
        progressBar.style.height = '100%';
        progressBar.style.background = itemPercent >= 15 ? '#10B981' : itemPercent >= 10 ? '#f59e0b' : '#e74c3c';
        progressBar.style.transition = 'width 0.5s ease';
        progressBar.style.borderRadius = '3px';
        
        progressBarContainer.appendChild(progressBar);
        
        li.appendChild(itemContainer);
        li.appendChild(progressBarContainer);
      enhancedItemsList.appendChild(li);
    });
    }
    
    createEnhancedPieChart(city);
    enhancedPanel.style.display = 'block';
  }
  
  function createEnhancedPieChart(city) {
    const enhancedCtx = document.getElementById('enhancedPieChart');
    
    if (enhancedChart) {
      enhancedChart.destroy();
    }
    
    const safeData = city.safePercentage || 0;
    const unsafeData = city.unsafePercentage || 0;
    const noResponseData = city.noresponsePercentage || 0;
    
    enhancedChart = new Chart(enhancedCtx, {
      type: 'pie',
      data: {
        labels: ['Safe', 'Unsafe', 'No Response'],
        datasets: [{
          data: [safeData, unsafeData, noResponseData],
          backgroundColor: ['#10B981', '#e74c3c', '#ecf0f1'],
          borderColor: ['#059669', '#c0392b', '#bdc3c7'],
          borderWidth: 1,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return label + ': ' + value + '%';
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 800
        }
      }
    });
  }
  
  function closeEnhancedInfo() {
    var enhancedPanel = document.getElementById('enhancedInfoPanel');
    enhancedPanel.style.display = 'none';
  }
  
  map.on('click', function(e) {
    // Only close if clicking directly on map background
    if (e.originalEvent.target === map.getContainer()) {
      closeEnhancedInfo();
    }
  });

  function animateCircles() {
    animatedCircles.forEach((circleObj, index) => {
      let pulsePhase = (Date.now() / 2000 + index * 0.3) % 1;
      let pulseRadius = 50000 + Math.sin(pulsePhase * Math.PI * 2) * 5000;
      let pulseOpacity = 0.3 + Math.sin(pulsePhase * Math.PI * 2) * 0.1;
      circleObj.main.setRadius(pulseRadius);
      circleObj.main.setStyle({ fillOpacity: pulseOpacity });

      circleObj.ripples.forEach((ripple, rippleIndex) => {
        let ripplePhase = (Date.now() / 3000 + index * 0.3 + rippleIndex * 0.5) % 1;
        let rippleRadius = 50000 + ripplePhase * 30000;
        let rippleOpacity = 0.4 * (1 - ripplePhase);
        ripple.setRadius(rippleRadius);
        ripple.setStyle({ opacity: rippleOpacity });
      });
    });

    requestAnimationFrame(animateCircles);
  }

  animateCircles();

  function showCityFromReactNative(cityName) {
    var city = cities.find(c => c.name === cityName || c.city === cityName);
    if (city) {
      map.flyTo(city.coords, 7, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      
      setTimeout(function() {
        showEnhancedInfo(city);
      }, 1600);
    }
  }
</script>
  </body>
</html>
`;

  const citiesListData = useMemo(() => {
    if (!floodingData?.data) return [];

    return floodingData.data.map((item) => ({
      name: item.city,
      township: item.township,
      fullName: `${item.city} - ${item.township}`,
      status: item.status === "High Risk" ? "High risk" : "Moderate risk",
      chance: item.chance,
      locals: item.locals,
      items: Object.keys(item.items),
    }));
  }, [floodingData]);

  const sortedCities = useMemo(() => {
    return [...citiesListData].sort((a, b) => {
      if (a.status === "High risk" && b.status !== "High risk") return -1;
      if (a.status !== "High risk" && b.status === "High risk") return 1;
      return b.chance - a.chance;
    });
  }, [citiesListData]);

  const handleCityClick = (city: { fullName: string }) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        showCityFromReactNative('${city.fullName}');
        true;
      `);
    }
  };

  const getRiskColor = (status: string) => {
    return status === "High risk" ? "#e74c3c" : "#f39c12";
  };

  const getRiskBackground = (status: string) => {
    return status === "High risk" ? "#e74c3c" : "#f39c12";
  };

  const getBorderColor = (status: string) => {
    return status === "High risk" ? "#c0392b" : "#e67e22";
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50" edges={["top", "bottom"]}>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading flood data...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50" edges={["top", "bottom"]}>
        <Box className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-700 text-lg font-semibold text-center">
            Failed to load flood data
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            Please try again later
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  // Calculate map height based on panel height
  const mapHeight = panelHeight.interpolate({
    inputRange: [minHeight, maxHeight],
    outputRange: [SCREEN_HEIGHT - minHeight, SCREEN_HEIGHT - maxHeight],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView className="flex-1 bg-blue-50" edges={["top", "bottom"]}>
      <Animated.View style={{ height: mapHeight, overflow: 'hidden' }}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          style={{ flex: 1 }}
          onLoadEnd={injectCitiesData}
        />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: panelHeight,
          backgroundColor: "white",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 15,
          zIndex: 1000,
          overflow: 'hidden',
        }}
      >
        {/* Drag Handle */}
        <View
          {...panResponder.panHandlers}
          style={{
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#CBD5E1",
              borderRadius: 2,
            }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Box className="px-4 pt-2 pb-3">
            <Box className="flex-row items-center justify-between">
              <Heading className="text-lg font-semibold text-gray-800">
                Flood Risk Areas
              </Heading>
              <TouchableOpacity
                onPress={() => refetch()}
                disabled={isRefetching}
                className="p-1.5 rounded-full bg-blue-50"
                style={{ opacity: isRefetching ? 0.6 : 1 }}
              >
                <Animated.View
                  style={{
                    transform: [{ rotate: rotation }],
                  }}
                >
                  <RefreshCw size={16} color="#3B82F6" />
                </Animated.View>
              </TouchableOpacity>
            </Box>
          </Box>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {sortedCities.length === 0 ? (
              <Box className="items-center justify-center py-8">
                <Text className="text-gray-400 text-sm">
                  No flood data available
                </Text>
              </Box>
            ) : (
              sortedCities.map((city, index) => (
                <TouchableOpacity
                  key={`${city.name}-${city.township}-${index}`}
                  className="bg-white rounded-lg p-3 mb-2"
                  style={{
                    //  borderBottomWidth: 1,
                     borderBottomColor: getBorderColor(city.status),
                  }}
                  onPress={() => handleCityClick(city)}
                >
                  <Box className="flex-row items-center">
                    <Box
                      className="w-8 h-8 rounded-full justify-center items-center mr-3"
                      style={{
                        backgroundColor: getRiskBackground(city.status),
                      }}
                    >
                      <Text className="text-white text-xs font-bold">
                        {city.status === "High risk" ? "H" : "M"}
                      </Text>
                    </Box>

                    <Box className="flex-1">
                      <Text className="text-base font-semibold text-gray-800">
                        {city.name}
                      </Text>
                      <Text className="text-gray-500 text-xs mb-1">
                        {city.township}
                      </Text>
                      <Box className="flex-row gap-2">
                        <Text className="text-gray-400 text-xs">
                          {city.locals.toLocaleString()} locals
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {city.chance}% chance
                        </Text>
                      </Box>
                    </Box>

                    <Box
                      className="px-2 py-0.5 rounded"
                      style={{ backgroundColor: getRiskColor(city.status) }}
                    >
                      <Text className="text-white text-xs font-semibold">
                        {city.status}
                      </Text>
                    </Box>
                  </Box>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default MapScreen;
