import React, { useState, useEffect } from 'react';
import {
  DayOfWeek,
  FoodItemName,
  PredictionInput,
  PredictionResult,
  WeatherCondition,
  UserPredictionRecord
} from '../types/canteen';
import { User } from '../types/auth';
import { FoodItemMeta, DAYS_LIST, WEATHERS_LIST, PRESET_SCENARIOS } from '../data/initialData';
import { MLRegressionModel } from '../services/mlModel';
import { UserDataService } from '../services/userDataService';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  ChevronRight,
  TrendingUp,
  Leaf,
  Plus,
  Clock,
  Trash2,
  History
} from 'lucide-react';

interface PredictViewProps {
  initialFoodItem?: FoodItemName;
  foodItems: FoodItemMeta[];
  currentUser?: User | null;
  onOpenAddItem: () => void;
}

export const PredictView: React.FC<PredictViewProps> = ({
  initialFoodItem,
  foodItems,
  currentUser,
  onOpenAddItem,
}) => {
  const activeUserId = currentUser ? currentUser.id : 'guest';

  // Form State
  const [foodItem, setFoodItem] = useState<FoodItemName>(initialFoodItem || 'Vada Pav');
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [weather, setWeather] = useState<WeatherCondition>('Sunny');
  const [studentAttendance, setStudentAttendance] = useState<number>(850);
  const [previousDaySales, setPreviousDaySales] = useState<number>(75);
  const [isHoliday, setIsHoliday] = useState<'Yes' | 'No'>('No');
  const [isSpecialEvent, setIsSpecialEvent] = useState<'Yes' | 'No'>('No');

  // Prediction Output State
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Prediction History State for Current User
  const [predictionHistory, setPredictionHistory] = useState<UserPredictionRecord[]>(() =>
    UserDataService.getUserPredictions(activeUserId)
  );

  useEffect(() => {
    setPredictionHistory(UserDataService.getUserPredictions(activeUserId));
  }, [activeUserId]);

  // Quick preset loader
  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setFoodItem(preset.foodItem);
    setDay(preset.day);
    setWeather(preset.weather);
    setStudentAttendance(preset.attendance);
    setPreviousDaySales(preset.prevSales);
    setIsHoliday(preset.holiday);
    setIsSpecialEvent(preset.specialEvent);
    setPredictionResult(null);
    setValidationError(null);
  };

  // Prediction Trigger
  const handlePredict = () => {
    // Validation
    if (studentAttendance < 0) {
      setValidationError('Student attendance cannot be negative.');
      return;
    }
    if (previousDaySales < 0) {
      setValidationError('Previous day sales cannot be negative.');
      return;
    }
    setValidationError(null);
    setIsCalculating(true);

    const inputData: PredictionInput = {
      foodItem,
      day,
      weather,
      studentAttendance: Number(studentAttendance),
      previousDaySales: Number(previousDaySales),
      isHoliday,
      isSpecialEvent,
    };

    // Smooth feedback settling
    setTimeout(() => {
      const result = MLRegressionModel.predictDemand(inputData, foodItems);
      setPredictionResult(result);
      setIsCalculating(false);

      // Save prediction to user-specific prediction history
      const savedPred = UserDataService.addPrediction(activeUserId, {
        foodItem: inputData.foodItem,
        day: inputData.day,
        weather: inputData.weather,
        previousDaySales: inputData.previousDaySales,
        studentAttendance: inputData.studentAttendance,
        isHoliday: inputData.isHoliday,
        isSpecialEvent: inputData.isSpecialEvent,
        predictedUnits: result.predictedUnits,
        demandLevel: result.demandLevel,
        recommendation: result.recommendationText,
      });
      setPredictionHistory((prev) => [savedPred, ...prev]);
    }, 180);
  };

  // Reset Handler (Prompt requirement: "Reset inputs and make another prediction")
  const handleReset = () => {
    setFoodItem('Vada Pav');
    setDay('Monday');
    setWeather('Sunny');
    setStudentAttendance(850);
    setPreviousDaySales(75);
    setIsHoliday('No');
    setIsSpecialEvent('No');
    setPredictionResult(null);
    setValidationError(null);
  };

  const selectedMeta = foodItems.find((i) => i.name === foodItem) || foodItems[0];

  return (
    <div className="space-y-6 pb-24">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>🔮 Predict Demand</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Enter upcoming conditions to forecast inventory requirements using the Random Forest ML regression model.
        </p>
      </div>

      {/* Preset Scenarios Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Viva Test Scenarios
          </span>
          <span className="text-[10px] text-amber-400 font-medium">1-Click Auto Fill</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-left transition-all group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400 truncate">
                {preset.title}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.desc}</div>
              <div className="mt-1 text-[9px] font-semibold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded inline-block">
                {preset.badge}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Input Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Tomorrow's Conditions Input</span>
          </div>
          <span className="text-[11px] text-slate-400">7 ML Feature Vectors</span>
        </div>

        {/* 1. Food Item Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Food Item <span className="text-amber-400">*</span>
            </label>
            <button
              type="button"
              onClick={onOpenAddItem}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {foodItems.map((item) => {
              const isSelected = foodItem === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setFoodItem(item.name);
                    // auto-sync baseline previous sales for convenience
                    setPreviousDaySales(Math.round(item.baseDemand * 0.95));
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white font-bold ring-1 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="truncate">
                    <div className="text-xs truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">Base ~{item.baseDemand}</div>
                  </div>
                </button>
              );
            })}

            {/* Quick add custom item in selector */}
            <button
              type="button"
              onClick={onOpenAddItem}
              className="p-2.5 rounded-xl border border-dashed border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-left flex items-center gap-2 transition-all cursor-pointer group"
            >
              <span className="text-base text-amber-400 font-bold group-hover:scale-110 transition-transform">+</span>
              <div className="truncate">
                <div className="text-xs font-semibold text-amber-400">Add Item</div>
                <div className="text-[10px] text-slate-500">Custom menu</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Day of the Week */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Day of Week <span className="text-amber-400">*</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {DAYS_LIST.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Weather Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Weather Condition <span className="text-amber-400">*</span>
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as WeatherCondition)}
              className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {WEATHERS_LIST.map((w) => (
                <option key={w} value={w}>
                  {w} {w === 'Rainy' ? '🌧️' : w === 'Sunny' ? '☀️' : w === 'Hot' ? '🔥' : w === 'Cold' ? '❄️' : '☁️'}
                </option>
              ))}
            </select>
          </div>

          {/* Student Attendance */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Student Attendance (Campus Footfall)
              </label>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                {studentAttendance}
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="2500"
              value={studentAttendance}
              onChange={(e) => setStudentAttendance(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
            {/* Quick Chips */}
            <div className="flex gap-1.5 mt-1.5">
              {[350, 750, 950, 1200].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStudentAttendance(val)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Previous Day Sales */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Previous Day Sales (Units)
              </label>
              <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                {previousDaySales}u
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="1000"
              value={previousDaySales}
              onChange={(e) => setPreviousDaySales(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-1.5 mt-1.5">
              {[40, 65, 85, 120].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPreviousDaySales(val)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  {val}u
                </button>
              ))}
            </div>
          </div>

          {/* Holiday Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Is Official Holiday?
            </label>
            <div className="grid grid-cols-2 gap-2 h-11">
              {(['No', 'Yes'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIsHoliday(opt)}
                  className={`rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isHoliday === opt
                      ? opt === 'Yes'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {opt === 'Yes' ? '🏖️ Yes (Holiday)' : '🏫 No (Academic)'}
                </button>
              ))}
            </div>
          </div>

          {/* Special Event Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Is Special Event / Fest?
            </label>
            <div className="grid grid-cols-2 gap-2 h-11">
              {(['No', 'Yes'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIsSpecialEvent(opt)}
                  className={`rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isSpecialEvent === opt
                      ? opt === 'Yes'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-800 border-slate-600 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {opt === 'Yes' ? '🎉 Yes (College Fest)' : '📖 No (Normal Day)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons Required by Prompt Section 8: "🚀 Predict Demand" & "🔄 Reset" */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handlePredict}
            disabled={isCalculating}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isCalculating ? 'Computing Trees...' : '🚀 Predict Demand'}</span>
          </button>

          <button
            onClick={handleReset}
            className="h-12 px-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 active:scale-[0.98] text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>🔄 Reset</span>
          </button>
        </div>
      </div>

      {/* PREDICTION RESULT CARD Required by Prompt Section 9 */}
      {predictionResult && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Machine Learning Prediction Result
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Confidence: {predictionResult.confidence}%
            </span>
          </div>

          {/* Primary Result Figures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Predicted Demand
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono mt-1 flex items-baseline gap-2">
                <span>{predictionResult.predictedUnits}</span>
                <span className="text-sm font-sans font-semibold text-amber-400">Units</span>
              </div>

              {/* Demand Level Badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Demand Level:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                    predictionResult.demandLevel === 'HIGH'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : predictionResult.demandLevel === 'MODERATE'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}
                >
                  {predictionResult.demandLevel}
                </span>
              </div>
            </div>

            {/* Preparation Guidance Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Preparation:</span>
              </div>
              <div className="text-base font-extrabold text-amber-400 font-mono">
                Approximately {predictionResult.recommendedPrepMin}–{predictionResult.recommendedPrepMax} units
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {predictionResult.recommendationText}
              </p>
            </div>
          </div>

          {/* Sustainability & Food Waste Avoidance Stat */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-bold text-emerald-400">Waste Prevention Impact: </span>
              Canteen prepares within safety buffer. Estimated{' '}
              <b className="text-white">~{predictionResult.wasteAvoidancePercent}% food wastage avoided</b> compared to unguided batch preparation.
            </div>
          </div>

          {/* Input Summary as required in prompt section 9 */}
          <div className="border-t border-slate-800 pt-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Parameters Used for Inference
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Food Item</span>
                <span className="font-semibold text-white">
                  {selectedMeta.emoji} {foodItem}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Day</span>
                <span className="font-semibold text-white">{day}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Weather</span>
                <span className="font-semibold text-white">{weather}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Attendance</span>
                <span className="font-semibold text-white font-mono">{studentAttendance}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Previous Sales</span>
                <span className="font-semibold text-white font-mono">{previousDaySales}u</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Holiday</span>
                <span className="font-semibold text-white">{isHoliday}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Special Event</span>
                <span className="font-semibold text-white">{isSpecialEvent}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Shelf Life</span>
                <span className="font-semibold text-amber-400">{selectedMeta.shelfLife}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Predict for another item</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* User's Prediction History Section (Prompt Section 6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Your Prediction History
            </h3>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {predictionHistory.length} Saved
            </span>
          </div>

          {predictionHistory.length > 0 && (
            <button
              onClick={() => {
                UserDataService.clearPredictions(activeUserId);
                setPredictionHistory([]);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Clear prediction history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {predictionHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 space-y-1.5">
            <div className="text-2xl mb-1">⏱️</div>
            <p className="text-slate-300 font-medium">No predictions saved yet.</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Whenever you forecast food demand, your prediction parameters and results are automatically stored under your account.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {predictionHistory.slice(0, 10).map((record) => {
              const meta = foodItems.find((f) => f.name === record.foodItem);
              const formattedDate = new Date(record.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={record.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.emoji || '🍲'}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{record.foodItem}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            record.demandLevel === 'HIGH'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : record.demandLevel === 'MODERATE'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}
                        >
                          {record.demandLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {record.day} · {record.weather} · Attendance: {record.studentAttendance} · Prev: {record.previousDaySales}u
                        {record.isHoliday === 'Yes' && ' · Holiday'}
                        {record.isSpecialEvent === 'Yes' && ' · Fest'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-extrabold text-amber-400 text-sm">
                        {record.predictedUnits} units
                      </div>
                      <div className="text-[10px] text-slate-500">{formattedDate}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
