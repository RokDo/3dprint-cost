import { motion } from 'framer-motion';
import { useApp } from '../hooks/useApp';
import { Card, CardHeader, CardTitle, CardContent, AnimatedNumber } from './ui';
import { 
  DollarSign, 
  Package, 
  Printer, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { formatCurrency, QUOTE_STATUS } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
  const { state } = useApp();
  const { filaments, quotes, printerProfiles, settings } = state;

  // Calculate dashboard metrics
  const totalFilamentValue = filaments.reduce((sum, f) => sum + (f.remainingGrams / f.weightGrams) * f.cost, 0);
  const lowStockFilaments = filaments.filter(f => (f.remainingGrams / f.weightGrams) * 100 < 20);
  
  const quoteStats = {
    pending: quotes.filter(q => q.status === QUOTE_STATUS.PENDING).length,
    accepted: quotes.filter(q => q.status === QUOTE_STATUS.ACCEPTED).length,
    rejected: quotes.filter(q => q.status === QUOTE_STATUS.REJECTED).length,
    total: quotes.length,
  };

  const totalRevenue = quotes
    .filter(q => q.status === QUOTE_STATUS.ACCEPTED)
    .reduce((sum, q) => sum + (q.finalPrice || 0), 0);

  const avgQuoteValue = quoteStats.accepted > 0 
    ? totalRevenue / quoteStats.accepted 
    : 0;

  // Material distribution data
  const materialData = filaments.reduce((acc, f) => {
    const existing = acc.find(item => item.name === f.material);
    if (existing) {
      existing.value += f.remainingGrams;
    } else {
      acc.push({ name: f.material, value: f.remainingGrams });
    }
    return acc;
  }, []);

  // Recent activity
  const recentQuotes = quotes.slice(0, 5);

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue, settings.currency),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Active Quotes',
      value: quoteStats.pending.toString(),
      change: quoteStats.pending > 5 ? '+3 new' : 'Stable',
      trend: quoteStats.pending > 5 ? 'up' : 'neutral',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Filament Inventory',
      value: formatCurrency(totalFilamentValue, settings.currency),
      change: lowStockFilaments.length > 0 ? `${lowStockFilaments.length} low` : 'Good',
      trend: lowStockFilaments.length > 0 ? 'down' : 'up',
      icon: Package,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Printers',
      value: printerProfiles.length.toString(),
      change: 'All operational',
      trend: 'up',
      icon: Printer,
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-text-muted">Welcome back! Here's your business overview.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-muted mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-success" />
                      )}
                      {stat.trend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-error" />
                      )}
                      <span className={cn(
                        'text-xs font-medium',
                        stat.trend === 'up' ? 'text-success' : 
                        stat.trend === 'down' ? 'text-error' : 'text-text-muted'
                      )}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    stat.color
                  )}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Material Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {materialData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={materialData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {materialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(37, 37, 66, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-text-muted">
                No filament data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Status */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background-secondary">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent-light" />
                  </div>
                  <div>
                    <p className="font-medium">Pending Quotes</p>
                    <p className="text-sm text-text-muted">Awaiting response</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-accent-light">{quoteStats.pending}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Accepted</p>
                    <p className="text-sm text-text-muted">Conversion rate</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-success">{quoteStats.accepted}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-error/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <p className="font-medium">Rejected</p>
                    <p className="text-sm text-text-muted">Lost opportunities</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-error">{quoteStats.rejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockFilaments.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockFilaments.map((filament) => (
                <div key={filament.id} className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div>
                    <p className="font-medium">{filament.name}</p>
                    <p className="text-sm text-text-muted">{filament.material} - {filament.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-warning">
                      {Math.round((filament.remainingGrams / filament.weightGrams) * 100)}% remaining
                    </p>
                    <p className="text-sm text-text-muted">{Math.round(filament.remainingGrams)}g left</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Quotes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg bg-background-secondary hover:bg-background-hover transition-colors">
                  <div>
                    <p className="font-medium">{quote.name}</p>
                    <p className="text-sm text-text-muted">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      quote.status === QUOTE_STATUS.ACCEPTED ? 'success' :
                      quote.status === QUOTE_STATUS.REJECTED ? 'error' : 'warning'
                    }>
                      {quote.status}
                    </Badge>
                    <span className="font-semibold">
                      {formatCurrency(quote.finalPrice || 0, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No quotes yet. Create your first quote!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components
function Badge({ children, variant = 'info' }) {
  const variants = {
    info: 'bg-accent/20 text-accent-light',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    error: 'bg-error/20 text-error',
  };
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', variants[variant])}>
      {children}
    </span>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
