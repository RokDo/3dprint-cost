# 3D Print Cost Calculator

A Windows desktop application for calculating 3D printing costs with detailed breakdown of material, machine, energy, and other costs.

## Features

### Filament Management
- **Add filaments** with custom properties:
  - Name (e.g., "Bambu Lab PETG Basic")
  - Material type (PLA, PETG, ABS, ASA, TPU, NYLON, PC, PVA, HIPS, OTHER)
  - Color
  - Weight (grams)
  - Cost (PLN)
- **Edit existing filaments**
- **Remove filaments** from your collection
- Automatic calculation of price per gram

### Printer Settings
Configure your printer's operational costs:

#### Printer Tab
- Printer name
- Printer purchase cost (for amortization)
- Expected lifetime in hours
- Simple hourly rate option (alternative to detailed calculation)
- Toggle between simple and detailed cost calculation

#### Energy & Parts Tab
- Average power consumption (Watts)
- Energy cost per kWh (PLN)
- Nozzle cost
- Nozzle lifetime in hours

#### Waste & Other Tab
- **Purge/Waste percentage** - Extra material for purge, tests, and failed starts
- **Failure rate percentage** - Account for completely failed prints
- Post-processing costs (support removal, sanding, etc.)

### Cost Calculation
Enter your print job details:
- Job name
- Select filament from your collection
- Print time (hours)
- Filament used (from slicer - Bambu Studio, PrusaSlicer, etc.)
- Support material weight

### Detailed Cost Breakdown
The calculator provides:

1. **Material Costs**
   - Base filament used
   - Added purge/waste percentage
   - Failure rate compensation
   - Total material cost

2. **Machine Costs**
   - Printer amortization (based on purchase price and lifetime)
   - Parts replacement (nozzle wear)

3. **Energy Costs**
   - Based on power consumption and local energy rates

4. **Other Costs**
   - Post-processing expenses

5. **Total Cost** with cost per gram

## Installation

### Requirements
- Python 3.7 or higher
- tkinter (usually included with Python on Windows)

### Running the Application

1. Make sure Python is installed on your system
2. Navigate to the application directory
3. Run:
   ```bash
   python print_cost_calculator.py
   ```

### Creating a Standalone Executable (Optional)

To create a .exe file that can run without Python:

1. Install PyInstaller:
   ```bash
   pip install pyinstaller
   ```

2. Create executable:
   ```bash
   pyinstaller --onefile --windowed --name="3D_Print_Cost_Calculator" print_cost_calculator.py
   ```

3. Find your executable in the `dist` folder

## Usage Guide

### First Time Setup

1. **Add Your Filaments**
   - Click "Add Filament"
   - Enter filament details (name, material, color, weight, cost)
   - Save

2. **Configure Printer Settings**
   - Click "⚙ Printer Settings"
   - Enter your printer information
   - Set purge percentage (recommended: 5-15%)
   - Set failure rate based on your experience (recommended: 3-10%)
   - Save settings

### Calculating a Print Cost

1. Enter a job name (optional)
2. Select the filament you'll use
3. Enter print time from your slicer
4. Enter filament usage from your slicer (including supports if separate)
5. Enter support material weight (if not included above)
6. Click "📊 Calculate Cost"

### Understanding the Results

The results show:
- **Base filament**: What the slicer reports
- **With purge**: Base + purge percentage for tests/priming
- **With failures**: Accounts for occasional failed prints
- **Material Cost**: Final filament cost
- **Machine Costs**: Amortization + parts
- **Energy Cost**: Electricity consumption
- **TOTAL**: Your complete cost

## Data Storage

All your filaments and settings are automatically saved to `print_cost_data.json` in the same directory. The data loads automatically when you start the application.

## Example Calculation

For a print using PETG filament:
- Filament: 150g used
- Supports: 25g
- Print time: 8 hours
- Purge setting: 10%
- Failure rate: 5%

The calculator will compute:
- Base: 175g
- With purge (10%): 192.5g
- With failures (5%): 202.125g
- Plus machine time, energy, and any post-processing

## Tips

1. **Accurate Slicer Data**: Use the exact filament usage from Bambu Studio or your slicer
2. **Realistic Purge**: Add 5-15% for purge depending on your printer and filament changes
3. **Track Failures**: Adjust failure rate based on your actual success rate
4. **Regular Updates**: Update filament prices as you buy new spools
5. **Multiple Profiles**: Consider different settings for different printer types

## Currency

The application uses PLN (Polish Złoty) by default, but you can mentally substitute any currency - the calculations work the same way.

## License

Free to use for personal and commercial purposes.

## Support

For issues or suggestions, please check the source code or modify as needed for your specific requirements.
