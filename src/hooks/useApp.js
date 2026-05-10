import { createContext, useContext, useReducer, useEffect } from 'react';
import { generateId, storage, CURRENCIES, DEFAULT_PRINTER_PROFILES } from '../utils/helpers';

// Initial state
const getInitialState = () => ({
  // Filaments inventory
  filaments: storage.get('printflow_filaments', [
    {
      id: generateId(),
      name: 'Generic PLA White',
      material: 'PLA',
      color: '#ffffff',
      brand: 'Generic',
      weightGrams: 1000,
      remainingGrams: 850,
      cost: 25.00,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'PETG Black',
      material: 'PETG',
      color: '#1a1a1a',
      brand: 'eSUN',
      weightGrams: 1000,
      remainingGrams: 600,
      cost: 30.00,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    },
  ]),

  // Printer profiles
  printerProfiles: storage.get('printflow_printers', DEFAULT_PRINTER_PROFILES),
  activePrinterId: storage.get('printflow_active_printer', 'default-fdm'),

  // Quotes
  quotes: storage.get('printflow_quotes', []),

  // Settings
  settings: storage.get('printflow_settings', {
    currency: 'USD',
    defaultMargin: 30,
    defaultPurgePercentage: 10,
    defaultFailureRate: 5,
    taxRate: 0,
    darkMode: true,
    notificationsEnabled: true,
  }),

  // Hardware inventory
  hardware: storage.get('printflow_hardware', [
    { id: generateId(), name: 'M3 Screws (pack)', quantity: 100, unit: 'pcs', cost: 5.00, lowStockThreshold: 20 },
    { id: generateId(), name: 'Brass Nozzles 0.4mm', quantity: 5, unit: 'pcs', cost: 15.00, lowStockThreshold: 3 },
  ]),

  // Activity log
  activityLog: storage.get('printflow_activity', []),
});

// Action types
const ActionTypes = {
  ADD_FILAMENT: 'ADD_FILAMENT',
  UPDATE_FILAMENT: 'UPDATE_FILAMENT',
  DELETE_FILAMENT: 'DELETE_FILAMENT',
  UPDATE_FILAMENT_STOCK: 'UPDATE_FILAMENT_STOCK',
  
  ADD_PRINTER_PROFILE: 'ADD_PRINTER_PROFILE',
  UPDATE_PRINTER_PROFILE: 'UPDATE_PRINTER_PROFILE',
  DELETE_PRINTER_PROFILE: 'DELETE_PRINTER_PROFILE',
  SET_ACTIVE_PRINTER: 'SET_ACTIVE_PRINTER',
  
  ADD_QUOTE: 'ADD_QUOTE',
  UPDATE_QUOTE: 'UPDATE_QUOTE',
  DELETE_QUOTE: 'DELETE_QUOTE',
  UPDATE_QUOTE_STATUS: 'UPDATE_QUOTE_STATUS',
  
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  ADD_HARDWARE: 'ADD_HARDWARE',
  UPDATE_HARDWARE: 'UPDATE_HARDWARE',
  DELETE_HARDWARE: 'DELETE_HARDWARE',
  UPDATE_HARDWARE_STOCK: 'UPDATE_HARDWARE_STOCK',
  
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  
  IMPORT_DATA: 'IMPORT_DATA',
};

// Reducer
function appReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case ActionTypes.ADD_FILAMENT:
      newState = {
        ...state,
        filaments: [...state.filaments, action.payload],
      };
      break;
      
    case ActionTypes.UPDATE_FILAMENT:
      newState = {
        ...state,
        filaments: state.filaments.map(f => 
          f.id === action.payload.id ? { ...f, ...action.payload } : f
        ),
      };
      break;
      
    case ActionTypes.DELETE_FILAMENT:
      newState = {
        ...state,
        filaments: state.filaments.filter(f => f.id !== action.payload),
      };
      break;
      
    case ActionTypes.UPDATE_FILAMENT_STOCK:
      newState = {
        ...state,
        filaments: state.filaments.map(f =>
          f.id === action.payload.id
            ? { ...f, remainingGrams: Math.max(0, f.remainingGrams - action.payload.used) }
            : f
        ),
      };
      break;
      
    case ActionTypes.ADD_PRINTER_PROFILE:
      newState = {
        ...state,
        printerProfiles: [...state.printerProfiles, action.payload],
      };
      break;
      
    case ActionTypes.UPDATE_PRINTER_PROFILE:
      newState = {
        ...state,
        printerProfiles: state.printerProfiles.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };
      break;
      
    case ActionTypes.DELETE_PRINTER_PROFILE:
      newState = {
        ...state,
        printerProfiles: state.printerProfiles.filter(p => p.id !== action.payload),
        activePrinterId: state.activePrinterId === action.payload 
          ? state.printerProfiles[0]?.id 
          : state.activePrinterId,
      };
      break;
      
    case ActionTypes.SET_ACTIVE_PRINTER:
      newState = {
        ...state,
        activePrinterId: action.payload,
      };
      break;
      
    case ActionTypes.ADD_QUOTE:
      newState = {
        ...state,
        quotes: [action.payload, ...state.quotes],
      };
      break;
      
    case ActionTypes.UPDATE_QUOTE:
      newState = {
        ...state,
        quotes: state.quotes.map(q =>
          q.id === action.payload.id ? { ...q, ...action.payload } : q
        ),
      };
      break;
      
    case ActionTypes.DELETE_QUOTE:
      newState = {
        ...state,
        quotes: state.quotes.filter(q => q.id !== action.payload),
      };
      break;
      
    case ActionTypes.UPDATE_QUOTE_STATUS:
      newState = {
        ...state,
        quotes: state.quotes.map(q =>
          q.id === action.payload.id ? { ...q, status: action.payload.status } : q
        ),
      };
      break;
      
    case ActionTypes.UPDATE_SETTINGS:
      newState = {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
      break;
      
    case ActionTypes.ADD_HARDWARE:
      newState = {
        ...state,
        hardware: [...state.hardware, action.payload],
      };
      break;
      
    case ActionTypes.UPDATE_HARDWARE:
      newState = {
        ...state,
        hardware: state.hardware.map(h =>
          h.id === action.payload.id ? { ...h, ...action.payload } : h
        ),
      };
      break;
      
    case ActionTypes.DELETE_HARDWARE:
      newState = {
        ...state,
        hardware: state.hardware.filter(h => h.id !== action.payload),
      };
      break;
      
    case ActionTypes.UPDATE_HARDWARE_STOCK:
      newState = {
        ...state,
        hardware: state.hardware.map(h =>
          h.id === action.payload.id
            ? { ...h, quantity: Math.max(0, h.quantity - action.payload.used) }
            : h
        ),
      };
      break;
      
    case ActionTypes.ADD_ACTIVITY:
      newState = {
        ...state,
        activityLog: [
          {
            id: generateId(),
            timestamp: new Date().toISOString(),
            ...action.payload,
          },
          ...state.activityLog.slice(0, 99),
        ],
      };
      break;
      
    case ActionTypes.IMPORT_DATA:
      newState = {
        ...state,
        ...action.payload,
      };
      break;
      
    default:
      return state;
  }
  
  // Persist to localStorage
  if (newState) {
    storage.set('printflow_filaments', newState.filaments);
    storage.set('printflow_printers', newState.printerProfiles);
    storage.set('printflow_active_printer', newState.activePrinterId);
    storage.set('printflow_quotes', newState.quotes);
    storage.set('printflow_settings', newState.settings);
    storage.set('printflow_hardware', newState.hardware);
    storage.set('printflow_activity', newState.activityLog);
  }
  
  return newState || state;
}

// Context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);

  // Action creators
  const actions = {
    // Filaments
    addFilament: (filament) => {
      dispatch({ type: ActionTypes.ADD_FILAMENT, payload: { ...filament, id: generateId() } });
      dispatch({ type: ActionTypes.ADD_ACTIVITY, payload: { action: 'add_filament', details: `Added ${filament.name}` } });
    },
    updateFilament: (filament) => {
      dispatch({ type: ActionTypes.UPDATE_FILAMENT, payload: filament });
      dispatch({ type: ActionTypes.ADD_ACTIVITY, payload: { action: 'update_filament', details: `Updated ${filament.name}` } });
    },
    deleteFilament: (id) => {
      dispatch({ type: ActionTypes.DELETE_FILAMENT, payload: id });
      dispatch({ type: ActionTypes.ADD_ACTIVITY, payload: { action: 'delete_filament', details: `Deleted filament` } });
    },
    updateFilamentStock: (id, used) => {
      dispatch({ type: ActionTypes.UPDATE_FILAMENT_STOCK, payload: { id, used } });
    },
    
    // Printers
    addPrinterProfile: (profile) => {
      dispatch({ type: ActionTypes.ADD_PRINTER_PROFILE, payload: { ...profile, id: generateId() } });
    },
    updatePrinterProfile: (profile) => {
      dispatch({ type: ActionTypes.UPDATE_PRINTER_PROFILE, payload: profile });
    },
    deletePrinterProfile: (id) => {
      dispatch({ type: ActionTypes.DELETE_PRINTER_PROFILE, payload: id });
    },
    setActivePrinter: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_PRINTER, payload: id });
    },
    
    // Quotes
    addQuote: (quote) => {
      dispatch({ type: ActionTypes.ADD_QUOTE, payload: { ...quote, id: generateId(), createdAt: new Date().toISOString() } });
      dispatch({ type: ActionTypes.ADD_ACTIVITY, payload: { action: 'create_quote', details: `Created quote ${quote.name}` } });
    },
    updateQuote: (quote) => {
      dispatch({ type: ActionTypes.UPDATE_QUOTE, payload: quote });
    },
    deleteQuote: (id) => {
      dispatch({ type: ActionTypes.DELETE_QUOTE, payload: id });
    },
    updateQuoteStatus: (id, status) => {
      dispatch({ type: ActionTypes.UPDATE_QUOTE_STATUS, payload: { id, status } });
      dispatch({ type: ActionTypes.ADD_ACTIVITY, payload: { action: 'update_quote_status', details: `Quote status changed to ${status}` } });
    },
    
    // Settings
    updateSettings: (settings) => {
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
    },
    
    // Hardware
    addHardware: (item) => {
      dispatch({ type: ActionTypes.ADD_HARDWARE, payload: { ...item, id: generateId() } });
    },
    updateHardware: (item) => {
      dispatch({ type: ActionTypes.UPDATE_HARDWARE, payload: item });
    },
    deleteHardware: (id) => {
      dispatch({ type: ActionTypes.DELETE_HARDWARE, payload: id });
    },
    updateHardwareStock: (id, used) => {
      dispatch({ type: ActionTypes.UPDATE_HARDWARE_STOCK, payload: { id, used } });
    },
    
    // Import/Export
    importData: (data) => {
      dispatch({ type: ActionTypes.IMPORT_DATA, payload: data });
      dispatch({ type: ActionTypes.ADD_ACTIVITY, payload: { action: 'import_data', details: 'Imported data' } });
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
