// App Configuration
// Set DEMO_MODE to true to use demo data for testing
// Set DEMO_MODE to false to use real API data

export const APP_CONFIG = {
  // Demo Mode: Set to true to use demo data for testing
  DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE === "true" || false,

  // Demo Data Configuration
  DEMO_DATA: {
    // Demo flood risk (set to > 70 to test notifications)
    floodRisk: 85,

    // Demo weather data
    weather: {
      temperature: 28,
      feelsLike: 26,
      condition: "Partly Cloudy",
      humidity: 78,
      windSpeed: 12,
      windDirection: "NE",
      visibility: 8,
      pressure: 1013,
      precipitation: 0.5,
      rain: 0.3,
      showers: 0.2,
    },

    // Demo precipitation data
    precipitation: {
      lastHour: 0.2,
      last24Hours: 1.5,
      next24HoursForecast: 3.2,
    },

    // Demo location
    location: "Yangon, Hlaing",
  },
};

// Helper function to check if demo mode is enabled
export const isDemoMode = () => APP_CONFIG.DEMO_MODE;

// Helper function to get demo flood risk
export const getDemoFloodRisk = () => APP_CONFIG.DEMO_DATA.floodRisk;
