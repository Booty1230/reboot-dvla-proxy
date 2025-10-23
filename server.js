
// Simple DVLA proxy for Re-Boot Automotive
// Deploy to Render or similar Node host.
// Requires: environment variable DVLA_KEY

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_URL = "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

app.get("/api/vehicle", async (req, res) => {
  const reg = (req.query.reg || "").toUpperCase().trim();
  if (!reg) return res.status(400).json({ error: "Missing reg" });
  if (!process.env.DVLA_KEY) return res.status(500).json({ error: "Missing DVLA_KEY" });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": process.env.DVLA_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ registrationNumber: reg })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({
      reg: data.registrationNumber,
      make: data.make,
      model: data.model,
      colour: data.colour,
      year: data.yearOfManufacture
    });
  } catch (err) {
    console.error("DVLA proxy error", err);
    res.status(500).json({ error: "DVLA proxy failure" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("DVLA proxy running on port", port));
