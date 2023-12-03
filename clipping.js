const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const cfg = require('./config');

const ffmpegPath = cfg.gConfig.ffmpegPath;
ffmpeg.setFfmpegPath(ffmpegPath);

const videoOutputFolder = cfg.gConfig.videoOutputFolder;

async function handleConsentPopup(page) {
  // Customize this function based on the structure of the consent pop-up on the specific website

  // Example: Clicking on a button with id "acceptButton" for consent
  await page.click('button:contains("Accept All")');

  // You may need to wait for the page to reload or for the consent pop-up to disappear
  await page.waitForTimeout(2000);  // Adjust the timeout as needed
}

async function captureVideo(captureId, videoUrl, captureQueue) {
  const captureData = { captureId, status: 'pending', message: '' }; // Replace this with your capture data structure
  captureQueue.push(captureData);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(videoUrl, { waitUntil: 'domcontentloaded' });
    // Handle consent pop-up (customize this based on your specific case)
    await handleConsentPopup(page);
    await page.waitForSelector('video');

    await page.evaluate(() => {
      document.querySelector('video').play();
    });

    // Capture for 30 seconds, taking a screenshot every second
    for (let i = 0; i < 30; i++) {
      const screenshotPath = path.join(videoOutputFolder, `screenshot_${i + 1}.png`);
      await page.screenshot({ path: screenshotPath });

      // Use setTimeout to introduce a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } finally {
    try {
      await browser.close();
      captureData.status = 'completed';
      captureData.message = `Video capture #${captureId} is completed.`;

      const screenshotPattern = path.join(videoOutputFolder, 'screenshot_%d.png');
      const videoOutputPath = path.join(videoOutputFolder, `output_${captureId}.mp4`);

      // encode video
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(screenshotPattern)
          .inputFPS(30)
          .videoCodec('libx264')
          .outputOptions('-pix_fmt yuv1080p')
          .output(videoOutputPath)
          .on('end', () => {
            console.log(`Video encoding for ${captureId} complete`);
            resolve();
          })
          .on('error', (err) => {
            console.error(`Error encoding video: ${err.message}`);
            console.error(err);
            reject(err);
          })
          .on('progress', (progress) => {
            console.log(`Processing: ${progress.percent}% done`);
          })
          .run();
      });
    } catch (err) {
      console.error(`Error during video encoding: ${err.message}`);
      captureData.status = 'failed';
      captureData.message = `Video capture #${captureId} failed during encoding.`;
      return err;
    }
  }
}

module.exports = captureVideo;
// Example usage
// const captureQueue = [];
// captureVideo(1, 'https://www.youtube.com/watch?v=gb2jgHpbowY');  // Replace with the actual video URL
