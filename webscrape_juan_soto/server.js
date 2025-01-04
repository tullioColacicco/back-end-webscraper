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
    "https://www.google.com/search?sca_esv=730791857161bc9a&rlz=1C1CHBF_enUS773US773&sxsrf=ADLYWIJb3COcq9KEnIgeHlI9SYvdlBNgVQ:1735774564831&q=yankees&tbm=nws&source=lnms&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWtG_mNb-HwafvV8cKK_h1a-aRpNV3VwRSMnTlqIbZe21BBv14h-NoyUlCQxjmyooZ0JaYNwp1mgi4n_FepLu1CsZmV9tXijs6fWPx8UHjeoL2Zrq0iU5xgUfo6ecWH04uKujs5SYApNnp__EMPP9YffpNp5lCNxwYazpraJRgURItz8BTTqcgs-kepBvdOTZXxDcOGg&sa=X&ved=2ahUKEwja6-KS2NWKAxUNEFkFHYGFFJYQ0pQJegQIHBAB&biw=1536&bih=1279&dpr=1",
    { waitUntil: "domcontentloaded" }
  );

  await page.waitForSelector(".SoAPf");
  await page.waitForSelector(".m7jPZ");
  await page.waitForSelector(".n0jPhd.ynAwRc.tNxQIb.nDgy9d");
  const allLinks = await page.evaluate(() => {
    const links = document.querySelectorAll(".m7jPZ");
    return Array.from(links).map((link) => {
      const desc =
        link.querySelector(".n0jPhd.ynAwRc.tNxQIb.nDgy9d")?.innerText ||
        "No description";
      const title = link.querySelector(".WlydOe")?.href || "No title link";
      const date =
        link.querySelector(".OSrXXb.rbYSKb.LfVVr")?.innerText || "No date";
      // Search for the nested image
      const imgElement = link.querySelector("img");
      const image = imgElement?.src || "No image found";

      return { desc, title, date, image };
    });
  });
  const elements = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".n0jPhd.ynAwRc.tNxQIb.nDgy9d")
    ).map((element) => element.innerText); // Use .innerText to get the text content
  });

  // Close the browser
  await browser.close();

  return allLinks; // Return the scraped data
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
