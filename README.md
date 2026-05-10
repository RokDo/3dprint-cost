# 🖨️ PrintFlow Pro - 3D Printing Cost Calculator & Business Platform

A **modern, premium SaaS-grade web application** for professional 3D printing businesses. Built with React, Vite, and TailwindCSS.

## ✨ Features

### 🎨 Modern UI/UX
- Clean SaaS-style interface inspired by Stripe, Linear, Notion
- Dark/Light mode support
- Smooth animations and micro-interactions
- Responsive design for all devices

### 💰 Smart Cost Calculator
- Real-time cost calculation
- Material, machine, energy, and labor cost breakdown
- Quantity-based pricing with volume discounts
- Profit margin visualization
- AI-powered optimization suggestions

### 📦 Inventory Management
- Track filaments by brand, type, color
- Real-time stock updates
- Low stock alerts
- Hardware inventory tracking

### 🖨️ Printer Profiles
- Multiple printer profiles
- Hourly rate, power consumption, maintenance factors
- Efficiency and reliability tracking

### 📊 Dashboard & Analytics
- Revenue tracking
- Quote success rate
- Material usage charts
- Low stock alerts

### 📝 Quote Management
- Unlimited quotes
- Status tracking (Pending, Accepted, Rejected)
- Search, filter, sort
- Duplicate quotes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Charts & graphs
- **Lucide React** - Icons
- **UUID** - Unique IDs

## 📁 Project Structure

```
src/
├── components/     # React components
│   ├── ui.jsx      # Reusable UI components
│   ├── Layout.jsx  # App layout with sidebar
│   ├── Dashboard.jsx
│   └── Calculator.jsx
├── hooks/          # Custom React hooks
│   └── useApp.js   # Global state management
├── utils/          # Utility functions
│   └── helpers.js  # Calculations & helpers
├── styles/         # CSS styles
│   └── globals.css
└── main.jsx        # Entry point
```

## 💡 Key Features

### Cost Calculation
- Filament weight & support material
- Print time estimation
- Machine hourly rates
- Energy consumption
- Purge/waste percentage
- Failure rate consideration
- Post-processing costs

### Pricing Engine
- Configurable profit margins
- Volume discounts (5, 10, 20, 50, 100+ units)
- Multi-currency support
- Tax/VAT options

### Business Tools
- Quote generation
- Client management
- Activity logging
- Data persistence (localStorage)

## 🎯 Target Users

Professional 3D printing businesses, maker spaces, and freelancers who need accurate cost calculations and business management tools.

---

Built with ❤️ for the 3D printing community
