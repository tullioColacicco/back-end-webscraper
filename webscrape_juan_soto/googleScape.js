const puppeteer = require("puppeteer");

async function scrapeNews() {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to a news website that has coverage of Juan Soto
  // For example, let's use Google News
  await page.goto(
    "https://www.google.com/search?q=juan+soto&sca_esv=24d1c3d5cf171cb0&rlz=1C1CHBF_enUS773US773&biw=1164&bih=1279&tbm=nws&sxsrf=ADLYWIJksjKXuc1zJ2dD44rf5ibQaHcnsA:1733175181114&story=Gh4SHEp1YW4gU290byBmcmVlIGFnZW5jeSBydW1vcnMyMQonxoX3l_bdhNY7xcfm1tj7yauzAfXIqr3-26f-ywHb2bmZmemH_rsBEIKrlecMGAVyAhAC&fcs=ACgqzee-FWCM74_uru7XRITKs5oR5qb6Gw&sa=X&ved=2ahUKEwjo0YPYhIqKAxUQSjABHaaOPcsQ7IUHegQIBxAF",
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
      return { desc, title };
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
