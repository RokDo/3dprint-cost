import { v4 as uuidv4 } from 'uuid';

// Currency configurations
export const CURRENCIES = {
  USD: { symbol: '$', position: 'before', locale: 'en-US' },
  EUR: { symbol: '€', position: 'after', locale: 'de-DE' },
  GBP: { symbol: '£', position: 'before', locale: 'en-GB' },
  PLN: { symbol: 'zł', position: 'after', locale: 'pl-PL' },
  JPY: { symbol: '¥', position: 'before', locale: 'ja-JP' },
  CNY: { symbol: '¥', position: 'before', locale: 'zh-CN' },
  AUD: { symbol: 'A$', position: 'before', locale: 'en-AU' },
  CAD: { symbol: 'C$', position: 'before', locale: 'en-CA' },
};

// Material types with default properties
export const MATERIALS = {
  PLA: { name: 'PLA', density: 1.24, avgTemp: 200, bedTemp: 60, difficulty: 'easy' },
  PETG: { name: 'PETG', density: 1.27, avgTemp: 240, bedTemp: 80, difficulty: 'medium' },
  ABS: { name: 'ABS', density: 1.04, avgTemp: 250, bedTemp: 100, difficulty: 'hard' },
  ASA: { name: 'ASA', density: 1.07, avgTemp: 250, bedTemp: 100, difficulty: 'hard' },
  TPU: { name: 'TPU', density: 1.21, avgTemp: 230, bedTemp: 60, difficulty: 'hard' },
  NYLON: { name: 'Nylon', density: 1.14, avgTemp: 260, bedTemp: 80, difficulty: 'expert' },
  PC: { name: 'Polycarbonate', density: 1.20, avgTemp: 280, bedTemp: 110, difficulty: 'expert' },
  PVA: { name: 'PVA (Support)', density: 1.23, avgTemp: 200, bedTemp: 60, difficulty: 'medium' },
  HIPS: { name: 'HIPS (Support)', density: 1.04, avgTemp: 235, bedTemp: 100, difficulty: 'medium' },
  OTHER: { name: 'Other', density: 1.10, avgTemp: 220, bedTemp: 60, difficulty: 'medium' },
};

// Default printer profiles
export const DEFAULT_PRINTER_PROFILES = [
  {
    id: 'default-fdm',
    name: 'Standard FDM Printer',
    hourlyRate: 5.0,
    powerWatts: 150,
    maintenanceFactor: 0.02,
    efficiency: 0.95,
    reliability: 0.95,
  },
  {
    id: 'premium-fdm',
    name: 'Premium FDM Printer',
    hourlyRate: 8.0,
    powerWatts: 200,
    maintenanceFactor: 0.015,
    efficiency: 0.98,
    reliability: 0.98,
  },
  {
    id: 'resin-standard',
    name: 'Standard Resin Printer',
    hourlyRate: 6.0,
    powerWatts: 100,
    maintenanceFactor: 0.025,
    efficiency: 0.94,
    reliability: 0.92,
  },
  {
    id: 'industrial',
    name: 'Industrial Grade',
    hourlyRate: 15.0,
    powerWatts: 500,
    maintenanceFactor: 0.01,
    efficiency: 0.99,
    reliability: 0.99,
  },
];

// Quote statuses
export const QUOTE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  REVISED: 'revised',
  EXPIRED: 'expired',
};

// Stock level thresholds
export const STOCK_LEVELS = {
  LOW: 20,
  CRITICAL: 10,
};

// Generate unique ID
export const generateId = () => uuidv4();

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return config.position === 'before' 
    ? `${config.symbol}${formatted}` 
    : `${formatted}${config.symbol}`;
};

// Calculate material cost per gram
export const calculateCostPerGram = (spoolCost, spoolWeight) => {
  if (spoolWeight <= 0) return 0;
  return spoolCost / spoolWeight;
};

// Calculate print job costs
export const calculatePrintCost = (params) => {
  const {
    filamentWeight,
    supportWeight = 0,
    printTimeHours,
    costPerGram,
    hourlyRate,
    powerWatts,
    energyCostPerKwh,
    purgePercentage = 10,
    failureRate = 5,
    postProcessingCost = 0,
    useDetailedCalculation = true,
  } = params;

  // Material calculations
  const totalFilament = filamentWeight + supportWeight;
  const purgeMultiplier = 1 + (purgePercentage / 100);
  const failureMultiplier = 1 + (failureRate / 100);
  const finalFilament = totalFilament * purgeMultiplier * failureMultiplier;
  const materialCost = finalFilament * costPerGram;

  // Machine calculations
  let machineCost = printTimeHours * hourlyRate;
  let energyCost = 0;

  if (useDetailedCalculation) {
    energyCost = (powerWatts / 1000) * printTimeHours * energyCostPerKwh;
  }

  const totalCost = materialCost + machineCost + energyCost + postProcessingCost;

  return {
    materialCost,
    machineCost,
    energyCost,
    postProcessingCost,
    totalCost,
    breakdown: {
      baseFilament: totalFilament,
      withPurge: totalFilament * purgeMultiplier,
      withFailure: finalFilament,
      materialCost,
      energyCost,
      machineCost,
      totalCost,
    },
  };
};

// Calculate quantity discount
export const calculateQuantityDiscount = (unitPrice, quantity) => {
  let discount = 0;
  
  if (quantity >= 100) discount = 0.20;
  else if (quantity >= 50) discount = 0.15;
  else if (quantity >= 20) discount = 0.10;
  else if (quantity >= 10) discount = 0.05;
  else if (quantity >= 5) discount = 0.03;

  const discountedPrice = unitPrice * (1 - discount);
  const totalPrice = discountedPrice * quantity;
  const savings = (unitPrice * quantity) - totalPrice;

  return {
    unitPrice: discountedPrice,
    totalPrice,
    savings,
    discountPercent: discount * 100,
  };
};

// Get stock level status
export const getStockStatus = (currentWeight, fullWeight) => {
  const percentage = (currentWeight / fullWeight) * 100;
  
  if (percentage <= STOCK_LEVELS.CRITICAL) return 'critical';
  if (percentage <= STOCK_LEVELS.LOW) return 'low';
  return 'good';
};

// Profit optimization suggestions
export const getProfitSuggestions = (costs, margin) => {
  const suggestions = [];
  
  if (margin < 20) {
    suggestions.push({
      type: 'margin',
      message: 'Consider increasing margin to at least 20% for sustainable business',
      impact: 'high',
    });
  }
  
  if (costs.materialCost > costs.totalCost * 0.5) {
    suggestions.push({
      type: 'material',
      message: 'Material costs are high. Consider bulk purchasing or alternative materials',
      impact: 'medium',
    });
  }
  
  if (costs.machineCost > costs.totalCost * 0.4) {
    suggestions.push({
      type: 'efficiency',
      message: 'Machine costs are significant. Optimize print settings or upgrade equipment',
      impact: 'medium',
    });
  }

  return suggestions;
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

// Class names helper
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
