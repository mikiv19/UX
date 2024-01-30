const { expect } = require('chai');
const request = require('supertest');
const app = require('../translator.js');
const languageCodes = require('./langaugeCodes.js');
const testText = require('./testText.js')
const playlistapp = require('../playlist.js')

//translator api tests
describe('Translate API Tests', () => {
    // as it is not sending any data with the post request a 500 is expected.
    it('Testing if it can connect to the TranslateAPI:', async() => {
        const response = await request(app).post('/translate')
        expect(response.status).to.equal(200)
    })
    it('Testing if the translation is equal to "hej"', async() => {
        const payload = {
            source: "en",
            text: "hello",
            target: "da",
            proxies: []
        }
        const response = await request(app)
            .post('/translate')
            .send(payload);
        expect(response.status).to.equal(200)
        expect(response.body).to.deep.equal({ translatedText: 'Hej' });
    })
    for (const { language, code }
        of languageCodes) {
        it(`Tests translation to ${language}`, async() => {
            const payload = {
                text: testText.longText,
                target: code
            };
            const response = await request(app)
                .post('/translate')
                .send(payload);
            expect(response.status).to.equal(200);
        }).timeout(6000)
    }
});

// Playlist api tests
describe('Playlist API Tests', () => {
    it('Testing if it can acces playlists in /playlists, by looking up "_id"', async() => {
        const response = await request(playlistapp)
            .get('/playlists');
        expect(response.status).to.equal(200);
        const playlistIds = response.body.map(playlist => playlist._id);
        //console.log('Number of songs with "_id" property:', songIds.length);
        expect(playlistIds.length).to.be.above(0);
        describe('Testing /playlist/:id with all "_id"s form the /playlist', () => {
            // Loop through the song ids from /playlist, and make a request to /playlist/:id for each id
            for (let i = 0; i < playlistIds.length; i++) {
                const playlistId = playlistIds[i];
                it(`Testing /playlist/${playlistId}`, async() => {
                    const response = await request(playlistapp)
                        .get(`/playlist/${playlistId}`);
                    expect(response.status).to.equal(200);
                    expect(response.body).to.have.property('_id', playlistId);
                    //console.log(response.body);
                });
            }
        });
    });
    it('Testing if it can access songs in /song by looking up "_id"', async() => {
        const response = await request(playlistapp)
            .get('/song');
        expect(response.status).to.equal(200);
        const songIds = response.body.map(song => song._id);
        //console.log('Number of songs with "_id" property:', songIds.length);
        expect(songIds.length).to.be.above(0);
        describe('Testing /song/:id with all "_id"s form the /song', () => {
            // Loop through the song ids from /song, and make a request to /song/:id for each id
            for (let i = 0; i < songIds.length; i++) {
                const songId = songIds[i];
                it(`Testing /song/${songId}`, async() => {
                    const response = await request(playlistapp)
                        .get(`/song/${songId}`);
                    expect(response.status).to.equal(200);
                    expect(response.body).to.have.property('_id', songId);
                    //console.log(response.body);
                });
            }
        });
    });
    it('Testing create playlist with "post/playlist" request with params: name: "name", songs : "songId"', async() => {
        // This payload is what we are sending to the post request.
        // This is done to test if the "create playlist" function works.
        const payload = {
            name: "playlistTest",
            songs: [
                "654c559fcafb85026653971f",
                "654c559fcafb850266539718",
                "654c559fcafb850266539726"
            ]
        }
        const response = await request(playlistapp)
            .post('/playlist')
            .send(payload);
        expect(response.status).to.equal(201);
        expect(response.body).to.contain({ name: "playlistTest" });
        const playlistId = response.body._id;
        console.log(response.body);
        console.log(playlistId);
        describe('changing the Name', () => {
            it(`change the name with request put/playlists/${playlistId}`, async() => {
                const payload = {
                    name: "updateTest"
                }
                const response = await request(playlistapp)
                    .put(`/playlists/${playlistId}`)
                    .send(payload);
                expect(response.status).to.equal(200);
                expect(response.body.name).to.have.equal('updateTest');
                console.log(response.body);
            });
        });
        describe('removing 1 song from the playlist', () => {
            it(`Deleting one song with request delete/playlists/${playlistId}/songs/654c559fcafb85026653971f`, async() => {
                const response = await request(playlistapp)
                    .delete(`/playlists/${playlistId}/songs/654c559fcafb85026653971f`)
                expect(response.status).to.equal(200);
                console.log(response.body);
            });
        });
        describe('delete the playlist from id', () => {
            it(`Deleting the playlist with request delete/playlists/${playlistId}`, async() => {
                const response = await request(playlistapp)
                    .delete(`/playlists/${playlistId}`)
                expect(response.status).to.equal(200);
                console.log(response.body);
            });
        });
    });
});