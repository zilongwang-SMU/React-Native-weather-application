export type CurrentWeather = {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
};

export async function geocodeCity(city: string): Promise<{
  displayName: string;
  lat: number;
  lon: number;
}> {
  const q = encodeURIComponent(city.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to geocode city.");
  const data = await res.json();

  const first = data?.results?.[0];
  if (!first) throw new Error("City not found. Try another name.");

  return {
    displayName: [first.name, first.admin1, first.country].filter(Boolean).join(", "),
    lat: first.latitude,
    lon: first.longitude,
  };
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather.");
  const data = await res.json();

  return data.current_weather as CurrentWeather;
}
