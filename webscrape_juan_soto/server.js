const express = require("express");
const cors = require("cors");

const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

// Endpoint to trigger the scraping function
app.get("/scrape", async (req, res) => {
  try {
    // Call your existing scrapeNews function
    const scrapedData = await scrapeNews();
    res.json(scrapedData); // Send the scraped data as JSON
  } catch (error) {
    console.error("Error scraping:", error);
    res.status(500).json({ error: "An error occurred while scraping" });
  }
});

// Your existing scrapeNews function with minor modifications
async function scrapeNews() {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the Google News page
  await page.goto(
    "https://www.google.com/search?q=yankees&rlz=1C1CHBF_enUS773US773&oq=yan&gs_lcrp=EgZjaHJvbWUqDwgAECMYJxjjAhiABBiKBTIPCAAQIxgnGOMCGIAEGIoFMgwIARAuGCcYgAQYigUyBggCEEUYOzIGCAMQRRg5MgYIBBBFGDwyBggFEEUYPTIGCAYQRRg8MgYIBxBFGDzSAQc3NzNqMGo0qAIAsAIB&sourceid=chrome&ie=UTF-8",
    { waitUntil: "domcontentloaded" }
  );

  await page.waitForSelector(".SoAPf");
  await page.waitForSelector(".m7jPZ");

  const allLinks = await page.evaluate(() => {
    const links = document.querySelectorAll(".m7jPZ");
    return Array.from(links).map((link) => {
      const desc =
        link.querySelector(".n0jPhd.ynAwRc.tNxQIb.nDgy9d")?.innerText ||
        "No description";
      const title = link.querySelector(".WlydOe")?.href || "No title link";
      return { desc, title };
    });
  });

  // Close the browser
  await browser.close();

  return allLinks; // Return the scraped data
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
