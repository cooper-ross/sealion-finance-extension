import dotenv from 'dotenv';
import OpenAI from "openai";

import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/shorten-text', async (req, res) => {
  // Retrieve data from the request body
  const { longText } = req.body;

  const questions = await shortenText(longText);
  res.status(200).json(questions);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: apiKey });


async function shortenText(longText) {
    // Basic instructions for the for the AI that give pretty good results
    const messages = [
        { role: "system", content: `You are shorten-bot, a bot that shortens long wordy and incoherent stock descriptions into a quick easy to read 1-2 line stock blurb summary! Please shorten the following text:` },
        { role: "user", content: longText }
    ];

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
    });
    
    return completion.choices[0].message.content;
}