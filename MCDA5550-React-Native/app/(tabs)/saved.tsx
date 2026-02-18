import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { initDb, getSavedCities, removeCity } from "../../src/db/database";
import {
  geocodeCity,
  fetchCurrentWeather,
  type CurrentWeather,
} from "../../src/services/openMeteo";

type CityCard = {
  city: string;
  loading: boolean;
  error?: string;
  displayName?: string;
  weather?: CurrentWeather;
};

export default function SavedScreen() {
  const [cities, setCities] = useState<string[]>([]);
  const [cards, setCards] = useState<CityCard[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCities = useCallback(() => {
    initDb();
    const list = getSavedCities(); // returns array of saved city strings
    setCities(list);
    setCards(
      list.map((c) => ({
        city: c,
        loading: true,
      })),
    );
    return list;
  }, []);

  const loadWeatherForCity = useCallback(async (cityLabel: string) => {
    // If you saved "Halifax, NS, Canada", geocoding still works.
    const p = await geocodeCity(cityLabel);
    const w = await fetchCurrentWeather(p.lat, p.lon);
    return { displayName: p.displayName, weather: w };
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    const list = loadCities();

    // If no cities, stop early
    if (list.length === 0) {
      setRefreshing(false);
      return;
    }

    // Fetch weather for each city in parallel
    const results = await Promise.all(
      list.map(async (city) => {
        try {
          const r = await loadWeatherForCity(city);
          return { city, ok: true as const, ...r };
        } catch (e: any) {
          return {
            city,
            ok: false as const,
            error: e?.message ?? "Failed to fetch weather",
          };
        }
      }),
    );

    // Update cards
    setCards(
      results.map((r) => {
        if (!r.ok) {
          return { city: r.city, loading: false, error: r.error };
        }
        return {
          city: r.city,
          loading: false,
          displayName: r.displayName,
          weather: r.weather,
        };
      }),
    );

    setRefreshing(false);
  }, [loadCities, loadWeatherForCity]);

  useEffect(() => {
    // Load list + weather once when screen loads
    refreshAll();
  }, [refreshAll]);

  const onRemove = (city: string) => {
    Alert.alert("Remove location?", city, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeCity(city);
          refreshAll();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 12 }}>
        Saved Locations
      </Text>

      <View style={{ marginBottom: 12 }}>
        <Button
          title={refreshing ? "Refreshing..." : "Refresh"}
          onPress={refreshAll}
          disabled={refreshing}
        />
        <Text style={{ marginTop: 8 }}>Saved cities: {cities.length}/5</Text>
      </View>

      {cities.length === 0 ? (
        <Text>No saved locations yet. Go to Search tab and save a city.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          {cards.map((card) => (
            <View
              key={card.city}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                {card.city}
              </Text>

              {card.loading ? (
                <View style={{ marginTop: 10 }}>
                  <ActivityIndicator />
                  <Text style={{ marginTop: 6 }}>Loading weather...</Text>
                </View>
              ) : card.error ? (
                <Text style={{ marginTop: 10, color: "crimson" }}>
                  Error: {card.error}
                </Text>
              ) : card.weather ? (
                <View style={{ marginTop: 10, gap: 4 }}>
                  {card.displayName ? (
                    <Text>Matched: {card.displayName}</Text>
                  ) : null}
                  <Text style={{ fontSize: 18, fontWeight: "600" }}>
                    {card.weather.temperature}°C
                  </Text>
                  <Text>Wind: {card.weather.windspeed} km/h</Text>
                  <Text>Code: {card.weather.weathercode}</Text>
                  <Text>Time: {card.weather.time}</Text>
                </View>
              ) : (
                <Text style={{ marginTop: 10 }}>No weather data.</Text>
              )}

              <View style={{ marginTop: 12 }}>
                <Button title="Remove" onPress={() => onRemove(card.city)} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
