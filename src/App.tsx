/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivePage, FoodItemName, SalesRecord } from './types/canteen';
import { User } from './types/auth';
import { FOOD_ITEMS_META, FoodItemMeta } from './data/initialData';
import { AuthService } from './services/authService';
import { UserDataService } from './services/userDataService';
import {
  TopHeader,
  DesktopSidebar,
  BottomTabBar
} from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { PredictView } from './components/PredictView';
import { SalesDataView } from './components/SalesDataView';
import { AnalyticsView } from './components/AnalyticsView';
import { AiModelView } from './components/AiModelView';
import { AboutView } from './components/AboutView';
import { AuthView } from './components/AuthView';
import { AddMenuItemModal } from './components/AddMenuItemModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [selectedFoodItemForPredict, setSelectedFoodItemForPredict] = useState<FoodItemName>('Vada Pav');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [appToast, setAppToast] = useState<string | null>(null);

  // Food Items State per logged-in user
  const [foodItems, setFoodItems] = useState<FoodItemMeta[]>(() => {
    const user = AuthService.getCurrentUser();
    return UserDataService.getUserMenu(user ? user.id : 'guest');
  });

  // Sales Records State strictly per logged-in user (Empty by default for new accounts)
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(() => {
    const user = AuthService.getCurrentUser();
    return UserDataService.getUserSales(user ? user.id : 'guest');
  });

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Sync state whenever the active user account changes
  useEffect(() => {
    const uid = currentUser ? currentUser.id : 'guest';
    setSalesRecords(UserDataService.getUserSales(uid));
    setFoodItems(UserDataService.getUserMenu(uid));
  }, [currentUser]);

  const showToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 3200);
  };

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setSalesRecords(UserDataService.getUserSales(user.id));
    setFoodItems(UserDataService.getUserMenu(user.id));
    setActivePage('dashboard');
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setSalesRecords(UserDataService.getUserSales('guest'));
    setFoodItems(UserDataService.getUserMenu('guest'));
    setActivePage('dashboard');
    showToast('Logged out successfully.');
  };

  // Handle adding a new food item to the menu for the current user
  const handleAddNewMenuItem = (newItem: FoodItemMeta) => {
    const uid = currentUser ? currentUser.id : 'guest';
    const updated = UserDataService.addMenuItem(uid, newItem);
    setFoodItems(updated);
    showToast(`Added "${newItem.name}" to canteen menu!`);
  };

  // Handle quick item jump from Dashboard to Predict Demand view
  const handleQuickPredict = (itemName: string) => {
    setSelectedFoodItemForPredict(itemName);
    setActivePage('predict');
  };

  const handleAddRecord = (record: SalesRecord) => {
    const uid = currentUser ? currentUser.id : 'guest';
    const updated = UserDataService.addSalesRecord(uid, record);
    setSalesRecords(updated);
    showToast(`Added ${record.Units_Sold} units of ${record.Food_Item}!`);
  };

  const handleResetDataset = () => {
    const uid = currentUser ? currentUser.id : 'guest';
    UserDataService.saveUserSales(uid, []);
    setSalesRecords([]);
    showToast('Sales records cleared for current account.');
  };

  // Render the active view
  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardView
            salesRecords={salesRecords}
            foodItems={foodItems}
            currentUser={currentUser}
            setActivePage={setActivePage}
            onQuickPredict={handleQuickPredict}
            onOpenAddItem={() => setIsAddItemModalOpen(true)}
            onAddRecord={handleAddRecord}
          />
        );
      case 'predict':
        return (
          <PredictView
            key={selectedFoodItemForPredict}
            initialFoodItem={selectedFoodItemForPredict}
            foodItems={foodItems}
            currentUser={currentUser}
            onOpenAddItem={() => setIsAddItemModalOpen(true)}
          />
        );
      case 'sales_data':
        return (
          <SalesDataView
            salesRecords={salesRecords}
            foodItems={foodItems}
            currentUser={currentUser}
            onAddRecord={handleAddRecord}
            onResetDataset={handleResetDataset}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            salesRecords={salesRecords}
            foodItems={foodItems}
            onNavigateToSales={() => setActivePage('sales_data')}
          />
        );
      case 'ai_model':
        return <AiModelView />;
      case 'about':
        return <AboutView />;
      case 'auth':
        return (
          <AuthView
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <DashboardView
            salesRecords={salesRecords}
            foodItems={foodItems}
            currentUser={currentUser}
            setActivePage={setActivePage}
            onQuickPredict={handleQuickPredict}
            onOpenAddItem={() => setIsAddItemModalOpen(true)}
            onAddRecord={handleAddRecord}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {appToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl animate-in slide-in-from-top-2 flex items-center gap-2">
          <span>✓</span>
          <span>{appToast}</span>
        </div>
      )}

      {/* Top Application Header */}
      <TopHeader
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex w-full">
        {/* Persistent Desktop Sidebar */}
        {!isMobileFrame && (
          <DesktopSidebar
            activePage={activePage}
            setActivePage={setActivePage}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 flex justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          {isMobileFrame ? (
            /* Smartphone Shell Container */
            <div className="w-full max-w-[430px] my-auto bg-slate-900 border-[6px] sm:border-[8px] border-slate-800 rounded-[38px] sm:rounded-[44px] shadow-2xl shadow-black/80 overflow-hidden flex flex-col min-h-[740px] max-h-[880px] relative">
              {/* Phone Dynamic Island / Speaker notch */}
              <div className="bg-slate-900 pt-3 pb-2 px-6 flex items-center justify-between border-b border-slate-800/40 select-none shrink-0 z-20">
                <span className="text-[11px] font-bold text-slate-300 font-mono">9:41</span>
                <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Scrollable View Inside Phone */}
              <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                {renderActiveView()}
              </div>

              {/* Fixed Bottom Tab Bar anchored within Phone Frame */}
              <div className="shrink-0 bg-slate-950 border-t border-slate-800">
                <BottomTabBar activePage={activePage} setActivePage={setActivePage} />
              </div>

              {/* Home indicator bar */}
              <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="w-28 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          ) : (
            /* Expanded Full-Width View */
            <div className="w-full max-w-5xl mx-auto">
              {renderActiveView()}
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom Tab Bar on standard mobile viewports when not in frame */}
      {!isMobileFrame && (
        <div className="lg:hidden">
          <BottomTabBar activePage={activePage} setActivePage={setActivePage} />
        </div>
      )}

      {/* Add New Menu Item Modal */}
      <AddMenuItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={handleAddNewMenuItem}
        existingItems={foodItems}
      />

      {/* Login / Sign Up / Forgot Password Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
