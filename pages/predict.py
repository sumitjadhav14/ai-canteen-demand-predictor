"""
Predict Demand Page Module for AI Canteen Demand Predictor
"""
import streamlit as st
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from model import CanteenDemandPredictor

FOOD_ITEMS = [
    "Vada Pav", "Samosa", "Sandwich", "Misal Pav",
    "Poha", "Idli", "Tea", "Coffee", "Cold Drink"
]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
WEATHERS = ["Sunny", "Cloudy", "Rainy", "Hot", "Cold"]

def render():
    st.title("🔮 Predict Food Demand")
    st.caption("Enter upcoming day parameters to calculate ML-based inventory requirements.")

    # Initialize predictor
    predictor = CanteenDemandPredictor()

    # Form with state keys
    col1, col2 = st.columns(2)

    with col1:
        food_item = st.selectbox("Food Item", FOOD_ITEMS, index=0)
        day = st.selectbox("Day of Week", DAYS, index=0)
        weather = st.selectbox("Weather Condition", WEATHERS, index=0)
        attendance = st.number_input("Student Attendance", min_value=0, max_value=3000, value=850, step=25)

    with col2:
        prev_sales = st.number_input("Previous Day Sales (Units)", min_value=0, max_value=1000, value=75, step=5)
        holiday = st.selectbox("Is Holiday?", ["No", "Yes"], index=0)
        special_event = st.selectbox("Is Special Event / Fest?", ["No", "Yes"], index=0)

    btn_col1, btn_col2 = st.columns([2, 1])
    with btn_col1:
        predict_clicked = st.button("🚀 Predict Demand", type="primary", use_container_width=True)
    with btn_col2:
        reset_clicked = st.button("🔄 Reset", use_container_width=True)

    if reset_clicked:
        st.rerun()

    if predict_clicked:
        units, level, recommendation = predictor.predict(
            day=day,
            weather=weather,
            previous_day_sales=prev_sales,
            is_holiday=holiday,
            is_special_event=special_event,
            student_attendance=attendance,
            food_item=food_item
        )

        st.markdown("---")
        st.subheader("🎯 Prediction Result")

        # Result card styling
        badge_color = "#10b981" if level == "HIGH" else ("#f59e0b" if level == "MODERATE" else "#64748b")

        st.markdown(f"""
            <div style="background-color: #1e293b; border-left: 6px solid {badge_color}; border-radius: 12px; padding: 24px; margin-top: 10px;">
                <h4 style="margin: 0; color: #94a3b8; text-transform: uppercase; font-size: 13px;">Predicted Demand</h4>
                <div style="font-size: 42px; font-weight: 800; color: #ffffff; margin: 8px 0;">{units} Units</div>
                <div style="display: inline-block; background-color: {badge_color}33; color: {badge_color}; font-weight: 700; padding: 4px 12px; border-radius: 9999px; font-size: 14px;">
                    DEMAND LEVEL: {level}
                </div>
                <p style="margin-top: 16px; font-size: 16px; color: #e2e8f0; font-weight: 500;">
                    <b>Recommended Preparation:</b> {recommendation}
                </p>
            </div>
        """, unsafe_allow_html=True)

        st.markdown("### 📋 Input Summary")
        c1, c2, c3 = st.columns(3)
        c1.write(f"**Food Item:** {food_item}")
        c1.write(f"**Day:** {day}")
        c2.write(f"**Weather:** {weather}")
        c2.write(f"**Attendance:** {attendance}")
        c3.write(f"**Holiday:** {holiday}")
        c3.write(f"**Special Event:** {special_event}")
