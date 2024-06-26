const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');

const writeFileAsync = promisify(fs.writeFile);

const cfg = require('./config.json');  // Assuming you have a config file

const videoOutputFolder = cfg.gConfig.videoOutputFolder;
// peg_path = cfg.gConfig.ffmpegPath

const vidConfig = {
  followNewTab: true,
  fps: 25,
  ffmpegPath: 'C:\\Users\\benwa\\Desktop\\ffmpeg-master-latest-win64-gpl-shared\\bin\\ffmpeg' || null,
  videoFrame: {
    width: 1024,
    height: 768,
  },
  videoCrf: 18,
  videoCodec: 'libx264', // or libx264, libvpx-vp9
  videoPreset: 'ultrafast',
  videoBitrate: 1000,
  autoPad: {
    color: 'black' | '#35A5FF',
  },
  aspectRatio: '4:3',
}

async function captureVideo(captureId, videoUrl) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    // Navigate to the video URL
    await page.goto(videoUrl, { waitUntil: 'domcontentloaded' });

    // Handle consent pop-ups if necessary
    await handleConsentPopUp(page);

    // Find the video player
    const videoPlayer = await page.$('video');

    // Start recording the screen
    if (videoPlayer) {
      const recorder = new PuppeteerScreenRecorder(page, vidConfig);
      await recorder.start(path.join(videoOutputFolder, `output_${captureId}.webm`));

      // Wait for 30 seconds (or your desired duration)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stop recording
      await recorder.stop();

      console.log(`Video recorded to: ${videoOutputFolder}`);
      const outputPathFile = path.join(videoOutputFolder, `outputPath_${captureId}.txt`);
      try {
        const content = `Output Path: ${path.join(videoOutputFolder, `output_${captureId}.webm`)}`;
        await writeFileAsync(outputPathFile, content);
      } catch (writeError) {
        console.error(`Error writing file: ${writeError.message}`);
      }
    }
  } catch (error) {
    console.error(`Error during video capture: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
  console.log('Video written to stream successfully');
  return {
    success: true,
  }
}

async function handleConsentPopUp(page) {
  await page.evaluate(() => {
    const acceptButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Accept'));
    if (acceptButton) {
      acceptButton.click();
    }
  });
}

module.exports = captureVideo;
