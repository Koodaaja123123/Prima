import streamlit as st
import pandas as pd
import requests

st.title('CSV Data Analyzer')


st.markdown(""" <style> .reportview-container { margin-top: -2em; } #MainMenu {visibility: hidden;} .stDeployButton {display:none;} footer {visibility: hidden;} #stDecoration {display:none;} </style> """, unsafe_allow_html=True)

# File uploader widget
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
if uploaded_file is not None:
    data = pd.read_csv(uploaded_file, encoding='iso-8859-1', sep=';')
    st.write(data)  # Display the data in the app

if uploaded_file is not None:
    # Assuming `data` is your DataFrame
    if st.button('Analyze'):
        # Perform analysis
        summary = data.describe()
        st.write(summary)  # Display summary statistics, for example


def get_chatbot_insight(data): 
    # This is a hypothetical function that sends data to your chatbot API   # python -m streamlit run data_analyzer.py
    # and receives some insight or analysis in return.  # https://primaai.onrender.com/api/analyze    #   http://localhost:5000/api/analyze
    response = requests.post("https://primaai.onrender.com/api/analyze", json={"data": data.to_dict()})
    if response.status_code == 200:
        return response.json()
    else:
        return "Error: Failed to get insight from API"

if uploaded_file is not None and st.button('Get Chatbot Insight'):
    insight = get_chatbot_insight(data)
    st.write(insight)