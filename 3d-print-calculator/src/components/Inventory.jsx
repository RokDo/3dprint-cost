import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useDataStore } from '../hooks/useDataStore'

export default function Inventory() {
  const { data, addInventory, updateInventory, deleteInventory } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    brand: '',
    type: 'PLA',
    color: '',
    weight: 1000,
    usedWeight: 0,
    costPerKg: 25,
    density: 1.24,
    diameter: 1.75,
  })

  const filteredInventory = data.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesType
  })

  const handleAddItem = () => {
    addInventory(newItem)
    setNewItem({
      name: '',
      brand: '',
      type: 'PLA',
      color: '',
      weight: 1000,
      usedWeight: 0,
      costPerKg: 25,
      density: 1.24,
      diameter: 1.75,
    })
    setShowAddForm(false)
  }

  const handleUpdateItem = (id, updates) => {
    updateInventory(id, updates)
    setEditingId(null)
  }

  const getStockStatus = (item) => {
    const remaining = item.weight - item.usedWeight
    const percentage = (remaining / item.weight) * 100
    
    if (percentage < 20) return { status: 'critical', color: 'text-red-500', bg: 'bg-red-500' }
    if (percentage < 50) return { status: 'low', color: 'text-orange-500', bg: 'bg-orange-500' }
    return { status: 'good', color: 'text-green-500', bg: 'bg-green-500' }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory</h1>
          <p className="text-dark-400">Manage your filament and materials stock</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search materials..."
            className="w-full bg-dark-900 border border-dark-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-dark-900 border border-dark-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="PLA">PLA</option>
          <option value="PETG">PETG</option>
          <option value="ABS">ABS</option>
          <option value="TPU">TPU</option>
          <option value="Nylon">Nylon</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-primary-500" />
            <span className="text-dark-400">Total Materials</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.inventory.length}</div>
        </div>
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <span className="text-dark-400">Low Stock</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.inventory.filter(i => {
              const remaining = i.weight - i.usedWeight
              return remaining < i.weight * 0.2
            }).length}
          </div>
        </div>
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-dark-400">Well Stocked</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.inventory.filter(i => {
              const remaining = i.weight - i.usedWeight
              return remaining >= i.weight * 0.5
            }).length}
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-md border border-dark-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Material</h2>
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
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Brand</label>
                  <input
                    type="text"
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Color</label>
                  <input
                    type="text"
                    value={newItem.color}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU">TPU</option>
                    <option value="Nylon">Nylon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Weight (g)</label>
                  <input
                    type="number"
                    value={newItem.weight}
                    onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Cost per Kg ($)</label>
                  <input
                    type="number"
                    value={newItem.costPerKg}
                    onChange={(e) => setNewItem({ ...newItem, costPerKg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Density (g/cm³)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.density}
                    onChange={(e) => setNewItem({ ...newItem, density: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
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
                onClick={handleAddItem}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="text-left text-dark-400 font-medium px-6 py-4">Material</th>
                <th className="text-left text-dark-400 font-medium px-6 py-4">Type</th>
                <th className="text-left text-dark-400 font-medium px-6 py-4">Stock</th>
                <th className="text-left text-dark-400 font-medium px-6 py-4">Remaining</th>
                <th className="text-left text-dark-400 font-medium px-6 py-4">Cost/kg</th>
                <th className="text-right text-dark-400 font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item)
                const remaining = item.weight - item.usedWeight
                const isEditing = editingId === item.id

                return (
                  <tr key={item.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                          className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-dark-400 text-sm">{item.brand}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === 'PLA' ? 'bg-green-500/20 text-green-500' :
                        item.type === 'PETG' ? 'bg-blue-500/20 text-blue-500' :
                        item.type === 'ABS' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-purple-500/20 text-purple-500'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-dark-700 rounded-full h-2">
                          <div 
                            className={`${stockStatus.bg} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${(remaining / item.weight) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm ${stockStatus.color}`}>
                          {Math.round((remaining / item.weight) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{remaining.toFixed(0)}g</div>
                      <div className="text-dark-400 text-sm">of {item.weight}g</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">${item.costPerKg.toFixed(2)}</div>
                      <div className="text-dark-400 text-sm">${(item.costPerKg / 1000).toFixed(3)}/g</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingId(item.id)}
                            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteInventory(item.id)}
                          className="p-2 text-dark-400 hover:text-red-500 hover:bg-dark-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12 text-dark-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No materials found</p>
          </div>
        )}
      </div>
    </div>
  )
}
