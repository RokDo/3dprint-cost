import { motion } from 'framer-motion';
import { useApp } from '../hooks/useApp';
import { 
  LayoutDashboard, 
  Calculator, 
  Package, 
  Printer, 
  FileText, 
  Settings, 
  Moon, 
  Sun,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/helpers';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
  { name: 'Calculator', icon: Calculator, href: '#calculator' },
  { name: 'Inventory', icon: Package, href: '#inventory' },
  { name: 'Printers', icon: Printer, href: '#printers' },
  { name: 'Quotes', icon: FileText, href: '#quotes' },
  { name: 'Settings', icon: Settings, href: '#settings' },
];

export function Layout({ children }) {
  const { state, actions } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const toggleDarkMode = () => {
    actions.updateSettings({ darkMode: !state.settings.darkMode });
  };

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-300',
      state.settings.darkMode ? 'dark bg-background-primary' : 'bg-gray-50'
    )}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-background-card border-r border-white/5 z-50',
          'lg:translate-x-0 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">PrintFlow</h1>
              <p className="text-xs text-text-muted">Pro Studio</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/20 text-accent-light'
                    : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                )}
                onClick={() => {
                  setActiveSection(item.href.slice(1));
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </motion.a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors"
          >
            {state.settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {state.settings.darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-background-hover text-text-secondary"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background-card border border-white/5">
                <span className="text-xs text-text-muted">Currency:</span>
                <select
                  value={state.settings.currency}
                  onChange={(e) => actions.updateSettings({ currency: e.target.value })}
                  className="bg-transparent text-sm font-medium text-text-primary focus:outline-none cursor-pointer"
                >
                  {Object.keys(CURRENCIES).map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
