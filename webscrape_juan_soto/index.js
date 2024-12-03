const puppeteer = require("puppeteer");

async function scrapeNews() {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to a news website that has coverage of Juan Soto
  // For example, let's use Google News
  await page.goto("https://www.mlb.com/yankees/news", {
    waitUntil: "domcontentloaded",
  });
  //*[@id="kp-wp-tab-overview"]/div[2]/div/div/div[2]/g-section-with-header/div[2]/div[2]/div/div[3]/div[1]/div/a/div/div[2]/div[2]
  // Wait for the necessary elements to load (this could be different depending on the site)
  await page.waitForSelector("article");

  // Scrape the headlines and links of the articles
  const articles = await page.evaluate(() => {
    const newsItems = [];
    const articleElements = document.querySelectorAll("article");

    articleElements.forEach((article) => {
      const title = article.querySelector("h1")
        ? article.querySelector("h1").innerText
        : null;
      const link = article.querySelector("a")
        ? article.querySelector("a").href
        : null;

      if (title && link) {
        newsItems.push({ title, link });
      }
    });

    return newsItems;
  });

  // Print the scraped data
  console.log(articles);

  // Close the browser
  await browser.close();
}

// Run the function
scrapeNews().catch(console.error);
