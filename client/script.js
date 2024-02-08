import bot from './assets/assets/bot.svg';
import user from './assets/assets/user.svg';

// Valitsee ensimmäisen löytyvän <form> elementin HTML-dokumentista.
const form = document.querySelector('form');
// Valitsee elementin, jolla on id 'chat_container'.
const chatContainer = document.querySelector('#chat_container');

// Globaali muuttuja, jota käytetään setIntervalin viitteen tallentamiseen.
let loadInterval;


/**
 * Generoi uniikin tunnisteen käyttäen nykyistä aikaleimaa ja satunnaislukua.
 * Tämä on hyödyllinen, kun tarvitaan uniikkeja tunnisteita esimerkiksi elementeille.
 * 
 * @returns {string} Uniikki tunniste.
 */
function generateUniqueId() {
    const timestamp = Date.now(); // Nykyinen aikaleima millisekunteina.
    const randomNumber = Math.random(); // Satunnaisluku välillä 0 - 1.
    const hexadecimalString = randomNumber.toString(16); // Muuntaa satunnaisluvun heksadesimaalimuotoon.
    return `id-${timestamp}-${hexadecimalString}`; // Yhdistää aikaleiman ja heksadesimaaliluvun tunnisteeksi.
}

// Funktio, joka luo animaation elementtiin näyttämällä pisteen ja lisäämällä pisteitä joka 300ms.
function loader(element) {
    clearInterval(loadInterval); // Tyhjentää aiemman setIntervalin, jos sellainen on olemassa.
    element.textContent = '.'; // Asettaa elementin tekstisisällöksi pisteen.

    // Asettaa uuden setIntervalin, joka suoritetaan joka 300ms.
    loadInterval = setInterval(() => {
        element.textContent += '.'; // Lisää yhden pisteen elementin tekstisisältöön.
        if (element.textContent.length > 3) {
            element.textContent = '.'; // Resetoi tekstisisällön yhteen pisteeseen, jos pisteitä on enemmän kuin kolme.
        }
    }, 300);
}


/**
 * Kirjoittaa tekstiä elementtiin kirjain kerrallaan animaation tapaan.
 * 
 * @param {HTMLElement} element - Elementti, johon teksti kirjoitetaan.
 * @param {string} text - Teksti, joka kirjoitetaan elementtiin.
 */
function typeText(element, text) {
    let index = 0; // Alustaa indeksin, joka seuraa kirjoitettavan merkin sijaintia tekstissä.
    // Asettaa toistuvan ajastimen, joka suorittaa funktion joka 20ms.
    let interval = setInterval(() => {
        // Tarkistaa, onko kaikki teksti jo kirjoitettu.
        if (index < text.length) {
            // Lisää seuraavan merkin tekstistä elementin sisältöön.
            element.innerHTML += text.charAt(index);
            index++; // Siirtyy seuraavaan merkkiin.

            // Vierittää chat-ikkunan alaosaan jokaisen lisätyn merkin jälkeen.
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            
        } else {
            // Pysäyttää ajastimen, kun kaikki teksti on kirjoitettu.
            clearInterval(interval);
        }
    }, 5); // ms välein suoritettava funktio.
}

/**
 * Luo chat-viestin HTML-rakenteen.
 * 
 * @param {boolean} isAi - Tosi, jos viesti on tekoälyltä, epätosi jos käyttäjältä.
 * @param {string} value - Viestin sisältö.
 * @param {string} uniqueId - Viestille annettava uniikki tunniste.
 * @returns {string} Viestin HTML-rakenne.
 */

function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi ? 'ai' : ''}">
            <div class="chat">
                <div class="profile">
                    <img src=${isAi ? bot : user} alt="${isAi ? 'bot' : 'user'}" />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
                ${isAi ? `<button class="copy-button" data-elementId="${uniqueId}">
                              <img src="assets/assets/CopyButton.svg" alt="Copy" />
                          </button>` : ''}
            </div>
        </div>
    `;
}


function copyToClipboard(elementId, event) {
    const textElement = document.getElementById(elementId);
    if (textElement) {
        const text = textElement.textContent || textElement.innerText;
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Error copying text:', err);
        });
    }

    // Select the correct image within the copy button
    const button = event.target.closest('.copy-button');
    const copyImage = button.querySelector('img');
    if (copyImage) {
        copyImage.style.visibility = 'hidden'; // Hide the copy button image
        setTimeout(() => {
            copyImage.style.visibility = 'visible'; // Show the image after 0.2 seconds
        }, 200);
    }
}


const micButton = document.querySelector('#mic_button');
const langSelect = document.querySelector('#language_select');

let isListening = false;
let recognition;

function stopRecognition() {
    if (recognition) {
        recognition.stop();
        // No need to set recognition to null here if you're immediately restarting or changing languages
    }
}

function setupSpeechRecognition(lang) {
    // Ensure any existing recognition is stopped before setting up a new instance
    if (recognition) {
        stopRecognition();
    }

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new window.SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        document.querySelector('textarea[name="prompt"]').value += transcript + ' ';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.onend = () => {
        // Automatically restart recognition if still listening, with the current language
        if (isListening) {
            setupSpeechRecognition(langSelect.value);
        }
    };
}

function startRecognition() {
    if (!isListening) {
        setupSpeechRecognition(langSelect.value);
        recognition.start();
        isListening = true;
    }
}

function restartRecognitionIfNeeded() {
    if (isListening) {
        stopRecognition();
        // Delay restarting recognition to ensure it stops completely
        setTimeout(() => setupSpeechRecognition(langSelect.value), 100);
    }
}

micButton.addEventListener('click', () => {
    if (isListening) {
        stopRecognition();
        isListening = false;
    } else {
        startRecognition();
    }
});

langSelect.addEventListener('change', () => {
    restartRecognitionIfNeeded();
});


/**
 * Käsittelee lomakkeen lähetystapahtuman.
 * 
 * @param {Event} e - Lomakkeen lähetystapahtuman tiedot.
 *  ->
 */
const handleSubmit = async (e) => {
    e.preventDefault(); // Estää lomakkeen oletuslähetystoiminnon.

    const data = new FormData(form); // Luo FormData-objektin lomakkeen tiedoista.
    chatContainer.innerHTML += chatStripe(false, data.get('prompt')); // Lisää käyttäjän viestin chat-containeriin.
    form.reset(); // Tyhjentää lomakkeen kentät.

    const uniqueId = generateUniqueId(); // Luo uniikin tunnisteen uudelle viestille.
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId); // Lisää tyhjän viestin (odotetaan AI:n vastausta).
    chatContainer.scrollTop = chatContainer.scrollHeight; // Vierittää chat-ikkunan viimeisimpään viestiin.

    const messageDiv = document.getElementById(uniqueId); // Etsii uuden tyhjän viestielementin.
    loader(messageDiv); // Aloittaa latausanimaation viestielementissä.

    try {
        // Lähettää pyynnön palvelimelle käyttäjän syötteellä # http://localhost:5000 # https://primaai.onrender.com
        const response = await fetch('https://primaai.onrender.com', {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: data.get('prompt') }) // Muuntaa käyttäjän syötteen JSON-muotoon.
        });

        clearInterval(loadInterval); // Lopettaa latausanimaation.
        messageDiv.innerHTML = ""; // Tyhjentää viestielementin.

        const responseData = await response.json(); // Muuntaa vastauksen JSON-muotoon.


         // Tarkistaa, onko HTTP-vastaus onnistunut.
        if (response.ok) {

            // Tarkistaa, onko vastauksessa odotettu rakenne.
            if (responseData && responseData.response && responseData.response.choices && responseData.response.choices.length > 0) {
                const botMessage = responseData.response.choices[0].message.content; // Ottaa AI:n viestin.
                typeText(messageDiv, botMessage); // Näyttää AI:n viestin käyttäjälle.
            } else {
                console.log('Unexpected response structure:', responseData);
                messageDiv.innerHTML = "Unexpected response format.";  // Näyttää virheviestin, jos vastauksen rakenne on väärä.
            }
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`); // Heittää virheen, jos HTTP-vastaus on virheellinen.
        }
    } catch (error) {
        console.error("Fetch error:", error.message); // Loggaa virheen konsoliin.
        messageDiv.innerHTML = "Error: " + error.message; // Näyttää virheviestin käyttäjälle.
    }
};

form.addEventListener('submit', handleSubmit);
// Tämä tarkoittaa, että joka kerta kun käyttäjä vapauttaa näppäimen, alla oleva koodi suoritetaan.
form.addEventListener('keyup', (e) => {
    // Tarkistaa, painettiinko 'Enter'-näppäintä ilman 'Shift'-näppäimen painallusta.
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Estää oletustoiminnon, joka normaalisti tapahtuisi, kun Enter-näppäintä painetaan.
        handleSubmit(e); // Kutsuu 'handleSubmit'-funktiota.
    }
});


chatContainer.addEventListener('click', (event) => {
    if (event.target.closest('.copy-button')) {
        const button = event.target.closest('.copy-button');
        const elementId = button.getAttribute('data-elementId');
        copyToClipboard(elementId, event);
    }
});

function openStreamlitApp() {
    window.open("http://localhost:8501", "StreamlitApp", "width=800,height=600"); // # https://primaai.onrender.com    // #  http://localhost:8501
}

document.addEventListener('DOMContentLoaded', (event) => {
    const streamlitButton = document.querySelector('#streamlitOpenButton');
    if (streamlitButton) {
      streamlitButton.addEventListener('click', openStreamlitApp);
    }
});

