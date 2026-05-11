import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Copy,
  DollarSign
} from 'lucide-react'
import { useDataStore } from '../hooks/useDataStore'

export default function Quotes() {
  const { data, updateQuote, deleteQuote } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [selectedQuote, setSelectedQuote] = useState(null)

  const filteredQuotes = data.quotes.filter(quote => {
    const matchesSearch = quote.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = (id, status) => {
    updateQuote(id, { status })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quotes</h1>
          <p className="text-dark-400">Manage and track all your quotes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quotes..."
            className="w-full bg-dark-900 border border-dark-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-dark-900 border border-dark-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-blue-500" />
            <span className="text-dark-400">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.quotes.length}</div>
        </div>
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            <span className="text-dark-400">Pending</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.quotes.filter(q => q.status === 'pending').length}
          </div>
        </div>
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-dark-400">Accepted</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.quotes.filter(q => q.status === 'accepted').length}
          </div>
        </div>
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-500" />
            <span className="text-dark-400">Rejected</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.quotes.filter(q => q.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-2xl border border-dark-800 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">{selectedQuote.name}</h2>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-dark-400">Status:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedQuote.id, 'pending')
                      setSelectedQuote({ ...selectedQuote, status: 'pending' })
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedQuote.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedQuote.id, 'accepted')
                      setSelectedQuote({ ...selectedQuote, status: 'accepted' })
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedQuote.status === 'accepted'
                        ? 'bg-green-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white'
                    }`}
                  >
                    Accepted
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedQuote.id, 'rejected')
                      setSelectedQuote({ ...selectedQuote, status: 'rejected' })
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedQuote.status === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {/* Parts */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Parts</h3>
                <div className="space-y-2">
                  {selectedQuote.parts?.map((part, index) => (
                    <div key={part.id} className="bg-dark-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{part.name}</span>
                        <span className="text-dark-400 text-sm">Qty: {part.quantity}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-dark-400">Weight: </span>
                          <span className="text-white">{part.weight}g</span>
                        </div>
                        <div>
                          <span className="text-dark-400">Time: </span>
                          <span className="text-white">{part.printTime}h</span>
                        </div>
                        <div>
                          <span className="text-dark-400">Material: </span>
                          <span className="text-white">
                            {data.inventory.find(m => m.id === part.materialId)?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              {selectedQuote.costs && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Cost Breakdown</h3>
                  <div className="bg-dark-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Material</span>
                      <span className="text-white">{formatCurrency(selectedQuote.costs.materialCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Machine Time</span>
                      <span className="text-white">{formatCurrency(selectedQuote.costs.machineCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Energy</span>
                      <span className="text-white">{formatCurrency(selectedQuote.costs.energyCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Labor</span>
                      <span className="text-white">{formatCurrency(selectedQuote.costs.laborCost)}</span>
                    </div>
                    <div className="border-t border-dark-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-white font-medium">Total</span>
                        <span className="text-white font-bold">{formatCurrency(selectedQuote.costs.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedQuote.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                  <p className="text-dark-400 bg-dark-800 rounded-xl p-4">{selectedQuote.notes}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="text-sm text-dark-400">
                Created: {formatDate(selectedQuote.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.map((quote) => (
          <div 
            key={quote.id}
            className="bg-dark-900 rounded-2xl p-6 border border-dark-800 hover:border-dark-700 transition-all card-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{quote.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-dark-400 mt-1">
                    <span>{formatDate(quote.createdAt)}</span>
                    <span>•</span>
                    <span>{quote.parts?.length || 0} parts</span>
                    <span>•</span>
                    <span>{quote.costs?.totalTime?.toFixed(1) || 0}h print time</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(quote.costs?.total || 0)}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    quote.status === 'accepted' 
                      ? 'bg-green-500/20 text-green-500' 
                      : quote.status === 'rejected'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {quote.status}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQuote(quote)}
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteQuote(quote.id)}
                    className="p-2 text-dark-400 hover:text-red-500 hover:bg-dark-800 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12 text-dark-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No quotes found</p>
          </div>
        )}
      </div>
    </div>
  )
}
