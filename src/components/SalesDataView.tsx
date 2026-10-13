import React, { useState, useMemo } from 'react';
import { SalesRecord, FoodItemName, DayOfWeek, WeatherCondition } from '../types/canteen';
import { FoodItemMeta, DAYS_LIST, WEATHERS_LIST } from '../data/initialData';
import { exportSalesRecordsToPdf } from '../utils/pdfExport';
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  RefreshCw,
  Database,
  Calendar,
  Layers,
  ShoppingBag,
  TrendingUp,
  X,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface SalesDataViewProps {
  salesRecords: SalesRecord[];
  foodItems: FoodItemMeta[];
  currentUser?: { id: string; name: string; email: string } | null;
  onAddRecord: (record: SalesRecord) => void;
  onResetDataset: () => void;
}

export const SalesDataView: React.FC<SalesDataViewProps> = ({
  salesRecords,
  foodItems,
  currentUser,
  onAddRecord,
  onResetDataset,
}) => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFoodItem, setFilterFoodItem] = useState<string>('All');
  const [filterDay, setFilterDay] = useState<string>('All');
  const [filterWeather, setFilterWeather] = useState<string>('All');
  const [filterHoliday, setFilterHoliday] = useState<string>('All');
  const [filterEvent, setFilterEvent] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof SalesRecord>('Date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // New Record Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDate, setNewDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newFoodItem, setNewFoodItem] = useState<FoodItemName>('Vada Pav');
  const [newDay, setNewDay] = useState<DayOfWeek>('Monday');
  const [newWeather, setNewWeather] = useState<WeatherCondition>('Sunny');
  const [newAttendance, setNewAttendance] = useState(850);
  const [newPrevSales, setNewPrevSales] = useState(75);
  const [newHoliday, setNewHoliday] = useState<'Yes' | 'No'>('No');
  const [newEvent, setNewEvent] = useState<'Yes' | 'No'>('No');
  const [newUnitsSold, setNewUnitsSold] = useState(88);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return salesRecords.filter((rec) => {
      if (filterFoodItem !== 'All' && rec.Food_Item !== filterFoodItem) return false;
      if (filterDay !== 'All' && rec.Day !== filterDay) return false;
      if (filterWeather !== 'All' && rec.Weather !== filterWeather) return false;
      if (filterHoliday !== 'All' && rec.Is_Holiday !== filterHoliday) return false;
      if (filterEvent !== 'All' && rec.Is_Special_Event !== filterEvent) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          rec.Food_Item.toLowerCase().includes(q) ||
          rec.Day.toLowerCase().includes(q) ||
          rec.Weather.toLowerCase().includes(q) ||
          rec.Date.includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [
    salesRecords,
    filterFoodItem,
    filterDay,
    filterWeather,
    filterHoliday,
    filterEvent,
    searchTerm,
    sortField,
    sortAsc,
  ]);

  // Statistics Required by Prompt Section 10
  const totalRecords = salesRecords.length;
  const totalUnitsSold = salesRecords.reduce((acc, curr) => acc + curr.Units_Sold, 0);
  const avgUnitsSold = totalRecords ? (totalUnitsSold / totalRecords).toFixed(1) : '0';
  const highestSales = totalRecords
    ? Math.max(...salesRecords.map((r) => r.Units_Sold))
    : 0;

  // Download CSV Functionality
  const handleDownloadCSV = () => {
    const headers = [
      'Date',
      'Day',
      'Weather',
      'Previous_Day_Sales',
      'Is_Holiday',
      'Is_Special_Event',
      'Student_Attendance',
      'Food_Item',
      'Units_Sold',
    ];

    const rows = filteredRecords.map((r) => [
      r.Date,
      r.Day,
      r.Weather,
      r.Previous_Day_Sales,
      r.Is_Holiday,
      r.Is_Special_Event,
      r.Student_Attendance,
      `"${r.Food_Item}"`,
      r.Units_Sold,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'canteen_sales.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Export current filtered sales records as a formatted PDF report for administration
  const handleExportPDF = () => {
    if (filteredRecords.length === 0) {
      alert('No sales records match the current filter selection to export.');
      return;
    }
    setPdfGenerating(true);
    try {
      exportSalesRecordsToPdf({
        records: filteredRecords,
        filterSummary: {
          foodItem: filterFoodItem,
          day: filterDay,
          weather: filterWeather,
          holiday: filterHoliday,
          event: filterEvent,
          search: searchTerm,
        },
      });
      setExportNotice(`Exported ${filteredRecords.length} records to PDF report!`);
      setTimeout(() => setExportNotice(null), 3500);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const dateValue = newDate.trim() || new Date().toISOString().split('T')[0];
    const record: SalesRecord = {
      id: `REC-USER-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      Date: dateValue,
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
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📊 Historical Sales Data</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full canteen transactional logs used to train and evaluate the regression model.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF Report button */}
          <button
            onClick={handleExportPDF}
            disabled={pdfGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Export filtered records as formatted PDF report for college administration"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{pdfGenerating ? 'Generating PDF...' : '📄 Export PDF Report'}</span>
          </button>

          {/* Download CSV button required by prompt */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Export notification banner */}
      {exportNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">PDF Ready for Administration</span>
        </div>
      )}

      {/* 4 Statistics Cards Required by Prompt Section 10 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-medium text-slate-400">Total Records</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalRecords}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Training entries</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-medium text-slate-400">Total Units Sold</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            {totalUnitsSold.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Historical quantity</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-medium text-slate-400">Average Units Sold</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {avgUnitsSold} <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Per item transaction</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-medium text-slate-400">Highest Sales in a Day</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {highestSales} <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Peak single record</div>
        </div>
      </div>

      {/* Empty State Banner (Prompt Section 7) */}
      {salesRecords.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-3xl">
            📋
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">No sales records yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Add your first sales record to start generating analytics.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Sales Record</span>
          </button>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Filter Canteen Dataset</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Showing {filteredRecords.length} of {salesRecords.length}
              </span>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by food item, day, weather, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 5 Filter Dropdowns Required by Prompt Section 10 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              {/* Food Item Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Food Item
                </label>
                <select
                  value={filterFoodItem}
                  onChange={(e) => setFilterFoodItem(e.target.value)}
                  className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Items</option>
                  {foodItems.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Day of Week
                </label>
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Days</option>
                  {DAYS_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weather Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Weather
                </label>
                <select
                  value={filterWeather}
                  onChange={(e) => setFilterWeather(e.target.value)}
                  className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Weather</option>
                  {WEATHERS_LIST.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Holiday Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Holiday?
                </label>
                <select
                  value={filterHoliday}
                  onChange={(e) => setFilterHoliday(e.target.value)}
                  className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Status</option>
                  <option value="Yes">Holiday (Yes)</option>
                  <option value="No">Academic (No)</option>
                </select>
              </div>

              {/* Special Event Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Special Event?
                </label>
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Status</option>
                  <option value="Yes">Event / Fest (Yes)</option>
                  <option value="No">Normal Day (No)</option>
                </select>
              </div>
            </div>

            {/* Reset filters shortcut */}
            {(filterFoodItem !== 'All' ||
              filterDay !== 'All' ||
              filterWeather !== 'All' ||
              filterHoliday !== 'All' ||
              filterEvent !== 'All' ||
              searchTerm !== '') && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setFilterFoodItem('All');
                    setFilterDay('All');
                    setFilterWeather('All');
                    setFilterHoliday('All');
                    setFilterEvent('All');
                    setSearchTerm('');
                  }}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Dataset Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th
                      onClick={() => {
                        setSortField('Date');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th
                      onClick={() => {
                        setSortField('Food_Item');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Food Item</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="p-3">Day</th>
                    <th className="p-3">Weather</th>
                    <th
                      onClick={() => {
                        setSortField('Student_Attendance');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3 cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Attendance</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="p-3 text-right">Prev Sales</th>
                    <th className="p-3 text-center">Holiday</th>
                    <th className="p-3 text-center">Event</th>
                    <th
                      onClick={() => {
                        setSortField('Units_Sold');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3 cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Units Sold</span>
                        <ArrowUpDown className="w-3 h-3 text-amber-400" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        No sales records matched your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.slice(0, 100).map((record) => {
                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-850/60 transition-colors"
                        >
                          <td className="p-3 font-mono text-slate-400">{record.Date}</td>
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span>
                              {foodItems.find((i) => i.name === record.Food_Item)?.emoji || '🍲'}
                            </span>
                            <span>{record.Food_Item}</span>
                          </td>
                          <td className="p-3 text-slate-300">{record.Day}</td>
                          <td className="p-3 text-slate-300">{record.Weather}</td>
                          <td className="p-3 text-right font-mono text-slate-300">
                            {record.Student_Attendance}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400">
                            {record.Previous_Day_Sales}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                record.Is_Holiday === 'Yes'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'text-slate-400'
                              }`}
                            >
                              {record.Is_Holiday}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                record.Is_Special_Event === 'Yes'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : 'text-slate-400'
                              }`}
                            >
                              {record.Is_Special_Event}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-amber-400 text-sm">
                            {record.Units_Sold}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Record Modal / Drawer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Historical Canteen Record</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
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
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950"
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
