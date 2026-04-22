# 🖨️ 3D Print Cost Calculator

A modern Windows desktop application for calculating 3D printing costs with a beautiful dark theme UI.

## ✨ Features

### 🧵 Filament Management
- Add, edit, and remove filaments
- Track filament name, material type, color, weight, and cost
- Automatic price per gram calculation
- Support for: PLA, PETG, ABS, ASA, TPU, NYLON, PC, PVA, HIPS

### ⚙️ Comprehensive Cost Calculation

**1. Material Costs**
- Base filament cost from slicer data
- Configurable purge/waste percentage (for tests, supports, purge, failed starts)
- Failure rate consideration

**2. Machine Costs**
- Printer amortization (based on printer cost and lifetime hours)
- Parts replacement (nozzle, belts, hotend)
- Optional simple hourly rate mode

**3. Energy Costs** (optional)
- Based on average power consumption (watts)
- Configurable energy price per kWh
- Calculated from print duration

**4. Additional Costs**
- Post-processing costs
- Customizable failure rate percentage

### 💱 Currency Support
- Customizable currency symbol (PLN, USD, EUR, GBP, etc.)
- Choose symbol position (before or after amount)
- Live preview in settings

### 🎨 Modern UI
- Dark theme with Catppuccin-inspired colors
- Clean, intuitive interface
- Tabbed settings dialog
- Formatted cost breakdown display

### 💾 Data Persistence
- All filaments and settings saved automatically
- JSON-based storage
- Auto-load on startup

## 📦 Installation

### Requirements
- Python 3.8 or higher
- tkinter (usually included with Python on Windows)

### Running the Application

```bash
python print_cost_calculator.py
```

### Creating Standalone .exe (Optional)

```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name "3DPrintCostCalculator" print_cost_calculator.py
```

The executable will be in the `dist` folder.

## 📖 Usage

### First Setup

1. Launch the application
2. Click **⚙️ Settings** to configure:
   - Printer name, cost, and lifetime hours
   - Energy consumption (watts) and cost per kWh
   - Nozzle cost and lifetime
   - **Purge/Waste %** - extra material for purge, tests, failed starts
   - Failure rate %
   - Currency symbol and position

### Adding Filaments

1. Click **+ Add Filament**
2. Enter: Name, Material, Color, Weight (g), Cost
3. Click **Save**

### Calculating Print Cost

1. Select a filament from the dropdown
2. Enter: Job name, Print time (hours), Filament used (g), Supports (g)
3. Click **📊 Calculate Cost**

### Understanding Results

Results show:
- Filament info and price per gram
- Material usage (base, with purge, with failure rate)
- Material cost
- Machine costs (amortization + parts)
- Energy cost
- Post-processing cost
- **TOTAL COST**

## ⚙️ Configuration Options

**Printer Tab:** Name, cost, lifetime, hourly rate option

**Energy & Parts Tab:** Power (W), energy cost (/kWh), nozzle cost/lifetime

**Waste & Other Tab:** Purge %, failure rate %, post-processing cost

**Currency Tab:** Symbol (PLN, $, €, £) and position (before/after)

## 💡 Tips

- Export exact filament usage from Bambu Studio, PrusaSlicer, or Cura
- Start with 10% purge, adjust based on actual waste
- Use a power meter for accurate energy consumption
- Update filament costs as prices change
- Backup `print_cost_data.json` regularly

## 🔧 Troubleshooting

**App won't start?** Ensure Python 3.8+ and tkinter installed: `python -m tkinter`

**Data not saving?** Check write permissions or run as administrator

**Wrong calculations?** Verify settings, filament data, and units

---

**Made with ❤️ for the 3D printing community**
