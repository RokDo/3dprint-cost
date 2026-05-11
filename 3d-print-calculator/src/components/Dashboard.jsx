import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Package,
  Clock,
  AlertTriangle,
  Printer
} from 'lucide-react'
import { useDataStore } from '../hooks/useDataStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const { data } = useDataStore()

  const totalQuotes = data.quotes.length
  const pendingQuotes = data.quotes.filter(q => q.status === 'pending').length
  const acceptedQuotes = data.quotes.filter(q => q.status === 'accepted').length
  
  const totalRevenue = data.quotes
    .filter(q => q.status === 'accepted')
    .reduce((sum, q) => sum + (q.costs?.total || 0), 0)
  
  const totalProfit = data.quotes
    .filter(q => q.status === 'accepted')
    .reduce((sum, q) => sum + (q.costs?.profit || 0), 0)

  const avgJobPrice = totalQuotes > 0 ? totalRevenue / totalQuotes : 0

  // Material usage data
  const materialUsage = data.inventory.map(m => ({
    name: m.name.split(' ')[0],
    used: m.usedWeight,
    remaining: m.weight - m.usedWeight,
  }))

  // Low stock items
  const lowStockItems = data.inventory.filter(m => {
    const remaining = m.weight - m.usedWeight
    return remaining < m.weight * 0.2 // Less than 20% remaining
  })

  // Recent quotes
  const recentQuotes = [...data.quotes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5)

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const stats = [
    { 
      label: 'Total Quotes', 
      value: totalQuotes, 
      icon: FileText, 
      color: 'bg-blue-500',
      trend: '+12%'
    },
    { 
      label: 'Revenue', 
      value: `$${totalRevenue.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'bg-green-500',
      trend: '+8%'
    },
    { 
      label: 'Avg Job Price', 
      value: `$${avgJobPrice.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      trend: '+5%'
    },
    { 
      label: 'Active Printers', 
      value: data.printers.filter(p => p.isActive).length, 
      icon: Printer, 
      color: 'bg-orange-500',
      subtext: `of ${data.printers.length}`
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-dark-400">Overview of your 3D printing business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index}
              className="bg-dark-900 rounded-2xl p-6 border border-dark-800 card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.trend && (
                  <span className="text-green-500 text-sm font-medium">{stat.trend}</span>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-dark-400 text-sm">{stat.label}</div>
              {stat.subtext && (
                <div className="text-dark-500 text-xs mt-1">{stat.subtext}</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Usage Chart */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            Material Usage
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="used" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quote Status */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Quote Status
          </h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: pendingQuotes },
                    { name: 'Accepted', value: acceptedQuotes },
                    { name: 'Rejected', value: totalQuotes - pendingQuotes - acceptedQuotes },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-dark-400 text-sm">Pending ({pendingQuotes})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-dark-400 text-sm">Accepted ({acceptedQuotes})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-dark-400 text-sm">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Recent Quotes
          </h2>
          {recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <div 
                  key={quote.id}
                  className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-700"
                >
                  <div>
                    <div className="text-white font-medium">{quote.name}</div>
                    <div className="text-dark-400 text-sm">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${quote.costs?.total?.toFixed(2) || '0.00'}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-dark-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No quotes yet</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Low Stock Alerts
          </h2>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item) => {
                const remaining = item.weight - item.usedWeight
                const percentage = (remaining / item.weight) * 100
                return (
                  <div 
                    key={item.id}
                    className="p-4 bg-dark-800 rounded-xl border border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-red-500 text-sm font-medium">
                        {remaining.toFixed(0)}g left
                      </div>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-dark-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50 text-green-500" />
              <p>All materials well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Profit Overview */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white/90 mb-2">Total Profit</h2>
            <div className="text-4xl font-bold text-white">${totalProfit.toFixed(2)}</div>
            <p className="text-white/70 text-sm mt-2">From accepted quotes</p>
          </div>
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-16 h-16 text-white/50" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
