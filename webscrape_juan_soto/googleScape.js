const puppeteer = require("puppeteer");

async function scrapeNews() {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to a news website that has coverage of Juan Soto
  // For example, let's use Google News
  await page.goto(
    "https://www.google.com/search?q=yankees&rlz=1C1CHBF_enUS773US773&oq=yan&gs_lcrp=EgZjaHJvbWUqDwgAECMYJxjjAhiABBiKBTIPCAAQIxgnGOMCGIAEGIoFMgwIARAuGCcYgAQYigUyBggCEEUYOzIGCAMQRRg5MgYIBBBFGDwyBggFEEUYPTIGCAYQRRg8MgYIBxBFGDzSAQc3NzNqMGo0qAIAsAIB&sourceid=chrome&ie=UTF-8",
    {
      waitUntil: "domcontentloaded",
    }
  );
  //*[@id="kp-wp-tab-overview"]/div[2]/div/div/div[2]/g-section-with-header/div[2]/div[2]/div/div[3]/div[1]/div/a/div/div[2]/div[2]
  // Wait for the necessary elements to load (this could be different depending on the site)
  await page.waitForSelector(".SoAPf");
  await page.waitForSelector(".m7jPZ");

  // *** this get child elements **
  //   const element = await page.$(".m7jpz");
  const parentElement = await page.$(".m7jPZ");

  // Example: Get the first child element with the class `.child-class`
  //   const childElement = await parentElement.$(".WlydOe");

  //   if (childElement) {
  //     const childText = await childElement.evaluate((el) => el.href);
  //     console.log(childText);
  //   } else {
  //     console.log("Child element not found");
  //   }
  //     ^^^^^^^^^^^
  // *** this get child elements **

  //*** this gets anchor and description using evaluate */

  const allLinks = await page.evaluate(() => {
    const links = document.querySelectorAll(".m7jPZ");
    return Array.from(links).map((link) => {
      const desc = link.querySelector(".n0jPhd.ynAwRc.tNxQIb.nDgy9d").innerText;
      const title = link.querySelector(".WlydOe").href;
      const date = link.querySelector(".OSrXXb.rbYSKb.LfVVr").innerText;
      return { desc, title, date };
    });
  });
  //*** this gets anchor and description using evaluate */

  //** this the first iteration */
  //   const allArticles = await page.evaluate(() => {
  //     const articles = document.querySelectorAll(".SoAPf");

  //     return Array.from(articles)
  //       .slice(0, 4)
  //       .map((article) => {
  //         const title = article.querySelector(
  //           ".n0jPhd.ynAwRc.tNxQIb.nDgy9d"
  //         ).innerText;
  //         return { title };
  //       });
  //   });

  //** this the first iteration */
  console.log(allLinks);
  // Close the browser
  await browser.close();
}

// Run the function
scrapeNews().catch(console.error);
