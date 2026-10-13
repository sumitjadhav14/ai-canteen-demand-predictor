"""
AI-Based College Canteen Demand Predictor
Script: train_model.py
Trains a Random Forest Regression model on canteen sales data and saves the model.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "canteen_sales.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_FILE = os.path.join(MODEL_DIR, "demand_model.pkl")

def train_demand_model():
    print("=" * 60)
    print("  AI Canteen Demand Predictor - Training Pipeline")
    print("=" * 60)

    # 1. Check & Load Dataset
    if not os.path.exists(DATA_PATH):
        print(f"Dataset not found at {DATA_PATH}. Generating new dataset...")
        from generate_dataset import generate_canteen_dataset
        generate_canteen_dataset(DATA_PATH)

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} records from {DATA_PATH}.")

    # 2. Define Features and Target
    feature_cols = [
        "Day", "Weather", "Previous_Day_Sales",
        "Is_Holiday", "Is_Special_Event", "Student_Attendance", "Food_Item"
    ]
    target_col = "Units_Sold"

    X = df[feature_cols]
    y = df[target_col]

    # 3. Categorical & Numerical feature specifications
    categorical_features = ["Day", "Weather", "Is_Holiday", "Is_Special_Event", "Food_Item"]
    numerical_features = ["Previous_Day_Sales", "Student_Attendance"]

    # Preprocessor using ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
        ]
    )

    # 4. Create Scikit-learn Pipeline with Random Forest Regressor
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])

    # 5. Split Dataset into Training & Testing sets (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Training set: {len(X_train)} samples | Testing set: {len(X_test)} samples")

    # 6. Fit the Model
    print("Training Random Forest Regression Model...")
    pipeline.fit(X_train, y_train)

    # 7. Evaluate on Test Set
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    print("\n--- MODEL EVALUATION METRICS ---")
    print(f"Mean Absolute Error (MAE) : {mae:.2f} units")
    print(f"Mean Squared Error (MSE)  : {mse:.2f}")
    print(f"Root Mean Squared (RMSE)  : {rmse:.2f} units")
    print(f"R² Score (Accuracy)       : {r2:.4f} ({r2*100:.1f}%)")

    # 8. Save Model to model/demand_model.pkl
    os.makedirs(MODEL_DIR, exist_ok=True)
    bundle = {
        "pipeline": pipeline,
        "features": feature_cols,
        "categorical_features": categorical_features,
        "numerical_features": numerical_features,
        "metrics": {
            "mae": round(float(mae), 2),
            "mse": round(float(mse), 2),
            "rmse": round(float(rmse), 2),
            "r2_score": round(float(r2), 4),
            "algorithm": "Random Forest Regressor",
            "n_estimators": 100,
            "test_size": 0.20,
            "train_samples": len(X_train),
            "test_samples": len(X_test)
        }
    }

    joblib.dump(bundle, MODEL_FILE)
    print(f"\nTrained model bundle successfully saved to '{MODEL_FILE}'.")
    return bundle

if __name__ == "__main__":
    train_demand_model()
