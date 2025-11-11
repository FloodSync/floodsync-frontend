import { useQuery } from "@tanstack/react-query";
import { weatherApi, WeatherResponse, FloodResponse, PrecipitationResponse } from "@/lib/api/weather";

export const useWeather = (
  latitude: number | null,
  longitude: number | null
) => {
  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => {
      if (!latitude || !longitude) {
        throw new Error("Coordinates required");
      }
      return weatherApi.getWeather(latitude, longitude);
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};

export const useFloodData = (
  latitude: number | null,
  longitude: number | null
) => {
  return useQuery({
    queryKey: ["flood", latitude, longitude],
    queryFn: () => {
      if (!latitude || !longitude) {
        throw new Error("Coordinates required");
      }
      return weatherApi.getFloodData(latitude, longitude);
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};

export const usePrecipitation = (
  latitude: number | null,
  longitude: number | null
) => {
  return useQuery({
    queryKey: ["precipitation", latitude, longitude],
    queryFn: () => {
      if (!latitude || !longitude) {
        throw new Error("Coordinates required");
      }
      return weatherApi.getPrecipitation(latitude, longitude);
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};
