const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    surface_pressure: number;
    visibility: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    surface_pressure: string;
    visibility: string;
    precipitation: string;
    rain: string;
    showers: string;
  };
}

export interface FloodResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    flood_level: number;
    flood_risk: number;
  };
}

export interface PrecipitationResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    precipitation: number[];
    rain: number[];
    showers: number[];
  };
  hourly_units: {
    precipitation: string;
    rain: string;
    showers: string;
  };
}

export interface GeocodingResponse {
  results: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }>;
}

export interface ReverseGeocodingResponse {
  results: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    feature_code?: string;
    country_code: string;
    country: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
    admin4?: string;
    timezone?: string;
    population?: number;
    postcodes?: string[];
    country_id?: number;
  }>;
}

export const weatherApi = {
  geocode: async (
    city: string,
    country: string = "Myanmar"
  ): Promise<GeocodingResponse> => {
    let url = `${OPEN_METEO_BASE}/geocoding?name=${encodeURIComponent(
      `${city}, ${country}`
    )}&count=5&language=en&format=json`;

    let response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data;
      }
    }

    url = `${OPEN_METEO_BASE}/geocoding?name=${encodeURIComponent(
      city
    )}&count=5&language=en&format=json`;
    response = await fetch(url);

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("No results found");
    }
    return data;
  },

  getWeather: async (
    latitude: number,
    longitude: number
  ): Promise<WeatherResponse> => {
    const url = `${OPEN_METEO_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,surface_pressure,visibility,is_day,precipitation,rain,showers&wind_speed_unit=kmh&precipitation_unit=mm&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather fetch failed");
    }
    return response.json();
  },

  getFloodData: async (
    latitude: number,
    longitude: number
  ): Promise<FloodResponse> => {
    const url = `https://api.open-meteo.com/v1/flood?latitude=${latitude}&longitude=${longitude}&current=flood_level,flood_risk`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Flood data fetch failed");
    }
    return response.json();
  },

  getPrecipitation: async (
    latitude: number,
    longitude: number
  ): Promise<PrecipitationResponse> => {
    const url = `${OPEN_METEO_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation,rain,showers&past_hours=24&forecast_hours=24&precipitation_unit=mm&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Precipitation data fetch failed");
    }
    return response.json();
  },

  reverseGeocode: async (
    latitude: number,
    longitude: number
  ): Promise<ReverseGeocodingResponse> => {
    const url = `${OPEN_METEO_BASE}/geocoding/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("No results found");
    }
    return data;
  },
};
