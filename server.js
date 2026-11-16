const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();

// Enable CORS so your HTML file can access it
app.use(cors());

// Proxy endpoint
app.get('/proxy-stream', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid or missing YouTube URL');
    }

    try {
        // Set headers so the browser knows it's receiving a video stream
        res.header('Content-Type', 'video/mp4');
        
        // Fetch the video stream from YouTube and pipe it directly to the client
        // This hides YouTube from the network filter
        ytdl(videoUrl, { 
            filter: format => format.container === 'mp4',
            quality: 'highest'
        }).pipe(res);

    } catch (error) {
        console.error('Streaming error:', error);
        res.status(500).send('Error proxying video stream');
    }
});

// Use Render's dynamic port or default to 3000 for local testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
