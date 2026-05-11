import { useState, useEffect } from 'react'

const STORAGE_KEY = '3d-print-calculator-data'

const defaultData = {
  quotes: [],
  inventory: [
    {
      id: '1',
      name: 'PLA Basic Black',
      brand: 'Generic',
      type: 'PLA',
      color: 'Black',
      weight: 1000,
      usedWeight: 0,
      costPerKg: 25,
      density: 1.24,
      diameter: 1.75,
    },
    {
      id: '2',
      name: 'PETG Clear',
      brand: 'eSUN',
      type: 'PETG',
      color: 'Clear',
      weight: 1000,
      usedWeight: 0,
      costPerKg: 35,
      density: 1.27,
      diameter: 1.75,
    },
    {
      id: '3',
      name: 'ABS White',
      brand: 'Hatchbox',
      type: 'ABS',
      color: 'White',
      weight: 1000,
      usedWeight: 0,
      costPerKg: 30,
      density: 1.04,
      diameter: 1.75,
    },
  ],
  printers: [
    {
      id: '1',
      name: 'Prusa MK4',
      hourlyRate: 5,
      powerUsage: 150,
      maintenanceFactor: 1.1,
      efficiency: 0.95,
      nozzleSize: 0.4,
      maxTemp: 300,
      isActive: true,
    },
    {
      id: '2',
      name: 'Bambu Lab X1C',
      hourlyRate: 8,
      powerUsage: 200,
      maintenanceFactor: 1.0,
      efficiency: 0.98,
      nozzleSize: 0.4,
      maxTemp: 300,
      isActive: true,
    },
    {
      id: '3',
      name: 'Ender 3 V3',
      hourlyRate: 3,
      powerUsage: 120,
      maintenanceFactor: 1.2,
      efficiency: 0.90,
      nozzleSize: 0.4,
      maxTemp: 260,
      isActive: false,
    },
  ],
  settings: {
    currency: '$',
    currencySymbol: '$',
    taxRate: 0,
    defaultMargin: 30,
    minimumJobPrice: 10,
    setupFee: 5,
    electricityRate: 0.12,
    laborRate: 15,
    packagingCost: 2,
    advancedMode: false,
  },
}

export function useDataStore() {
  const [data, setData] = useState(defaultData)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setData({ ...defaultData, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setIsLoaded(true)
  }

  const saveData = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  }

  const updateData = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }))
    setTimeout(() => saveData(), 100)
  }

  const addQuote = (quote) => {
    const newQuote = {
      ...quote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    updateData('quotes', [...data.quotes, newQuote])
    return newQuote
  }

  const updateQuote = (id, updates) => {
    const updated = data.quotes.map(q => 
      q.id === id ? { ...q, ...updates } : q
    )
    updateData('quotes', updated)
  }

  const deleteQuote = (id) => {
    updateData('quotes', data.quotes.filter(q => q.id !== id))
  }

  const addInventory = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    }
    updateData('inventory', [...data.inventory, newItem])
    return newItem
  }

  const updateInventory = (id, updates) => {
    const updated = data.inventory.map(i => 
      i.id === id ? { ...i, ...updates } : i
    )
    updateData('inventory', updated)
  }

  const deleteInventory = (id) => {
    updateData('inventory', data.inventory.filter(i => i.id !== id))
  }

  const updateInventoryUsage = (id, usedWeight) => {
    const item = data.inventory.find(i => i.id === id)
    if (item) {
      updateInventory(id, { usedWeight: item.usedWeight + usedWeight })
    }
  }

  const addPrinter = (printer) => {
    const newPrinter = {
      ...printer,
      id: Date.now().toString(),
    }
    updateData('printers', [...data.printers, newPrinter])
    return newPrinter
  }

  const updatePrinter = (id, updates) => {
    const updated = data.printers.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    updateData('printers', updated)
  }

  const deletePrinter = (id) => {
    updateData('printers', data.printers.filter(p => p.id !== id))
  }

  const updateSettings = (settings) => {
    updateData('settings', { ...data.settings, ...settings })
  }

  return {
    data,
    isLoaded,
    loadData,
    saveData,
    updateData,
    addQuote,
    updateQuote,
    deleteQuote,
    addInventory,
    updateInventory,
    deleteInventory,
    updateInventoryUsage,
    addPrinter,
    updatePrinter,
    deletePrinter,
    updateSettings,
  }
}
