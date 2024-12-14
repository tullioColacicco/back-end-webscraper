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
      (button) => button.textContent.includes("Stats")
    ); // Find the button with text "News"

    if (newsButton) {
      newsButton.click(); // Click the button if found
    } else {
      console.log("News button not found!");
    }
  });

  // Optionally, wait for new content to appear after clicking the "News" button
  await page.waitForSelector(".table__body"); // Replace with the appropriate selector for the new content (adjust this)

  // Extract or log some content after clicking the button
  const liChildNodes = await page.evaluate(() => {
    // Select all <li> elements with the class 'news-tab__list__item'
    const liElements = document.querySelectorAll(".table__body");
    const liHeader = document.querySelectorAll(".table__row");

    //map over list header elements
    const listNodesArray = Array.from(liHeader).map((li) => {
      // Get all child nodes of the <li> element
      const childNodes = li.childNodes;
      //   const avg = li.querySelector(".table__cell.table__cell--avg").textContent; // childNodes returns a NodeList with all child nodes (including text nodes, comment nodes, etc.)

      // Create an array to hold information about each child node
      const childDetails = Array.from(childNodes).map((child) => {
        return {
          nodeType: child.nodeType, // 1 = Element, 3 = Text, 8 = Comment
          nodeName: child.nodeName,
          nodeClassName: child.className, // Tag name (e.g., 'DIV', 'SPAN', etc.)
          nodeValue: child.textContent,
          //   avg: avg, // Text content or value (for text nodes or comment nodes)
        };
      });

      return childDetails; // Return the array of child nodes' details for this <li>
    });

    // Map over each <li> element to extract its child nodes
    const childNodesArray = Array.from(liElements).map((li) => {
      // Get all child nodes of the <li> element
      const childNodes = li.childNodes;
      //   const avg = li.querySelector(".table__cell.table__cell--avg").textContent; // childNodes returns a NodeList with all child nodes (including text nodes, comment nodes, etc.)

      // Create an array to hold information about each child node
      const childDetails = Array.from(childNodes).map((child) => {
        return {
          nodeType: child.nodeType, // 1 = Element, 3 = Text, 8 = Comment
          nodeName: child.nodeName,
          nodeClassName: child.className, // Tag name (e.g., 'DIV', 'SPAN', etc.)
          nodeValue: child.textContent,
          //   avg: avg, // Text content or value (for text nodes or comment nodes)
        };
      });

      return childDetails; // Return the array of child nodes' details for this <li>
    });

    return listNodesArray; // Return the array containing details of child nodes for each <li>
  });

  console.log("News-related links:", liChildNodes);

  // Close the browser
  await browser.close();
}

// Run the function
scrapePlayerCardMenu().catch(console.error);
