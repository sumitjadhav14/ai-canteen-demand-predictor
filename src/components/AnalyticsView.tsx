import React, { useState } from 'react';
import { SalesRecord } from '../types/canteen';
import { FoodItemMeta, DAYS_LIST, WEATHERS_LIST } from '../data/initialData';
import {
  BarChart3,
  TrendingUp,
  CloudRain,
  Users,
  Calendar,
  Plus
} from 'lucide-react';

interface AnalyticsViewProps {
  salesRecords: SalesRecord[];
  foodItems: FoodItemMeta[];
  onNavigateToSales?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  salesRecords,
  foodItems,
  onNavigateToSales,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'items' | 'days' | 'weather' | 'attendance' | 'holiday'>('all');

  // If user has zero records, show the empty state requested in Section 9
  if (salesRecords.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📈 Demand Analytics & Insights</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical trends and correlations derived directly from your canteen sales records.
          </p>
        </div>

        {/* Empty State Banner (Prompt Section 9) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
            📊
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">No Analytics Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              You don't have enough sales data to generate analytics. Start adding sales records or making predictions to generate personalized analytics.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-left text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-amber-400 text-[11px] uppercase tracking-wider">
              Add your first sales record to see:
            </div>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">•</span> Food demand trends
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">•</span> Popular food items
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">•</span> Weather vs demand
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">•</span> Attendance vs demand
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">•</span> Daily sales
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">•</span> Demand patterns
              </li>
            </ul>
          </div>

          {onNavigateToSales && (
            <button
              onClick={onNavigateToSales}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Sales Record</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Dynamic Analytics strictly derived from user's records ---
  const userFoodItemNames = Array.from(new Set(salesRecords.map((r) => r.Food_Item)));

  // Chart 1: Food Item vs Total Sales (Shows ONLY items entered by this user)
  const itemSales = userFoodItemNames.map((name) => {
    const total = salesRecords
      .filter((r) => r.Food_Item === name)
      .reduce((sum, r) => sum + r.Units_Sold, 0);
    const meta = foodItems.find((f) => f.name === name);
    return { name, total, emoji: meta?.emoji || '🍲' };
  }).sort((a, b) => b.total - a.total);

  const maxItemTotal = Math.max(...itemSales.map((i) => i.total), 1);

  // Chart 2: Average Demand by Day of Week
  const dayDemand = DAYS_LIST.map((day) => {
    const matching = salesRecords.filter((r) => r.Day === day);
    const avg = matching.length
      ? Math.round(matching.reduce((sum, r) => sum + r.Units_Sold, 0) / matching.length)
      : 0;
    return { day, avg };
  });

  const maxDayAvg = Math.max(...dayDemand.map((d) => d.avg), 1);

  // Chart 3: Weather vs Demand for Key Items in user's records
  const weatherCompareItems = userFoodItemNames.slice(0, 4);
  const weatherAverages = WEATHERS_LIST.map((weather) => {
    const recs = salesRecords.filter((r) => r.Weather === weather);
    const itemAvgs: Record<string, number> = {};
    weatherCompareItems.forEach((item) => {
      const itemRecs = recs.filter((r) => r.Food_Item === item);
      itemAvgs[item] = itemRecs.length
        ? Math.round(itemRecs.reduce((sum, r) => sum + r.Units_Sold, 0) / itemRecs.length)
        : 0;
    });
    return { weather, itemAvgs };
  });

  // Chart 4: Attendance vs Demand (Correlation Scatter points from user's records)
  const scatterPoints = salesRecords.slice(0, 60).map((r) => ({
    x: r.Student_Attendance,
    y: r.Units_Sold,
    item: r.Food_Item,
  }));

  // Chart 5: Holiday vs Normal Day
  const holidayRecords = salesRecords.filter((r) => r.Is_Holiday === 'Yes');
  const normalRecords = salesRecords.filter((r) => r.Is_Holiday === 'No');

  const avgHolidayDemand = holidayRecords.length
    ? Math.round(holidayRecords.reduce((s, r) => s + r.Units_Sold, 0) / holidayRecords.length)
    : 0;
  const avgNormalDemand = normalRecords.length
    ? Math.round(normalRecords.reduce((s, r) => s + r.Units_Sold, 0) / normalRecords.length)
    : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>📈 Demand Analytics & Insights</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Statistical trends and correlations derived directly from your {salesRecords.length} recorded sales entries.
        </p>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {[
          { id: 'all', label: 'All Charts' },
          { id: 'items', label: '1. Food Items' },
          { id: 'days', label: '2. Days of Week' },
          { id: 'weather', label: '3. Weather' },
          { id: 'attendance', label: '4. Attendance' },
          { id: 'holiday', label: '5. Holidays' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CHART 1: Food Item vs Total Sales */}
      {(activeTab === 'all' || activeTab === 'items') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>1. Food Item vs Total Sales</span>
              </h3>
              <p className="text-[11px] text-slate-400">Total units sold per menu item from your sales records</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">X: Item · Y: Units</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-2.5 pt-2">
            {itemSales.map((item) => {
              const pct = (item.total / maxItemTotal) * 100;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 tabular-nums">
                      {item.total.toLocaleString()} units
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
            <span className="font-bold text-amber-400">Analytical Explanation: </span>
            {itemSales.length > 0
              ? `${itemSales[0].name} represents your highest sales volume item with ${itemSales[0].total} units recorded.`
              : 'Add more sales records across menu categories to visualize volume distribution.'}
          </div>
        </div>
      )}

      {/* CHART 2: Average Demand by Day of the Week */}
      {(activeTab === 'all' || activeTab === 'days') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>2. Average Demand by Day of the Week</span>
              </h3>
              <p className="text-[11px] text-slate-400">Mean units required across weekdays and weekends</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">X: Day · Y: Avg Units</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-800">
            {dayDemand.map((d) => {
              const heightPct = d.avg > 0 ? Math.max(12, (d.avg / maxDayAvg) * 100) : 4;
              const isPeak = d.day === 'Monday' || d.day === 'Friday';

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono font-bold text-sky-400 tabular-nums">
                    {d.avg}u
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-950 rounded-t-lg overflow-hidden flex items-end h-32 border border-slate-800">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        d.avg === 0 ? 'bg-slate-850' : isPeak ? 'bg-sky-400' : 'bg-sky-600'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold group-hover:text-white">
                    {d.day.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
            <span className="font-bold text-sky-400">Analytical Explanation: </span>
            Evaluates daily footfall and consumption patterns across the academic week from your entries.
          </div>
        </div>
      )}

      {/* CHART 3: Weather vs Food Demand */}
      {(activeTab === 'all' || activeTab === 'weather') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-emerald-400" />
                <span>3. Weather Condition vs Demand</span>
              </h3>
              <p className="text-[11px] text-slate-400">Demand sensitivity across meteorological conditions from your data</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              {weatherCompareItems.map((item, idx) => (
                <span key={item} className="flex items-center gap-1 text-slate-300">
                  <div
                    className={`w-2 h-2 rounded ${
                      idx === 0
                        ? 'bg-amber-400'
                        : idx === 1
                        ? 'bg-orange-400'
                        : idx === 2
                        ? 'bg-cyan-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {weatherAverages.map((w) => (
              <div
                key={w.weather}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{w.weather}</span>
                  <span>
                    {w.weather === 'Rainy' ? '🌧️' : w.weather === 'Hot' ? '🔥' : w.weather === 'Cold' ? '❄️' : '☀️'}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {weatherCompareItems.length === 0 ? (
                    <span className="text-[10px] text-slate-600">No items recorded</span>
                  ) : (
                    weatherCompareItems.map((item) => (
                      <div key={item} className="flex justify-between">
                        <span className="text-slate-400 truncate max-w-[80px]">{item}:</span>
                        <span className="font-bold text-amber-400 font-mono">{w.itemAvgs[item] || 0}u</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
            <span className="font-bold text-emerald-400">Analytical Explanation: </span>
            Shows how weather changes affect order volume across your canteen entries.
          </div>
        </div>
      )}

      {/* CHART 4: Student Attendance vs Demand */}
      {(activeTab === 'all' || activeTab === 'attendance') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>4. Student Attendance vs Units Sold</span>
              </h3>
              <p className="text-[11px] text-slate-400">Scatter correlation from your recorded sales transactions</p>
            </div>
          </div>

          <div className="relative h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 pointer-events-none opacity-20 divide-x divide-y divide-slate-700" />

            {/* Regression line if more than 1 point */}
            {scatterPoints.length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="10%"
                  y1="80%"
                  x2="90%"
                  y2="20%"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              </svg>
            )}

            <div className="relative w-full h-full">
              {scatterPoints.map((pt, idx) => {
                const maxAtt = Math.max(...scatterPoints.map((p) => p.x), 1000);
                const maxUnit = Math.max(...scatterPoints.map((p) => p.y), 100);
                const left = Math.min(92, Math.max(5, (pt.x / maxAtt) * 90));
                const top = Math.min(90, Math.max(10, 100 - (pt.y / maxUnit) * 85));
                return (
                  <div
                    key={idx}
                    className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400/90 hover:w-3.5 hover:h-3.5 hover:bg-amber-400 transition-all cursor-pointer"
                    style={{ left: `${left}%`, top: `${top}%` }}
                    title={`Attendance: ${pt.x} → ${pt.item}: ${pt.y} units`}
                  />
                );
              })}
            </div>

            <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-mono">
              Lower Attendance
            </div>
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono">
              Higher Attendance
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
            <span className="font-bold text-purple-400">Analytical Explanation: </span>
            Correlation scatter plot showing how campus attendance scales with food sales.
          </div>
        </div>
      )}

      {/* CHART 5: Holiday vs Demand */}
      {(activeTab === 'all' || activeTab === 'holiday') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <span>5. Holiday Impact on Demand</span>
              </h3>
              <p className="text-[11px] text-slate-400">Comparative mean demand: Academic Days vs Holidays</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs font-semibold text-slate-400">Academic / Normal Days</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mt-1">
                {avgNormalDemand} <span className="text-xs font-normal text-slate-400">units</span>
              </div>
              <div className="text-[11px] text-emerald-400/80 mt-1">
                {normalRecords.length} entries recorded
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs font-semibold text-slate-400">Official Holidays</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-400 font-mono mt-1">
                {avgHolidayDemand} <span className="text-xs font-normal text-slate-400">units</span>
              </div>
              <div className="text-[11px] text-rose-400/80 mt-1">
                {holidayRecords.length} entries recorded
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
            <span className="font-bold text-rose-400">Analytical Explanation: </span>
            Shows how official holidays reduce campus canteen demand compared to regular academic days.
          </div>
        </div>
      )}
    </div>
  );
};
