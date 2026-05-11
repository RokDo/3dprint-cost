import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Clock, 
  Zap, 
  Users, 
  Package, 
  Plus, 
  Minus, 
  Save, 
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  Settings as SettingsIcon
} from 'lucide-react'
import { useDataStore } from '../hooks/useDataStore'

export default function Calculator() {
  const { data, addQuote, updateInventoryUsage } = useDataStore()
  const [parts, setParts] = useState([{
    id: Date.now(),
    name: 'Part 1',
    weight: 50,
    printTime: 2,
    materialId: data.inventory[0]?.id || '',
    quantity: 1,
  }])
  const [printerId, setPrinterId] = useState(data.printers[0]?.id || '')
  const [margin, setMargin] = useState(data.settings.defaultMargin)
  const [marginType, setMarginType] = useState('percentage')
  const [customMargin, setCustomMargin] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [laborHours, setLaborHours] = useState(0.5)
  const [packagingCost, setPackagingCost] = useState(data.settings.packagingCost)
  const [setupFee, setSetupFee] = useState(data.settings.setupFee)
  const [quoteName, setQuoteName] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')

  const printer = data.printers.find(p => p.id === printerId) || data.printers[0]
  
  const calculateCosts = () => {
    let totalMaterialCost = 0
    let totalMachineCost = 0
    let totalEnergyCost = 0
    let totalTime = 0

    parts.forEach(part => {
      const material = data.inventory.find(m => m.id === part.materialId)
      if (material && printer) {
        const materialCost = (part.weight / 1000) * material.costPerKg * part.quantity
        const machineCost = (part.printTime * printer.hourlyRate) * part.quantity
        const energyCost = (part.printTime * (printer.powerUsage / 1000) * data.settings.electricityRate) * part.quantity
        
        totalMaterialCost += materialCost
        totalMachineCost += machineCost
        totalEnergyCost += energyCost
        totalTime += part.printTime * part.quantity
      }
    })

    const laborCost = laborHours * data.settings.laborRate
    const baseCost = totalMaterialCost + totalMachineCost + totalEnergyCost + laborCost + packagingCost + setupFee
    
    let calculatedMargin = 0
    if (marginType === 'percentage') {
      calculatedMargin = baseCost * (margin / 100)
    } else {
      calculatedMargin = customMargin
    }

    const subtotal = baseCost + calculatedMargin
    const tax = subtotal * (data.settings.taxRate / 100)
    const total = subtotal + tax

    const profit = calculatedMargin
    const profitMargin = total > 0 ? (profit / total) * 100 : 0

    return {
      materialCost: totalMaterialCost,
      machineCost: totalMachineCost,
      energyCost: totalEnergyCost,
      laborCost,
      packagingCost,
      setupFee,
      baseCost,
      margin: calculatedMargin,
      subtotal,
      tax,
      total,
      profit,
      profitMargin,
      totalTime,
    }
  }

  const costs = calculateCosts()

  const addPart = () => {
    setParts([...parts, {
      id: Date.now(),
      name: `Part ${parts.length + 1}`,
      weight: 50,
      printTime: 2,
      materialId: data.inventory[0]?.id || '',
      quantity: 1,
    }])
  }

  const removePart = (id) => {
    if (parts.length > 1) {
      setParts(parts.filter(p => p.id !== id))
    }
  }

  const updatePart = (id, field, value) => {
    setParts(parts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const saveQuote = () => {
    const quote = {
      name: quoteName || `Quote ${new Date().toLocaleDateString()}`,
      notes: quoteNotes,
      parts: [...parts],
      printerId,
      margin,
      marginType,
      laborHours,
      packagingCost,
      setupFee,
      costs,
    }
    addQuote(quote)
    
    // Update inventory usage
    parts.forEach(part => {
      if (part.materialId) {
        updateInventoryUsage(part.materialId, part.weight * part.quantity)
      }
    })
    
    alert('Quote saved successfully!')
  }

  const formatCurrency = (amount) => {
    return `${data.settings.currencySymbol}${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cost Calculator</h1>
          <p className="text-dark-400">Calculate precise printing costs and generate quotes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Info */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <h2 className="text-xl font-semibold text-white mb-4">Quote Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Quote Name</label>
                <input
                  type="text"
                  value={quoteName}
                  onChange={(e) => setQuoteName(e.target.value)}
                  placeholder="Enter quote name..."
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Printer</label>
                <select
                  value={printerId}
                  onChange={(e) => setPrinterId(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  {data.printers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parts */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Parts</h2>
              <button
                onClick={addPart}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Part
              </button>
            </div>

            <div className="space-y-4">
              {parts.map((part, index) => (
                <div key={part.id} className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary-600/20 text-primary-500 rounded-lg flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={part.name}
                        onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                        className="bg-transparent border-none text-white font-medium focus:outline-none"
                      />
                    </div>
                    {parts.length > 1 && (
                      <button
                        onClick={() => removePart(part.id)}
                        className="text-dark-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">Weight (g)</label>
                      <input
                        type="number"
                        value={part.weight}
                        onChange={(e) => updatePart(part.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">Print Time (hrs)</label>
                      <input
                        type="number"
                        value={part.printTime}
                        onChange={(e) => updatePart(part.id, 'printTime', parseFloat(e.target.value) || 0)}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">Quantity</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updatePart(part.id, 'quantity', Math.max(1, part.quantity - 1))}
                          className="w-8 h-8 bg-dark-700 hover:bg-dark-600 rounded-lg flex items-center justify-center text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-medium w-8 text-center">{part.quantity}</span>
                        <button
                          onClick={() => updatePart(part.id, 'quantity', part.quantity + 1)}
                          className="w-8 h-8 bg-dark-700 hover:bg-dark-600 rounded-lg flex items-center justify-center text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">Material</label>
                      <select
                        value={part.materialId}
                        onChange={(e) => updatePart(part.id, 'materialId', e.target.value)}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                      >
                        {data.inventory.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({formatCurrency(m.costPerKg / 1000)}/g)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full mb-4"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Advanced Settings
              </h2>
              {showAdvanced ? <ChevronUp className="w-5 h-5 text-dark-400" /> : <ChevronDown className="w-5 h-5 text-dark-400" />}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-down">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Labor Hours</label>
                  <input
                    type="number"
                    value={laborHours}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Packaging ($)</label>
                  <input
                    type="number"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Setup Fee ($)</label>
                  <input
                    type="number"
                    value={setupFee}
                    onChange={(e) => setSetupFee(parseFloat(e.target.value) || 0)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Notes</label>
                  <input
                    type="text"
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 shadow-xl sticky top-6">
            <h2 className="text-lg font-semibold text-white/90 mb-2">Total Price</h2>
            <div className="text-5xl font-bold text-white mb-4 animate-number">
              {formatCurrency(costs.total)}
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-white/80 text-sm mb-2">
                <span>Profit</span>
                <span className="font-semibold text-white">{formatCurrency(costs.profit)}</span>
              </div>
              <div className="flex items-center justify-between text-white/80 text-sm">
                <span>Profit Margin</span>
                <span className="font-semibold text-white">{costs.profitMargin.toFixed(1)}%</span>
              </div>
            </div>

            <button
              onClick={saveQuote}
              className="w-full mt-4 bg-white text-primary-600 font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Quote
            </button>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
            
            <div className="space-y-3">
              <CostItem 
                icon={Package} 
                label="Material" 
                value={costs.materialCost} 
                color="bg-blue-500"
                formatCurrency={formatCurrency}
              />
              <CostItem 
                icon={Clock} 
                label="Machine Time" 
                value={costs.machineCost} 
                color="bg-green-500"
                formatCurrency={formatCurrency}
              />
              <CostItem 
                icon={Zap} 
                label="Energy" 
                value={costs.energyCost} 
                color="bg-yellow-500"
                formatCurrency={formatCurrency}
              />
              <CostItem 
                icon={Users} 
                label="Labor" 
                value={costs.laborCost} 
                color="bg-purple-500"
                formatCurrency={formatCurrency}
              />
              <CostItem 
                icon={DollarSign} 
                label="Packaging" 
                value={costs.packagingCost} 
                color="bg-pink-500"
                formatCurrency={formatCurrency}
              />
              <CostItem 
                icon={DollarSign} 
                label="Setup Fee" 
                value={costs.setupFee} 
                color="bg-orange-500"
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="border-t border-dark-700 mt-4 pt-4 space-y-2">
              <div className="flex items-center justify-between text-dark-400 text-sm">
                <span>Base Cost</span>
                <span>{formatCurrency(costs.baseCost)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm">Margin</span>
                <div className="flex items-center gap-2">
                  <select
                    value={marginType}
                    onChange={(e) => setMarginType(e.target.value)}
                    className="bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                  {marginType === 'percentage' ? (
                    <input
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none"
                    />
                  ) : (
                    <input
                      type="number"
                      value={customMargin}
                      onChange={(e) => setCustomMargin(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none"
                    />
                  )}
                </div>
                <span className="text-white font-medium">{formatCurrency(costs.margin)}</span>
              </div>

              {data.settings.taxRate > 0 && (
                <div className="flex items-center justify-between text-dark-400 text-sm">
                  <span>Tax ({data.settings.taxRate}%)</span>
                  <span>{formatCurrency(costs.tax)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-white font-semibold pt-2 border-t border-dark-700">
                <span>Total</span>
                <span>{formatCurrency(costs.total)}</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mt-4">
              <div className="flex h-3 rounded-full overflow-hidden bg-dark-800">
                <div 
                  className="bg-blue-500 transition-all duration-300" 
                  style={{ width: `${(costs.materialCost / costs.baseCost) * 100}%` }}
                />
                <div 
                  className="bg-green-500 transition-all duration-300" 
                  style={{ width: `${(costs.machineCost / costs.baseCost) * 100}%` }}
                />
                <div 
                  className="bg-yellow-500 transition-all duration-300" 
                  style={{ width: `${(costs.energyCost / costs.baseCost) * 100}%` }}
                />
                <div 
                  className="bg-purple-500 transition-all duration-300" 
                  style={{ width: `${(costs.laborCost / costs.baseCost) * 100}%` }}
                />
                <div 
                  className="bg-pink-500 transition-all duration-300" 
                  style={{ width: `${((costs.packagingCost + costs.setupFee) / costs.baseCost) * 100}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-dark-400">Material</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-dark-400">Machine</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-xs text-dark-400">Energy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-dark-400">Labor</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-xs text-dark-400">Other</span>
                </div>
              </div>
            </div>
          </div>

          {/* Print Time Summary */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Print Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Total Print Time</span>
                <span className="text-white font-medium">{costs.totalTime.toFixed(2)} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Total Weight</span>
                <span className="text-white font-medium">{parts.reduce((sum, p) => sum + (p.weight * p.quantity), 0)} g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Parts</span>
                <span className="text-white font-medium">{parts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CostItem({ icon: Icon, label, value, color, formatCurrency }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-dark-400 group-hover:text-white transition-colors">{label}</span>
      </div>
      <span className="text-white font-medium">{formatCurrency(value)}</span>
    </div>
  )
}
