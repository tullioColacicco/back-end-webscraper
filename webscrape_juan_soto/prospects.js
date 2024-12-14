const puppeteer = require("puppeteer");

async function scrapeProspects() {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: true }); // headless: true means the browser runs without UI.
  const page = await browser.newPage();

  // Navigate to the Yankees prospects page
  await page.goto("https://www.mlb.com/milb/prospects/yankees", {
    waitUntil: "domcontentloaded",
  });

  // Wait for the rankings table to load (adjust if necessary)
  await page.waitForSelector(".rankings__table.rankings__table--team"); // Wait for the table to appear

  // Extract the prospect data
  const prospects = await page.evaluate(() => {
    const data = [];

    // Select the rows in the rankings table
    const rows = document.querySelectorAll(
      ".rankings__table.rankings__table--team tbody tr"
    );

    rows.forEach((row) => {
      const nameElement = row.querySelector(".prospect-headshot__name"); // Adjust this based on the actual structure of the page
      //   const rankElement = row.querySelector(".rank"); // Adjust this based on the actual structure
      //   const positionElement = row.querySelector(".position"); // Adjust this if necessary

      if (nameElement) {
        const name = nameElement.innerText.trim();
        // const rank = rankElement.innerText.trim();
        // const position = positionElement.innerText.trim();

        // Push the scraped data to the array
        data.push({
          name,
        });
      }
    });

    return data; // Return the extracted data to the main function
  });

  // Log the extracted data
  console.log(prospects);

  // Close the browser
  await browser.close();
}

// Run the scraping function
scrapeProspects().catch(console.error);
