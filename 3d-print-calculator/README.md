# 3D Print Calculator Pro

A professional desktop application for 3D printing businesses to calculate costs, manage quotes, track inventory, and optimize pricing.

## Features

### 💰 Cost Calculator
- Real-time cost calculation
- Multi-material & multi-part support
- Quantity-based pricing with bulk discounts
- Detailed cost breakdown (material, machine, energy, labor)
- Visual cost distribution bars
- Profit margin optimization

### 📊 Dashboard
- Business overview with key metrics
- Material usage charts
- Quote status tracking
- Low stock alerts
- Revenue and profit analytics

### 📝 Quote Management
- Save unlimited quotes locally
- Status tracking (Pending/Accepted/Rejected)
- Search and filter functionality
- Detailed quote view with full breakdown
- Auto-update inventory on save

### 📦 Inventory System
- Track filament stock levels
- Multiple material types (PLA, PETG, ABS, TPU, Nylon)
- Real-time stock percentage indicators
- Low stock warnings
- Cost per gram calculation
- Brand and color tracking

### 🖨️ Printer Profiles
- Unlimited printer profiles
- Hourly rate configuration
- Power usage tracking
- Maintenance factors
- Efficiency modifiers
- Active/inactive status

### ⚙️ Settings
- Customizable currency symbols
- Default margin settings
- Tax rate configuration
- Electricity and labor rates
- Data export/import (JSON backup)
- Reset to defaults

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: LocalStorage (offline-first)
- **Desktop**: Electron (optional)

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
cd 3d-print-calculator
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
```

The built files will be in the `dist` folder. You can serve them with any static file server or package as an Electron app.

### Desktop App (Electron)

```bash
# Install Electron dependencies
npm install electron electron-builder --save-dev

# Run as desktop app
npm run electron:dev

# Build distributable
npm run electron:build
```

## Usage

1. **Setup**: Go to Settings and configure your default rates (electricity, labor, margin)
2. **Add Printers**: Create printer profiles with hourly rates and power usage
3. **Add Materials**: Input your filament inventory with costs
4. **Calculate**: Use the Calculator to create quotes with parts, materials, and print times
5. **Manage**: Track all quotes in the Quotes section and update their status
6. **Monitor**: Check the Dashboard for business insights and low stock alerts

## Data Storage

All data is stored locally in your browser's localStorage:
- No account required
- Works completely offline
- Export/Import functionality for backups
- Data persists between sessions

## Keyboard Shortcuts

- The app is fully mouse-driven with intuitive UI
- All inputs support standard keyboard navigation

## File Structure

```
3d-print-calculator/
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── Calculator.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Printers.jsx
│   │   ├── Quotes.jsx
│   │   └── SettingsPanel.jsx
│   ├── hooks/
│   │   └── useDataStore.js
│   ├── utils/
│   └── index.css
├── public/
├── electron/
│   └── main.js
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## License

MIT License - Feel free to use for personal or commercial projects.

## Support

For issues or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for the 3D printing community**
