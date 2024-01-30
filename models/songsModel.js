const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    title: {
        type: String
    },
    id: {
        type: String
    },
    Songs: {
        type: mongoose.Schema.Types.ObjectId,
        trackPath: {
            type: mongoose.Schema.Types.trackPath,
        },
        coverPath: {
            type: mongoose.Schema.Types.coverPathPath,
        }
    },
}, {
    timestamps: true
})
const Song = mongoose.model('Songs', songSchema);
module.exports = Song;