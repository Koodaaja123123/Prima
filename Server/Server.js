import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config(); // Alustetaan dotenv, joka lataa .env-tiedoston avain-arvoparit.

// Luo uuden OpenAI-instanssin käyttäen ympäristömuuttujassa määriteltyä API-avainta.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Hakee API-avaimen .env-tiedostosta.
});

const app = express(); // Luo uuden Express-sovelluksen.
app.use(cors()); // Sallii CORS:n kaikille reiteille.
app.use(express.json()); // Sallii JSON-muotoisten pyyntöjen käsittelyn.

app.get('/', async (req, res) => {
  res.status(200).send({ message: 'Hello' });
});

// Määrittelee reitin POST-pyynnöille juureen ('/').
app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const systemMessage = {
      "role": "system",
      "content": "You are an expert problem solver. You always think about a problem in a step-by-step way using Chain of Thought, Reasoning, and common sense."
    };

    const userMessage = { "role": "user", "content": prompt };

    const response = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-1106:personal::8kICv97Z",
      messages: [systemMessage ,userMessage],
      temperature: 0,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0.9,
      presence_penalty: 0,
    });

    res.status(200).send({ response });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Käynnistää Express-palvelimen portissa 5000.
app.listen(5000, () => console.log('AI server started on http://localhost:5000'));  // Tulostaa viestin konsoliin, kun palvelin on käynnistynyt.