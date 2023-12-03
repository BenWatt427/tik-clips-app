const express = require('express');
const captureVideo = require('./clipping');
const cfg = require('./config');

const app = express();
const PORT = cfg.gConfig.port;

const captureQueue = [];

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/capture-videos', async (req, res) => {
  const videoUrls = req.body.videoUrls;

  try {
    if (!Array.isArray(videoUrls) || videoUrls.length === 0) {
      return res.status(400).send('Invalid video URLs');
    }
    const captureIds = [];
    for (const url of videoUrls) {
      const captureId = captureQueue.length + 1;
      captureIds.push(captureId);

      captureQueue.push({
        captureId,
        status: 'pending',
        message: `Video capture #${captureId} for ${url} is pending.`,
      });
      const response = await captureVideo(captureId, url, captureQueue);
      if (!response.success) {
        return res.status(400).json('Video capture failed');
      }
    }
    return res.status(200).json({ captureIds, message: 'Video capture complete' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Failed to capture video for ${url}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
