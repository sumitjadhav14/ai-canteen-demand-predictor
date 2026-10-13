"""
AI-Based College Canteen Demand Predictor
Script: generate_dataset.py
Generates a realistic historical sales dataset for college canteen demand prediction.
"""

import os
import csv
import random
from datetime import datetime, timedelta

def generate_canteen_dataset(filename="data/canteen_sales.csv", num_days=100):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    random.seed(42)

    food_items = [
        {"name": "Vada Pav", "base": 85, "rain_boost": 1.35, "cold_boost": 1.15, "hot_boost": 0.90},
        {"name": "Samosa", "base": 75, "rain_boost": 1.40, "cold_boost": 1.20, "hot_boost": 0.85},
        {"name": "Sandwich", "base": 55, "rain_boost": 0.95, "cold_boost": 1.00, "hot_boost": 1.10},
        {"name": "Misal Pav", "base": 45, "rain_boost": 1.30, "cold_boost": 1.25, "hot_boost": 0.80},
        {"name": "Poha", "base": 50, "rain_boost": 1.05, "cold_boost": 1.10, "hot_boost": 1.00},
        {"name": "Idli", "base": 40, "rain_boost": 0.90, "cold_boost": 1.05, "hot_boost": 1.05},
        {"name": "Tea", "base": 130, "rain_boost": 1.50, "cold_boost": 1.60, "hot_boost": 0.75},
        {"name": "Coffee", "base": 65, "rain_boost": 1.30, "cold_boost": 1.45, "hot_boost": 0.80},
        {"name": "Cold Drink", "base": 60, "rain_boost": 0.40, "cold_boost": 0.45, "hot_boost": 1.70},
    ]

    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weathers = ["Sunny", "Cloudy", "Rainy", "Hot", "Cold"]

    start_date = datetime(2026, 6, 1)
    records = []

    # Track previous day sales per food item
    prev_sales_tracker = {item["name"]: item["base"] for item in food_items}

    for day_idx in range(num_days):
        current_date = start_date + timedelta(days=day_idx)
        day_name = days_of_week[current_date.weekday()]

        # Weekend / holiday logic
        is_weekend = day_name in ["Saturday", "Sunday"]
        # Occasional holidays on weekdays (5% chance), weekends are holidays (80% chance)
        is_holiday = "Yes" if (is_weekend and random.random() < 0.85) or (not is_weekend and random.random() < 0.06) else "No"
        # College festivals or sports events
        is_special_event = "Yes" if (not is_holiday == "Yes" and random.random() < 0.10) else "No"

        # Seasonal/day weather
        weather_weights = [0.40, 0.20, 0.25, 0.10, 0.05]
        if current_date.month in [6, 7, 8]: # Monsoon
            weather_weights = [0.15, 0.25, 0.50, 0.05, 0.05]
        weather = random.choices(weathers, weights=weather_weights, k=1)[0]

        # Attendance calculation
        if is_holiday == "Yes":
            attendance = random.randint(120, 350) # only hostellers / lab students
        elif is_special_event == "Yes":
            attendance = random.randint(950, 1250) # extra crowd
        elif is_weekend:
            attendance = random.randint(350, 550)
        elif day_name in ["Monday", "Friday"]:
            attendance = random.randint(800, 1050)
        else:
            attendance = random.randint(700, 950)

        # Generate sales for all food items or sample
        for item in food_items:
            base = item["base"]
            prev_sales = prev_sales_tracker[item["name"]]

            # Attendance factor (800 is baseline)
            attendance_factor = attendance / 800.0

            # Weather multiplier
            weather_multiplier = 1.0
            if weather == "Rainy":
                weather_multiplier = item["rain_boost"]
            elif weather == "Cold":
                weather_multiplier = item["cold_boost"]
            elif weather == "Hot":
                weather_multiplier = item["hot_boost"]
            elif weather == "Cloudy":
                weather_multiplier = 1.05

            # Event factor
            event_multiplier = 1.35 if is_special_event == "Yes" else 1.0

            # Holiday factor
            holiday_multiplier = 0.35 if is_holiday == "Yes" else 1.0

            # Autocorrelation with previous day
            sales_val = (base * 0.45 * attendance_factor * weather_multiplier * event_multiplier * holiday_multiplier) + (0.35 * prev_sales)
            # Add random natural fluctuation (+- 7%)
            noise = random.uniform(0.92, 1.08)
            final_units = max(5, int(round(sales_val * noise)))

            # Update tracker
            prev_sales_tracker[item["name"]] = final_units

            records.append({
                "Date": current_date.strftime("%Y-%m-%d"),
                "Day": day_name,
                "Weather": weather,
                "Previous_Day_Sales": prev_sales,
                "Is_Holiday": is_holiday,
                "Is_Special_Event": is_special_event,
                "Student_Attendance": attendance,
                "Food_Item": item["name"],
                "Units_Sold": final_units
            })

    # Write to CSV
    fieldnames = [
        "Date", "Day", "Weather", "Previous_Day_Sales",
        "Is_Holiday", "Is_Special_Event", "Student_Attendance",
        "Food_Item", "Units_Sold"
    ]

    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"Successfully generated {len(records)} canteen sales records in '{filename}'.")
    return filename

if __name__ == "__main__":
    generate_canteen_dataset()
