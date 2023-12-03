"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const puppeteer_1 = __importDefault(require("puppeteer"));
const PuppeteerScreenRecorder_1 = require("../lib/PuppeteerScreenRecorder");
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
/**
 * @ignore
 */
async function testStartMethod(format) {
    const browser = await puppeteer_1.default.launch({
        executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'],
    });
    const page = await browser.newPage();
    const recorder = new PuppeteerScreenRecorder_1.PuppeteerScreenRecorder(page);
    await recorder.start(format);
    await page.goto('https://www.youtube.com/watch?v=fh4RNP4bMWk');
    await sleep(2000);
    await page.evaluate(() => {
        const buttonElement = Array.from(document.querySelectorAll('a yt-formatted-string')).find((element) => element.textContent === 'Reject all');
        if (buttonElement) {
            buttonElement.click();
        }
    });
    await page.click('button[title="Play (k)"]');
    await page.waitFor(20 * 1000);
    await recorder.stop();
    await browser.close();
}
/**
 * @ignore
 */
async function testStartStreamMethod(format) {
    const browser = await puppeteer_1.default.launch({
        executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'],
    });
    const page = await browser.newPage();
    const recorder = new PuppeteerScreenRecorder_1.PuppeteerScreenRecorder(page);
    const passthrough = new stream_1.PassThrough();
    format = format.replace('video', 'stream');
    const fileWriteStream = fs_1.default.createWriteStream(format);
    passthrough.pipe(fileWriteStream);
    await recorder.startStream(passthrough);
    await page.goto('https://www.youtube.com/watch?v=fh4RNP4bMWk');
    await sleep(2000);
    await page.click('button[title="Play (k)"]');
    await page.waitFor(20 * 1000);
    await recorder.stop();
    await browser.close();
}
/**
 * @ignore
 */
async function executeSample(format) {
    const argList = process.argv.slice(2);
    const isStreamTest = argList.includes('stream');
    if (isStreamTest) {
        console.log('Testing with startSteam Method');
        return testStartStreamMethod(format);
    }
    console.log('Testing with start Method');
    return testStartMethod(format);
}
executeSample('./report/video/simple1.mp4').then(() => {
    console.log('completed');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXhhbXBsZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQUFvQjtBQUNwQixtQ0FBcUM7QUFFckMsMERBQWtDO0FBRWxDLDRFQUF5RTtBQUV6RSxTQUFTLEtBQUssQ0FBQyxJQUFZO0lBQ3pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM3QixVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLGVBQWUsQ0FBQyxNQUFNO0lBQ25DLE1BQU0sT0FBTyxHQUFHLE1BQU0sbUJBQVMsQ0FBQyxNQUFNLENBQUM7UUFDckMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUM7S0FDekQsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxpREFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0IsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7SUFDL0QsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEIsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtRQUN2QixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUM5QixRQUFRLENBQUMsZ0JBQWdCLENBQW9CLHVCQUF1QixDQUFDLENBQ3RFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDO1FB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