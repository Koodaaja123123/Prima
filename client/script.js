import bot from './assets/assets/bot.svg';
import user from './assets/assets/user.svg';
import CopyBut from './assets/assets/CopyButton.svg';

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

function chatStripe(isAi, value, uniqueId) { // Luo chat-viestin HTML-rakenteen.
    // Palauttaa HTML-merkkijonon, joka sisältää viestin ja mahdollisen kopioi-napin
    return `
        <div class="wrapper ${isAi ? 'ai' : ''}">
            <div class="chat">
                <div class="profile">
                    <img src=${isAi ? bot : user} alt="${isAi ? 'bot' : 'user'}" />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
                ${isAi ? `<button class="copy-button" data-elementId="${uniqueId}">
                              <img src="${CopyBut}" alt="Copy" />
                          </button>` : ''}
            </div>
        </div>
    `;
}


function copyToClipboard(elementId, event) {
    // Haetaan dokumentista elementti, jonka id vastaa annettua elementId:tä
    const textElement = document.getElementById(elementId);
    if (textElement) {
        // Haetaan elementin tekstisisältö
        const text = textElement.textContent || textElement.innerText;
        // Yrittää kirjoittaa tekstin leikepöydälle.
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Error copying text:', err);
        });
    }

    // Etsii läheisimmän kopioi-napin ja hakee sen sisältä kuvan
    const button = event.target.closest('.copy-button');
    const copyImage = button.querySelector('img');
    if (copyImage) {
        copyImage.style.visibility = 'hidden'; // Piilottaa kuvan väliaikaisesti.
        setTimeout(() => {                          //
            copyImage.style.visibility = 'visible'; // Näyttää kuvan uudelleen 0,2 sekunnin kuluttua
        }, 200);                                    //
    }
}

// Valitsee mikrofoninapin ja kielenvalintaelementin
const micButton = document.querySelector('#mic_button');
const langSelect = document.querySelector('#language_select');

// Alustaa muuttujat, jotka pitävät kirjaa onko puheentunnistus käynnissä
let isListening = false;
let recognition;


// Funktio puheentunnistuksen pysäyttämiseen
function stopRecognition() {
    if (recognition) {
        recognition.stop();
    }
}


// Asettaa puheentunnistuksen käyttäen valittua kieltä
function setupSpeechRecognition(lang) {
    if (recognition) {
        stopRecognition();
    }

    // Valitsee selaimen puheentunnistusrajapinnan
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new window.SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = true;


    // Määrittää, mitä tehdään, kun puheentunnistus tunnistaa puhetta.
    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        // Lisää tunnistetun puheen tekstikenttään
        document.querySelector('textarea[name="prompt"]').value += transcript + ' ';
    };


    // Kirjaa virheet, jos puheentunnistuksessa tapahtuu virhe
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    // Uudelleenkäynnistää puheentunnistuksen, jos se päättyy ja kuuntelu on yhä päällä.
    recognition.onend = () => {
        if (isListening) {
            setupSpeechRecognition(langSelect.value);
        }
    };
}





/*
function startRecognition() { ...

Tässä osassa koodia hallinnoidaan puheentunnistuksen aloittamista ja uudelleenkäynnistämistä
sekä käyttäjän toiminnan kuuntelua liittyen mikrofoninapin painallukseen ja kielen valintaan
*/
function startRecognition() {
    // Tarkistaa, onko puheentunnistus jo käynnissä
    if (!isListening) {
        // Asettaa puheentunnistuksen valitulle kielelle ja käynnistää sen.
        setupSpeechRecognition(langSelect.value);
        recognition.start();
        // Asetetaan kuuntelun tila päälle
        isListening = true;
    }
}








/*

function restartRecognitionIfNeeded() { ....

Tämä funktio käynnistää puheentunnistuksen,
jos se ei ole jo käynnissä. Se käyttää valittua kieltä ja asettaa isListening-tilan todeksi.
*/
function restartRecognitionIfNeeded() {
    // Tarkistaa, onko puheentunnistus aktiivinen
    if (isListening) {
        // Pysäyttää aktiivisen puheentunnistuksen
        stopRecognition();
        // Käynnistää puheentunnistuksen uudelleen lyhyen viiveen jälkeen
        setTimeout(() => setupSpeechRecognition(langSelect.value), 100);
    }
}






/*

micButton.addEventListener('click', () => { ....

Tämä funktio uudelleenkäynnistää puheentunnistuksen, 
jos kieltä on vaihdettu sen ollessa aktiivinen, varmistaen,
 että puheentunnistus käyttää uutta valittua kieltä.
*/
micButton.addEventListener('click', () => {
    // Tarkistaa, onko puheentunnistus aktiivinen
    if (isListening) {
        // Jos on, pysäyttää sen ja asettaa kuuntelun tilan pois päältä
        stopRecognition();
        isListening = false;
    } else {
        // Jos ei ole, käynnistää puheentunnistuksen
        startRecognition();
    }
});






/*

langSelect.addEventListener('change', () => { ....

Tämä koodi lisää tapahtumankuuntelijan mikrofoninapille.
Nappia painettaessa funktio tarkistaa, onko puheentunnistus aktiivinen, ja joko pysäyttää tai käynnistää sen tilanteen mukaan
*/
langSelect.addEventListener('change', () => {
    // Kutsuu funktion, joka uudelleenkäynnistää puheentunnistuksen, jos kieltä on vaihdettu.
    restartRecognitionIfNeeded();
});



let isMessageLoading = false; // Tämä muuttuja pitää kirjaa siitä, onko viestin lähettäminen parhaillaan meneillään.

/**
 * Käsittelee lomakkeen lähetystapahtuman.
 * 
 * @param {Event} e - Lomakkeen lähetystapahtuman tiedot.
 *  ->
 */

const handleSubmit = async (e) => {
    e.preventDefault(); // Estää sivun uudelleenlatauksen, joka normaalisti tapahtuu lomakkeen lähetyksen yhteydessä.


    // Tarkistaa, onko toinen pyyntö jo käynnissä. Jos on, ei tee mitään
    if (isMessageLoading) {
        console.log("Skipped");
        return;
    }


    const promptValue = form.querySelector('textarea[name="prompt"]').value.trim(); // Poistaa käyttäjän syöttämästä tekstistä turhat välilyönnit.


    // Tarkistaa, onko käyttäjä syöttänyt tekstiä. Jos ei, ei tee mitään.
    if (!promptValue) {
        console.log("Skipped because the prompt is empty.");
        return;
    }

    const body = JSON.stringify({ prompt: promptValue }); // Muuntaa syötetekstin JSON-muotoon valmistellakseen sen lähetettäväksi palvelimelle.

    const data = new FormData(form); // Luo FormData-objektin, jota käytetään lomakkeen tietojen lähettämiseen.
    data.append('prompt', promptValue);

    chatContainer.innerHTML += chatStripe(false, data.get('prompt')); // Lisää käyttäjän viestin chat-ikkunaan.
    form.reset(); // Tyhjentää lomakkeen syöttökentät lähetyksen jälkeen

    const uniqueId = generateUniqueId(); // Luo uniikin tunnisteen uudelle viestielementille
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId); // Lisää tyhjän viestin (odotetaan AI:n vastausta). 
    chatContainer.scrollTop = chatContainer.scrollHeight; // Vierittää chat-ikkunan viimeisimpään viestiin.


    const messageDiv = document.getElementById(uniqueId); // Etsii juuri lisätyn tyhjän viestielementin ja aloittaa latausanimaation siihen
    loader(messageDiv); // Aloittaa latausanimaation viestielementissä.

    isMessageLoading = true; // Asettaa viestin lataustilan päälle

    try {                                                               
        // Lähettää pyynnön palvelimelle käyttäjän syötteellä              
        const response = await fetch('https://primaai.onrender.com/api/analyze', {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        clearInterval(loadInterval); // Lopettaa latausanimaation.
        messageDiv.innerHTML = ""; // Tyhjentää viestielementin, valmistellen sen palvelimen vastauksen näyttämiseksi.

        const responseData = await response.json(); // Muuntaa vastauksen JSON-muotoon.


         // Tarkistaa, onko HTTP-vastaus onnistunut.
        if (response.ok) {
            // Tarkistaa, onko palvelimen vastauksen rakenne odotetunlainen.
            if (responseData && responseData.response && responseData.response.choices && responseData.response.choices.length > 0) {
                const botMessage = responseData.response.choices[0].message.content; // Ottaa AI:n viestin.
                typeText(messageDiv, botMessage); // Näyttää AI:n viestin käyttäjälle.
            } else {
                messageDiv.innerHTML = "Unexpected response format.";  // Näyttää virheviestin, jos vastauksen rakenne on väärä.
            }
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`); // Heittää virheen, jos HTTP-vastaus on virheellinen.
        }
    } catch (error) {
        messageDiv.innerHTML = "Error: " + error.message; // Näyttää virheviestin käyttäjälle.

    } finally {
        isMessageLoading = false; // Asettaa viestin lataustilan pois päältä
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


// Kuuntelee 'click'-tapahtumia 'chatContainer'-elementissä
chatContainer.addEventListener('click', (event) => {
    if (event.target.closest('.copy-button')) { // Tarkistaa, onko klikattu elementti tai sen vanhempi 'copy-button' luokan omaava nappi.
        const button = event.target.closest('.copy-button'); // Etsii lähimmän '.copy-button' luokan omaavan napin.
        const elementId = button.getAttribute('data-elementId'); // Hakee napin 'data-elementId' attribuutin arvon.
        copyToClipboard(elementId, event); // Kutsuu 'copyToClipboard'-funktiota, joka kopioi kyseisen elementin tekstisisällön leikepöydälle.
    }
});

// Avaa uuden selainikkunan tai välilehden osoitteeseen  https:// ...
function openStreamlitApp() {
    window.open("https://primaanalyzer.streamlit.app/", "StreamlitApp", "width=800,height=600"); 
}


// Tapahtumankäsittelijä, joka suoritetaan kun dokumentti on valmis (kaikki DOM-elementit on ladattu).
document.addEventListener('DOMContentLoaded', (event) => {
    // Etsii elementin, jonka id on 'fileUploadButton
    const fileUploadButton = document.querySelector('#fileUploadButton');
    if (fileUploadButton) { // Tarkistaa, löytyikö kyseinen nappi
        // Asettaa 'click'-tapahtumankäsittelijän napille, joka avaa Streamlit-sovelluksen.
        fileUploadButton.addEventListener('click', openStreamlitApp);
    }
});