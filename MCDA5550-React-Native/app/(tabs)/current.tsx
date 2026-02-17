import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";

type CurrentWeather = {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
};

async function fetchCurrentWeather(
  lat: number,
  lon: number,
): Promise<CurrentWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather.");
  const data = await res.json();
  return data.current_weather as CurrentWeather;
}

async function reverseGeocodeName(lat: number, lon: number): Promise<string> {
  const results = await Location.reverseGeocodeAsync({
    latitude: lat,
    longitude: lon,
  });

  if (!results || results.length === 0) return "Unknown location";

  const r = results[0];
  // Different phones return different fields, so we build a safe label
  const city = r.city || r.subregion || r.district || r.name || "";
  const region = r.region || "";
  const country = r.country || "";

  const label = [city, region, country].filter(Boolean).join(", ");
  return label || "Unknown location";
}

export default function CurrentScreen() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [placeName, setPlaceName] = useState<string>("");
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  const load = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      // Handle denial gracefully (required)
      if (status !== "granted") {
        setErrorMsg("Location permission denied. Showing Halifax as fallback.");

        // Halifax fallback
        const lat = 44.6488;
        const lon = -63.5752;

        setCoords({ lat, lon });
        setPlaceName("Halifax, NS, Canada");
        setWeather(await fetchCurrentWeather(lat, lon));
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;

      setCoords({ lat, lon });

      const name = await reverseGeocodeName(lat, lon);
      setPlaceName(name);

      setWeather(await fetchCurrentWeather(lat, lon));
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 12 }}>
        Current Location Weather
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={{ gap: 10 }}>
          {errorMsg ? (
            <Text style={{ color: "crimson" }}>{errorMsg}</Text>
          ) : null}

          {placeName ? (
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              Location: {placeName}
            </Text>
          ) : null}

          {coords ? (
            <Text>
              Lat: {coords.lat.toFixed(4)} | Lon: {coords.lon.toFixed(4)}
            </Text>
          ) : null}

          {weather ? (
            <View style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "600" }}>
                Temperature: {weather.temperature}°C
              </Text>
              <Text>Wind Speed: {weather.windspeed} km/h</Text>
              <Text>Wind Direction: {weather.winddirection}°</Text>
              <Text>Weather Code: {weather.weathercode}</Text>
              <Text>Time: {weather.time}</Text>
            </View>
          ) : (
            <Text>No weather data yet.</Text>
          )}

          <Button title="Refresh" onPress={load} />
        </View>
      )}
    </SafeAreaView>
  );
}
