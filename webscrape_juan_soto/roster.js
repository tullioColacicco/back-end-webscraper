const express = require("express");
const cors = require("cors");

const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 3003;
app.use(cors());

// Endpoint to trigger the scraping function
app.get("/scrape", async (req, res) => {
  try {
    // Call your existing scrapeNews function
    const scrapedData = await scrapeRoster();
    res.json(scrapedData); // Send the scraped data as JSON
  } catch (error) {
    console.error("Error scraping:", error);
    res.status(500).json({ error: "An error occurred while scraping" });
  }
});

// Your existing scrapeNews function with minor modifications
async function scrapeRoster() {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the MLB Yankees roster page
  await page.goto("https://www.mlb.com/yankees/roster", {
    waitUntil: "domcontentloaded",
  });

  // Wait for the roster table to load
  await page.waitForSelector(".roster__table");

  // Extract data from all rows, including text and image sources
  const allRows = await page.evaluate(() => {
    const rows = document.querySelectorAll(".roster__table tbody tr");

    return Array.from(rows).map((row) => {
      const cells = row.querySelectorAll("td");
      const rowData = Array.from(cells).map((cell) => cell.innerText.trim());

      // Extract the image `src` from the `player-thumb` cell
      const playerThumbCell = row.querySelector("td.player-thumb");
      const img = playerThumbCell?.querySelector("img");
      const imgSrc = img ? img.src : null;

      return {
        text: rowData, // All text from the row
        img: imgSrc, // Image source URL
      };
    });
  });

  // Log the extracted data
  console.log(allRows);
  return allRows; // Return the scraped data
  // Close the browser
  await browser.close();
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
