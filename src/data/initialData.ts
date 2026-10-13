import { FoodItemName, SalesRecord, WeatherCondition, DayOfWeek } from '../types/canteen';

export interface FoodItemMeta {
  name: FoodItemName;
  baseDemand: number;
  category: 'Snack' | 'Beverage' | 'Breakfast' | 'Meal';
  emoji: string;
  shelfLife: string;
  rainFactor: number;
  coldFactor: number;
  hotFactor: number;
}

export const FOOD_ITEMS_META: FoodItemMeta[] = [
  { name: 'Vada Pav', baseDemand: 85, category: 'Snack', emoji: '🥪', shelfLife: '4-6 hours', rainFactor: 1.35, coldFactor: 1.15, hotFactor: 0.90 },
  { name: 'Samosa', baseDemand: 75, category: 'Snack', emoji: '🥟', shelfLife: '5-7 hours', rainFactor: 1.40, coldFactor: 1.20, hotFactor: 0.85 },
  { name: 'Sandwich', baseDemand: 55, category: 'Snack', emoji: '🥪', shelfLife: '3-4 hours', rainFactor: 0.95, coldFactor: 1.00, hotFactor: 1.10 },
  { name: 'Misal Pav', baseDemand: 45, category: 'Breakfast', emoji: '🍲', shelfLife: '4 hours', rainFactor: 1.30, coldFactor: 1.25, hotFactor: 0.80 },
  { name: 'Poha', baseDemand: 50, category: 'Breakfast', emoji: '🥣', shelfLife: '3-5 hours', rainFactor: 1.05, coldFactor: 1.10, hotFactor: 1.00 },
  { name: 'Idli', baseDemand: 40, category: 'Breakfast', emoji: '⚪', shelfLife: '4 hours', rainFactor: 0.90, coldFactor: 1.05, hotFactor: 1.05 },
  { name: 'Tea', baseDemand: 130, category: 'Beverage', emoji: '☕', shelfLife: 'Fresh on demand', rainFactor: 1.50, coldFactor: 1.60, hotFactor: 0.75 },
  { name: 'Coffee', baseDemand: 65, category: 'Beverage', emoji: '🧋', shelfLife: 'Fresh on demand', rainFactor: 1.30, coldFactor: 1.45, hotFactor: 0.80 },
  { name: 'Cold Drink', baseDemand: 60, category: 'Beverage', emoji: '🥤', shelfLife: 'Refrigerated bottle', rainFactor: 0.40, coldFactor: 0.45, hotFactor: 1.70 },
];

export const DAYS_LIST: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const WEATHERS_LIST: WeatherCondition[] = ['Sunny', 'Cloudy', 'Rainy', 'Hot', 'Cold'];

// Generate 90 realistic initial records for the table and charts
export const generateInitialSalesRecords = (): SalesRecord[] => {
  const records: SalesRecord[] = [];
  const days = DAYS_LIST;
  const weathers: WeatherCondition[] = ['Sunny', 'Cloudy', 'Rainy', 'Hot', 'Cold'];
  
  // Starting date: 2026-06-01
  let currentDate = new Date(2026, 5, 1);
  let idCounter = 1;

  for (let dayOffset = 0; dayOffset < 20; dayOffset++) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const isHoliday = isWeekend ? 'Yes' : (dayOffset % 12 === 0 ? 'Yes' : 'No');
    const isSpecialEvent = (!isWeekend && dayOffset % 7 === 3) ? 'Yes' : 'No';

    // Weather variation
    const weather = dayOffset % 5 === 2 ? 'Rainy' : (dayOffset % 5 === 4 ? 'Hot' : (dayOffset % 5 === 1 ? 'Cloudy' : (dayOffset % 7 === 0 ? 'Cold' : 'Sunny')));

    // Attendance
    let attendance = 850;
    if (isHoliday === 'Yes') attendance = 240;
    else if (isSpecialEvent === 'Yes') attendance = 1180;
    else if (isWeekend) attendance = 420;
    else if (dayOfWeek === 'Monday' || dayOfWeek === 'Friday') attendance = 940;
    else attendance = 820;

    for (const item of FOOD_ITEMS_META) {
      let mult = 1.0;
      if (weather === 'Rainy') mult = item.rainFactor;
      else if (weather === 'Hot') mult = item.hotFactor;
      else if (weather === 'Cold') mult = item.coldFactor;
      else if (weather === 'Cloudy') mult = 1.05;

      const attFactor = attendance / 800;
      const eventMult = isSpecialEvent === 'Yes' ? 1.35 : 1.0;
      const holMult = isHoliday === 'Yes' ? 0.35 : 1.0;

      const prevSales = Math.round(item.baseDemand * 0.95);
      const calculated = Math.round((item.baseDemand * 0.5 * attFactor * mult * eventMult * holMult) + (0.35 * prevSales));
      const unitsSold = Math.max(5, calculated);

      records.push({
        id: `REC-${idCounter++}`,
        Date: dateStr,
        Day: dayOfWeek,
        Weather: weather,
        Previous_Day_Sales: prevSales,
        Is_Holiday: isHoliday,
        Is_Special_Event: isSpecialEvent,
        Student_Attendance: attendance,
        Food_Item: item.name,
        Units_Sold: unitsSold
      });
    }
  }

  return records;
};

export const VIVA_QUESTIONS = [
  {
    q: "1. Why choose Random Forest Regressor over Linear Regression for canteen demand prediction?",
    a: "Linear Regression assumes strict linear additivity between features. In canteen operations, conditions interact non-linearly: for example, Rainy weather dramatically multiplies Tea and Samosa demand (+40%) while sharply dampening Cold Drinks (-60%). A Random Forest ensemble of decision trees models these high-order interactions and non-linear step thresholds without overfitting."
  },
  {
    q: "2. What are the key input features fed into the AI model?",
    a: "Seven core features: Student Attendance (highest weight ~34%), Food Item (categorical ~28%), Previous Day Sales (~16%), Weather (~10%), Special Event / Fest (~6%), Day of Week (~4%), and Holiday (~2%)."
  },
  {
    q: "3. What is the difference between MAE and MSE?",
    a: "MAE (Mean Absolute Error) measures the average magnitude of prediction errors in actual food units (e.g. error of ~4 units). MSE (Mean Squared Error) squares the errors before averaging, which heavily penalizes large unexpected prediction outliers."
  },
  {
    q: "4. What does an R² score of 0.942 indicate?",
    a: "R² (Coefficient of Determination) represents the proportion of total variance in food demand explained by the regression model. An R² of 0.942 means 94.2% of the variations in canteen sales are successfully predicted from the daily conditions."
  },
  {
    q: "5. How are categorical variables preprocessed before training?",
    a: "We use One-Hot Encoding (OHE) via Scikit-Learn's ColumnTransformer. Categorical features like Day (Monday-Sunday), Weather (Sunny, Rainy, etc.), and Food Item are mapped to binary columns (0 or 1), while continuous variables (Attendance, Previous Sales) are scaled."
  },
  {
    q: "6. How does this system directly reduce college food wastage?",
    a: "By providing canteen chefs with a recommended preparation range (e.g. 85–90 units with a 5% safety buffer) 24 hours prior, cooks avoid arbitrarily frying 150 samosas on rainy exam days or holiday weekends when attendance drops to 250."
  }
];

export const PRESET_SCENARIOS = [
  {
    title: "Monsoon Fest Rush",
    desc: "Rainy college fest with 1,200 attendance",
    badge: "High Demand",
    foodItem: 'Samosa' as FoodItemName,
    day: 'Wednesday' as DayOfWeek,
    weather: 'Rainy' as WeatherCondition,
    attendance: 1200,
    prevSales: 95,
    holiday: 'No' as const,
    specialEvent: 'Yes' as const
  },
  {
    title: "Lazy Exam Sunday",
    desc: "Quiet weekend with minimal campus footfall",
    badge: "Low Demand",
    foodItem: 'Vada Pav' as FoodItemName,
    day: 'Sunday' as DayOfWeek,
    weather: 'Sunny' as WeatherCondition,
    attendance: 260,
    prevSales: 35,
    holiday: 'Yes' as const,
    specialEvent: 'No' as const
  },
  {
    title: "Scorching Hot Friday",
    desc: "High temp afternoon, peak cold beverages",
    badge: "Beverage Spike",
    foodItem: 'Cold Drink' as FoodItemName,
    day: 'Friday' as DayOfWeek,
    weather: 'Hot' as WeatherCondition,
    attendance: 980,
    prevSales: 80,
    holiday: 'No' as const,
    specialEvent: 'No' as const
  },
  {
    title: "Regular Busy Monday",
    desc: "Standard academic start of week",
    badge: "Standard",
    foodItem: 'Tea' as FoodItemName,
    day: 'Monday' as DayOfWeek,
    weather: 'Cloudy' as WeatherCondition,
    attendance: 920,
    prevSales: 130,
    holiday: 'No' as const,
    specialEvent: 'No' as const
  }
];
