const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3002;

// Use CORS to handle cross-origin requests
app.use(cors());

// Declare a global variable to hold the browser instance
let browser = null;

// Start the server and launch Puppeteer browser once
(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Use these arguments for environments like Docker
  });

  // Endpoint to trigger the scraping function
  app.get("/scrape", async (req, res) => {
    try {
      const scrapedData = await scrapePlayerCardMenu();
      res.json(scrapedData); // Send the scraped data as JSON
    } catch (error) {
      console.error("Error scraping:", error);
      res.status(500).json({ error: "An error occurred while scraping" });
    }
  });

  // Scraping function that uses the global browser instance
  async function scrapePlayerCardMenu() {
    const page = await browser.newPage(); // Create a new page for each request

    try {
      // Navigate to the page you want to scrape
      await page.goto(
        "https://www.mlb.com/milb/prospects/yankees/jasson-dominguez-691176",
        {
          waitUntil: "domcontentloaded",
        }
      );

      // Wait for the element containing the class 'sc-bZQynM jWTqqF menu player-card__menu'
      await page.waitForSelector(".sc-bZQynM.jWTqqF.menu.player-card__menu");

      // Find and click the "News" button inside the menu
      await page.evaluate(() => {
        const menuElement = document.querySelector(
          ".sc-bZQynM.jWTqqF.menu.player-card__menu"
        );

        if (!menuElement) {
          return null; // If the menu element is not found, return null
        }

        const newsButton = [...menuElement.querySelectorAll("button")].find(
          (button) => button.textContent.includes("News")
        ); // Find the button with text "News"

        if (newsButton) {
          newsButton.click(); // Click the button if found
        } else {
          console.log("News button not found!");
        }
      });

      // Wait for the news section to load
      await page.waitForSelector(".news-tab__list", { visible: true });

      // Get the content or any other properties of the element
      const children = await page.$$eval(".news-tab__list > li", (elements) => {
        // Map the elements to an array of objects containing both href and title
        return elements.map((el) => {
          const anchor = el.querySelector("a"); // Get the <a> element within each child
          return {
            href: anchor ? anchor.getAttribute("href") : null, // Get the href attribute
            title: anchor ? anchor.getAttribute("title") : null, // Get the title attribute
          };
        });
      });

      console.log("News-related links:", children);

      return children; // Return the scraped data
    } catch (error) {
      console.error("Error during scraping:", error);
      throw error; // Rethrow the error to be caught in the Express route
    } finally {
      // Optionally, close the page if necessary (you may want to keep it open for reuse)
      await page.close();
    }
  }

  // Start the Express server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();

// Ensure proper cleanup when server shuts down
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await browser.close();
  process.exit(0);
});
