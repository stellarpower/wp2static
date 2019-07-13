describe('Plugin page renders and filelist is generated', () => {
  beforeAll(async () => {
    // change timeout to 10 seconds
    jest.setTimeout(10000);

    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:81/wp-login.php');
    await page.type('#user_login', 'admin');
    await page.type('#user_pass', 'banana');
    await page.click('#wp-submit');

    await page.goto('http://localhost:81/wp-admin/admin.php?page=wp2static');
    await browser.newPage();

    // wait for filelist preview to complete:
    await page.waitForFunction(
      `document.querySelector('#current_action').innerHTML.includes('URLs were detected')`
    );

  });

  it('should be titled "WP2Static Test Site"', async () => {
    await expect(page.title()).resolves.toMatch('WP2Static');
  });

  it('generate button should not be disabled ', async () => {
    const is_disabled = await page.evaluate(() => document.querySelector('#wp2staticGenerateButton[disabled]') !== null);

    await expect(is_disabled).toBeFalsy();
  });

  it('Resetting default settings sets staging deploy method to "folder"', async () => {
    await page.$eval('#wp2staticResetDefaultsButton', el => el.click());

    page.on("dialog", (dialog) => {
      dialog.accept();
    });

    await browser.newPage();

    // wait for filelist preview to complete:
    await page.waitForFunction(
      `document.querySelector('#current_action').innerHTML.includes('URLs were detected')`
    );

    // check staging deploy method reset to folder
    const stagingDeployMethod = await page.evaluate(() => document.querySelector('#deploymentMethodStaging').innerText);

    await expect(stagingDeployMethod).toMatch('Deployment Method folder');
  });

  it('Set staging deploy method to "zip" and saving persists', async () => {
    await page.$eval('#staging_deploy', el => el.click());
    await page.select('#selected_deployment_method', 'zip')

    // await page.screenshot({path: 'screenshot.png'}); // DEBUG

    await page.$eval('#wp2staticSaveButton', el => el.click());

    await browser.newPage();

    // wait for filelist preview to complete:
    await page.waitForFunction(
      `document.querySelector('#current_action').innerHTML.includes('URLs were detected')`
    );

    // check staging deploy method reset to folder
    const stagingDeployMethod = await page.evaluate(() => document.querySelector('#deploymentMethodStaging').innerText);

    // await page.screenshot({path: 'screenshot.png'}); // DEBUG

    await expect(stagingDeployMethod).toMatch('Deployment Method zip');
  });
});
