const puppeteer = require("puppeteer");

async function scrapeProspects() {
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

  rows = rows.slice(0, 2);
  // Iterate through each row, click the prospect, and wait for the drawer to appear
  for (let row of rows) {
    const data = [];
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
    await page.evaluate(() => {
      const menuElement = document.querySelector(
        ".sc-bZQynM.jWTqqF.menu.player-card__menu"
      );

      if (!menuElement) {
        return null; // If the menu element is not found, return null
      }

      const bioButton = [...menuElement.querySelectorAll("button")].find(
        (button) => button.textContent.includes("Bio")
      ); // Find the button with text "News"

      if (bioButton) {
        bioButton.click(); // Click the button if found
      } else {
        console.log("Bio button not found!");
      }
    });
    await page.screenshot({
      path: "screenshot.png", // Path to save the screenshot
      fullPage: true, // Capture the entire page, not just the visible viewport
    });
    const bioStats = await page.evaluate(() => {
      const bioLists = document.querySelectorAll(
        ".Styles__BioTabContainer-sc-1vyfrup-0.cqSVQY.bio-tab__container ul li div"
      );
      const age = bioLists[0].innerHTML;
      const ageNumber = bioLists[1].innerHTML;
      return { age, ageNumber };
    });
    prospects.push({
      bioStats,
    });
    // Close the drawer by clicking outside or on a close button (if needed)
    // For example, if there's a close button in the drawer, you can do something like this:
    // await page.click(".drawer-close-button"); // Adjust the selector as needed
  }

  console.log(prospects); // Log the collected data
  await browser.close();
}

scrapeProspects().catch(console.error);
