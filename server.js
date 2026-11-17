const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const app = express();

app.use(cors());

// A friendly home page
app.get('/', (req, res) => {
    res.send('Proxy server is online!');
});

app.get('/proxy-stream', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        // Fetch video info first to ensure it's accessible
        const info = await ytdl.getInfo(videoUrl);
        
        // Find the best MP4 format with both video and audio
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });

        res.header('Content-Type', 'video/mp4');
        
        // Stream it with a fake User-Agent so YouTube doesn't block the Render server
        ytdl(videoUrl, { 
            format: format,
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        }).pipe(res);

    } catch (error) {
        console.error('Streaming error:', error.message);
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
