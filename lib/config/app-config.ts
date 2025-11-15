export const APP_CONFIG = {
  DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE === "true" || false,

  DEMO_DATA: {
    floodRisk: 85,

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

    precipitation: {
      lastHour: 0.2,
      last24Hours: 1.5,
      next24HoursForecast: 3.2,
    },

    location: "Yangon, Ahlone",
  },
};

export const isDemoMode = () => APP_CONFIG.DEMO_MODE;

export const getDemoFloodRisk = () => APP_CONFIG.DEMO_DATA.floodRisk;
