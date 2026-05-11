import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Printer,
  Zap,
  DollarSign,
  Settings,
  CheckCircle
} from 'lucide-react'
import { useDataStore } from '../hooks/useDataStore'

export default function Printers() {
  const { data, addPrinter, updatePrinter, deletePrinter } = useDataStore()
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    hourlyRate: 5,
    powerUsage: 150,
    maintenanceFactor: 1.0,
    efficiency: 0.95,
    nozzleSize: 0.4,
    maxTemp: 300,
    isActive: true,
  })

  const handleAddPrinter = () => {
    addPrinter(newPrinter)
    setNewPrinter({
      name: '',
      hourlyRate: 5,
      powerUsage: 150,
      maintenanceFactor: 1.0,
      efficiency: 0.95,
      nozzleSize: 0.4,
      maxTemp: 300,
      isActive: true,
    })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Printers</h1>
          <p className="text-dark-400">Manage your 3D printer profiles and settings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Printer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <Printer className="w-6 h-6 text-primary-500" />
            <span className="text-dark-400">Total Printers</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.printers.length}</div>
        </div>
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-dark-400">Active</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.printers.filter(p => p.isActive).length}
          </div>
        </div>
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-500" />
            <span className="text-dark-400">Avg Hourly Rate</span>
          </div>
          <div className="text-3xl font-bold text-white">
            ${data.printers.length > 0 
              ? (data.printers.reduce((sum, p) => sum + p.hourlyRate, 0) / data.printers.length).toFixed(2)
              : '0.00'
            }
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-md border border-dark-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Printer</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={newPrinter.hourlyRate}
                    onChange={(e) => setNewPrinter({ ...newPrinter, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Power Usage (W)</label>
                  <input
                    type="number"
                    value={newPrinter.powerUsage}
                    onChange={(e) => setNewPrinter({ ...newPrinter, powerUsage: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Maintenance Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrinter.maintenanceFactor}
                    onChange={(e) => setNewPrinter({ ...newPrinter, maintenanceFactor: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Efficiency</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrinter.efficiency}
                    onChange={(e) => setNewPrinter({ ...newPrinter, efficiency: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Nozzle Size (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrinter.nozzleSize}
                    onChange={(e) => setNewPrinter({ ...newPrinter, nozzleSize: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Max Temp (°C)</label>
                  <input
                    type="number"
                    value={newPrinter.maxTemp}
                    onChange={(e) => setNewPrinter({ ...newPrinter, maxTemp: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newPrinter.isActive}
                  onChange={(e) => setNewPrinter({ ...newPrinter, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-dark-800 border-dark-700 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-white">Active</label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-3 bg-dark-800 hover:bg-dark-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrinter}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
              >
                Add Printer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.printers.map((printer) => {
          const isEditing = editingId === printer.id

          return (
            <div 
              key={printer.id}
              className={`bg-dark-900 rounded-2xl p-6 border transition-all card-hover ${
                printer.isActive ? 'border-dark-800' : 'border-dark-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    printer.isActive ? 'bg-primary-600/20' : 'bg-dark-800'
                  }`}>
                    <Printer className={`w-6 h-6 ${
                      printer.isActive ? 'text-primary-500' : 'text-dark-500'
                    }`} />
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={printer.name}
                        onChange={(e) => updatePrinter(printer.id, { name: e.target.value })}
                        className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                      />
                    ) : (
                      <h3 className="text-xl font-semibold text-white">{printer.name}</h3>
                    )}
                    <div className={`text-sm mt-1 ${
                      printer.isActive ? 'text-green-500' : 'text-dark-500'
                    }`}>
                      {printer.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingId(printer.id)}
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deletePrinter(printer.id)}
                    className="p-2 text-dark-400 hover:text-red-500 hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-dark-400 text-sm">Hourly Rate</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={printer.hourlyRate}
                      onChange={(e) => updatePrinter(printer.id, { hourlyRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <div className="text-white font-semibold">${printer.hourlyRate.toFixed(2)}/hr</div>
                  )}
                </div>

                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-dark-400 text-sm">Power Usage</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={printer.powerUsage}
                      onChange={(e) => updatePrinter(printer.id, { powerUsage: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <div className="text-white font-semibold">{printer.powerUsage}W</div>
                  )}
                </div>

                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-blue-500" />
                    <span className="text-dark-400 text-sm">Maintenance</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={printer.maintenanceFactor}
                      onChange={(e) => updatePrinter(printer.id, { maintenanceFactor: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <div className="text-white font-semibold">x{printer.maintenanceFactor.toFixed(2)}</div>
                  )}
                </div>

                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-dark-400 text-sm">Efficiency</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={printer.efficiency}
                      onChange={(e) => updatePrinter(printer.id, { efficiency: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <div className="text-white font-semibold">{(printer.efficiency * 100).toFixed(0)}%</div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-dark-400">
                  <span>Nozzle: {printer.nozzleSize}mm</span>
                  <span>Max Temp: {printer.maxTemp}°C</span>
                </div>
                <button
                  onClick={() => updatePrinter(printer.id, { isActive: !printer.isActive })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    printer.isActive
                      ? 'bg-dark-800 text-dark-400 hover:text-white'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {printer.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {data.printers.length === 0 && (
        <div className="text-center py-12 text-dark-400">
          <Printer className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No printers added yet</p>
        </div>
      )}
    </div>
  )
}
