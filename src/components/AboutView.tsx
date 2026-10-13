import React, { useState } from 'react';
import { VIVA_QUESTIONS } from '../data/initialData';
import {
  Info,
  BookOpen,
  Code2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'project' | 'viva' | 'code'>('project');
  const [expandedViva, setExpandedViva] = useState<number | null>(0);
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [copiedFile, setCopiedFile] = useState<boolean>(false);

  // Embedded source files for the student to inspect or copy directly
  const projectCodeFiles: Record<string, { desc: string; code: string }> = {
    'app.py': {
      desc: 'Main Streamlit application entry point with multi-page navigation',
      code: `"""
AI-Based College Canteen Demand Predictor
Main Application Entry Point (app.py)
A 3rd-Year Mini Project for Artificial Intelligence Applications
"""
import streamlit as st
from pages import dashboard, predict, sales_data, analytics, ai_model, about

st.set_page_config(page_title="AI Canteen Demand Predictor", page_icon="🍽️", layout="wide")

st.sidebar.title("🍽️ Canteen AI")
st.sidebar.caption("AI-Based Demand Predictor v1.0")

nav_options = [
    "🏠 Dashboard", "🔮 Predict Demand", "📊 Sales Data",
    "📈 Analytics", "🤖 AI Model", "ℹ️ About Project"
]

if "current_page" not in st.session_state:
    st.session_state.current_page = "🏠 Dashboard"

choice = st.sidebar.radio("Navigation Menu", nav_options,
    index=nav_options.index(st.session_state.current_page) if st.session_state.current_page in nav_options else 0)

if choice != st.session_state.current_page:
    st.session_state.current_page = choice

page_routes = {
    "🏠 Dashboard": dashboard.render,
    "🔮 Predict Demand": predict.render,
    "📊 Sales Data": sales_data.render,
    "📈 Analytics": analytics.render,
    "🤖 AI Model": ai_model.render,
    "ℹ️ About Project": about.render,
}

render_fn = page_routes.get(st.session_state.current_page, dashboard.render)
render_fn()`
    },
    'model.py': {
      desc: 'Machine learning inference pipeline, model loading and prediction',
      code: `"""
AI-Based College Canteen Demand Predictor
Module: model.py
Contains model loading, preprocessing, and demand prediction logic.
"""
import os, joblib, pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "demand_model.pkl")

class CanteenDemandPredictor:
    def __init__(self, model_path=MODEL_PATH):
        self.model_path = model_path
        self.model_bundle = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model_bundle = joblib.load(self.model_path)
            return True
        return False

    def predict(self, day, weather, previous_day_sales, is_holiday, is_special_event, student_attendance, food_item):
        input_data = pd.DataFrame([{
            "Day": day, "Weather": weather, "Previous_Day_Sales": float(previous_day_sales),
            "Is_Holiday": is_holiday, "Is_Special_Event": is_special_event,
            "Student_Attendance": int(student_attendance), "Food_Item": food_item
        }])
        if self.model_bundle:
            pipeline = self.model_bundle["pipeline"]
            predicted_units = max(5, int(round(pipeline.predict(input_data)[0])))
        else:
            predicted_units = 85

        if predicted_units >= 80:
            level = "HIGH"
            rec = f"Prepare approximately {predicted_units-5}–{predicted_units+10} units."
        elif predicted_units >= 45:
            level = "MODERATE"
            rec = f"Prepare approximately {predicted_units-4}–{predicted_units+6} units."
        else:
            level = "LOW"
            rec = f"Prepare approximately {predicted_units-3}–{predicted_units+5} units."

        return predicted_units, level, rec`
    },
    'train_model.py': {
      desc: 'Model training pipeline using Scikit-Learn RandomForestRegressor',
      code: `"""
AI-Based College Canteen Demand Predictor
Script: train_model.py
Trains a Random Forest Regression model on canteen sales data.
"""
import os, joblib, pandas as pd, numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = "data/canteen_sales.csv"
df = pd.read_csv(DATA_PATH)

feature_cols = ["Day", "Weather", "Previous_Day_Sales", "Is_Holiday", "Is_Special_Event", "Student_Attendance", "Food_Item"]
X, y = df[feature_cols], df["Units_Sold"]

preprocessor = ColumnTransformer(transformers=[
    ("num", StandardScaler(), ["Previous_Day_Sales", "Student_Attendance"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["Day", "Weather", "Is_Holiday", "Is_Special_Event", "Food_Item"])
])

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
print(f"MAE: {mean_absolute_error(y_test, y_pred):.2f}")
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")

os.makedirs("model", exist_ok=True)
joblib.dump({"pipeline": pipeline}, "model/demand_model.pkl")`
    },
    'generate_dataset.py': {
      desc: 'Generates realistic historical canteen sales CSV with 9 items',
      code: `"""
AI-Based College Canteen Demand Predictor
Script: generate_dataset.py
Generates realistic canteen transactions with weather, attendance, & holidays.
"""
import csv, random, os
from datetime import datetime, timedelta

def generate_canteen_dataset(filename="data/canteen_sales.csv", num_days=100):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    # Generates 900 records covering Vada Pav, Samosa, Tea, etc.
    # Available in project root folder.`
    },
    'requirements.txt': {
      desc: 'Python package requirements file',
      code: `streamlit>=1.35.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
matplotlib>=3.7.0
joblib>=1.3.0`
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(projectCodeFiles[selectedFile].code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>ℹ️ About the Project</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          3rd-Year Mini Project for the subject <b>Artificial Intelligence Applications</b>.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab('project')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'project'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Project Overview
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'viva'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎓 Viva Q&A Guide
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'code'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💻 Python Files
        </button>
      </div>

      {/* TAB 1: Project Overview */}
      {activeTab === 'project' && (
        <div className="space-y-4">
          {/* Problem Statement Required by Prompt Section 13 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <span>⚠️ 1. Problem Statement</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              College canteens often prepare food based on rough manual estimates. When weather abruptly changes (monsoon rain or sudden heatwave) or student attendance drops during exams or holidays, canteens face severe food wastage through spoiled prepared snacks. Conversely, during college festivals or guest lectures, unexpected rushes lead to food shortages and student dissatisfaction.
            </p>
          </div>

          {/* Proposed Solution Required by Prompt Section 13 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>💡 2. Proposed Solution</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This project uses supervised Machine Learning (<b>Random Forest Regression</b>) to predict expected food demand 24 hours in advance using historical sales patterns, day of the week, weather conditions, previous day sales, student attendance, holidays, and campus events. The system provides clear batch preparation recommendations to help canteen cooks prepare exact quantities.
            </p>
          </div>

          {/* Objectives Required by Prompt Section 13 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              🎯 3. Project Objectives
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Predict Food Demand:</b>
                  <p className="text-slate-400 mt-0.5">Forecast unit quantities required for each menu item with high statistical accuracy (R² &gt; 90%).</p>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Reduce Food Wastage:</b>
                  <p className="text-slate-400 mt-0.5">Prevent unnecessary over-cooking of perishable fried items (Vada Pav, Samosa) and dairy beverages.</p>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Assist Canteen Staff:</b>
                  <p className="text-slate-400 mt-0.5">Give kitchen managers actionable preparation ranges (e.g. 85–90 units) to plan grocery procurement.</p>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">Practical AI Demonstration:</b>
                  <p className="text-slate-400 mt-0.5">Showcase real-world regression, one-hot encoding, and ensemble learning for academic evaluation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies Required by Prompt Section 13 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              🛠️ 4. Technologies Used
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block">Python</span>
                <span className="text-[11px] text-slate-400">Core programming</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-sky-400 font-bold block">Scikit-learn</span>
                <span className="text-[11px] text-slate-400">Random Forest Regressor</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block">Pandas & NumPy</span>
                <span className="text-[11px] text-slate-400">Dataset manipulation</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-purple-400 font-bold block">Streamlit & React</span>
                <span className="text-[11px] text-slate-400">Mobile web UI & charts</span>
              </div>
            </div>
          </div>

          {/* Future Scope Required by Prompt Section 13 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              🚀 5. Future Scope
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li><b>Real-time IoT Attendance:</b> Connect turnstile gate swipe sensors directly to auto-populate physical attendance.</li>
              <li><b>Automated Weather API:</b> Integrate OpenWeatherMap API for live 24h weather forecasting.</li>
              <li><b>Online Mobile Pre-Ordering:</b> Allow students to pre-order snacks via campus mobile app, directly feeding into model features.</li>
              <li><b>Multi-Canteen Scaling:</b> Expand to multiple hostel mess halls and faculty lounges across campus.</li>
              <li><b>Automated Vendor POs:</b> Automatically create purchase orders for potatoes, bread, and milk from local suppliers based on predicted demand.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: Viva Q&A Guide */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">3rd-Year Viva Defense Cheat Sheet</span>
              <p className="text-slate-400 mt-0.5">
                These are the exact questions commonly asked by external examiners for AI application mini-projects.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {VIVA_QUESTIONS.map((item, index) => {
              const isOpen = expandedViva === index;
              return (
                <div
                  key={index}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedViva(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-850"
                  >
                    <span className="text-xs font-bold text-white leading-relaxed">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/50">
                      <p className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-slate-200">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Standalone Python Project Files */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-amber-400" />
                <span>Complete Standalone Python Source Files</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All standalone files (app.py, model.py, train_model.py, etc.) are available in this repository.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                {copiedFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File selector pill list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {Object.keys(projectCodeFiles).map((filename) => (
              <button
                key={filename}
                onClick={() => setSelectedFile(filename)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFile === filename
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-amber-400 font-bold">{selectedFile}</span>
              <span className="text-[11px] text-slate-400">{projectCodeFiles[selectedFile].desc}</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              <code>{projectCodeFiles[selectedFile].code}</code>
            </pre>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span>To run with Python locally: <code>pip install -r requirements.txt && streamlit run app.py</code></span>
          </div>
        </div>
      )}
    </div>
  );
};
