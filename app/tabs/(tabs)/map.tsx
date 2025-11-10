import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const MapScreen = () => {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body, html { margin:0; padding:0; height:100%; }
      #map { width:100%; height:100vh; }
      .info-panel {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: white;
        border: 2px solid #333;
        border-radius: 10px;
        padding: 10px 15px;
        font-family: 'Comic Sans MS', cursive;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        width: 220px;
        display: none;
        transition: all 0.3s ease;
      }
      .chart-container {
        width: 100%;
        height: 100px;
      }
      .legend {
        font-size: 12px;
      }
      .legend div {
        margin-bottom: 4px;
      }
      .legend span {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 5px;
      }
      ul {
        margin: 0;
        padding-left: 20px;
      }
      .city-label {
        font-weight: bold;
        color: #333;
        background: rgba(255,255,255,0.7);
        border-radius: 5px;
        padding: 2px 4px;
        cursor: pointer;
      }
      
      /* NEW STYLES ADDED FOR ENHANCED INFO BOX */
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
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .status-unsafe { background: #e74c3c; color: white; }
      .status-safe { background: #2ecc71; color: white; }
      .status-noresponse { background: #ecf0f1; color: #2c3e50; border: 1px solid #bdc3c7; }
      
      /* NEW: Smaller Pie Chart Styles */
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
        height: 120px;
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
    </style>
  </head>
  <body>
    <div id="map"></div>

    <div class="info-panel" id="infoPanel">
      <strong id="cityName"></strong><br>
      <span id="locals"></span>
      <div class="chart-container">
        <canvas id="pieChart"></canvas>
      </div>
      <div class="legend">
        <div><span style="background:#e74c3c"></span>unsafe</div>
        <div><span style="background:#2ecc71"></span>safe</div>
        <div><span style="background:#ecf0f1; border:1px solid #999"></span>no response</div>
      </div>
      <hr/>
      <strong>required items:</strong>
      <ul id="itemsList"></ul>
    </div>
    
    <!-- NEW ENHANCED INFO BOX -->
    <div class="enhanced-info-panel" id="enhancedInfoPanel">
      <button class="close-btn" onclick="closeEnhancedInfo()">×</button>
      <div class="city-header" id="enhancedCityName">City Name</div>
      <div class="locals-count" id="enhancedLocals">aprx total Locals: 1000</div>
      
      <div class="status-tags">
        <span class="status-tag status-unsafe">unsafe</span>
        <span class="status-tag status-safe">safe</span>
        <span class="status-tag status-noresponse">no response</span>
      </div>
      
      <!-- NEW: Smaller Pie Chart Section -->
      <div class="pie-chart-section">
        <div class="pie-chart-title">Safety Status</div>
        <div class="pie-chart-container">
          <canvas id="enhancedPieChart"></canvas>
        </div>
        <div class="pie-chart-legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #e74c3c"></div>
            <span>Unsafe</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #2ecc71"></div>
            <span>Safe</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #ecf0f1; border: 1px solid #bdc3c7"></div>
            <span>No Response</span>
          </div>
        </div>
      </div>
      
      <div class="required-section">
        <div class="section-title">required items</div>
        <ul class="items-list" id="enhancedItemsList">
          <li>bla bla</li>
          <li>bla bla</li>
          <li>bla bla</li>
          <li>bla bla</li>
        </ul>
      </div>
    </div>

    <script>
      var map = L.map('map').setView([20.5, 96.2], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      var cities = [
        { name: 'Yangon', coords: [16.8661, 96.1951], status: 'unsafe', locals: 1500, items: ['water', 'rice', 'blankets'] },
        { name: 'Mandalay', coords: [21.9587, 96.0891], status: 'unsafe', locals: 1200, items: ['food', 'medicine', 'fuel'] },
        { name: 'Naypyidaw', coords: [19.7633, 96.0785], status: 'safe', locals: 800, items: ['medical aid', 'tents'] },
        { name: 'Bago', coords: [17.3349, 96.5063], status: 'unsafe', locals: 1000, items: ['clothes', 'water', 'flashlights'] },
        { name: 'Taunggyi', coords: [20.7899, 97.0332], status: 'safe', locals: 900, items: ['first aid', 'rice'] }
      ];

      var chart; // reference to Chart.js instance for original panel
      var enhancedChart; // NEW: reference for enhanced panel chart

      cities.forEach(city => {
        var color = city.status === 'safe' ? 'green' : 'red';
        // Circle zone
        var circle = L.circle(city.coords, {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          radius: 50000
        }).addTo(map);
        
        // Marker for click area
        var marker = L.marker(city.coords, { opacity: 0 });
        marker.addTo(map);
        
        // Tooltip label (on marker)
        marker.bindTooltip(city.name, { permanent: true, direction: 'center', className: 'city-label' });

        // Click both circle and marker
        circle.on('click', () => showInfo(city));
        marker.on('click', () => showInfo(city));
      });

      function showInfo(city) {
        var panel = document.getElementById('infoPanel');
        document.getElementById('cityName').innerHTML = city.name + ", bla bla";
        document.getElementById('locals').innerHTML = "aprx total Locals: " + city.locals;

        // Populate list
        var itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = "";
        city.items.forEach(i => {
          var li = document.createElement('li');
          li.textContent = i;
          itemsList.appendChild(li);
        });

        // Show panel
        panel.style.display = 'block';

        // Update Chart
        const ctx = document.getElementById('pieChart');
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Unsafe', 'Safe', 'No response'],
            datasets: [{
              data: [
                city.status === 'unsafe' ? 70 : 10,
                city.status === 'safe' ? 70 : 20,
                10
              ],
              backgroundColor: ['#e74c3c', '#2ecc71', '#ecf0f1'],
              borderWidth: 1
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: false
          }
        });
        
        // NEW CODE: Show enhanced info box
        showEnhancedInfo(city);
      }
      
      // NEW FUNCTION: Show enhanced info box
      function showEnhancedInfo(city) {
        var enhancedPanel = document.getElementById('enhancedInfoPanel');
        document.getElementById('enhancedCityName').textContent = city.name;
        document.getElementById('enhancedLocals').textContent = "aprx total Locals: " + city.locals;
        
        // Update status tags based on city status
        var statusTags = document.querySelectorAll('.status-tag');
        statusTags.forEach(tag => {
          tag.style.opacity = '0.3';
        });
        
        if (city.status === 'unsafe') {
          document.querySelector('.status-unsafe').style.opacity = '1';
        } else if (city.status === 'safe') {
          document.querySelector('.status-safe').style.opacity = '1';
        }
        document.querySelector('.status-noresponse').style.opacity = '1';
        
        // Populate items list
        var enhancedItemsList = document.getElementById('enhancedItemsList');
        enhancedItemsList.innerHTML = "";
        city.items.forEach(item => {
          var li = document.createElement('li');
          li.textContent = item;
          enhancedItemsList.appendChild(li);
        });
        
        // NEW: Create enhanced pie chart
        createEnhancedPieChart(city);
        
        // Show the enhanced panel
        enhancedPanel.style.display = 'block';
      }
      
      // NEW FUNCTION: Create enhanced pie chart
      function createEnhancedPieChart(city) {
        const enhancedCtx = document.getElementById('enhancedPieChart');
        
        // Destroy existing chart if it exists
        if (enhancedChart) {
          enhancedChart.destroy();
        }
        
        // Calculate data based on city status
        let unsafeData, safeData;
        if (city.status === 'unsafe') {
          unsafeData = 70;
          safeData = 20;
        } else if (city.status === 'safe') {
          unsafeData = 10;
          safeData = 70;
        } else {
          unsafeData = 30;
          safeData = 30;
        }
        
        enhancedChart = new Chart(enhancedCtx, {
          type: 'pie',
          data: {
            labels: ['Unsafe', 'Safe', 'No Response'],
            datasets: [{
              data: [unsafeData, safeData, 10],
              backgroundColor: ['#e74c3c', '#2ecc71', '#ecf0f1'],
              borderColor: ['#c0392b', '#27ae60', '#bdc3c7'],
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
                    return \`\${label}: \${value}%\`;
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
      
      // NEW FUNCTION: Close enhanced info box
      function closeEnhancedInfo() {
        var enhancedPanel = document.getElementById('enhancedInfoPanel');
        enhancedPanel.style.display = 'none';
      }
      
      // NEW: Close enhanced info when clicking on map
      map.on('click', function() {
        closeEnhancedInfo();
      });
    </script>
  </body>
</html>
`;

  return (
    <SafeAreaView style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
});