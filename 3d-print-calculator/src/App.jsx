import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Printer, 
  Settings, 
  Moon, 
  Sun,
  Plus,
  Search,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  BarChart3
} from 'lucide-react'
import Dashboard from './components/Dashboard'
import Quotes from './components/Quotes'
import Inventory from './components/Inventory'
import Printers from './components/Printers'
import SettingsPanel from './components/SettingsPanel'
import Calculator from './components/Calculator'
import { useDataStore } from './hooks/useDataStore'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const { loadData, saveData } = useDataStore()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveData()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveData])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'calculator':
        return <Calculator />
      case 'quotes':
        return <Quotes />
      case 'inventory':
        return <Inventory />
      case 'printers':
        return <Printers />
      case 'settings':
        return <SettingsPanel />
      default:
        return <Dashboard />
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Calculator', icon: DollarSign },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'printers', label: 'Printers', icon: Printer },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-dark-950' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-dark-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Printer className="w-8 h-8 text-primary-500" />
            <span>3D Print Pro</span>
          </h1>
          <p className="text-xs text-dark-400 mt-1">Business Manager</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-dark-800">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-dark-800 text-dark-400 hover:text-white transition-all duration-200"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App
