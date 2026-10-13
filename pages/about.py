"""
About Page Module for AI Canteen Demand Predictor
"""
import streamlit as st

def render():
    st.title("ℹ️ About the Project")
    st.caption("College Mini-Project for 3rd Year · Artificial Intelligence Applications")

    st.subheader("1. Problem Statement")
    st.warning(
        "College canteens often prepare food based on rough manual estimates. On unexpected rainy days, fest days, "
        "or low-attendance exam periods, kitchen staff face severe misjudgments: either huge food wastage "
        "(spoilage of prepared perishable items) or severe shortages (students returning hungry and losing revenue)."
    )

    st.subheader("2. Proposed Solution")
    st.success(
        "This project employs supervised Machine Learning (Random Forest Regression) to accurately predict food "
        "consumption per menu item 24 hours in advance, taking into account campus attendance, day of the week, "
        "weather conditions, previous day sales, holidays, and campus festivals."
    )

    st.subheader("3. Key Project Objectives")
    st.markdown("""
    * **Predict Food Demand:** Provide precise unit estimates per food item.
    * **Reduce Food Wastage:** Prevent excess preparation of perishable snacks and meals.
    * **Assist Canteen Operations:** Enable procurement and kitchen staff to purchase ingredients efficiently.
    * **Demonstrate Practical ML:** Bridge theoretical Machine Learning concepts into tangible campus automation.
    """)

    st.subheader("4. Technologies Used")
    t1, t2, t3 = st.columns(3)
    with t1:
        st.write("🐍 **Python** (Core Language)")
        st.write("📊 **Pandas & NumPy** (Data processing)")
    with t2:
        st.write("🤖 **Scikit-learn** (ML algorithms)")
        st.write("📈 **Matplotlib** (Data visualization)")
    with t3:
        st.write("⚡ **Streamlit** (Interactive multi-page UI)")
        st.write("💾 **Joblib** (Model serialization)")

    st.subheader("5. Future Scope")
    st.markdown("""
    * **Live IoT Turnstile Integration:** Automatically sync student card swipes at campus gates for real-time attendance.
    * **Automated Weather API:** Fetch 24-hour meteorological forecasts automatically without manual input.
    * **Mobile Pre-Ordering App:** Integrate student mobile pre-orders directly into demand forecasts.
    * **Multi-Canteen & Multi-Vendor Support:** Scale the system across engineering, medical, and management campus food courts.
    * **Dynamic Menu Recommendations:** Recommend recipes based on remaining raw perishable inventory.
    """)
