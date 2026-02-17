import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("weather.db");

export function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS saved_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT UNIQUE NOT NULL
    );
  `);
}

export function getSavedCities(): string[] {
  const rows = db.getAllSync<{ city: string }>(
    "SELECT city FROM saved_locations ORDER BY id DESC;"
  );
  return rows.map((r) => r.city);
}

export function countSavedCities(): number {
  const row = db.getFirstSync<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM saved_locations;"
  );
  return row?.cnt ?? 0;
}

export function saveCity(city: string): { ok: boolean; message: string } {
  const trimmed = city.trim();
  if (!trimmed) return { ok: false, message: "City name is empty." };

  const cnt = countSavedCities();
  if (cnt >= 5) return { ok: false, message: "You already saved 5 cities." };

  try {
    db.runSync("INSERT INTO saved_locations (city) VALUES (?);", [trimmed]);
    return { ok: true, message: "Saved!" };
  } catch {
    // likely UNIQUE constraint (already saved)
    return { ok: false, message: "City already saved (or invalid)." };
  }
}

export function removeCity(city: string) {
  db.runSync("DELETE FROM saved_locations WHERE city = ?;", [city]);
}
