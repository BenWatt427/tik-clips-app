import fs from 'fs';
import { dirname } from 'path';
import test from 'ava';
import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from '../';
const launchBrowser = async () => {
    const puppeteerPath = process.env['PUPPETEER_EXECUTABLE_PATH'];
    if (!puppeteerPath) {
        throw new Error('Please configure puppeteer path: export PUPPETEER_EXECUTABLE_PATH=<path>');
    }
    const browser = await puppeteer.launch({
        headless: true,
        ...(puppeteerPath ? { executablePath: puppeteerPath } : {}),
    });
    return browser;
};
test('case 1a --> Happy Path: Should be able to create a new screen-recording session', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const outputVideoPath = './test-output/test/video-recorder/testCase1.mp4';
    const recorder = new PuppeteerScreenRecorder(page);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    await page.goto('https://google.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 1a --> Happy Path: Should be able to create a new screen-recording session using mp4 format', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const outputVideoPath = './test-output/test/video-recorder/testCase1.mp4';
    const recorder = new PuppeteerScreenRecorder(page);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    await page.goto('https://google.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 1b --> Happy Path: Should be able to create a new screen-recording session using mov', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const outputVideoPath = './test-output/test/video-recorder/testCase1.mov';
    const recorder = new PuppeteerScreenRecorder(page);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    await page.goto('https://google.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 1c --> Happy Path: Should be able to create a new screen-recording session using webm', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const outputVideoPath = './test-output/test/video-recorder/testCase1.webm';
    const recorder = new PuppeteerScreenRecorder(page);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    await page.goto('https://google.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 1d --> Happy Path: should be to get the total duration of recording using avi', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const outputVideoPath = './test-output/test/video-recorder/testCase2.avi';
    const recorder = new PuppeteerScreenRecorder(page);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    await page.goto('https://google.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    const duration = recorder.getRecordDuration();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    console.log('duration', duration);
    assert.is(duration !== '00:00:00:00', true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 2 --> Happy Path: testing video recording with video frame width, height and aspect ratio', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const options = {
        followNewTab: false,
        videoFrame: {
            width: 1024,
            height: 1024,
        },
        aspectRatio: '4:3',
    };
    const outputVideoPath = './test-output/test/video-recorder/testCase4.mp4';
    const recorder = new PuppeteerScreenRecorder(page, options);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('test 3 -> Error Path: should throw error if an invalid savePath argument is passed for start method', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    try {
        const outputVideoPath = './test-output/test/video-recorder/';
        const recorder = new PuppeteerScreenRecorder(page);
        await recorder.start(outputVideoPath);
        /** execute */
        await page.goto('https://github.com', { waitUntil: 'load' });
        await page.goto('https://google.com', { waitUntil: 'load' });
        /** clear */
        await recorder.stop();
    }
    catch (error) {
        assert.true(error.message === 'File format is not supported');
    }
});
test('case 4 --> Happy Path: Should be able to create a new screen-recording session using streams', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const outputVideoPath = './test-output/test/video-recorder/testCase4.mp4';
    try {
        fs.mkdirSync(dirname(outputVideoPath), { recursive: true });
    }
    catch (e) {
        console.error(e);
    }
    const fileWriteStream = fs.createWriteStream(outputVideoPath);
    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.startStream(fileWriteStream);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    await page.goto('https://google.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
    fileWriteStream.on('end', () => {
        assert.is(fileWriteStream.writableFinished, true);
    });
});
test('case 5a --> Happy Path: testing video recording with video frame width, height and autopad color', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const options = {
        followNewTab: false,
        videoFrame: {
            width: 1024,
            height: 1024,
        },
        autopad: {
            color: 'gray',
        },
    };
    const outputVideoPath = './test-output/test/video-recorder/testCase5a.mp4';
    const recorder = new PuppeteerScreenRecorder(page, options);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 5b --> Happy Path: testing video recording with video frame width, height and autopad color as hex code', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const options = {
        followNewTab: false,
        videoFrame: {
            width: 1024,
            height: 1024,
        },
        autopad: {
            color: '#008000',
        },
    };
    const outputVideoPath = './test-output/test/video-recorder/testCase5b.mp4';
    const recorder = new PuppeteerScreenRecorder(page, options);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 5c --> Happy Path: testing video recording with video frame width, height and default autopad color', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const options = {
        followNewTab: false,
        videoFrame: {
            width: 1024,
            height: 1024,
        },
        autopad: {},
    };
    const outputVideoPath = './test-output/test/video-recorder/testCase5c.mp4';
    const recorder = new PuppeteerScreenRecorder(page, options);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
test('case 6 --> Happy Path: should create a video with a custom crf', async (assert) => {
    /** setup */
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const options = {
        followNewTab: false,
        videoFrame: {
            width: 1024,
            height: 1024,
        },
        videoCrf: 0,
    };
    const outputVideoPath = './test-output/test/video-recorder/testCase6.mp4';
    const recorder = new PuppeteerScreenRecorder(page, options);
    const recorderValue = await recorder.start(outputVideoPath);
    /** execute */
    await page.goto('https://github.com', { waitUntil: 'load' });
    /** clear */
    const status = await recorder.stop();
    await browser.close();
    /** assert */
    assert.is(recorderValue instanceof PuppeteerScreenRecorder, true);
    assert.is(status, true);
    assert.is(fs.existsSync(outputVideoPath), true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU2NyZWVuUmVjb3JkZXIuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zcGVjL1B1cHBldGVlclNjcmVlblJlY29yZGVyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3BCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxJQUFJLE1BQU0sS0FBSyxDQUFDO0FBQ3ZCLE9BQU8sU0FBUyxNQUFNLFdBQVcsQ0FBQztBQUVsQyxPQUFPLEVBQUUsdUJBQXVCLEVBQWtDLE1BQU0sS0FBSyxDQUFDO0FBRTlFLE1BQU0sYUFBYSxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQy9CLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUUvRCxJQUFJLENBQUMsYUFBYSxFQUFFO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQ2IsMEVBQTBFLENBQzNFLENBQUM7S0FDSDtJQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNyQyxRQUFRLEVBQUUsSUFBSTtRQUNkLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDNUQsQ0FBQyxDQUFDO0lBRUgsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFDO0FBRUYsSUFBSSxDQUFDLGlGQUFpRixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN2RyxZQUFZO0lBQ1osTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztJQUV0QyxNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUVyQyxNQUFNLGVBQWUsR0FBRyxpREFBaUQsQ0FBQztJQUMxRSxN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