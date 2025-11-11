import React, { useRef } from 'react';
import { 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  SafeAreaView 
} from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { WebView } from 'react-native-webview';

const { height } = Dimensions.get('window');

const MapScreen = () => {
  const webViewRef = useRef(null);

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
        gap: 6px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      
      .status-tag {
        padding: 3px 10px;
        border-radius: 15px;
        font-size: 9px;
        text-transform: uppercase;
      }
      
      .status-unsafe { background: #e74c3c; color: white; }
      .status-safe { background: #f39c12; color: white; }
      .status-noresponse { background: #ecf0f1; color: #2c3e50; border: 1px solid #bdc3c7; }
      
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
        padding: 10px;
        border-left: 3px solid #3498db;
        font-size: 13px;
      }
      
      .items-list li {
        margin-bottom: 4px;
        padding: 2px 0;
        color: #34495e;
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
        <span class="status-tag status-unsafe">High risk</span>
        <span class="status-tag status-safe">Moderate risk</span>
        <span class="status-tag status-noresponse">no response</span>
      </div>
      
      <div class="pie-chart-section">
        <div class="pie-chart-title">Safety Status</div>
        <div class="pie-chart-container">
          <canvas id="enhancedPieChart"></canvas>
        </div>
        <div class="pie-chart-legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #e74c3c"></div>
            <span>High risk</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #f39c12"></div>
            <span>Moderate risk</span>
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

  var cities = [
    { name: 'Yangon', coords: [16.8661, 96.1951], status: 'High risk', locals: 1500, items: ['water', 'rice', 'blankets', 'medical kits'] },
    { name: 'Mandalay', coords: [21.9587, 96.0891], status: 'High risk', locals: 1200, items: ['food', 'medicine', 'fuel', 'emergency shelters'] },
    { name: 'Naypyidaw', coords: [19.7633, 96.0785], status: 'Moderate risk', locals: 800, items: ['medical aid', 'tents', 'clean water'] },
    { name: 'Bago', coords: [17.3349, 96.5063], status: 'Moderate risk', locals: 1000, items: ['clothes', 'water', 'flashlights', 'first aid'] },
    { name: 'Taunggyi', coords: [20.7899, 97.0332], status: 'Moderate risk', locals: 900, items: ['first aid', 'rice', 'emergency blankets'] }
  ];

  var animatedCircles = [];
  var enhancedChart;

  cities.forEach(city => {
    var color = city.status === 'Moderate risk' ? 'orange' : 'red';

    // Main circle - make sure it's on top and fully clickable
    var circle = L.circle(city.coords, {
      color: color,
      fillColor: color,
      fillOpacity: 0.3,
      radius: 50000,
      className: 'animated-circle',
      interactive: true,
      bubblingMouseEvents: true
    }).addTo(map);

    // Create ripple effect circles - make sure they don't block clicks
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

    // Bring main circle to front to ensure it receives clicks
    circle.bringToFront();

    animatedCircles.push({
      main: circle,
      ripples: [ripple1, ripple2],
      color: color,
      coords: city.coords
    });

    // Marker for click area - make it more visible for debugging
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

    // Add click events with better debugging
    circle.on('click', function(e) {
      console.log('Circle clicked:', city.name);
      e.originalEvent.stopPropagation();
      showEnhancedInfo(city);
    });

    marker.on('click', function(e) {
      console.log('Marker clicked:', city.name);
      e.originalEvent.stopPropagation();
      showEnhancedInfo(city);
    });

    // Also add click to the tooltip itself
    setTimeout(() => {
      var tooltip = marker.getElement()?.querySelector('.leaflet-tooltip');
      if (tooltip) {
        tooltip.style.pointerEvents = 'auto';
        tooltip.addEventListener('click', function(e) {
          console.log('Tooltip clicked:', city.name);
          e.stopPropagation();
          showEnhancedInfo(city);
        });
      }
    }, 100);
  });

  function showEnhancedInfo(city) {
    console.log('Showing info for:', city.name);
    var enhancedPanel = document.getElementById('enhancedInfoPanel');
    document.getElementById('enhancedCityName').textContent = city.name;
    document.getElementById('enhancedLocals').textContent = "Approx total Locals: " + city.locals;
    
    var statusTags = document.querySelectorAll('.status-tag');
    statusTags.forEach(tag => {
      tag.style.opacity = '0.3';
    });
    
    if (city.status === 'High risk') {
      document.querySelector('.status-unsafe').style.opacity = '1';
    } else if (city.status === 'Moderate risk') {
      document.querySelector('.status-safe').style.opacity = '1';
    }
    document.querySelector('.status-noresponse').style.opacity = '1';
    
    var enhancedItemsList = document.getElementById('enhancedItemsList');
    enhancedItemsList.innerHTML = "";
    city.items.forEach(item => {
      var li = document.createElement('li');
      li.textContent = item;
      enhancedItemsList.appendChild(li);
    });
    
    createEnhancedPieChart(city);
    enhancedPanel.style.display = 'block';
  }
  
  function createEnhancedPieChart(city) {
    const enhancedCtx = document.getElementById('enhancedPieChart');
    
    if (enhancedChart) {
      enhancedChart.destroy();
    }
    
    let unsafeData, safeData;
    if (city.status === 'High risk') {
      unsafeData = 70;
      safeData = 20;
    } else if (city.status === 'Moderate risk') {
      unsafeData = 10;
      safeData = 70;
    } else {
      unsafeData = 30;
      safeData = 30;
    }
    
    enhancedChart = new Chart(enhancedCtx, {
      type: 'pie',
      data: {
        labels: ['High risk', 'Moderate risk', 'No Response'],
        datasets: [{
          data: [unsafeData, safeData, 10],
          backgroundColor: ['#e74c3c', '#f39c12', '#ecf0f1'],
          borderColor: ['#c0392b', '#e67e22', '#bdc3c7'],
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
    var city = cities.find(c => c.name === cityName);
    if (city) {
      // Use flyTo for smoother animation with better performance
      map.flyTo(city.coords, 7, {
        duration: 1.5, // Slightly longer for smoother transition
        easeLinearity: 0.25
      });
      
      // Show the info panel after the animation completes
      setTimeout(function() {
        showEnhancedInfo(city);
      }, 1600); // Match the animation duration + small buffer
    }
  }
</script>
  </body>
</html>
`;

  const citiesData = [
    { 
      name: 'Yangon', 
      status: 'High risk', 
      time: '4 mins ago',
      locals: 1500,
      waterLevel: '2.1m',
      items: ['water', 'rice', 'blankets', 'medical kits']
    },
    { 
      name: 'Mandalay', 
      status: 'High risk', 
      time: '6 mins ago',
      locals: 1200,
      waterLevel: '1.8m',
      items: ['food', 'medicine', 'fuel', 'emergency shelters']
    },
    { 
      name: 'Bago', 
      status: 'Moderate risk', 
      time: '8 mins ago',
      locals: 1000,
      waterLevel: '1.2m',
      items: ['clothes', 'water', 'flashlights', 'first aid']
    },
    { 
      name: 'Taunggyi', 
      status: 'Moderate risk', 
      time: '15 mins ago',
      locals: 900,
      waterLevel: '0.9m',
      items: ['first aid', 'rice', 'emergency blankets']
    },
    { 
      name: 'Naypyidaw', 
      status: 'Moderate risk', 
      time: '20 mins ago',
      locals: 800,
      waterLevel: '0.7m',
      items: ['medical aid', 'tents', 'clean water']
    }
  ];

  const sortedCities = [...citiesData].sort((a, b) => {
    if (a.status === 'High risk' && b.status !== 'High risk') return -1;
    if (a.status !== 'High risk' && b.status === 'High risk') return 1;
    const timeA = parseInt(a.time);
    const timeB = parseInt(b.time);
    return timeA - timeB;
  });

  const handleCityClick = (city) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        showCityFromReactNative('${city.name}');
        true;
      `);
    }
  };

  const getRiskColor = (status) => {
    return status === 'High risk' ? '#e74c3c' : '#f39c12';
  };

  const getRiskBackground = (status) => {
    return status === 'High risk' ? '#e74c3c' : '#f39c12';
  };

  const getBorderColor = (status) => {
    return status === 'High risk' ? '#c0392b' : '#e67e22';
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      {/* Map Section */}
      <Box className="h-1/2 bg-gray-100">
        <WebView 
          ref={webViewRef}
          originWhitelist={['*']} 
          source={{ html }} 
          className="flex-1"
        />
      </Box>

      {/* Cities Data Section */}
      <Box className="flex-1 p-4 bg-white">
        <Heading className="text-2xl font-bold text-gray-800 mb-4">
          Flood Risk Areas
        </Heading>
        
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {sortedCities.map((city, index) => (
            <TouchableOpacity 
              key={index} 
              className="bg-gray-50 rounded-xl p-4 mb-3 border-l-4 shadow-sm"
              style={{ borderLeftColor: getBorderColor(city.status) }}
              onPress={() => handleCityClick(city)}
            >
              <Box className="flex-row items-center">
                {/* Risk Indicator */}
                <Box 
                  className="w-10 h-10 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: getRiskBackground(city.status) }}
                >
                  <Text className="text-white text-xs font-bold">
                    {city.status === 'High risk' ? 'HIGH' : 'MOD'}
                  </Text>
                </Box>
                
                {/* City Details */}
                <Box className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">
                    {city.name}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">
                    {city.time}
                  </Text>
                  <Box className="flex-row gap-3">
                    <Text className="text-gray-500 text-xs">
                      👥 {city.locals} locals
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      🌊 {city.waterLevel}
                    </Text>
                  </Box>
                </Box>
                
                {/* Status Badge */}
                <Box 
                  className="px-2 py-1 rounded-lg"
                  style={{ backgroundColor: getRiskColor(city.status) }}
                >
                  <Text className="text-white text-xs font-bold uppercase">
                    {city.status}
                  </Text>
                </Box>
              </Box>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
};

export default MapScreen;