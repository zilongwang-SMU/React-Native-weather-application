# 🌤️ React Native Weather App (MCDA5550 Assignment)

## 📌 Overview

This project is a **React Native Weather Application** built using **Expo**.  
The app allows users to:

- View weather for their **current location**
- **Search** weather by city name
- **Save** favorite locations (maximum 5)
- View weather for **saved locations**
- **Remove** saved locations

This assignment demonstrates integration of **navigation, APIs, location services, and local storage**.

---

## 🚀 Features

### Screen 1 – Current Location Weather

- Requests location permission using `expo-location`
- Retrieves GPS coordinates
- Displays current weather
- Handles permission denial gracefully (fallback location)

---

### Screen 2 – Search & Save

- Search weather by city name
- Displays weather details
- Save location to SQLite database
- Disable saving when 5 cities are stored
- Prevent duplicate saves

---

### Screen 3 – Saved Locations

- Displays saved cities (max 5)
- Fetches weather for each saved city
- Allows removing cities
- Data persists between app launches

---

## 🛠️ Technologies Used

- React Native
- Expo
- Expo Router
- `expo-location`
- `expo-sqlite`
- Open-Meteo API

---

## 📦 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd MCDA5550-React-Native
```

### 2️⃣ Install Dependencies

```bash
npm install
```

Install required Expo packages:

```bash
npx expo install expo-location expo-sqlite

```

### 3️⃣ Start Development Server

```bash
npx expo start
```
