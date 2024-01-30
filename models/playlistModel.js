const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        songs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'songs',

        }],
    }, {
        timestamps: true
    }

)
const playlist = mongoose.model('Playlist', playlistSchema);

module.exports = playlist;