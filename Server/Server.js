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


app.get('/', async (req, res) => {                              //
  res.status(200).send({ message: 'Hello, server started' });   // Määrittää reitin GET-pyynnöille juureen ('/'), joka lähettää vastauksena tervehdyksen.
});                                                             //

// Määrittelee reitin POST-pyynnöille '/api/analyze', joka käsittelee tekstianalyysipyynnöt.
app.post('/api/analyze', async (req, res) => {
  try {

    // Ottaa 'prompt' kentän pyynnön rungosta.
    const { prompt } = req.body;

    // Tarkistaa, onko 'prompt' kelvollinen merkkijono.
    if (typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
    }

    // Määrittelee viestin, joka lähetetään OpenAI:lle.
    const systemMessage = {
      "role": "system",
      "content": "You are an expert problem solver. You always think about a problem in a step-by-step way using Chain of Thought, Reasoning, and common sense."
    };


    // Luo viestitaulukon, joka sisältää järjestelmäviestin ja käyttäjän antaman 'prompt':n.
    const messages = [systemMessage, { "role": "user", "content": prompt }];


    // Tekee pyynnön OpenAI:n chat-completions API:lle käyttäen määriteltyä mallia ja viestejä.
    const response = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-1106:personal::8kICv97Z",
      messages,
      temperature: 0,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0.9,
      presence_penalty: 0,
    });

    // Lähettää onnistuneen vastauksen takaisin asiakasohjelmalle
    res.status(200).json({ response });

  } catch (error) { // Ottaa kiinni mahdolliset virheet ja lähettää virheviestin.
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Käynnistää Express-palvelimen portissa 5000 ja tulostaa viestin onnistumisesta.
app.listen(5000, () => console.log('AI server started'));  // Tulostaa viestin konsoliin, kun palvelin on käynnistynyt.