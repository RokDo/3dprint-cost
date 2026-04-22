"""
3D Print Cost Calculator
A Windows desktop application for calculating 3D printing costs
Modern UI with customizable currency support
"""

import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from datetime import datetime
from typing import Dict, List, Optional


# Modern color scheme (Catppuccin-inspired)
COLORS = {
    'bg_primary': '#1e1e2e',
    'bg_secondary': '#2d2d44',
    'bg_card': '#363650',
    'accent': '#7aa2f7',
    'accent_hover': '#5d87e5',
    'text_primary': '#ffffff',
    'text_secondary': '#a9b1d6',
    'success': '#9ece6a',
    'warning': '#e0af68',
    'error': '#f7768e',
    'border': '#414868'
}


class Filament:
    """Represents a filament spool with its properties"""
    def __init__(self, name: str, material: str, color: str, 
                 weight_grams: float, cost: float, currency: str = "PLN"):
        self.name = name
        self.material = material.upper()
        self.color = color
        self.weight_grams = weight_grams
        self.cost = cost
        self.currency = currency
        self.id = datetime.now().timestamp()
    
    @property
    def price_per_gram(self) -> float:
        """Calculate price per gram"""
        if self.weight_grams > 0:
            return self.cost / self.weight_grams
        return 0.0
    
    def to_dict(self) -> dict:
        """Convert to dictionary for serialization"""
        return {
            'name': self.name,
            'material': self.material,
            'color': self.color,
            'weight_grams': self.weight_grams,
            'cost': self.cost,
            'currency': self.currency,
            'id': self.id
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Filament':
        """Create Filament from dictionary"""
        f = cls(
            name=data['name'],
            material=data['material'],
            color=data['color'],
            weight_grams=data['weight_grams'],
            cost=data['cost'],
            currency=data.get('currency', 'PLN')
        )
        f.id = data.get('id', datetime.now().timestamp())
        return f


class PrinterSettings:
    """Printer configuration and cost settings"""
    def __init__(self):
        # Printer amortization
        self.printer_name = "My Printer"
        self.printer_cost = 2000.0
        self.printer_lifetime_hours = 5000
        
        # Energy consumption
        self.avg_power_watts = 150
        self.energy_cost_per_kwh = 1.0
        
        # Machine hourly rate (alternative to detailed calculation)
        self.hourly_rate = 5.0
        
        # Parts replacement
        self.nozzle_cost = 10.0
        self.nozzle_lifetime_hours = 500
        
        # Purge/waste percentage
        self.purge_percentage = 10.0
        
        # Other costs
        self.failure_rate = 5.0
        self.post_processing_cost = 0.0
        
        # Use detailed calculation or simple hourly rate
        self.use_detailed_calculation = True
        
        # Currency settings
        self.currency_symbol = "PLN"
        self.currency_position = "after"
    
    def get_machine_cost_per_hour(self) -> float:
        """Calculate machine cost per hour based on settings"""
        if not self.use_detailed_calculation:
            return self.hourly_rate
        
        amortization = self.printer_cost / self.printer_lifetime_hours
        energy_cost = (self.avg_power_watts / 1000) * self.energy_cost_per_kwh
        parts_cost = self.nozzle_cost / self.nozzle_lifetime_hours
        
        return amortization + energy_cost + parts_cost
    
    def get_energy_cost(self, hours: float) -> float:
        """Calculate energy cost for given hours"""
        return (self.avg_power_watts / 1000) * hours * self.energy_cost_per_kwh
    
    def to_dict(self) -> dict:
        """Convert to dictionary for serialization"""
        return self.__dict__.copy()
    
    @classmethod
    def from_dict(cls, data: dict) -> 'PrinterSettings':
        """Create PrinterSettings from dictionary"""
        ps = cls()
        ps.__dict__.update(data)
        return ps


class PrintJob:
    """Represents a print job with its calculations"""
    def __init__(self, filament: Filament, settings: PrinterSettings):
        self.filament = filament
        self.settings = settings
        self.job_name = ""
        self.print_time_hours = 0.0
        self.filament_used_grams = 0.0
        self.support_grams = 0.0
        self.infill_percentage = 20
        self.layer_height = 0.2
        self.material_cost = 0.0
        self.machine_cost = 0.0
        self.energy_cost = 0.0
        self.total_cost = 0.0
        self.breakdown = {}
    
    def calculate(self) -> dict:
        """Calculate all costs for this print job"""
        total_filament = self.filament_used_grams + self.support_grams
        purge_multiplier = 1 + (self.settings.purge_percentage / 100)
        total_with_purge = total_filament * purge_multiplier
        failure_multiplier = 1 + (self.settings.failure_rate / 100)
        final_filament = total_with_purge * failure_multiplier
        
        self.material_cost = final_filament * self.filament.price_per_gram
        self.machine_cost = self.print_time_hours * self.settings.get_machine_cost_per_hour()
        
        if self.settings.use_detailed_calculation:
            self.energy_cost = self.settings.get_energy_cost(self.print_time_hours)
        else:
            self.energy_cost = 0.0
        
        post_process = self.settings.post_processing_cost
        self.total_cost = self.material_cost + self.machine_cost + self.energy_cost + post_process
        
        self.breakdown = {
            'base_filament_grams': total_filament,
            'with_purge_grams': total_with_purge,
            'with_failure_grams': final_filament,
            'material_cost': self.material_cost,
            'machine_amortization': self.print_time_hours * (self.settings.printer_cost / self.settings.printer_lifetime_hours),
            'machine_parts': self.print_time_hours * (self.settings.nozzle_cost / self.settings.nozzle_lifetime_hours),
            'energy_cost': self.energy_cost,
            'post_processing': post_process,
            'purge_added_percent': self.settings.purge_percentage,
            'failure_rate_percent': self.settings.failure_rate,
            'total': self.total_cost
        }
        
        return self.breakdown


class ModernStyle:
    """Apply modern styling to tkinter widgets"""
    
    @staticmethod
    def apply_theme(root):
        """Apply modern theme to the application"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure colors
        style.configure('.', 
                       background=COLORS['bg_primary'],
                       foreground=COLORS['text_primary'],
                       font=('Segoe UI', 10))
        
        style.configure('TFrame', background=COLORS['bg_primary'])
        style.configure('TLabel', background=COLORS['bg_primary'], 
                       foreground=COLORS['text_primary'],
                       font=('Segoe UI', 10))
        style.configure('Header.TLabel', font=('Segoe UI', 12, 'bold'),
                       foreground=COLORS['accent'])
        style.configure('Title.TLabel', font=('Segoe UI', 16, 'bold'),
                       foreground=COLORS['text_primary'])
        style.configure('Card.TFrame', background=COLORS['bg_card'])
        
        style.configure('TButton', 
                       background=COLORS['accent'],
                       foreground=COLORS['text_primary'],
                       font=('Segoe UI', 10, 'bold'),
                       padding=(15, 8),
                       borderwidth=0)
        style.map('TButton',
                 background=[('active', COLORS['accent_hover']),
                            ('pressed', COLORS['accent'])])
        
        style.configure('TLabelframe', 
                       background=COLORS['bg_secondary'],
                       foreground=COLORS['text_primary'],
                       font=('Segoe UI', 11, 'bold'))
        style.configure('TLabelframe.Label',
                       background=COLORS['bg_secondary'],
                       foreground=COLORS['accent'],
                       font=('Segoe UI', 11, 'bold'))
        
        style.configure('TEntry',
                       fieldbackground=COLORS['bg_secondary'],
                       foreground=COLORS['text_primary'],
                       insertcolor=COLORS['text_primary'],
                       padding=5)
        
        style.configure('TCOMBobox',
                       fieldbackground=COLORS['bg_secondary'],
                       foreground=COLORS['text_primary'],
                       arrowcolor=COLORS['accent'])
        style.map('TCombobox',
                 selectbackground=[('focus', COLORS['accent'])],
                 selectforeground=[('focus', COLORS['text_primary'])])
        
        style.configure('TNotebook', 
                       background=COLORS['bg_secondary'],
                       tabmargins=[2, 2, 2, 0])
        style.configure('TNotebook.Tab',
                       background=COLORS['bg_secondary'],
                       foreground=COLORS['text_secondary'],
                       padding=[15, 8],
                       font=('Segoe UI', 10))
        style.map('TNotebook.Tab',
                 background=[('selected', COLORS['bg_card'])],
                 foreground=[('selected', COLORS['text_primary'])])
        
        style.configure('Treeview',
                       background=COLORS['bg_secondary'],
                       foreground=COLORS['text_primary'],
                       fieldbackground=COLORS['bg_secondary'],
                       rowheight=28,
                       font=('Segoe UI', 10))
        style.configure('Treeview.Heading',
                       background=COLORS['bg_card'],
                       foreground=COLORS['accent'],
                       font=('Segoe UI', 10, 'bold'))
        style.map('Treeview',
                 background=[('selected', COLORS['accent'])],
                 foreground=[('selected', COLORS['text_primary'])])
        
        style.configure('Vertical.TScrollbar',
                       background=COLORS['bg_card'],
                       troughcolor=COLORS['bg_secondary'],
                       borderwidth=0,
                       arrowcolor=COLORS['text_secondary'])
        
        # Configure root window
        root.configure(bg=COLORS['bg_primary'])


class FilamentDialog(tk.Toplevel):
    """Modern dialog for adding/editing filaments"""
    def __init__(self, parent, title: str, filament: Optional[Filament] = None, currency_symbol: str = "PLN"):
        super().__init__(parent)
        self.title(title)
        self.filament = filament
        self.result = None
        self.currency_symbol = currency_symbol
        
        self.transient(parent)
        self.grab_set()
        self.resizable(False, False)
        
        ModernStyle.apply_theme(self)
        self.configure(bg=COLORS['bg_primary'])
        
        self.create_widgets()
        
        if filament:
            self.populate(filament)
        
        self.protocol("WM_DELETE_WINDOW", self.cancel)
        self.center_window()
        self.wait_visibility()
        self.focus_force()
    
    def center_window(self):
        """Center dialog on screen"""
        self.update_idletasks()
        width = 420
        height = 380
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_widgets(self):
        """Create dialog widgets"""
        main_frame = ttk.Frame(self, padding="25")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(main_frame, text="Filament Details", style='Title.TLabel')
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # Name
        ttk.Label(main_frame, text="Name:").grid(row=1, column=0, sticky=tk.W, pady=8)
        self.name_var = tk.StringVar()
        name_entry = ttk.Entry(main_frame, textvariable=self.name_var, width=35)
        name_entry.grid(row=1, column=1, pady=8, sticky='ew')
        
        # Material
        ttk.Label(main_frame, text="Material:").grid(row=2, column=0, sticky=tk.W, pady=8)
        self.material_var = tk.StringVar()
        material_combo = ttk.Combobox(main_frame, textvariable=self.material_var, width=32, state='readonly')
        material_combo['values'] = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'NYLON', 'PC', 'PVA', 'HIPS', 'OTHER']
        material_combo.grid(row=2, column=1, pady=8, sticky='ew')
        
        # Color
        ttk.Label(main_frame, text="Color:").grid(row=3, column=0, sticky=tk.W, pady=8)
        self.color_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.color_var, width=35).grid(row=3, column=1, pady=8, sticky='ew')
        
        # Weight
        ttk.Label(main_frame, text=f"Weight (grams):").grid(row=4, column=0, sticky=tk.W, pady=8)
        self.weight_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.weight_var, width=35).grid(row=4, column=1, pady=8, sticky='ew')
        
        # Cost
        ttk.Label(main_frame, text=f"Cost ({self.currency_symbol}):").grid(row=5, column=0, sticky=tk.W, pady=8)
        self.cost_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.cost_var, width=35).grid(row=5, column=1, pady=8, sticky='ew')
        
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=6, column=0, columnspan=2, pady=25)
        
        save_btn = ttk.Button(btn_frame, text="Save", command=self.save)
        save_btn.pack(side=tk.LEFT, padx=10)
        cancel_btn = ttk.Button(btn_frame, text="Cancel", command=self.cancel)
        cancel_btn.pack(side=tk.LEFT, padx=10)
    
    def populate(self, filament: Filament):
        """Populate fields with existing filament data"""
        self.name_var.set(filament.name)
        self.material_var.set(filament.material)
        self.color_var.set(filament.color)
        self.weight_var.set(str(filament.weight_grams))
        self.cost_var.set(str(filament.cost))
    
    def save(self):
        """Validate and save data"""
        try:
            name = self.name_var.get().strip()
            material = self.material_var.get().strip()
            color = self.color_var.get().strip()
            
            if not name or not material or not color:
                messagebox.showerror("Error", "All fields are required", parent=self)
                return
            
            weight = float(self.weight_var.get())
            cost = float(self.cost_var.get())
            
            if weight <= 0 or cost <= 0:
                messagebox.showerror("Error", "Weight and cost must be positive", parent=self)
                return
            
            self.result = {
                'name': name,
                'material': material,
                'color': color,
                'weight_grams': weight,
                'cost': cost
            }
            self.destroy()
        except ValueError:
            messagebox.showerror("Error", "Invalid number format", parent=self)
    
    def cancel(self):
        """Cancel dialog"""
        self.result = None
        self.destroy()


class SettingsDialog(tk.Toplevel):
    """Modern dialog for printer settings"""
    def __init__(self, parent, title: str, settings: PrinterSettings):
        super().__init__(parent)
        self.title(title)
        self.settings = settings
        self.result = None
        
        self.transient(parent)
        self.grab_set()
        self.resizable(False, False)
        
        ModernStyle.apply_theme(self)
        self.configure(bg=COLORS['bg_primary'])
        
        self.create_widgets()
        self.populate()
        
        self.protocol("WM_DELETE_WINDOW", self.cancel)
        self.center_window()
        self.wait_visibility()
        self.focus_force()
    
    def center_window(self):
        """Center dialog on screen"""
        self.update_idletasks()
        width = 550
        height = 580
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_widgets(self):
        """Create dialog widgets"""
        main_frame = ttk.Frame(self, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(main_frame, text="Printer Settings", style='Title.TLabel')
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 15))
        
        # Create notebook for tabs
        notebook = ttk.Notebook(main_frame)
        notebook.grid(row=1, column=0, columnspan=2, sticky='nsew', pady=10)
        
        # Tab 1: Printer
        printer_frame = ttk.Frame(notebook, padding="15")
        notebook.add(printer_frame, text="  Printer  ")
        
        row = 0
        ttk.Label(printer_frame, text="Printer Name:").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.printer_name_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.printer_name_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        ttk.Label(printer_frame, text=f"Printer Cost:").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.printer_cost_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.printer_cost_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        ttk.Label(printer_frame, text="Lifetime (hours):").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.lifetime_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.lifetime_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        ttk.Label(printer_frame, text="Simple Hourly Rate:").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.hourly_rate_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.hourly_rate_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        self.use_detailed_var = tk.BooleanVar()
        ttk.Checkbutton(printer_frame, text="Use detailed calculation (amortization + energy + parts)",
                       variable=self.use_detailed_var).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=10)
        
        # Tab 2: Energy & Parts
        energy_frame = ttk.Frame(notebook, padding="15")
        notebook.add(energy_frame, text="  Energy & Parts  ")
        
        row = 0
        ttk.Label(energy_frame, text="Avg Power (Watts):").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.power_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.power_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        ttk.Label(energy_frame, text=f"Energy Cost (/kWh):").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.energy_cost_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.energy_cost_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        ttk.Separator(energy_frame, orient='horizontal').grid(row=row, column=0, columnspan=2, sticky='ew', pady=15)
        
        row += 1
        ttk.Label(energy_frame, text="Nozzle Cost:").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.nozzle_cost_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.nozzle_cost_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        ttk.Label(energy_frame, text="Nozzle Lifetime (hours):").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.nozzle_lifetime_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.nozzle_lifetime_var, width=35).grid(row=row, column=1, pady=8)
        
        # Tab 3: Waste & Other
        waste_frame = ttk.Frame(notebook, padding="15")
        notebook.add(waste_frame, text="  Waste & Other  ")
        
        row = 0
        ttk.Label(waste_frame, text="Purge/Waste (%):").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.purge_var = tk.StringVar()
        ttk.Entry(waste_frame, textvariable=self.purge_var, width=35).grid(row=row, column=1, pady=8)
        ttk.Label(waste_frame, text="%").grid(row=row, column=2, sticky=tk.W, pady=8)
        
        row += 1
        ttk.Label(waste_frame, text="Failure Rate (%):").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.failure_var = tk.StringVar()
        ttk.Entry(waste_frame, textvariable=self.failure_var, width=35).grid(row=row, column=1, pady=8)
        ttk.Label(waste_frame, text="%").grid(row=row, column=2, sticky=tk.W, pady=8)
        
        row += 1
        ttk.Label(waste_frame, text=f"Post-processing Cost:").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.post_process_var = tk.StringVar()
        ttk.Entry(waste_frame, textvariable=self.post_process_var, width=35).grid(row=row, column=1, pady=8)
        
        # Tab 4: Currency
        currency_frame = ttk.Frame(notebook, padding="15")
        notebook.add(currency_frame, text="  Currency  ")
        
        row = 0
        ttk.Label(currency_frame, text="Currency Symbol:").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.currency_symbol_var = tk.StringVar()
        ttk.Entry(currency_frame, textvariable=self.currency_symbol_var, width=35).grid(row=row, column=1, pady=8)
        
        row += 1
        ttk.Label(currency_frame, text="Symbol Position:").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.currency_position_var = tk.StringVar()
        position_combo = ttk.Combobox(currency_frame, textvariable=self.currency_position_var, width=32, state='readonly')
        position_combo['values'] = ['before', 'after']
        position_combo.grid(row=row, column=1, pady=8, sticky='ew')
        
        row += 1
        ttk.Label(currency_frame, text="Examples:", style='Header.TLabel').grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(15, 5))
        self.example_label = ttk.Label(currency_frame, text="", foreground=COLORS['text_secondary'])
        self.example_label.grid(row=row+1, column=0, columnspan=2, sticky=tk.W, pady=5)
        self.update_example()
        
        # Bind to update example
        self.currency_symbol_var.trace_add('write', lambda *args: self.update_example())
        self.currency_position_var.trace_add('write', lambda *args: self.update_example())
        
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=2, column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="Save", command=self.save).pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel).pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="Reset to Defaults", command=self.reset_defaults).pack(side=tk.RIGHT, padx=10)
    
    def update_example(self):
        """Update currency example display"""
        symbol = self.currency_symbol_var.get() or "PLN"
        position = self.currency_position_var.get() or "after"
        if position == "before":
            self.example_label.config(text=f"{symbol} 100.00  |  {symbol}1,234.56")
        else:
            self.example_label.config(text=f"100.00 {symbol}  |  1,234.56 {symbol}")
    
    def populate(self):
        """Populate fields with current settings"""
        s = self.settings
        self.printer_name_var.set(s.printer_name)
        self.printer_cost_var.set(str(s.printer_cost))
        self.lifetime_var.set(str(s.printer_lifetime_hours))
        self.hourly_rate_var.set(str(s.hourly_rate))
        self.use_detailed_var.set(s.use_detailed_calculation)
        self.power_var.set(str(s.avg_power_watts))
        self.energy_cost_var.set(str(s.energy_cost_per_kwh))
        self.nozzle_cost_var.set(str(s.nozzle_cost))
        self.nozzle_lifetime_var.set(str(s.nozzle_lifetime_hours))
        self.purge_var.set(str(s.purge_percentage))
        self.failure_var.set(str(s.failure_rate))
        self.post_process_var.set(str(s.post_processing_cost))
        self.currency_symbol_var.set(s.currency_symbol)
        self.currency_position_var.set(s.currency_position)
        self.update_example()
    
    def reset_defaults(self):
        """Reset to default values"""
        defaults = PrinterSettings()
        self.printer_cost_var.set(str(defaults.printer_cost))
        self.lifetime_var.set(str(defaults.printer_lifetime_hours))
        self.hourly_rate_var.set(str(defaults.hourly_rate))
        self.use_detailed_var.set(defaults.use_detailed_calculation)
        self.power_var.set(str(defaults.avg_power_watts))
        self.energy_cost_var.set(str(defaults.energy_cost_per_kwh))
        self.nozzle_cost_var.set(str(defaults.nozzle_cost))
        self.nozzle_lifetime_var.set(str(defaults.nozzle_lifetime_hours))
        self.purge_var.set(str(defaults.purge_percentage))
        self.failure_var.set(str(defaults.failure_rate))
        self.post_process_var.set(str(defaults.post_processing_cost))
        self.currency_symbol_var.set(defaults.currency_symbol)
        self.currency_position_var.set(defaults.currency_position)
        self.update_example()
    
    def save(self):
        """Validate and save settings"""
        try:
            self.result = PrinterSettings()
            self.result.printer_name = self.printer_name_var.get().strip() or "My Printer"
            self.result.printer_cost = float(self.printer_cost_var.get())
            self.result.printer_lifetime_hours = float(self.lifetime_var.get())
            self.result.hourly_rate = float(self.hourly_rate_var.get())
            self.result.use_detailed_calculation = self.use_detailed_var.get()
            self.result.avg_power_watts = float(self.power_var.get())
            self.result.energy_cost_per_kwh = float(self.energy_cost_var.get())
            self.result.nozzle_cost = float(self.nozzle_cost_var.get())
            self.result.nozzle_lifetime_hours = float(self.nozzle_lifetime_var.get())
            self.result.purge_percentage = float(self.purge_var.get())
            self.result.failure_rate = float(self.failure_var.get())
            self.result.post_processing_cost = float(self.post_process_var.get())
            self.result.currency_symbol = self.currency_symbol_var.get().strip() or "PLN"
            self.result.currency_position = self.currency_position_var.get().strip() or "after"
            
            if self.result.printer_cost <= 0 or self.result.printer_lifetime_hours <= 0:
                raise ValueError("Invalid values")
            
            self.destroy()
        except ValueError:
            messagebox.showerror("Error", "Please enter valid numeric values", parent=self)
    
    def cancel(self):
        """Cancel dialog"""
        self.result = None
        self.destroy()


class CostCalculatorApp:
    """Main application class with modern UI"""
    
    DATA_FILE = "print_cost_data.json"
    
    def __init__(self, root):
        self.root = root
        self.root.title("3D Print Cost Calculator")
        self.root.geometry("1100x750")
        self.root.minsize(900, 600)
        
        # Data
        self.filaments: List[Filament] = []
        self.settings = PrinterSettings()
        self.current_job: Optional[PrintJob] = None
        
        # Apply modern theme
        ModernStyle.apply_theme(root)
        
        # Setup UI first (before loading data to avoid status_label error)
        self.setup_ui()
        
        # Load saved data after UI is ready
        self.load_data()
        
        # Bind close event
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
    
    def setup_ui(self):
        """Setup the user interface"""
        # Main container with padding
        main_container = ttk.Frame(self.root, padding="15")
        main_container.pack(fill=tk.BOTH, expand=True)
        
        # Header
        header_frame = ttk.Frame(main_container)
        header_frame.pack(fill=tk.X, pady=(0, 15))
        
        title_label = ttk.Label(header_frame, text="🖨️ 3D Print Cost Calculator", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        settings_btn = ttk.Button(header_frame, text="⚙️ Settings", command=self.open_settings)
        settings_btn.pack(side=tk.RIGHT)
        
        # Content area - split into left and right panels
        content_frame = ttk.Frame(main_container)
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Left panel - Filaments
        left_panel = ttk.LabelFrame(content_frame, text="Filaments", padding="12")
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        
        # Filament listbox with scrollbar
        list_frame = ttk.Frame(left_panel)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        self.filament_listbox = tk.Listbox(list_frame, 
                                           width=35, 
                                           height=18,
                                           bg=COLORS['bg_secondary'],
                                           fg=COLORS['text_primary'],
                                           selectbackground=COLORS['accent'],
                                           selectforeground=COLORS['text_primary'],
                                           activestyle='none',
                                           font=('Segoe UI', 10),
                                           borderwidth=0,
                                           highlightthickness=0)
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.filament_listbox.yview)
        self.filament_listbox.configure(yscrollcommand=scrollbar.set)
        
        self.filament_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Filament buttons
        filament_btn_frame = ttk.Frame(left_panel)
        filament_btn_frame.pack(fill=tk.X, pady=(10, 0))
        
        add_btn = ttk.Button(filament_btn_frame, text="+ Add Filament", command=self.add_filament)
        add_btn.pack(side=tk.LEFT, padx=(0, 5))
        edit_btn = ttk.Button(filament_btn_frame, text="✏️ Edit", command=self.edit_filament)
        edit_btn.pack(side=tk.LEFT, padx=5)
        delete_btn = ttk.Button(filament_btn_frame, text="🗑️ Delete", command=self.delete_filament)
        delete_btn.pack(side=tk.LEFT, padx=5)
        
        # Right panel - Calculator
        right_panel = ttk.LabelFrame(content_frame, text="Cost Calculator", padding="12")
        right_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Input frame
        input_frame = ttk.Frame(right_panel)
        input_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Job name
        job_frame = ttk.Frame(input_frame)
        job_frame.pack(fill=tk.X, pady=5)
        ttk.Label(job_frame, text="Job Name:").pack(side=tk.LEFT)
        self.job_name_var = tk.StringVar()
        ttk.Entry(job_frame, textvariable=self.job_name_var, width=40).pack(side=tk.LEFT, padx=10)
        
        # Filament selection
        filament_sel_frame = ttk.Frame(input_frame)
        filament_sel_frame.pack(fill=tk.X, pady=5)
        ttk.Label(filament_sel_frame, text="Filament:").pack(side=tk.LEFT)
        self.filament_var = tk.StringVar()
        self.filament_combo = ttk.Combobox(filament_sel_frame, textvariable=self.filament_var, width=37, state='readonly')
        self.filament_combo.pack(side=tk.LEFT, padx=10)
        
        # Print time and filament used
        details_frame = ttk.Frame(input_frame)
        details_frame.pack(fill=tk.X, pady=10)
        
        time_frame = ttk.Frame(details_frame)
        time_frame.pack(side=tk.LEFT, padx=(0, 20))
        ttk.Label(time_frame, text="Print Time (hours):").pack(anchor=tk.W)
        self.time_var = tk.StringVar(value="0")
        ttk.Entry(time_frame, textvariable=self.time_var, width=15).pack(anchor=tk.W, pady=3)
        
        weight_frame = ttk.Frame(details_frame)
        weight_frame.pack(side=tk.LEFT)
        ttk.Label(weight_frame, text="Filament Used (g):").pack(anchor=tk.W)
        self.weight_var = tk.StringVar(value="0")
        ttk.Entry(weight_frame, textvariable=self.weight_var, width=15).pack(anchor=tk.W, pady=3)
        
        support_frame = ttk.Frame(details_frame)
        support_frame.pack(side=tk.LEFT, padx=(20, 0))
        ttk.Label(support_frame, text="Supports (g):").pack(anchor=tk.W)
        self.support_var = tk.StringVar(value="0")
        ttk.Entry(support_frame, textvariable=self.support_var, width=15).pack(anchor=tk.W, pady=3)
        
        # Calculate button
        calc_btn = ttk.Button(input_frame, text="📊 Calculate Cost", command=self.calculate_cost)
        calc_btn.pack(pady=15)
        
        # Results frame
        results_frame = ttk.LabelFrame(right_panel, text="Results", padding="12")
        results_frame.pack(fill=tk.BOTH, expand=True)
        
        # Results text area
        self.results_text = tk.Text(results_frame, 
                                   wrap=tk.WORD, 
                                   width=50, 
                                   height=15,
                                   bg=COLORS['bg_secondary'],
                                   fg=COLORS['text_primary'],
                                   font=('Consolas', 10),
                                   borderwidth=0,
                                   highlightthickness=0,
                                   padx=10,
                                   pady=10)
        results_scrollbar = ttk.Scrollbar(results_frame, orient=tk.VERTICAL, command=self.results_text.yview)
        self.results_text.configure(yscrollcommand=results_scrollbar.set)
        
        self.results_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        results_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Status bar
        status_frame = ttk.Frame(self.root)
        status_frame.pack(fill=tk.X, side=tk.BOTTOM)
        
        self.status_label = ttk.Label(status_frame, 
                                     text="Ready", 
                                     relief=tk.FLAT,
                                     anchor=tk.W,
                                     foreground=COLORS['text_secondary'],
                                     font=('Segoe UI', 9))
        self.status_label.pack(fill=tk.X, padx=15, pady=8)
        
        # Update filament list
        self.update_filament_list()
    
    def format_currency(self, amount: float) -> str:
        """Format amount with currency symbol"""
        symbol = self.settings.currency_symbol
        position = self.settings.currency_position
        
        formatted = f"{amount:.2f}"
        
        if position == "before":
            return f"{symbol}{formatted}"
        else:
            return f"{formatted} {symbol}"
    
    def update_filament_list(self):
        """Update the filament listbox and combo box"""
        self.filament_listbox.delete(0, tk.END)
        self.filament_combo['values'] = []
        
        for filament in self.filaments:
            display = f"{filament.name} - {filament.material} ({filament.color})"
            self.filament_listbox.insert(tk.END, display)
            self.filament_combo['values'] = tuple(list(self.filament_combo['values']) + [display])
        
        count = len(self.filaments)
        self.status_label.config(text=f"Loaded {count} filament{'s' if count != 1 else ''}")
    
    def add_filament(self):
        """Add a new filament"""
        dialog = FilamentDialog(self.root, "Add New Filament", currency_symbol=self.settings.currency_symbol)
        self.root.wait_window(dialog)
        
        if dialog.result:
            filament = Filament(
                name=dialog.result['name'],
                material=dialog.result['material'],
                color=dialog.result['color'],
                weight_grams=dialog.result['weight_grams'],
                cost=dialog.result['cost'],
                currency=self.settings.currency_symbol
            )
            self.filaments.append(filament)
            self.update_filament_list()
            self.save_data()
            self.status_label.config(text=f"Added: {filament.name}")
    
    def edit_filament(self):
        """Edit selected filament"""
        selection = self.filament_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a filament to edit")
            return
        
        filament = self.filaments[selection[0]]
        dialog = FilamentDialog(self.root, "Edit Filament", filament, self.settings.currency_symbol)
        self.root.wait_window(dialog)
        
        if dialog.result:
            filament.name = dialog.result['name']
            filament.material = dialog.result['material']
            filament.color = dialog.result['color']
            filament.weight_grams = dialog.result['weight_grams']
            filament.cost = dialog.result['cost']
            filament.currency = self.settings.currency_symbol
            
            self.update_filament_list()
            self.save_data()
            self.status_label.config(text=f"Updated: {filament.name}")
    
    def delete_filament(self):
        """Delete selected filament"""
        selection = self.filament_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a filament to delete")
            return
        
        filament = self.filaments[selection[0]]
        if messagebox.askyesno("Confirm Delete", f"Delete '{filament.name}'?"):
            self.filaments.pop(selection[0])
            self.update_filament_list()
            self.save_data()
            self.status_label.config(text=f"Deleted: {filament.name}")
    
    def open_settings(self):
        """Open settings dialog"""
        dialog = SettingsDialog(self.root, "Printer Settings", self.settings)
        self.root.wait_window(dialog)
        
        if dialog.result:
            self.settings = dialog.result
            self.save_data()
            self.status_label.config(text="Settings updated")
    
    def calculate_cost(self):
        """Calculate print cost"""
        try:
            job_name = self.job_name_var.get().strip() or "Unnamed Print"
            filament_name = self.filament_var.get()
            
            if not filament_name:
                messagebox.showwarning("Warning", "Please select a filament")
                return
            
            # Find selected filament
            filament = None
            for f in self.filaments:
                display = f"{f.name} - {f.material} ({f.color})"
                if display == filament_name:
                    filament = f
                    break
            
            if not filament:
                messagebox.showerror("Error", "Selected filament not found")
                return
            
            print_time = float(self.time_var.get())
            filament_used = float(self.weight_var.get())
            supports = float(self.support_var.get())
            
            if print_time < 0 or filament_used < 0 or supports < 0:
                raise ValueError("Negative values not allowed")
            
            # Create and calculate job
            self.current_job = PrintJob(filament, self.settings)
            self.current_job.job_name = job_name
            self.current_job.print_time_hours = print_time
            self.current_job.filament_used_grams = filament_used
            self.current_job.support_grams = supports
            
            breakdown = self.current_job.calculate()
            
            # Display results
            self.display_results(breakdown, job_name, filament)
            
        except ValueError as e:
            messagebox.showerror("Error", f"Invalid input: {str(e)}")
    
    def display_results(self, breakdown: dict, job_name: str, filament: Filament):
        """Display calculation results"""
        cur = self.format_currency
        
        results = f"""
╔══════════════════════════════════════════╗
║  📋 COST BREAKDOWN: {job_name[:30]:<30} ║
╠══════════════════════════════════════════╣

🧵 FILAMENT INFO
   Name: {filament.name}
   Material: {filament.material}
   Price: {cur(filament.price_per_gram)}/g

📊 MATERIAL USAGE
   Base filament: {breakdown['base_filament_grams']:.1f}g
   With purge (+{breakdown['purge_added_percent']:.0f}%): {breakdown['with_purge_grams']:.1f}g
   With failure rate (+{breakdown['failure_rate_percent']:.0f}%): {breakdown['with_failure_grams']:.1f}g
   
   💰 Material Cost: {cur(breakdown['material_cost'])}

⏱️ MACHINE COSTS
   Amortization: {cur(breakdown['machine_amortization'])}
   Parts (nozzle, etc.): {cur(breakdown['machine_parts'])}
   
   🔧 Total Machine: {cur(breakdown['machine_amortization'] + breakdown['machine_parts'])}

⚡ ENERGY
   💡 Energy Cost: {cur(breakdown['energy_cost'])}

🎨 POST-PROCESSING
   Cost: {cur(breakdown['post_processing'])}

╠══════════════════════════════════════════╣
║  💵 TOTAL COST: {cur(breakdown['total']):>20} ║
╚══════════════════════════════════════════╝
"""
        
        self.results_text.delete(1.0, tk.END)
        self.results_text.insert(1.0, results)
        self.status_label.config(text=f"Calculated: {job_name}")
    
    def save_data(self):
        """Save data to JSON file"""
        try:
            data = {
                'filaments': [f.to_dict() for f in self.filaments],
                'settings': self.settings.to_dict(),
                'last_updated': datetime.now().isoformat()
            }
            
            with open(self.DATA_FILE, 'w') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save data: {str(e)}")
    
    def load_data(self):
        """Load data from JSON file"""
        try:
            if os.path.exists(self.DATA_FILE):
                with open(self.DATA_FILE, 'r') as f:
                    data = json.load(f)
                
                self.filaments = [Filament.from_dict(fd) for fd in data.get('filaments', [])]
                
                if 'settings' in data:
                    self.settings = PrinterSettings.from_dict(data['settings'])
                
                self.update_filament_list()
                self.status_label.config(text=f"Loaded {len(self.filaments)} filament(s)")
            else:
                self.status_label.config(text="Welcome! Add your first filament.")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load data: {str(e)}")
            self.status_label.config(text="Started with empty data")
    
    def on_close(self):
        """Handle window close"""
        self.save_data()
        self.root.destroy()


def main():
    """Main entry point"""
    root = tk.Tk()
    
    # Center window on screen
    root.update_idletasks()
    width = 1100
    height = 750
    x = (root.winfo_screenwidth() // 2) - (width // 2)
    y = (root.winfo_screenheight() // 2) - (height // 2)
    root.geometry(f'{width}x{height}+{x}+{y}')
    
    app = CostCalculatorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
