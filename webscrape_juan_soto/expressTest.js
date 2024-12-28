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
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the Yankees prospects page
    await page.goto("https://www.mlb.com/milb/prospects/yankees", {
      waitUntil: "domcontentloaded",
    });

    const cookieContainerSelector = "#onetrust-group-container";
    await page.waitForSelector(cookieContainerSelector, { visible: true });

    // Find the "OK" button within the cookie container and click it
    const okButtonSelector = "#onetrust-accept-btn-handler"; // This is the typical ID for the "OK" button
    await page.waitForSelector(okButtonSelector, { visible: true });

    // Click the "OK" button to accept cookies
    await page.click(okButtonSelector);

    // Extract the prospect data and interact with each row
    const prospects = [];
    await page.waitForSelector(".load-more__container button");
    const loadMoreButtonSelector = ".load-more__container button";

    // Wait for all load more buttons to be available
    await page.waitForSelector(loadMoreButtonSelector);
    await page.evaluate(() => {
      const menuElement = document.querySelector(".load-more__container");

      if (!menuElement) {
        return null; // If the menu element is not found, return null
      }

      const newsButton = [...menuElement.querySelectorAll("button")].find(
        (button) => button.textContent.includes("Show Full List")
      ); // Find the button with text "News"

      if (newsButton) {
        newsButton.click(); // Click the button if found
      } else {
        console.log("News button not found!");
      }
    });

    // Get the rows of the rankings table
    let rows = await page.$$(".rankings__table.rankings__table--team tbody tr");
    await page.screenshot({
      path: "screenshot.png", // Path to save the screenshot
      fullPage: true, // Capture the entire page, not just the visible viewport
    });
    rows = rows.slice(0, 5);
    // Iterate through each row, click the prospect, and wait for the drawer to appear
    for (let row of rows) {
      const data = [];
      let count = 0;
      // Extract the prospect name from the row
      const name = await row.$eval(".prospect-headshot__name", (el) =>
        el.innerText.trim()
      );

      // Click the row to open the prospect's drawer
      console.log(`Clicking on ${name}...`);
      await row.click({ timeout: 1000000 }); // Click on the row (adjust timeout as needed)
      // await page.screenshot({
      //   path: "screenshot.png", // Path to save the screenshot
      //   fullPage: true, // Capture the entire page, not just the visible viewport
      // });
      // Wait for the drawer to become visible
      console.log("Waiting for the drawer to appear...");
      // await page.waitForSelector(".sc-bZQynM.jWTqqF.menu.player-card__menu");

      // Extract data from the drawer (you can extract other elements here as needed)
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
      await page.screenshot({
        path: "screenshot.png", // Path to save the screenshot
        fullPage: true, // Capture the entire page, not just the visible viewport
      });
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

      // Push the prospect's name and the drawer data into the prospects array
      prospects.push({
        name,
        children,
      });

      // Use a more efficient CSS selector, without repeating the 'div' tag unless necessary
      await page.click(".drawer__close-container", {
        timeout: 100000000,
      }); // Click on the "Next" button to move to the next prospect

      // await page.waitForSelector(".player-card-navigation__next-container", {
      //   visible: true,
      // });
      await page.screenshot({
        path: `screenshot_${name}.png`, // Unique filename per prospect
        fullPage: true,
      });
      // Close the drawer by clicking outside or on a close button (if needed)
      // For example, if there's a close button in the drawer, you can do something like this:
      // await page.click(".drawer-close-button"); // Adjust the selector as needed
    }

    console.log(prospects); // Log the collected data
    await browser.close();
    return prospects;
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
