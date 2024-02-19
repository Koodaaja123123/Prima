
import streamlit as st
import pandas as pd

# Kustomoidaan Streamlit-sovelluksen CSS-tyylejä
st.markdown(""" <style> .reportview-container { margin-top: -2em; } #MainMenu {visibility: hidden;} .stDeployButton {display:none;} footer {visibility: hidden;} #stDecoration {display:none;} </style> """, unsafe_allow_html=True)

# Sovelluksen otsikko
st.title('Data analyzer') 

# Tervetuloviesti
st.write("Hello, 👋 I accept Excel files")

# Tiedoston latauskomponentti, joka hyväksyy CSV, XLSX ja XLS tiedostot
file = st.file_uploader("Upload your file here", type=["csv", "xlsx"])
if file is not None:  # Jos käyttäjä on ladannut tiedoston, 'file' ei ole 'None'
    # Erota tiedostonimi ja tiedostopääte (esim. 'data.csv' -> ['data', 'csv'])
    file_extension = file.name.split('.')[-1]
    # Tarkista tiedostopääte ja käsittele tiedosto sen mukaan
    if file_extension.lower() == 'csv':  # Jos tiedostopääte on 'csv', lue CSV-tiedosto
        df = pd.read_csv(file)  # Lue CSV-tiedosto pandasin read_csv-funktiolla
    elif file_extension.lower() == 'xlsx':  # Jos tiedostopääte on 'xlsx', lue Excel-tiedosto
        df = pd.read_excel(file, engine='openpyxl')  # Lue Excel-tiedosto openpyxl-moottorilla

    
    st.write("Successfully read file.")  # Ilmoita käyttäjälle, että tiedosto on luettu onnistuneesti

    
    if df is not None:
        st.write("**Data Overview**")
        # Tulostetaan otsikko "Data Overview" näyttöön
        st.write("The first rows of your dataset look like this:")
        # Tulostetaan teksti, joka kertoo käyttäjälle, että seuraavaksi näytetään datasetin ensimmäiset rivit
        st.dataframe(df.head())
        # Näytetään DataFrame-objektin (`df`) ensimmäiset viisi riviä. Tämä auttaa käyttäjää saamaan nopean yleiskuvan siitä, miltä data näyttää ja millaisia sarakkeita datasetti sisältää.

    
    # Perusanalyysi
    if st.checkbox('Show correlation matrix'):
    # Valitaan vain numeeriset sarakkeet korrelaatiomatriisin laskentaa varten
        numeric_df = df.select_dtypes(include=['number'])
        st.write(numeric_df.corr())  # Näytetään korrelaatiomatriisi numeerisille ominaisuuksille
        
        
        # Jos käyttäjä valitsee tämän valintaruudun, näytetään pudotusvalikko sarakkeiden valitsemiseksi
    if st.checkbox('Analyze a single variable'):
        # Luo pudotusvalikon, josta käyttäjä voi valita yhden sarakkeen analysoitavaksi
        selected_column = st.selectbox('Select one column', df.columns)
        
   
        # Tarkistetaan, onko valitun sarakkeen datatyyppi muuta kuin numeerinen (float tai integer)
        if df[selected_column].dtype not in ['float64', 'int64']:
            # Jos data on ei-numeerista, lasketaan jokaisen uniikin arvon esiintymiskerrat sarakkeessa,
            # jonka jälkeen resetoidaan indeksi muuttamaan Series DataFrameksi. Tämä on tarpeen, koska
            # value_counts() palauttaa Series-objektin, jossa indeksinä on uniikit arvot ja Seriesin
            # arvot ovat näiden uniikkien arvojen esiintymiskerrat. reset_index() muuttaa tämän Seriesin
            # DataFrameksi.
            value_counts = df[selected_column].dropna().value_counts().reset_index()
            # Nimetään tuloksena olevan DataFrame:n sarakkeet selkeämmin. Ensimmäinen sarake
            # (reset_index() jälkeen 'index') nimetään 'category':ksi, joka edustaa valitun sarakkeen
            # uniikkeja arvoja. Toinen sarake ('counts') edustaa kunkin uniikin arvon esiintymiskertoja.
            value_counts.columns = ['category', 'counts']
            # Luodaan ja näytetään pylväsdiagrammi Streamlitin avulla. DataFrame asetetaan ensin
            # käyttämään 'category'-saraketta indeksinään, koska st.bar_chart odottaa DataFrame:n
            # indeksin olevan kategoriat ja DataFrame:n arvojen olevan plotattavia arvoja. Näin
            # diagrammissa kategoriat ovat x-akselilla ja lukumäärät y-akselilla.
            st.bar_chart(value_counts.set_index('category')['counts'])
        else:
            # Jos data on numeerista (float tai integer), näytetään valitun sarakkeen kuvailevat
            # tilastot käyttäen st.write()-funktiota, joka sisältää lukumäärän, keskiarvon, keskihajonnan,
            # minimi- ja maksimiarvot sekä prosentiilit. Tämä antaa nopean tilastollisen yhteenvedon
            # datasta.
            st.write(df[selected_column].describe())
            # Lisäksi piirretään viivadiagrammi numeerisesta datasta käyttäen Streamlitin st.line_chart()-funktiota,
            # joka plotaa valitun sarakkeen datan y-akselille ja sen indeksin x-akselille. Tämä on hyödyllistä
            # trendien tai jakautumien visualisointiin numeerisessa datassa sarjan tai arvoalueen yli.
            st.line_chart(df[selected_column])


        
            
            
        # Luo uusi ominaisuus -valintaruutu. Jos käyttäjä valitsee tämän, näytetään lisäasetuksia uuden ominaisuuden luomiseksi.
    if st.checkbox('Create a new feature'):
        # Valitse vain numeeriset sarakkeet DataFramesta, koska uuden ominaisuuden laskeminen vaatii numeerisia arvoja.
        numeric_columns = df.select_dtypes(include=['number']).columns
        # Luo pudotusvalikko, josta käyttäjä voi valita ensimmäisen sarakkeen uutta ominaisuutta varten.
        col1 = st.selectbox('Select first column', numeric_columns)
        # Luo toinen pudotusvalikko, josta käyttäjä voi valita toisen sarakkeen.
        col2 = st.selectbox('Select second column', numeric_columns)
        # Anna käyttäjän valita, mitä matemaattista operaatiota käytetään sarakkeiden välillä.
        operation = st.selectbox('Select operation', ['+', '-', '*', '/'])
        # Tekstikenttä uuden ominaisuuden nimen määrittämiseen.
        new_column_name = st.text_input('Name of the new feature')
        
        # Jos käyttäjä klikkaa "Luo ominaisuus" -nappia, suoritetaan valittu operaatio valituille sarakkeille.
        if st.button('Create Feature'):
            try:
                # Suoritetaan valittu operaatio ja tallennetaan tulos uuteen sarakkeeseen DataFrameen.
                if operation == '+':
                    df[new_column_name] = df[col1] + df[col2]
                elif operation == '-':
                    df[new_column_name] = df[col1] - df[col2]
                elif operation == '*':
                    df[new_column_name] = df[col1] * df[col2]
                elif operation == '/':
                    df[new_column_name] = df[col1] / df[col2]
                # Näytä DataFrameen ensimmäiset rivit muutosten jälkeen.
                st.write(df.head())
            except TypeError:
                # Näytä virheviesti, jos valitut sarakkeet eivät ole numeerisia tai jos tapahtuu tyyppivirhe.
                st.error('Please select numeric variables for the operation.')


    # Tekstidatan analyysi -valintaruutu. Jos käyttäjä valitsee tämän, näytetään lisäasetuksia tekstidatan analysoimiseksi.
    if st.checkbox('Text Data Analysis'):
        # Valitse kaikki tekstityypin sarakkeet DataFramesta.
        text_columns = df.select_dtypes(include=['object']).columns
        # Luo pudotusvalikko, josta käyttäjä voi valita tekstisarakkeen analysoitavaksi.
        selected_text_column = st.selectbox('Select text column', text_columns)
        # Kun käyttäjä klikkaa "Analyze" -nappia, suoritetaan analyysi valitulle tekstisarakkeelle.
        if st.button('Analyze'):
            # Näytä viesti, joka ilmoittaa, mitä saraketta analysoidaan.
            st.write(f'Most common words in {selected_text_column}:')
            # Tuo Counter luokka collections moduulista laskeaksesi yleisimmät sanat.
            from collections import Counter
            # Jaa teksti sanoiksi, luo sanoista lista ja laske yleisimmät sanat.
            words = df[selected_text_column].str.split(expand=True).stack()
            most_common_words = Counter(words).most_common(10)
            # Näytä lista kymmenestä yleisimmästä sanasta ja niiden esiintymiskerrat.
            st.write(most_common_words)