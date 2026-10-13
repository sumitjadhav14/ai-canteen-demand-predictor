"""
Analytics Page Module for AI Canteen Demand Predictor
"""
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "canteen_sales.csv")

def render():
    st.title("📈 Canteen Demand Analytics")
    st.caption("Visual insights and correlation patterns extracted from canteen sales data.")

    if not os.path.exists(DATA_FILE):
        st.error("Dataset not found. Please generate the dataset first.")
        return

    df = pd.read_csv(DATA_FILE)

    plt.style.use("dark_background")

    # 1. Food Item vs Total Sales
    st.subheader("1. Food Item vs Total Sales")
    item_sales = df.groupby("Food_Item")["Units_Sold"].sum().sort_values(ascending=False)
    
    fig1, ax1 = plt.subplots(figsize=(10, 4))
    item_sales.plot(kind="bar", color="#38bdf8", ax=ax1, edgecolor="#0284c7")
    ax1.set_title("Total Units Sold per Food Item", fontsize=14, pad=12)
    ax1.set_xlabel("Food Item")
    ax1.set_ylabel("Total Units Sold")
    ax1.grid(axis="y", linestyle="--", alpha=0.3)
    plt.xticks(rotation=45)
    st.pyplot(fig1)
    st.caption("Explanation: High-volume beverages like Tea and popular snacks like Vada Pav and Samosa represent the largest share of daily canteen consumption.")

    st.markdown("---")

    # 2. Average Demand by Day of the Week
    st.subheader("2. Average Demand by Day of Week")
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_sales = df.groupby("Day")["Units_Sold"].mean().reindex(days_order)

    fig2, ax2 = plt.subplots(figsize=(10, 4))
    day_sales.plot(kind="line", marker="o", color="#f59e0b", linewidth=2.5, ax=ax2)
    ax2.set_title("Average Units Sold by Day of the Week", fontsize=14, pad=12)
    ax2.set_xlabel("Day of Week")
    ax2.set_ylabel("Average Units Sold")
    ax2.grid(True, linestyle="--", alpha=0.3)
    st.pyplot(fig2)
    st.caption("Explanation: Weekdays demonstrate peak canteen engagement with Monday and Friday leading, while weekend demand drops due to lower student presence on campus.")

    st.markdown("---")

    # 3. Weather vs Demand
    st.subheader("3. Weather Impact on Food Demand")
    weather_sales = df.groupby(["Weather", "Food_Item"])["Units_Sold"].mean().unstack()

    fig3, ax3 = plt.subplots(figsize=(11, 5))
    weather_sales[["Tea", "Samosa", "Cold Drink", "Vada Pav"]].plot(kind="bar", ax=ax3, colormap="viridis")
    ax3.set_title("Weather Condition vs Demand for Selected Items", fontsize=14, pad=12)
    ax3.set_xlabel("Weather Condition")
    ax3.set_ylabel("Average Units Sold")
    ax3.legend(title="Food Item")
    ax3.grid(axis="y", linestyle="--", alpha=0.3)
    st.pyplot(fig3)
    st.caption("Explanation: Rainy and Cold weather significantly amplifies hot beverage and fried snack demand (Tea, Samosa), whereas Hot weather spikes Cold Drink sales.")

    st.markdown("---")

    # 4. Student Attendance vs Demand
    st.subheader("4. Student Attendance vs Units Sold")
    fig4, ax4 = plt.subplots(figsize=(10, 4))
    ax4.scatter(df["Student_Attendance"], df["Units_Sold"], alpha=0.5, color="#10b981", edgecolors="none")
    ax4.set_title("Student Attendance vs Food Units Sold", fontsize=14, pad=12)
    ax4.set_xlabel("Student Attendance on Campus")
    ax4.set_ylabel("Units Sold")
    ax4.grid(True, linestyle="--", alpha=0.3)
    st.pyplot(fig4)
    st.caption("Explanation: Demand generally increases when student attendance is higher. There is a strong positive correlation between campus attendance and canteen order volume.")

    st.markdown("---")

    # 5. Holiday vs Demand
    st.subheader("5. Holiday Impact on Demand")
    holiday_comp = df.groupby("Is_Holiday")["Units_Sold"].mean()
    fig5, ax5 = plt.subplots(figsize=(8, 3.5))
    holiday_comp.plot(kind="bar", color=["#6366f1", "#ec4899"], ax=ax5)
    ax5.set_title("Average Demand on Normal Days vs Holidays", fontsize=14, pad=12)
    ax5.set_xlabel("Is Holiday?")
    ax5.set_ylabel("Average Units Sold")
    ax5.grid(axis="y", linestyle="--", alpha=0.3)
    st.pyplot(fig5)
    st.caption("Explanation: Demand sharply contracts on official holidays as day scholars are absent, leaving only hostel residents and faculty.")
