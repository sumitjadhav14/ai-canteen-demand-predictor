"""
Sales Data Page Module for AI Canteen Demand Predictor
"""
import streamlit as st
import pandas as pd
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "canteen_sales.csv")

def render():
    st.title("📊 Historical Sales Data")
    st.caption("Search, filter, and inspect canteen transaction records used for model training.")

    if not os.path.exists(DATA_FILE):
        st.warning("Dataset not found. Generating default dataset...")
        from generate_dataset import generate_canteen_dataset
        generate_canteen_dataset(DATA_FILE)

    df = pd.read_csv(DATA_FILE)

    # Summary Statistics Cards
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Records", len(df))
    col2.metric("Total Units Sold", f"{df['Units_Sold'].sum():,}")
    col3.metric("Average Units / Entry", f"{df['Units_Sold'].mean():.1f}")
    col4.metric("Highest Single Day Sale", f"{df['Units_Sold'].max()} units")

    st.markdown("---")
    st.subheader("Filter Records")

    # Filters
    f1, f2, f3 = st.columns(3)
    with f1:
        food_options = ["All"] + sorted(df["Food_Item"].unique().tolist())
        selected_food = st.selectbox("Food Item", food_options)
    with f2:
        day_options = ["All"] + sorted(df["Day"].unique().tolist())
        selected_day = st.selectbox("Day", day_options)
    with f3:
        weather_options = ["All"] + sorted(df["Weather"].unique().tolist())
        selected_weather = st.selectbox("Weather", weather_options)

    f4, f5 = st.columns(2)
    with f4:
        holiday_filter = st.radio("Holiday Filter", ["All", "Yes", "No"], horizontal=True)
    with f5:
        event_filter = st.radio("Special Event Filter", ["All", "Yes", "No"], horizontal=True)

    # Apply filters
    filtered_df = df.copy()
    if selected_food != "All":
        filtered_df = filtered_df[filtered_df["Food_Item"] == selected_food]
    if selected_day != "All":
        filtered_df = filtered_df[filtered_df["Day"] == selected_day]
    if selected_weather != "All":
        filtered_df = filtered_df[filtered_df["Weather"] == selected_weather]
    if holiday_filter != "All":
        filtered_df = filtered_df[filtered_df["Is_Holiday"] == holiday_filter]
    if event_filter != "All":
        filtered_df = filtered_df[filtered_df["Is_Special_Event"] == event_filter]

    st.write(f"Showing **{len(filtered_df)}** matching records")
    st.dataframe(filtered_df, use_container_width=True, height=400)

    # Download CSV button
    csv_bytes = filtered_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Download CSV Dataset",
        data=csv_bytes,
        file_name="canteen_sales_data.csv",
        mime="text/csv",
        type="primary"
    )
