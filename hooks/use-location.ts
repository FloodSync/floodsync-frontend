import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useAuthStore } from "@/stores/auth-store";
import { weatherApi } from "@/lib/api/weather";
import { myanmarCities } from "@/lib/data/myanmar-locations";

interface Coordinates {
  latitude: number;
  longitude: number;
  city?: string;
  township?: string;
}

export const useLocation = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cachedCoordinatesRef = useRef<Map<string, Coordinates>>(new Map());

  useEffect(() => {
    const getLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isAuthenticated && user && user.city) {
          const cityName = user.city;
          
          const cached = cachedCoordinatesRef.current.get(cityName);
          if (cached) {
            setCoordinates(cached);
            setLoading(false);
            return;
          }

          const cityData = myanmarCities.find(
            (c) => c.value.toLowerCase() === cityName.toLowerCase()
          );
          
          if (cityData && cityData.latitude && cityData.longitude) {
            const userCoordinates: Coordinates = {
              latitude: cityData.latitude,
              longitude: cityData.longitude,
              city: user.city,
              township: user.township,
            };
            
            cachedCoordinatesRef.current.set(cityName, userCoordinates);
            setCoordinates(userCoordinates);
            setLoading(false);
            return;
          }

          try {
            const geocodeResult = await weatherApi.geocode(cityName);
            if (geocodeResult.results && geocodeResult.results.length > 0) {
              const result = geocodeResult.results.find(
                (r) => r.country === "Myanmar" || r.country === "MM"
              ) || geocodeResult.results[0];
              
              const userCoordinates: Coordinates = {
                latitude: result.latitude,
                longitude: result.longitude,
                city: user.city,
                township: user.township,
              };
              
              cachedCoordinatesRef.current.set(cityName, userCoordinates);
              setCoordinates(userCoordinates);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Geocoding failed for user city, falling back to GPS:", err);
          }
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isAuthenticated && user) {
            setError("Unable to get location for your registered city. Please enable location access or check your city name.");
          } else {
            setError("Location permission is required to show weather data. Please enable location access in your device settings.");
          }
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lon,
          });
          
          if (reverseGeocode && reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            setCoordinates({
              latitude: lat,
              longitude: lon,
              city: address.city || address.district || address.subregion || address.region || address.country,
              township: address.district || address.subregion || undefined,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Expo reverse geocoding failed, trying API:", err);
        }
        
        try {
          const reverseGeocodeResult = await weatherApi.reverseGeocode(lat, lon);
          if (reverseGeocodeResult.results && reverseGeocodeResult.results.length > 0) {
            const result = reverseGeocodeResult.results[0];
            setCoordinates({
              latitude: lat,
              longitude: lon,
              city: result.name || result.admin2 || result.admin1 || result.country,
              township: result.admin2 || result.admin3 || undefined,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("API reverse geocoding failed, using coordinates:", err);
        }
        setCoordinates({
          latitude: lat,
          longitude: lon,
        });
      } catch (err: any) {
        setError(err.message || "Failed to get location");
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, [isAuthenticated, user?.city, user?.township]);

  return { coordinates, loading, error };
};
