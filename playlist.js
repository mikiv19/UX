const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Playlist = require('./models/playlistModel');
const Song = require('./models/songsModel');
require('dotenv').config();
const app = express();
const port = 8000;
// "app.use" is used to add middelware to parse incoming json requests and puts the parsed data in req.body.
app.use(express.json())
    // Start the server
app.listen(port, () => {
    console.log(`Server running  on port ${port}`);
});
//database connection
mongoose.connect(process.env.DB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('connected to MongoDB')
    }).catch((error) => {
        console.log(error)
    })

module.exports = app;
// Routes
// Get all playlists, req is prexifix with "_" to show that its not needed in this request
app.get('/playlists', async(_req, res) => {
        try {
            const playlist = await Playlist.find({});
            res.status(200).json(playlist);
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    })
    // Create Playlist
app.post('/playlist', async(req, res) => {
        try {
            const playlist = await Playlist.create(req.body)
            res.status(201).json(playlist)
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    })
    // Fetch songs, req is prexifix with "_" to show that its not needed in this request
app.get('/song', async(_req, res) => {
        try {
            const song = await Song.find({});
            res.status(200).json(song);
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    })
    // get song by id
app.get('/song/:songId', async(req, res) => {
        try {
            const { songId } = req.params
            const song = await Song.findById(songId);
            res.status(200).json(song);
            if (!song) {
                return res.status(204).json({ message: 'Song not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    })
    // get song from title
app.get('/songs/:title', async(req, res) => {
        try {
            const title = req.params
            const song = await Song.find(title);
            res.status(200).json(song);
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    })
    // Playlist by ID
app.get('/playlist/:playlistId', async(req, res) => {
    try {
        const { playlistId } = req.params;
        // Henter playlist fra playlistId
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(204).json({ message: 'Playlist not found' });
        }
        // get info from all the songs in the playlist, iterable method.
        const detailedSongs = await Promise.all(playlist.songs.map(async(songId) => {
            const response = await axios.get(`http://localhost:8000/song/${songId}`);
            return response.data;
        }));
        // Combine the playlist information with detailedSongs information
        const playlistWithSongs = {
            _id: playlist._id,
            name: playlist.name,
            songs: detailedSongs,
            createdAt: playlist.createdAt,
            updatedAt: playlist.updatedAt
        };
        // returns the playlist with song info
        res.status(200).json(playlistWithSongs);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
});

// Update playlist name
app.put('/playlists/:playlistId', async(req, res) => {
    try {
        const { playlistId } = req.params;
        const playlists = await Playlist.findByIdAndUpdate(playlistId, req.body);
        if (!playlists) {
            return res.status(404).json({ message: 'No playlist with that ID ${id}' })
        }
        const updatedPlaylist = await Playlist.findById(playlistId)
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete playlist
app.delete('/playlists/:playlistId', async(req, res) => {
    try {
        const { playlistId } = req.params;
        const playlist = await Playlist.findByIdAndDelete(playlistId, req.body);
        if (!playlist) {
            return res.status(404).json({ message: 'No playlist with that ID ${id}' })
        }
        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})

// Delete a song from a playlist
app.delete('/playlists/:playlistId/songs/:songId', async(req, res) => {
    try {
        const { playlistId, songId } = req.params;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: `No playlist with ID ${playlistId}` });
        }
        const songIndex = playlist.songs.findIndex(song => song._id.toString() === songId);
        if (songIndex === -1) {
            return res.status(404).json({ message: `No song with ID ${songId} found in the playlist` });
        }

        // Remove song from the playlist
        playlist.songs.splice(songIndex, 1);

        // Save the updated playlist to mongoDB
        await playlist.save();

        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});