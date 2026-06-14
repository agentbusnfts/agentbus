const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 628 });

  const htmlPath = path.resolve(__dirname, '../public/images/frame-template.html');
  const fileUrl = 'file://' + htmlPath;

  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  const outputPath = path.resolve(__dirname, '../public/images/farcaster-frame.png');
  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 628 }
  });

  console.log('Screenshot saved to:', outputPath);
  await browser.close();
})();
