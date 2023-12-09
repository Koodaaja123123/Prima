import express from 'express'; // Express.js, web-sovelluskehys Node.js:lle.
import * as dotenv from 'dotenv'; // Dotenv, ympäristömuuttujien hallintaan.
import cors from 'cors'; // CORS (Cross-Origin Resource Sharing) middleware.
import OpenAI from 'openai'; // OpenAI SDK:n tuonti.

dotenv.config(); // Alustetaan dotenv, joka lataa .env-tiedoston avain-arvoparit.

// Luo uusi OpenAI-instanssi käyttäen ympäristömuuttujassa määriteltyä API-avainta.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Hakee API-avaimen .env-tiedostosta.
});

const app = express(); // Luo uuden Express-sovelluksen.
app.use(cors()); // Sallii CORS:n kaikille reiteille.
app.use(express.json()); // Sallii JSON-muotoisten pyyntöjen käsittelyn.

// Määritellään reitti, joka käsittelee GET-pyyntöjä juureen ('/').
app.get('/', async (req, res) => {
  // Lähettää HTTP 200 (OK) vastauksen JSON-muodossa.
  res.status(200).send({
    message: 'Hello' // Vastauksen sisältö.
  });
});


// Määrittelee reitin POST-pyynnöille juureen ('/').
app.post('/', async (req, res) => {
  // Ottaa käyttäjän syötteen (prompt) pyynnön rungosta.
  try {
    const prompt = req.body.prompt;

    // Kutsuu OpenAI:n chat API:ta käyttäen GPT-4-mallia.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Käytettävä AI-malli.
      messages: [{ "role": "user", "content": prompt }], // Lähetettävä viesti.
      temperature: 0, // Määrittää luovan vastauksen todennäköisyyden (0-1).
      max_tokens: 256, // Maksimi määrä merkkejä vastauksessa
      top_p: 1, // Määrittää, kuinka moni parhaista merkeistä otetaan huomioon.
      frequency_penalty: 0.5, // vättää toistuvia sanoja vastauksessa.
      presence_penalty: 0, // Ei vaikuta vastauksen monipuolisuuteen.
    });

    // Lähettää vastauksen takaisin raakamuodossa testaustarkoituksiin.
    res.status(200).send({ response });
  } catch (error) {
     // Tulostaa virheen konsoliin ja lähettää 500 (Internal Server Error) vastauksen.
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});


// Käynnistää Express-palvelimen portissa 5000.
app.listen(5000, () => console.log('AI server started on http://localhost:5000'));  // Tulostaa viestin konsoliin, kun palvelin on käynnistynyt.