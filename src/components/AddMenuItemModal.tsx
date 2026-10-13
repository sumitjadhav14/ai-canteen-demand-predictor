import React, { useState } from 'react';
import { FoodItemMeta } from '../data/initialData';
import { Plus, X, Utensils, AlertCircle } from 'lucide-react';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: FoodItemMeta) => void;
  existingItems: FoodItemMeta[];
}

const EMOJI_OPTIONS = ['🍛', '🥘', '🍲', '🥪', '🌮', '🥗', '🧋', '☕', '🥤', '🥟', '🍜', '🍔', '🍕', '🌯', '🍳', '🥞', '🍙'];

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  existingItems,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Snack' | 'Breakfast' | 'Meal' | 'Beverage'>('Snack');
  const [emoji, setEmoji] = useState('🍛');
  const [baseDemand, setBaseDemand] = useState(60);
  const [shelfLife, setShelfLife] = useState('4-6 hours');
  const [weatherSensitivity, setWeatherSensitivity] = useState<'rain_surge' | 'hot_surge' | 'neutral'>('neutral');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a valid item name.');
      return;
    }

    if (existingItems.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`An item named "${trimmed}" already exists in the menu.`);
      return;
    }

    let rainFactor = 1.0;
    let coldFactor = 1.0;
    let hotFactor = 1.0;

    if (weatherSensitivity === 'rain_surge') {
      rainFactor = 1.35;
      coldFactor = 1.20;
      hotFactor = 0.85;
    } else if (weatherSensitivity === 'hot_surge') {
      rainFactor = 0.50;
      coldFactor = 0.50;
      hotFactor = 1.65;
    }

    const newItem: FoodItemMeta = {
      name: trimmed,
      category,
      emoji,
      baseDemand: Number(baseDemand),
      shelfLife,
      rainFactor,
      coldFactor,
      hotFactor,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add New Food Item</h3>
              <p className="text-[11px] text-slate-400">Add to canteen menu & prediction model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Item Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Food Item Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Pav Bhaji, Masala Dosa, Frankie"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Choose Icon / Emoji
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-8 h-8 rounded-lg text-base shrink-0 flex items-center justify-center transition-all ${
                    emoji === em
                      ? 'bg-amber-500/30 border border-amber-500 scale-110'
                      : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Base Demand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2.5 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Snack">Snack</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Meal">Meal</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Base Daily Demand</label>
                <span className="font-mono text-amber-400 font-bold">{baseDemand}u</span>
              </div>
              <input
                type="number"
                min="10"
                max="500"
                value={baseDemand}
                onChange={(e) => setBaseDemand(Math.max(5, parseInt(e.target.value) || 0))}
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Shelf Life */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Kitchen Shelf Life</label>
            <select
              value={shelfLife}
              onChange={(e) => setShelfLife(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Fresh on demand">Fresh on demand (Beverage / Quick Fry)</option>
              <option value="3-4 hours">3-4 hours (Sandwich, Frankie)</option>
              <option value="4-6 hours">4-6 hours (Vada Pav, Samosa, Poha)</option>
              <option value="Full Day (Refrigerated)">Full Day (Cold drinks / Packaged)</option>
            </select>
          </div>

          {/* Weather Sensitivity */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Weather Tendency</label>
            <select
              value={weatherSensitivity}
              onChange={(e) => setWeatherSensitivity(e.target.value as any)}
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="neutral">All-Weather (Stable demand year-round)</option>
              <option value="rain_surge">Rain/Monsoon Surge (+35% during rain/cold)</option>
              <option value="hot_surge">Heatwave Surge (+65% chilled during summer)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-slate-950 shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Menu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
