

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
        
        # Tarkistaa, onko valittu sarake numeerinen (float64 tai int64)
        if df[selected_column].dtype in ['float64', 'int64']:
            # Näyttää valitun numeerisen sarakkeen yhteenvetostatistiikat
            st.write(df[selected_column].describe())
            # Piirtää viivakaavion valitun numeerisen sarakkeen arvoista
            st.line_chart(df[selected_column])
        else:
            # Kategorisille tai tekstisarakkeille, näytetään arvojen esiintymiskerrat
            st.write(df[selected_column].value_counts())
            # Piirtää pylväskaavion näyttämään, kuinka monta kertaa kunkin arvon esiintyy valitussa sarakkeessa
            st.bar_chart(df[selected_column].value_counts())
            
            
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