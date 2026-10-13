# AI-Based College Canteen Demand Predictor

> A 3rd-Year College Mini-Project for the subject **Artificial Intelligence Applications**.

An end-to-end Machine Learning web and mobile application that forecasts daily food item demand in a college canteen to minimize food spoilage and prevent stockouts.

---

## 📌 1. Project Overview

College canteens routinely encounter volatile demand influenced by fluctuating student attendance, bad weather (monsoon/winter), exam periods, weekends, and cultural fests. Preparing too much food results in discarded meals and financial loss; preparing too little leads to student dissatisfaction and missed sales.

This project implements a **Random Forest Regression** model that predicts the exact number of units required for key food items (such as Vada Pav, Samosa, Tea, Coffee, Sandwich, Poha, etc.) using historical factors and forthcoming daily conditions.

---

## 🚀 2. Key Features

- **Executive KPI Dashboard:** Real-time metrics on total units sold, daily averages, and most popular menu items.
- **Predictive Demand Engine:** Enter upcoming day parameters (Day, Weather, Attendance, Special Events) to receive instant unit predictions and preparation recommendations.
- **Demand Classification:** Categorizes output into `LOW`, `MODERATE`, or `HIGH` with suggested batch preparation ranges.
- **Searchable Sales Explorer:** Interactive tabular view of historical sales records with dynamic filtering and one-click CSV export.
- **Analytical Visualizations:** In-depth visual charts highlighting item popularity, weekday variations, weather influences, and attendance correlation.
- **AI Model Transparency & Metrics:** Inspect live regression metrics (MAE, MSE, RMSE, R² Score) and feature importance rankings.
- **Mobile-First Responsive Interface:** Ergonomic mobile app experience with bottom navigation bar, quick presets, and viva preparation aids.

---

## 🛠️ 3. Technologies Used

- **Language:** Python 3.10+
- **Frontend / App Framework:** Streamlit & Modern React/Tailwind
- **Data Manipulation:** Pandas, NumPy
- **Machine Learning:** Scikit-learn (RandomForestRegressor, ColumnTransformer, OneHotEncoder)
- **Serialization:** Joblib
- **Data Visualization:** Matplotlib

---

## 📂 4. Project Structure

```text
AI-Canteen-Demand-Predictor/
│
├── app.py                     # Main Streamlit multipage application
├── model.py                   # Prediction class and inference pipeline
├── train_model.py             # Model training and evaluation script
├── generate_dataset.py        # Generates realistic synthetic sales data
├── requirements.txt           # Python dependency specifications
├── README.md                  # Comprehensive project documentation
│
├── data/
│   └── canteen_sales.csv      # Generated historical sales dataset
│
├── model/
│   └── demand_model.pkl       # Serialized trained model bundle
│
└── pages/
    ├── dashboard.py           # Dashboard view with KPI metrics
    ├── predict.py             # Demand prediction form and recommendations
    ├── sales_data.py          # Searchable, filterable data table with CSV export
    ├── analytics.py           # Visualization charts and academic explanations
    ├── ai_model.py            # Model architecture, formulas, and R² metrics
    └── about.py               # Problem statement, objectives, and viva notes
```

---

## 💻 5. Installation & Setup Instructions

Follow these 4 simple steps to run the project on your local machine:

### Step 1: Clone the repository or navigate to directory
```bash
cd AI-Canteen-Demand-Predictor
```

### Step 2: Install required packages
```bash
pip install -r requirements.txt
```

### Step 3: Generate the synthetic dataset
```bash
python generate_dataset.py
```
*(Creates `data/canteen_sales.csv` with realistic campus sales data)*

### Step 4: Train the Machine Learning model
```bash
python train_model.py
```
*(Trains Random Forest Regressor and outputs MAE, MSE, and R² score)*

### Step 5: Run the Streamlit web application
```bash
streamlit run app.py
```
The application will launch automatically in your browser at `http://localhost:8501`.

---

## 🔮 6. Example Usage & Viva Explanation

### Scenario: Rainy College Fest Day
- **Food Item:** Samosa
- **Day:** Monday
- **Weather:** Rainy
- **Student Attendance:** 1,100
- **Is Holiday:** No
- **Is Special Event:** Yes
- **Previous Day Sales:** 95

**Predicted Demand:** ~118 Units  
**Demand Level:** HIGH  
**Recommendation:** Prepare approximately 115–125 units with staggered frying batches between 11:30 AM and 1:30 PM.

---

## 🎓 7. Common Viva / Oral Exam Questions & Answers

1. **Why use Random Forest instead of Linear Regression?**  
   *Answer:* Canteen demand has strong non-linear relationships. For instance, Rainy weather dramatically boosts hot tea and samosas while hurting cold drinks. Random Forest effectively captures these interaction terms without requiring manual feature engineering.

2. **What does the R² score mean?**  
   *Answer:* The R² score (Coefficient of Determination) measures the proportion of variance in food demand that the model predicts. An R² of 0.94 means 94% of the variations in sales are explained by attendance, weather, and day factors.

3. **How does this system prevent food waste?**  
   *Answer:* By predicting demand 24 hours ahead, cooks prepare only the necessary batch quantities rather than guessing, reducing surplus perishable inventory.

---

## 🔮 8. Future Scope

1. **Real-time IoT Attendance:** Direct RFID turnstile integration for automated footfall counts.
2. **OpenWeather API:** Automated weather forecast ingestion.
3. **QR-Based Pre-Ordering:** Incorporate mobile app reservations to refine same-day demand spikes.
4. **Dynamic Raw Material Procurement:** Auto-generate daily vegetable and milk purchase orders for vendors.
