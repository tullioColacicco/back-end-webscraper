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
  const prospects = await page.evaluate(async () => {
    const data = [];

    // Select the rows in the rankings table
    const rows = document.querySelectorAll(
      ".rankings__table.rankings__table--team tbody tr"
    );

    // Loop through each row and click it
    for (let row of rows) {
      const nameElement = row.querySelector(".prospect-headshot__name"); // Adjust this based on the actual structure of the page

      if (nameElement) {
        const name = nameElement.innerText.trim();

        // Click the row (or you can target a specific link or button inside the row)
        const link = row.querySelector("a"); // Assuming the row has a link to click
        if (link) {
          link.click(); // Click on the row/link

          // Wait for a new page or modal to load
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds (adjust as needed)

          // You can also extract more data after clicking if necessary
          // For example, scrape more details from the page opened after clicking
          const additionalData = await page.evaluate(() => {
            const someDetail = document.querySelector(".some-detail-selector"); // Example selector for details
            return someDetail ? someDetail.innerText.trim() : null;
          });

          // Store the data
          data.push({
            name,
            additionalData,
          });

          // Optionally go back to the main list or page before continuing to the next row
          await page.goBack(); // Go back to the previous page (if applicable)
          await page.waitForTimeout(1000); // Wait for 1 second before continuing
        }
      }
    }

    return data; // Return the scraped data
  });

  // Log the extracted data
  console.log(prospects);

  // Close the browser
  await browser.close();
}

// Run the scraping function
scrapeProspects().catch(console.error);
