const puppeteer = require("puppeteer");

async function scrapeProspects() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the Yankees prospects page
  await page.goto("https://www.mlb.com/milb/prospects/yankees", {
    waitUntil: "domcontentloaded",
  });

  // Extract the prospect data and interact with each row
  const prospects = [];

  // Get the rows of the rankings table
  const rows = await page.$$(".rankings__table.rankings__table--team tbody tr");

  // Iterate through each row, click the prospect, and wait for the drawer to appear
  for (let row of rows) {
    const data = [];
    // Extract the prospect name from the row
    const name = await row.$eval(".prospect-headshot__name", (el) =>
      el.innerText.trim()
    );

    // Click the row to open the prospect's drawer
    console.log(`Clicking on ${name}...`);
    await row.click();

    // Wait for the drawer to become visible
    console.log("Waiting for the drawer to appear...");
    // await page.waitForSelector(".sc-bZQynM.jWTqqF.menu.player-card__menu");

    // Extract data from the drawer (you can extract other elements here as needed)
    const drawerData = await page.evaluate(() => {
      const drawer = document.querySelector(
        ".sc-bZQynM.jWTqqF.menu.player-card__menu"
      );

      return drawer ? drawer.innerHTML : null; // You can extract specific data from the drawer if needed
    });

    // Push the prospect's name and the drawer data into the prospects array
    prospects.push({
      name,
      drawerData,
      data,
    });

    // Close the drawer by clicking outside or on a close button (if needed)
    // For example, if there's a close button in the drawer, you can do something like this:
    // await page.click(".drawer-close-button"); // Adjust the selector as needed
  }

  console.log(prospects); // Log the collected data
  await browser.close();
}

scrapeProspects().catch(console.error);
