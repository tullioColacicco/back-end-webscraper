const express = require("express");
const cors = require("cors");

// Import scrapers
// const scrapeGoogle = require("./expressTest");
const scrapeGoogle = require("./server");
const scrapeProspects = require("./expressTest");
const scrapeRoster = require("./roster");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/scrapeRoster", async (req, res) => {
  try {
    console.log("Scraping started...");
    const data = await scrapeRoster();
    console.log("Scraped data:", data);
    res.json(data);
  } catch (err) {
    console.error("Error during scraping:", err);
    res
      .status(500)
      .json({ error: "Failed to scrape data", message: err.message });
  }
});

app.get("/scrapeProspects", async (req, res) => {
  try {
    console.log("Scraping started...");
    const data = await scrapeProspects();
    console.log("Scraped data:", data);
    res.json(data);
  } catch (err) {
    console.error("Error during scraping:", err);
    res
      .status(500)
      .json({ error: "Failed to scrape data", message: err.message });
  }
});

app.get("/scrapeGoogle", async (req, res) => {
  try {
    console.log("Scraping started...");
    const data = await scrapeGoogle();
    console.log("Scraped data:", data);
    res.json(data);
  } catch (err) {
    console.error("Error during scraping:", err);
    res
      .status(500)
      .json({ error: "Failed to scrape data", message: err.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the Scraping API!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
