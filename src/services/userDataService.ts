import { SalesRecord, UserPredictionRecord } from '../types/canteen';
import { FoodItemMeta, FOOD_ITEMS_META } from '../data/initialData';

export class UserDataService {
  private static getSalesKey(userId: string): string {
    return `canteen_sales_${userId}`;
  }

  private static getPredictionsKey(userId: string): string {
    return `canteen_predictions_${userId}`;
  }

  private static getMenuKey(userId: string): string {
    return `canteen_menu_${userId}`;
  }

  /**
   * Initializes a brand-new user with completely fresh, empty data
   */
  public static initNewUserData(userId: string): void {
    try {
      localStorage.setItem(this.getSalesKey(userId), JSON.stringify([]));
      localStorage.setItem(this.getPredictionsKey(userId), JSON.stringify([]));
      localStorage.setItem(this.getMenuKey(userId), JSON.stringify(FOOD_ITEMS_META));
    } catch (e) {
      console.error('Failed to init new user data:', e);
    }
  }

  /**
   * Retrieves sales records belonging ONLY to the specified user
   */
  public static getUserSales(userId: string): SalesRecord[] {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(this.getSalesKey(userId));
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(`Failed to get sales for user ${userId}:`, e);
    }
    return [];
  }

  /**
   * Saves sales records for the specified user
   */
  public static saveUserSales(userId: string, records: SalesRecord[]): void {
    if (!userId) return;
    try {
      localStorage.setItem(this.getSalesKey(userId), JSON.stringify(records));
    } catch (e) {
      console.error(`Failed to save sales for user ${userId}:`, e);
    }
  }

  /**
   * Adds a new sales record to the user's dataset
   */
  public static addSalesRecord(userId: string, record: SalesRecord): SalesRecord[] {
    const existing = this.getUserSales(userId);
    const updated = [record, ...existing];
    this.saveUserSales(userId, updated);
    return updated;
  }

  /**
   * Retrieves prediction history for the specified user
   */
  public static getUserPredictions(userId: string): UserPredictionRecord[] {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(this.getPredictionsKey(userId));
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(`Failed to get predictions for user ${userId}:`, e);
    }
    return [];
  }

  /**
   * Adds a prediction to the user's prediction history
   */
  public static addPrediction(
    userId: string,
    prediction: Omit<UserPredictionRecord, 'id' | 'userId' | 'timestamp'>
  ): UserPredictionRecord {
    const existing = this.getUserPredictions(userId);
    const newRecord: UserPredictionRecord = {
      id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      timestamp: new Date().toISOString(),
      ...prediction,
    };
    const updated = [newRecord, ...existing];
    try {
      localStorage.setItem(this.getPredictionsKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.error(`Failed to save prediction for user ${userId}:`, e);
    }
    return newRecord;
  }

  /**
   * Clears prediction history for the specified user
   */
  public static clearPredictions(userId: string): void {
    if (!userId) return;
    try {
      localStorage.setItem(this.getPredictionsKey(userId), JSON.stringify([]));
    } catch (e) {
      console.error(`Failed to clear predictions for user ${userId}:`, e);
    }
  }

  /**
   * Retrieves the menu items for the specified user
   */
  public static getUserMenu(userId: string): FoodItemMeta[] {
    if (!userId) return FOOD_ITEMS_META;
    try {
      const data = localStorage.getItem(this.getMenuKey(userId));
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(`Failed to get menu for user ${userId}:`, e);
    }
    return FOOD_ITEMS_META;
  }

  /**
   * Adds a custom menu item for the specified user
   */
  public static addMenuItem(userId: string, item: FoodItemMeta): FoodItemMeta[] {
    const existing = this.getUserMenu(userId);
    const updated = [...existing, item];
    try {
      localStorage.setItem(this.getMenuKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.error(`Failed to save menu for user ${userId}:`, e);
    }
    return updated;
  }
}
