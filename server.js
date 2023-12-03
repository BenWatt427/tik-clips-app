const express = require('express');
const bodyParser = require('body-parser');
const captureVideo = require('./clipping');

const app = express();
const PORT = 3000;

const captureQueue = [];

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

app.post('/capture-videos', async (req, res) => {
  const videoUrls = req.body.videoUrls;

  const captureIds = [];
  for (const url of videoUrls) {
    const captureId = captureQueue.length + 1;
    captureIds.push(captureId);

    captureQueue.push({
      captureId,
      status: 'pending',
      message: `Video capture #${captureId} for ${url} is pending.`,
    });
    captureVideo(captureId, url);
  }

  res.send({ captureIds, message: 'Video capture initiated. Check the "public" folder for the output videos.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
