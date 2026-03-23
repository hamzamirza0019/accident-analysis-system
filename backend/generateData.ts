const majorCities = [
  { lat: 12.9716, lng: 77.5946 }, // Bangalore
  { lat: 28.7041, lng: 77.1025 }, // Delhi
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 17.3850, lng: 78.4867 }  // Hyderabad
];

const lowAccidentCities = [
  { lat: 15.3647, lng: 75.1240 },
  { lat: 16.7050, lng: 74.2433 },
  { lat: 23.2599, lng: 77.4126 },
  { lat: 26.8467, lng: 80.9462 },
  { lat: 25.3176, lng: 82.9739 },
  { lat: 21.1702, lng: 72.8311 },
  { lat: 22.7196, lng: 75.8577 },
  { lat: 11.0168, lng: 76.9558 },
  { lat: 9.9252, lng: 78.1198 },
  { lat: 30.7333, lng: 76.7794 }
];

const severities = ["low", "medium", "high"];

function randomOffset(scale = 0.01) {
  return (Math.random() - 0.5) * scale;
}

function randomDate() {
  const now = new Date();
  const pastDays = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(now.getDate() - pastDays);
  return date.toISOString();
}

const data = [];

// 🔴 HIGH ACCIDENT CITIES (strong clusters)
for (let i = 0; i < 120; i++) {
  const base = majorCities[Math.floor(Math.random() * majorCities.length)];

  data.push({
    lat: base.lat + randomOffset(0.008),
    lng: base.lng + randomOffset(0.008),
    severity: severities[Math.floor(Math.random() * severities.length)],
    timestamp: randomDate()
  });
}

// 🟡 LOW ACCIDENT CITIES (light clusters)
for (let i = 0; i < 50; i++) {
  const base = lowAccidentCities[Math.floor(Math.random() * lowAccidentCities.length)];

  data.push({
    lat: base.lat + randomOffset(0.02),
    lng: base.lng + randomOffset(0.02),
    severity: severities[Math.floor(Math.random() * severities.length)],
    timestamp: randomDate()
  });
}

// 🌍 RANDOM INDIA SPREAD
for (let i = 0; i < 30; i++) {
  const lat = 8 + Math.random() * 29;
  const lng = 68 + Math.random() * 29;

  data.push({
    lat,
    lng,
    severity: "low",
    timestamp: randomDate()
  });
}

console.log(JSON.stringify(data, null, 2));