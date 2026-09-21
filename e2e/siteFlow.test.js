const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const SITE_URL = process.env.SITE_URL || 'http://myshop-ecommerce-megha.s3-website-us-east-1.amazonaws.com';
const testEmail = `e2e-test-${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

(async function runTest() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // 1. Site loads — unauthenticated visit redirects to /register
    await driver.get(SITE_URL);
    await driver.wait(until.elementLocated(By.css('.auth-card')), 20000);
    console.log('PASS: site loaded and redirected to register page');

    // 2. Register a new test account
    await driver.findElement(By.name('name')).sendKeys('E2E Test User');
    await driver.findElement(By.name('email')).sendKeys(testEmail);
    await driver.findElement(By.name('password')).sendKeys(testPassword);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // 3. Should land on login page with success message
    await driver.wait(until.elementLocated(By.css('.auth-success')), 20000);
    console.log('PASS: registration succeeded, redirected to login');

    // 4. Log in with the same credentials
    await driver.findElement(By.name('email')).sendKeys(testEmail);
    await driver.findElement(By.name('password')).sendKeys(testPassword);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // 5. Should land on home page, navbar shows the user's name
    await driver.wait(until.elementLocated(By.xpath("//span[contains(.,'Hi, E2E')]")), 20000);
    console.log('PASS: login succeeded, navbar shows logged-in user');

    // 6. Add the first product to the cart
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(.,'Add to Cart')]")),
      20000
    );
    await addButton.click();
    await driver.sleep(1000); // give the API call + Redux update a moment
    console.log('PASS: clicked Add to Cart, current URL:', await driver.getCurrentUrl());

    // 7. Go to the cart page
    const cartLink = await driver.findElement(By.css('a[href="/cart"]'));
    console.log('Found cart link, clicking it now...');
    await cartLink.click();
    await driver.sleep(1000);
    console.log('After clicking cart link, current URL:', await driver.getCurrentUrl());
    await driver.wait(until.elementLocated(By.css('.cart-item')), 20000);
    console.log('PASS: item appears in cart');

    // 7. Go to the cart page
    await driver.findElement(By.css('a[href="/cart"]')).click();
    await driver.wait(until.elementLocated(By.css('.cart-item')), 20000);
    console.log('PASS: item appears in cart');

    // 8. Remove the item
    await driver.findElement(By.xpath("//button[contains(text(),'Remove')]")).click();
    await driver.wait(until.elementLocated(By.xpath("//h2[contains(.,'cart is empty')]")), 20000);
    console.log('PASS: item removed, cart is empty');

    console.log('\nALL E2E STEPS PASSED');
    process.exitCode = 0;
  } catch (err) {
    console.error('E2E TEST FAILED:', err.message);
    try {
      const currentUrl = await driver.getCurrentUrl();
      const bodyText = await driver.findElement(By.css('body')).getText();
      console.log('\n--- DIAGNOSTIC INFO ---');
      console.log('Current URL:', currentUrl);
      console.log('Page text:', bodyText.slice(0, 500));
      console.log('--- END DIAGNOSTIC INFO ---\n');
    } catch (diagErr) {
      console.log('Could not capture diagnostic info:', diagErr.message);
    }
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
})();