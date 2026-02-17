import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  fetchCurrentWeather,
  geocodeCity,
  type CurrentWeather,
} from "../../src/services/openMeteo";
import { countSavedCities, initDb, saveCity } from "../../src/db/database";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<{
    displayName: string;
    lat: number;
    lon: number;
  } | null>(null);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCount = () => setSavedCount(countSavedCities());

  useEffect(() => {
    initDb();
    refreshCount();
  }, []);

  const onSearch = async () => {
    const text = query.trim();
    if (!text) {
      Alert.alert("Missing city", "Please enter a city name.");
      return;
    }

    setLoading(true);
    setPlace(null);
    setWeather(null);

    try {
      const p = await geocodeCity(text);
      setPlace(p);

      const w = await fetchCurrentWeather(p.lat, p.lon);
      setWeather(w);
    } catch (e: any) {
      Alert.alert("Search failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const onSave = () => {
    if (!place) return;
    const result = saveCity(place.displayName);
    refreshCount();
    Alert.alert(result.ok ? "Saved" : "Cannot Save", result.message);
  };

  const saveDisabled = savedCount >= 5 || !place;

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 12 }}>
        Search Weather
      </Text>

      <TextInput
        placeholder="Enter city name (e.g., Halifax)"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="words"
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <View style={{ gap: 10 }}>
        <Button
          title={loading ? "Searching..." : "Search"}
          onPress={onSearch}
          disabled={loading}
        />

        <Text>Saved cities: {savedCount}/5</Text>

        <Button
          title="Save Location"
          onPress={onSave}
          disabled={saveDisabled}
        />

        {savedCount >= 5 ? (
          <Text style={{ color: "crimson" }}>
            Save disabled: you already saved 5 cities.
          </Text>
        ) : null}
      </View>

      {place ? (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Result:</Text>
          <Text>{place.displayName}</Text>
          <Text>
            Lat: {place.lat.toFixed(4)} | Lon: {place.lon.toFixed(4)}
          </Text>
        </View>
      ) : null}

      {weather ? (
        <View
          style={{
            marginTop: 16,
            padding: 12,
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Temperature: {weather.temperature}°C
          </Text>
          <Text>Wind Speed: {weather.windspeed} km/h</Text>
          <Text>Weather Code: {weather.weathercode}</Text>
          <Text>Time: {weather.time}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
