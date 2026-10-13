"""
AI-Based College Canteen Demand Predictor
Main Application Entry Point (app.py)
A 3rd-Year Mini Project for Artificial Intelligence Applications
"""

import streamlit as st
import pandas as pd
import os

# Set page config for a mobile-friendly modern UI
st.set_page_config(
    page_title="AI Canteen Demand Predictor",
    page_icon="🍽️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Apply custom modern styling
st.markdown("""
    <style>
    .main {
        background-color: #0f172a;
        color: #f8fafc;
    }
    .stButton>button {
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
    }
    .metric-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    </style>
""", unsafe_allow_html=True)

# Sidebar Navigation with clear active-page indication
st.sidebar.title("🍽️ Canteen AI")
st.sidebar.caption("AI-Based Demand Predictor v1.0")

nav_options = [
    "🏠 Dashboard",
    "🔮 Predict Demand",
    "📊 Sales Data",
    "📈 Analytics",
    "ℹ️ About Project"
]

# Query params or session state for seamless internal button navigation
if "current_page" not in st.session_state:
    st.session_state.current_page = "🏠 Dashboard"

# Allow sidebar selection
choice = st.sidebar.radio(
    "Navigation Menu",
    nav_options,
    index=nav_options.index(st.session_state.current_page) if st.session_state.current_page in nav_options else 0
)

# Update state if radio clicked
if choice != st.session_state.current_page:
    st.session_state.current_page = choice

# Import and route to corresponding page modules
from pages import dashboard, predict, sales_data, analytics, about

page_routes = {
    "🏠 Dashboard": dashboard.render,
    "🔮 Predict Demand": predict.render,
    "📊 Sales Data": sales_data.render,
    "📈 Analytics": analytics.render,
    "ℹ️ About Project": about.render,
}

# Execute active page render function
render_fn = page_routes.get(st.session_state.current_page, dashboard.render)
render_fn()
