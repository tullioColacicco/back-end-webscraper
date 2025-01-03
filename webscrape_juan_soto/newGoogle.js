const puppeteer = require("puppeteer");

async function scrapeElements() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to your target page
  await page.goto(
    "https://www.google.com/search?sca_esv=730791857161bc9a&rlz=1C1CHBF_enUS773US773&sxsrf=ADLYWIJb3COcq9KEnIgeHlI9SYvdlBNgVQ:1735774564831&q=yankees&tbm=nws&source=lnms&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWtG_mNb-HwafvV8cKK_h1a-aRpNV3VwRSMnTlqIbZe21BBv14h-NoyUlCQxjmyooZ0JaYNwp1mgi4n_FepLu1CsZmV9tXijs6fWPx8UHjeoL2Zrq0iU5xgUfo6ecWH04uKujs5SYApNnp__EMPP9YffpNp5lCNxwYazpraJRgURItz8BTTqcgs-kepBvdOTZXxDcOGg&sa=X&ved=2ahUKEwja6-KS2NWKAxUNEFkFHYGFFJYQ0pQJegQIHBAB&biw=1536&bih=1279&dpr=1",
    { waitUntil: "domcontentloaded" }
  );

  // Wait for elements with the class name to load
  await page.waitForSelector(".n0jPhd.ynAwRc.tNxQIb.nDgy9d");

  // Scrape text and <a> tags with hrefs
  const elements = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".n0jPhd.ynAwRc.tNxQIb.nDgy9d")
    ).map((element) => {
      // Get the text content and href from <a> tags
      const links = Array.from(element.querySelectorAll("a")).map((a) => ({
        text: a.innerText.trim(), // Text inside the <a> tag
        href: a.href, // href attribute of the <a> tag
      }));

      return {
        text: element.innerText.trim(), // Entire element's text content
        links: links, // Array of all <a> tags with hrefs
      };
    });
  });

  console.log(elements);

  await browser.close();
}

// Run the function
scrapeElements().catch(console.error);
