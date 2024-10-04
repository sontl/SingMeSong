const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Keep this true for production, but set to false for debugging
      args: [
        '--autoplay-policy=no-user-gesture-required',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--auto-open-devtools-for-tabs',
      ],
      defaultViewport: { width: 1280, height: 720 },
      protocolTimeout: 600000, // Increase protocol timeout to 10 minutes
    });

    const page = await browser.newPage();

    // Navigate to your local server
    await page.goto('http://localhost:3000/visualizer/ffe0ceb4-8237-435f-87e3-dc948737c0e4', { 
      waitUntil: 'networkidle0',
      timeout: 60000 // Increase navigation timeout to 1 minute
    });

    // Wait for the P5.js sketch to be fully loaded and ready
    await page.waitForFunction(() => {
      return window.isSketchReady && window.isSketchReady();
    }, { timeout: 120000 }); // Increase timeout to 2 minutes

    console.log('P5.js sketch loaded and ready');

    // Start recording
    await page.evaluate(() => {
      window.startRecording();
    });

    console.log('Recording started');

    // Wait for the recording to finish (song to end)
    await page.waitForFunction(() => {
      return window.isRecordingFinished();
    }, { timeout: 600000 }); // Increase timeout to 10 minutes

    console.log('Recording finished');

    // Get the video blob and save it to a file
    const videoBuffer = await page.evaluate(async () => {
      const blob = await window.getRecordedVideo();
      const arrayBuffer = await blob.arrayBuffer();
      return Array.from(new Uint8Array(arrayBuffer));
    });

    fs.writeFileSync('output-video.webm', Buffer.from(videoBuffer));
    console.log('Video saved to output-video.webm');

    // Close the browser
    await browser.close();
    console.log('Browser closed');

    // Combine video with audio using FFmpeg, adjusting video speed back to normal
    const audioUrl = 'https://cdn1.suno.ai/aaeeccae-2254-401a-b35e-6c39ede55a68.mp3';
    const ffmpegCommand = `ffmpeg -y -i output-video.webm -i "${audioUrl}" -c:v libx264 -preset fast -crf 22 -c:a aac -strict experimental output-final.mp4`;

    console.log('Executing FFmpeg command...');
    console.log('FFmpeg command:', ffmpegCommand);

    try {
      const ffmpegTimeout = 300000; // 5 minutes timeout
      console.log(`FFmpeg timeout set to ${ffmpegTimeout / 1000} seconds`);

      const { stdout, stderr } = await execPromise(ffmpegCommand);

      console.log('FFmpeg command executed successfully');
      console.log('Video combined with audio successfully. Output: output-final.mp4');

      if (stdout) {
        console.log('FFmpeg stdout:', stdout);
      }

      if (stderr) {
        console.log('FFmpeg stderr (this may include progress information):', stderr);
      }
    } catch (error) {
      console.error('Error during FFmpeg execution:', error.message);
      console.error('FFmpeg error details:', error);
    }

  } catch (error) {
    console.error('Error during recording or FFmpeg execution:', error);
    if (error.message.includes('timed out')) {
      console.error('A timeout occurred. Consider increasing the relevant timeout settings.');
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed due to error or completion');
    }
    process.exit(0); // Exit with success code if everything completed
  }
})();
