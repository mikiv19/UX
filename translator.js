// Import the required libraries
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;

// "app.use" is used to add middelware to parse incoming json requests and puts the parsed data in req.body.
app.use(express.json());
app.post('/translate', async(req, res) => {
    // Define the API endpoint

    // Extract the target, text, and proxies from the request body
    const { target, text } = req.body;
    // Define the payload with the extracted parameters
    const payload = {
        source: "en",
        target: target,
        text: text,
        proxies: []
    };
    try {
        let translatedText = "";
        let success = false;
        try {
            const response = await axios.post('https://deep-translator-api.azurewebsites.net/google/', payload);
            //console.log(response.status)
            if (response.status === 200) {
                //console.log(response.data)
                translatedText = response.data.translation;
                success = true;
                //console.log(response.status)
            }
        } catch {
            const response = await axios.post(`https://665.uncovernet.workers.dev/translate?text=${encodeURIComponent(text)}&source_lang=en&target_lang=${target}`);
            //console.log(response.status)
            if (response.status === 200) {
                //console.log(response.data.response)
                translatedText = response.data.response.translated_text;
                success = true;
                //console.log(response.status)
            }
        }
        if (success) {
            console.log("Translated text", translatedText);
            res.status(200).json({ translatedText });
        }
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({ error: "not this try failed" });
    }
});