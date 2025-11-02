import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// === DVLA VEHICLE LOOKUP ===
app.get("/vehicle/:reg", async (req, res) => {
  const reg = req.params.reg.toUpperCase().trim();
  const DVLA_API_KEY = process.env.DVLA_API_KEY; // Set this in Render's environment variables

  try {
    const response = await fetch(`https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles`, {
      method: "POST",
      headers: {
        "x-api-key": DVLA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registrationNumber: reg }),
    });

    if (!response.ok) throw new Error(`DVLA request failed: ${response.status}`);
    const data = await response.json();
    res.json({
      make: data.make,
      model: data.model,
      colour: data.colour,
      fuelType: data.fuelType,
      yearOfManufacture: data.yearOfManufacture,
    });
  } catch (err) {
    console.error("DVLA Error:", err);
    res.status(500).json({ error: "DVLA lookup failed" });
  }
});

// === GOOGLE DISTANCE MATRIX LOOKUP ===
app.get("/distance", async (req, res) => {
  const { origin, destination } = req.query;
  const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!origin || !destination) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&units=imperial&key=${GOOGLE_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.rows || !data.rows[0] || !data.rows[0].elements) {
      console.error("Google Maps API returned unexpected data:", JSON.stringify(data, null, 2));
      return res.status(400).json({ error: "Google API error", details: data });
    }

    const element = data.rows[0].elements[0];
    if (!element || element.status !== "OK") {
      console.error("Google Maps element error:", JSON.stringify(element, null, 2));
      return res.status(400).json({ error: "Google Maps element error", details: element });
    }

    res.json({
      distance_text: element.distance.text,
      distance_miles: parseFloat(element.distance.text.replace(/[^\d.]/g, "")),
      duration_text: element.duration.text,
    });
  } catch (error) {
    console.error("Distance error:", error);
    res.status(500).json({ error: "Failed to fetch distance" });
  }
});

// === ROOT ROUTE ===
app.get("/", (req, res) => {
  res.send("✅ Reboot DVLA Proxy is live and ready!");
});

// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
