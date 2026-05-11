import { useState } from 'react'
import { 
  DollarSign, 
  Percent, 
  Save,
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useDataStore } from '../hooks/useDataStore'

export default function SettingsPanel() {
  const { data, updateSettings } = useDataStore()
  const [settings, setSettings] = useState({ ...data.settings })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-dark-400">Configure your application preferences and defaults</p>
      </div>

      {/* Currency & Pricing */}
      <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary-500" />
          Currency & Pricing
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-dark-400 mb-2">Currency Symbol</label>
            <input
              type="text"
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Default Margin (%)</label>
            <input
              type="number"
              value={settings.defaultMargin}
              onChange={(e) => setSettings({ ...settings, defaultMargin: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Minimum Job Price ($)</label>
            <input
              type="number"
              value={settings.minimumJobPrice}
              onChange={(e) => setSettings({ ...settings, minimumJobPrice: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Setup Fee ($)</label>
            <input
              type="number"
              value={settings.setupFee}
              onChange={(e) => setSettings({ ...settings, setupFee: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Packaging Cost ($)</label>
            <input
              type="number"
              value={settings.packagingCost}
              onChange={(e) => setSettings({ ...settings, packagingCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Percent className="w-5 h-5 text-primary-500" />
          Operating Costs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-dark-400 mb-2">Electricity Rate ($/kWh)</label>
            <input
              type="number"
              step="0.01"
              value={settings.electricityRate}
              onChange={(e) => setSettings({ ...settings, electricityRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Labor Rate ($/hour)</label>
            <input
              type="number"
              value={settings.laborRate}
              onChange={(e) => setSettings({ ...settings, laborRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
        <h2 className="text-xl font-semibold text-white mb-6">Advanced Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
            <div>
              <div className="text-white font-medium">Advanced Mode</div>
              <div className="text-dark-400 text-sm">Show additional calculation options</div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, advancedMode: !settings.advancedMode })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.advancedMode ? 'bg-primary-600' : 'bg-dark-700'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.advancedMode ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" />
          Data Management
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-dark-800 rounded-xl">
            <div className="text-white font-medium mb-2">Export Data</div>
            <p className="text-dark-400 text-sm mb-4">
              Download all your quotes, inventory, and settings as a JSON file for backup.
            </p>
            <button
              onClick={() => {
                const dataStr = localStorage.getItem('3d-print-calculator-data')
                if (dataStr) {
                  const blob = new Blob([dataStr], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `3d-print-backup-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }
              }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
            >
              Export Data
            </button>
          </div>

          <div className="p-4 bg-dark-800 rounded-xl">
            <div className="text-white font-medium mb-2">Import Data</div>
            <p className="text-dark-400 text-sm mb-4">
              Restore your data from a previously exported JSON backup file.
            </p>
            <label className="inline-block px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors cursor-pointer">
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      try {
                        const imported = JSON.parse(event.target.result)
                        localStorage.setItem('3d-print-calculator-data', JSON.stringify(imported))
                        window.location.reload()
                      } catch (err) {
                        alert('Invalid backup file')
                      }
                    }
                    reader.readAsText(file)
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="text-red-500 font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </div>
            <p className="text-dark-400 text-sm mb-4">
              Reset all data to default values. This action cannot be undone.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                  localStorage.removeItem('3d-print-calculator-data')
                  window.location.reload()
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <div className="flex items-center gap-2 text-green-500 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>Saved successfully!</span>
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-semibold"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>

      {/* Info */}
      <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800 text-center">
        <div className="text-white font-semibold mb-2">3D Print Calculator Pro</div>
        <div className="text-dark-400 text-sm">Version 1.0.0</div>
        <div className="text-dark-500 text-xs mt-2">
          All data is stored locally in your browser. No server required.
        </div>
      </div>
    </div>
  )
}
