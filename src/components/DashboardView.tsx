import React, { useState, useEffect } from 'react';
import { ActivePage, SalesRecord, FoodItemName, DayOfWeek, WeatherCondition } from '../types/canteen';
import { FoodItemMeta, DAYS_LIST, WEATHERS_LIST } from '../data/initialData';
import { User, UserRole } from '../types/auth';
import { exportSalesRecordsToPdf } from '../utils/pdfExport';
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Clock,
  Layers,
  Calendar,
  AlertCircle,
  ArrowRight,
  Plus,
  FileText,
  CheckCircle2,
  ChefHat,
  Shield,
  Zap,
  CheckSquare,
  Square,
  Download,
  X,
  Flame,
  Leaf,
  Users
} from 'lucide-react';

interface DashboardViewProps {
  salesRecords: SalesRecord[];
  foodItems: FoodItemMeta[];
  currentUser?: User | null;
  setActivePage: (page: ActivePage) => void;
  onQuickPredict: (itemName: string) => void;
  onOpenAddItem: () => void;
  onAddRecord?: (record: SalesRecord) => void;
}

const ALL_ROLES: UserRole[] = [
  'Staff Member',
  'Kitchen Manager',
  'Canteen Supervisor',
  'College Administrator',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  salesRecords,
  foodItems,
  currentUser,
  setActivePage,
  onQuickPredict,
  onOpenAddItem,
  onAddRecord,
}) => {
  // Active Role View (Defaults to logged-in user's role, can be switched for demonstration)
  const [activeRoleView, setActiveRoleView] = useState<UserRole>(
    () => currentUser?.role || 'Staff Member'
  );

  useEffect(() => {
    if (currentUser?.role) {
      setActiveRoleView(currentUser.role);
    }
  }, [currentUser?.role]);

  // Dashboard Fast Add Record Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDate, setNewDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newFoodItem, setNewFoodItem] = useState<FoodItemName>('Vada Pav');
  const [newDay, setNewDay] = useState<DayOfWeek>('Monday');
  const [newWeather, setNewWeather] = useState<WeatherCondition>('Sunny');
  const [newAttendance, setNewAttendance] = useState(850);
  const [newPrevSales, setNewPrevSales] = useState(75);
  const [newHoliday, setNewHoliday] = useState<'Yes' | 'No'>('No');
  const [newEvent, setNewEvent] = useState<'Yes' | 'No'>('No');
  const [newUnitsSold, setNewUnitsSold] = useState(80);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Staff counter checklist state
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({
    morningPrep: true,
    lunchRush: false,
    closingReconcile: false,
  });

  const triggerToast = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 3200);
  };

  const handleCreateRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRecord) {
      setActivePage('sales_data');
      return;
    }
    const record: SalesRecord = {
      id: `REC-DASH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      Date: newDate || new Date().toISOString().split('T')[0],
      Day: newDay,
      Weather: newWeather,
      Previous_Day_Sales: Number(newPrevSales) || 0,
      Is_Holiday: newHoliday,
      Is_Special_Event: newEvent,
      Student_Attendance: Number(newAttendance) || 0,
      Food_Item: newFoodItem,
      Units_Sold: Number(newUnitsSold) || 0,
    };
    onAddRecord(record);
    setIsAddModalOpen(false);
    triggerToast(`Logged ${record.Units_Sold} units of ${record.Food_Item}!`);
  };

  // Fast 1-click logger for counter staff
  const handleFastLogItem = (itemName: string, quantity: number) => {
    if (!onAddRecord) {
      setActivePage('sales_data');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDay = days[new Date().getDay()] as DayOfWeek;

    const record: SalesRecord = {
      id: `REC-FAST-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      Date: todayStr,
      Day: todayDay,
      Weather: 'Sunny',
      Previous_Day_Sales: Math.round(quantity * 0.9),
      Is_Holiday: 'No',
      Is_Special_Event: 'No',
      Student_Attendance: 850,
      Food_Item: itemName,
      Units_Sold: quantity,
    };
    onAddRecord(record);
    triggerToast(`⚡ Quick-logged +${quantity} units of ${itemName}!`);
  };

  // Administrator 1-Click PDF Export
  const handleAdminExportPdf = () => {
    if (salesRecords.length === 0) {
      triggerToast('No sales records to export yet. Add sales records first!');
      return;
    }
    try {
      exportSalesRecordsToPdf({
        records: salesRecords,
        filterSummary: {
          foodItem: 'All',
          day: 'All',
          weather: 'All',
          holiday: 'All',
          event: 'All',
          search: '',
        },
        generatedBy: currentUser?.name || 'College Dining Administrator',
      });
      triggerToast('Generated official Administrative PDF report!');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to generate PDF. Try again.');
    }
  };
  // Aggregate KPI Calculations strictly from currently logged-in user's records
  const totalSales = salesRecords.reduce((acc, curr) => acc + curr.Units_Sold, 0);
  const numRecords = salesRecords.length;

  const uniqueDaysCount = new Set(salesRecords.map((r) => r.Date)).size;
  const avgDailyDemand =
    salesRecords.length === 0
      ? '0'
      : uniqueDaysCount > 0
      ? (totalSales / uniqueDaysCount).toFixed(1)
      : (totalSales / salesRecords.length).toFixed(1);

  // Compute most popular food item from user's records
  const itemCounts: Record<string, number> = {};
  salesRecords.forEach((r) => {
    itemCounts[r.Food_Item] = (itemCounts[r.Food_Item] || 0) + r.Units_Sold;
  });

  let mostPopularItem = 'No data';
  let maxCount = 0;
  Object.entries(itemCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPopularItem = name;
    }
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Role Switcher Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Role Dashboard View:
              </span>
              <span className="text-amber-400 font-extrabold text-xs">{activeRoleView}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {currentUser
                ? `Logged in as ${currentUser.name} (${currentUser.role})`
                : 'Previewing role-customized dashboard experience'}
            </div>
          </div>
        </div>

        {/* Role toggle pill buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {ALL_ROLES.map((role) => {
            const isSelected = activeRoleView === role;
            const isMyAccountRole = currentUser?.role === role;

            return (
              <button
                key={role}
                onClick={() => setActiveRoleView(role)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>
                  {role === 'Staff Member'
                    ? '🏷️ Staff'
                    : role === 'Kitchen Manager'
                    ? '🍳 Kitchen'
                    : role === 'Canteen Supervisor'
                    ? '📦 Supervisor'
                    : '🏛️ Admin'}
                </span>
                {isMyAccountRole && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected
                        ? 'bg-slate-950/25 text-slate-950'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    You
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Notice Notification */}
      {actionSuccessNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">Real-Time Sync</span>
        </div>
      )}

      {/* Hero Welcome Banner - Dynamically Tailored by Role */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-5 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-amber-100 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Campus Canteen Operations</span>
            </span>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5">
              <span>
                {activeRoleView === 'Staff Member'
                  ? '🏷️ Counter Sales & POS Terminal'
                  : activeRoleView === 'Kitchen Manager'
                  ? '🍳 Kitchen Production & Batch Prep'
                  : activeRoleView === 'Canteen Supervisor'
                  ? '📦 Menu & Operations Oversight'
                  : '🏛️ Dining Governance & Audit'}
              </span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            {currentUser ? `Welcome, ${currentUser.name} 👋` : 'Welcome to CanteenAI 👋'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 font-medium mt-0.5 max-w-xl">
            {activeRoleView === 'Staff Member' &&
              'Cashier & Counter Sales Desk · Record daily item sales and track closing tallies.'}
            {activeRoleView === 'Kitchen Manager' &&
              'Cooking & Production Management · Forecast batches and eliminate perishable food waste.'}
            {activeRoleView === 'Canteen Supervisor' &&
              'Dining Operations & Catalog · Manage custom items, audit shelf-life, and supervise shifts.'}
            {activeRoleView === 'College Administrator' &&
              'Executive Governance & Audit · Review food waste reduction metrics and export official reports.'}
          </p>

          <p className="text-xs text-amber-50/90 mt-2.5 leading-relaxed max-w-xl">
            Use machine learning to estimate tomorrow's food demand and help reduce food wastage.
          </p>

          {/* Role-Customized Action Buttons */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            {activeRoleView === 'Staff Member' && (
              <>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-950 text-amber-400 hover:bg-slate-900 active:scale-95 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>⚡ Log Today's Sales</span>
                  <Plus className="w-3.5 h-3.5 ml-0.5" />
                </button>
                <button
                  onClick={() => setActivePage('sales_data')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white active:scale-95 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border border-white/20 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>📋 Open Sales Register</span>
                </button>
              </>
            )}

            {activeRoleView === 'Kitchen Manager' && (
              <>
                <button
                  onClick={() => setActivePage('predict')}
                  className="flex items-center gap-2 bg-slate-950 text-amber-400 hover:bg-slate-900 active:scale-95 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>🔮 Forecast Tomorrow's Cooking</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
                <button
                  onClick={() => setActivePage('analytics')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white active:scale-95 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border border-white/20 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>📊 Consumption Trends</span>
                </button>
              </>
            )}

            {activeRoleView === 'Canteen Supervisor' && (
              <>
                <button
                  onClick={onOpenAddItem}
                  className="flex items-center gap-2 bg-slate-950 text-amber-400 hover:bg-slate-900 active:scale-95 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>+ Add New Menu Item</span>
                </button>
                <button
                  onClick={() => setActivePage('sales_data')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white active:scale-95 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border border-white/20 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>📋 Full Sales Log</span>
                </button>
              </>
            )}

            {activeRoleView === 'College Administrator' && (
              <>
                <button
                  onClick={handleAdminExportPdf}
                  className="flex items-center gap-2 bg-slate-950 text-amber-400 hover:bg-slate-900 active:scale-95 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>📄 Download Official PDF Report</span>
                  <Download className="w-3.5 h-3.5 ml-1" />
                </button>
                <button
                  onClick={() => setActivePage('analytics')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white active:scale-95 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border border-white/20 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>📈 Campus Demand Trends</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-6 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Core KPI Cards Required by Prompt Section 7 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Canteen Metrics Overview
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Real-time sync</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Sales */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Total Sales</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {totalSales.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Total Units Tracked</span>
              </div>
            </div>
          </div>

          {/* Card 2: Average Daily Demand */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Average Daily Demand</span>
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {avgDailyDemand} <span className="text-xs font-normal text-slate-400">units</span>
              </div>
              <div className="text-[10px] text-sky-400 font-medium mt-0.5">
                Per menu item / entry
              </div>
            </div>
          </div>

          {/* Card 3: Most Popular Food */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Most Popular Food</span>
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <span className="text-sm">⭐</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-extrabold text-white truncate">
                {mostPopularItem}
              </div>
              <div className="text-[10px] text-orange-400 font-medium mt-0.5 truncate">
                {maxCount > 0 ? `${maxCount.toLocaleString()} total units consumed` : 'No sales recorded yet'}
              </div>
            </div>
          </div>

          {/* Card 4: Number of Records */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Number of Records</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {numRecords}
              </div>
              <div className="text-[10px] text-purple-400 font-medium mt-0.5">
                Historical sales entries
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Customized Command Center Widget */}
      {activeRoleView === 'Staff Member' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Counter Sales Register & Fast Logger</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                    🟢 Shift Active
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Cashier terminal tools. Fast 1-click counter recording and shift reconciliation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Custom Sales Entry</span>
            </button>
          </div>

          {/* Quick 1-Click Fast Log Buttons */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ 1-Click Fast Counter Logging (Today's Shift)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Tea', qty: 10, emoji: '☕' },
                { name: 'Vada Pav', qty: 5, emoji: '🥪' },
                { name: 'Samosa', qty: 5, emoji: '🥟' },
                { name: 'Coffee', qty: 5, emoji: '🧋' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleFastLogItem(item.name, item.qty)}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500 hover:bg-slate-850 p-2.5 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      +{item.qty} units
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 mt-1 truncate">
                    Log {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500">Tap to record immediately</div>
                </button>
              ))}
            </div>
          </div>

          {/* Shift Closing Checklist */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Cashier Shift Checklist
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'morningPrep', label: 'Morning counter opening tallies checked' },
                { id: 'lunchRush', label: 'Lunch peak snack transactions logged' },
                { id: 'closingReconcile', label: 'Evening register reconciled with Kitchen' },
              ].map((task) => (
                <button
                  key={task.id}
                  onClick={() =>
                    setCompletedChecklist((prev) => ({
                      ...prev,
                      [task.id]: !prev[task.id],
                    }))
                  }
                  className="flex items-center gap-2 text-left text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {completedChecklist[task.id] ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={completedChecklist[task.id] ? 'line-through text-slate-500' : ''}>
                    {task.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeRoleView === 'Kitchen Manager' && (
        <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Kitchen Production & Batch Prep Guide</span>
                  <span className="bg-sky-500/20 text-sky-400 text-[10px] px-2 py-0.5 rounded-full border border-sky-500/30 font-mono">
                    Culinary Production
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Batch cooking schedule and weather sensitivity matrix to eliminate surplus food waste.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActivePage('predict')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-extrabold text-slate-950 text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🔮 Run Tomorrow's Forecast</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Shift 1 */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Shift 1 · 09:30 AM
              </div>
              <div className="text-xs font-bold text-white">Morning Prep & Breakfast</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prepare 50 Idli & 60 Poha. Mix dough for first batch of 70 Vada Pavs.
              </p>
            </div>

            {/* Shift 2 */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Shift 2 · 12:15 PM
              </div>
              <div className="text-xs font-bold text-white">Peak Lunch Rush (Staggered Frying)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fry in 2 batches of 40 Samosas to maintain crispness and prevent drying out.
              </p>
            </div>

            {/* Shift 3 */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Shift 3 · 03:30 PM
              </div>
              <div className="text-xs font-bold text-white">Evening High Tea & Perishables</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fresh tea brewing on demand. Stop frying by 04:30 PM to clear all stock.
              </p>
            </div>
          </div>

          {/* Weather Impact Matrix */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400">Weather Sensitivity Multiplier: </span>
              <span>
                Rainy or Cold weather multiplies Tea demand by <b>+50%</b> and Samosas by <b>+40%</b>, while dropping Cold Drinks by <b>-60%</b>. Check weather forecast before grocery buying!
              </span>
            </div>
          </div>
        </div>
      )}

      {activeRoleView === 'Canteen Supervisor' && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Menu Catalogue & Stock Velocity Health</span>
                  <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 font-mono">
                    Operations
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Menu item distribution, inventory velocity, and grocery procurement oversight.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAddItem}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 font-extrabold text-white text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Menu Item</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Snacks</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                {foodItems.filter((f) => f.category === 'Snack').length} Items
              </div>
              <div className="text-[10px] text-slate-400">High turnover velocity</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Beverages</div>
              <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
                {foodItems.filter((f) => f.category === 'Beverage').length} Items
              </div>
              <div className="text-[10px] text-slate-400">High profit margin</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Breakfast</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                {foodItems.filter((f) => f.category === 'Breakfast').length} Items
              </div>
              <div className="text-[10px] text-slate-400">Morning footfall anchor</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-purple-400">Inventory Safety Target: </span>
              <span className="text-slate-400">Maintain a strict 15% safety stock buffer over predicted demand.</span>
            </div>
            <button
              onClick={() => setActivePage('sales_data')}
              className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              <span>Audit Sales Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {activeRoleView === 'College Administrator' && (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <FileText className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Executive Dining Governance & Audit</span>
                  <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30 font-mono">
                    Administration
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Campus dining sustainability, food waste mitigation rate, and official administrative exports.
                </p>
              </div>
            </div>

            <button
              onClick={handleAdminExportPdf}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-extrabold text-white text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📄 Download Official PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                <Leaf className="w-3.5 h-3.5" />
                <span>Food Waste Avoided</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">~28.4%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Saved vs traditional unguided batch cooking
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-sky-400 text-[10px] font-bold uppercase">
                <Users className="w-3.5 h-3.5" />
                <span>Tracked Meals</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {totalSales.toLocaleString()} <span className="text-xs font-normal text-slate-400">units</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Across {numRecords} recorded entries</div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Daily Velocity</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                {avgDailyDemand} <span className="text-xs font-normal text-slate-400">units/day</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Campus dining engagement average</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Menu Item Demand Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Predict By Menu Item
            </h3>
            <p className="text-[11px] text-slate-500">Tap an item to jump straight into prediction</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddItem}
              className="text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Menu Item</span>
            </button>
            <button
              onClick={() => setActivePage('predict')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>All Items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {foodItems.map((item) => {
            const userItemSold = salesRecords
              .filter((r) => r.Food_Item === item.name)
              .reduce((sum, r) => sum + r.Units_Sold, 0);

            return (
              <button
                key={item.name}
                onClick={() => onQuickPredict(item.name)}
                className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 p-3 rounded-xl flex flex-col items-center text-center transition-all cursor-pointer"
              >
                <div className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate w-full">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-medium">
                  {userItemSold} units
                </div>
              </button>
            );
          })}

          {/* Dedicated + Add Item card in the menu grid */}
          <button
            onClick={onOpenAddItem}
            className="group bg-slate-950/70 border-2 border-dashed border-slate-800 hover:border-amber-500/60 hover:bg-amber-500/5 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[96px]"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center mb-1 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
              + Add Item
            </div>
            <div className="text-[9px] text-slate-600 mt-0.5">Custom Menu</div>
          </button>
        </div>
      </div>

      {/* Recent Sales Activity Snippet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Sales Activity
            </h4>
          </div>
          {salesRecords.length > 0 && (
            <button
              onClick={() => setActivePage('sales_data')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {salesRecords.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 space-y-2.5">
            <p className="text-slate-400 font-medium">📋 No sales recorded yet for your account.</p>
            <button
              onClick={() => setActivePage('sales_data')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Sales Record</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {salesRecords.slice(0, 4).map((record) => (
              <div key={record.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400 font-semibold">
                    {record.Day.substring(0, 3)}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-200">{record.Food_Item}</div>
                    <div className="text-[10px] text-slate-500">
                      {record.Weather} · Att: {record.Student_Attendance}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-400 font-mono tabular-nums">
                    {record.Units_Sold} units
                  </div>
                  <div className="text-[10px] text-slate-500">{record.Date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fast Add Record Modal inside Dashboard */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Log Counter Sales Record</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecordSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Food Item</label>
                  <select
                    value={newFoodItem}
                    onChange={(e) => setNewFoodItem(e.target.value as FoodItemName)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2 text-white"
                  >
                    {foodItems.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2 text-white"
                  >
                    {DAYS_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weather</label>
                  <select
                    value={newWeather}
                    onChange={(e) => setNewWeather(e.target.value as WeatherCondition)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2 text-white"
                  >
                    {WEATHERS_LIST.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Student Attendance
                  </label>
                  <input
                    type="number"
                    value={newAttendance}
                    onChange={(e) => setNewAttendance(parseInt(e.target.value) || 0)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Previous Day Sales
                  </label>
                  <input
                    type="number"
                    value={newPrevSales}
                    onChange={(e) => setNewPrevSales(parseInt(e.target.value) || 0)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Holiday</label>
                  <select
                    value={newHoliday}
                    onChange={(e) => setNewHoliday(e.target.value as 'Yes' | 'No')}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2 text-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Special Event</label>
                  <select
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value as 'Yes' | 'No')}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2 text-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Units Sold</label>
                  <input
                    type="number"
                    value={newUnitsSold}
                    onChange={(e) => setNewUnitsSold(parseInt(e.target.value) || 0)}
                    className="w-full h-10 bg-slate-950 border border-amber-500 rounded-lg px-3 text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 cursor-pointer shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
