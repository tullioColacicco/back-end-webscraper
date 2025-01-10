const puppeteer = require("puppeteer");

async function scrapeNews() {
  // Launch Puppeteer
  // Specify the executable path for Render's Chromium (might vary based on your environment)

  const browser = await puppeteer.launch({
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable", // Common path for Render
    headless: true,
    args: [
      "--no-sandbox", // Required to run as root in Docker
      "--disable-setuid-sandbox", // Prevents sandboxing issues
    ],
  });

  const page = await browser.newPage();

  try {
    // Navigate to the Google News page
    await page.goto(
      "https://www.google.com/search?sca_esv=730791857161bc9a&rlz=1C1CHBF_enUS773US773&sxsrf=ADLYWIJb3COcq9KEnIgeHlI9SYvdlBNgVQ:1735774564831&q=yankees&tbm=nws&source=lnms&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWtG_mNb-HwafvV8cKK_h1a-aRpNV3VwRSMnTlqIbZe21BBv14h-NoyUlCQxjmyooZ0JaYNwp1mgi4n_FepLu1CsZmV9tXijs6fWPx8UHjeoL2Zrq0iU5xgUfo6ecWH04uKujs5SYApNnp__EMPP9YffpNp5lCNxwYazpraJRgURItz8BTTqcgs-kepBvdOTZXxDcOGg&sa=X&ved=2ahUKEwja6-KS2NWKAxUNEFkFHYGFFJYQ0pQJegQIHBAB&biw=1536&bih=1279&dpr=1",
      { waitUntil: "domcontentloaded" }
    );

    // Wait for necessary selectors
    await page.waitForSelector(".SoAPf");
    await page.waitForSelector(".m7jPZ");
    await page.waitForSelector(".n0jPhd.ynAwRc.tNxQIb.nDgy9d");

    // Extract data from the page
    const allLinks = await page.evaluate(() => {
      const links = document.querySelectorAll(".m7jPZ");
      return Array.from(links).map((link) => {
        const desc =
          link.querySelector(".n0jPhd.ynAwRc.tNxQIb.nDgy9d")?.innerText ||
          "No description";
        const title = link.querySelector(".WlydOe")?.href || "No title link";
        const date =
          link.querySelector(".OSrXXb.rbYSKb.LfVVr")?.innerText || "No date";
        const imgElement = link.querySelector("img");
        const image = imgElement?.src || "No image found";

        return { desc, title, date, image };
      });
    });

    console.log("Scraped Data:", allLinks); // Log the scraped data
    return allLinks; // Return the scraped data
  } catch (error) {
    console.error("Error scraping news:", error);
    throw error; // Rethrow error to handle in higher-level logic
  } finally {
    await browser.close(); // Close the browser
  }
}

// Run the scraper
scrapeNews()
  .then((data) => {
    console.log("Scraping complete. Data:", data);
  })
  .catch((error) => {
    console.error("Scraping failed:", error);
  });

module.exports = scrapeNews;
