const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

async function captureVideo(captureId, videoUrl) {
  const captureData = captureQueue.find((item) => item.captureId === captureId);
  captureData.status = 'in-progress';
  captureData.message = `Video capture #${captureId} is in progress.`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {

    await page.goto(videoUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('video');

    await page.evaluate(() => {
      document.querySelector('video').play();
    });

    // clip 60 seconds of video
    await new Promise(resolve => setTimeout(resolve, 60000));

    await page.evaluate(() => {
      document.querySelector('video').pause();
    });

    for (let i = 0; i < 30 * 30; i++) {
      const screenshotPath = path.join(__dirname, 'public', `screenshot_${i + 1}.png`);
      await page.screenshot({ path: screenshotPath });
      await page.waitForTimeout(1000 / 30);
    }
  } finally {
    await browser.close();
    captureData.status = 'completed';
    captureData.message = `Video capture #${captureId} is completed.`;

    // Constructing file paths using path.join for consistency
    const screenshotFolder = path.join(__dirname, 'public');
    const screenshotPattern = path.join(screenshotFolder, `screenshot_%d.png`);
    const videoOutputPath = path.join(screenshotFolder, `output_${captureId}.mp4`);

    // Move video encoding logic here if you want to process the video immediately
    ffmpeg()
      .input(screenshotPattern)
      .inputFPS(30)
      .output(videoOutputPath)
      .on('end', () => console.log(`Video encoding for ${captureId} complete`))
      .run();
  }
}

module.exports = captureVideo;
