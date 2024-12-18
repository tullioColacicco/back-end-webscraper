const puppeteer = require("puppeteer");
async function scrapePlayerCardMenu() {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: false }); // Set to true for headless mode
  const page = await browser.newPage();
  // Navigate to the page you want to scrape
  await page.goto(
    "https://www.mlb.com/milb/prospects/yankees/jasson-dominguez-691176",
    { waitUntil: "domcontentloaded" }
  );
  // Wait for the element containing the class 'sc-bZQynM jWTqqF menu player-card__menu'
  await page.waitForSelector(".sc-bZQynM.jWTqqF.menu.player-card__menu");
  // Find and click the "News" button inside the menu
  await page.evaluate(() => {
    // Find the menu element with the specific class
    const menuElement = document.querySelector(
      ".sc-bZQynM.jWTqqF.menu.player-card__menu"
    );
    if (!menuElement) {
      return null; // If the menu element is not found, return null
    }
    // Find the "News" button inside the menu by its text content
    const newsButton = [...menuElement.querySelectorAll("button")].find(
      (button) => button.textContent.includes("News")
    ); // Find the button with text "News"
    if (newsButton) {
      newsButton.click(); // Click the button if found
    } else {
      console.log("News button not found!");
    }
  });
  await page.waitForSelector(".news-tab__list", { visible: true });
  await page.waitForSelector(".sc-gZMcBi.jszDao.skeleton-container");
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
  // Close the browser
  await browser.close();
}
// Run the function
scrapePlayerCardMenu().catch(console.error);
