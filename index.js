// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");
  // Wait for the page to load content
  await page.waitForSelector('.athing');

  let isSorted = true;
  let articlesCount = 0;

  while (articlesCount < 100 && isSorted) {
    // Fetch articles and check sorting within page.evaluate
    const result = await page.evaluate(({articlesProcessed}) => {
      const items = Array.from(document.querySelectorAll('.athing'));
      let lastTimestamp = Infinity;
      let isSorted = true;

      for (let item of items) {
        const subtextRow = item.nextElementSibling.querySelector('.subtext');
        const ageText = subtextRow.querySelector('.age').getAttribute('title');
        const timestamp = new Date(ageText).getTime();
        articlesProcessed++;
        if (timestamp > lastTimestamp) {
          isSorted = false;
          break;
        }

        lastTimestamp = timestamp;
        if (articlesProcessed >= 100) break;
      }

      return { isSorted, articlesProcessed };
    }, {articlesProcessed:articlesCount});

    articlesCount = result.articlesProcessed;
    isSorted = result.isSorted;

    if (!isSorted || articlesCount >= 100) break;

    // Click the "More" link to load more articles
    const moreLink = await page.$('a.morelink');
    if (moreLink) {
      await Promise.all([
        page.waitForNavigation(), // Wait for the next batch of articles to load
        moreLink.click()
      ]);
    } else {
      console.log("No more 'More' link to click.");
      break;
    }
  }
  console.log(`Checked ${articlesCount} articles.`);
  console.log(`Are the first 100 articles sorted from newest to oldest? ${isSorted ? 'Yes' : 'No'}`);

  // Close browser
  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();
