"""
3D Print Cost Calculator
A Windows desktop application for calculating 3D printing costs
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import json
import os
from datetime import datetime
from typing import Dict, List, Optional

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
        self.printer_cost = 2000.0  # PLN
        self.printer_lifetime_hours = 5000  # hours
        
        # Energy consumption
        self.avg_power_watts = 150  # average watts during printing
        self.energy_cost_per_kwh = 1.0  # PLN per kWh
        
        # Machine hourly rate (alternative to detailed calculation)
        self.hourly_rate = 5.0  # PLN per hour
        
        # Parts replacement
        self.nozzle_cost = 10.0  # PLN
        self.nozzle_lifetime_hours = 500  # hours
        
        # Purge/waste percentage
        self.purge_percentage = 10.0  # % extra material for purge/tests
        
        # Other costs
        self.failure_rate = 5.0  # % failed prints
        self.post_processing_cost = 0.0  # PLN per print average
        
        # Use detailed calculation or simple hourly rate
        self.use_detailed_calculation = True
    
    def get_machine_cost_per_hour(self) -> float:
        """Calculate machine cost per hour based on settings"""
        if not self.use_detailed_calculation:
            return self.hourly_rate
        
        # Amortization per hour
        amortization = self.printer_cost / self.printer_lifetime_hours
        
        # Energy cost per hour
        energy_cost = (self.avg_power_watts / 1000) * self.energy_cost_per_kwh
        
        # Parts replacement per hour
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
        
        # Print job details
        self.job_name = ""
        self.print_time_hours = 0.0
        self.filament_used_grams = 0.0
        self.support_grams = 0.0
        self.infill_percentage = 20
        self.layer_height = 0.2
        
        # Results
        self.material_cost = 0.0
        self.machine_cost = 0.0
        self.energy_cost = 0.0
        self.total_cost = 0.0
        self.breakdown = {}
    
    def calculate(self) -> dict:
        """Calculate all costs for this print job"""
        # Total filament used (including supports)
        total_filament = self.filament_used_grams + self.support_grams
        
        # Add purge/waste percentage
        purge_multiplier = 1 + (self.settings.purge_percentage / 100)
        total_with_purge = total_filament * purge_multiplier
        
        # Add failure rate consideration
        failure_multiplier = 1 + (self.settings.failure_rate / 100)
        final_filament = total_with_purge * failure_multiplier
        
        # Material cost
        self.material_cost = final_filament * self.filament.price_per_gram
        
        # Machine cost
        self.machine_cost = self.print_time_hours * self.settings.get_machine_cost_per_hour()
        
        # Energy cost (only if using detailed calculation)
        if self.settings.use_detailed_calculation:
            self.energy_cost = self.settings.get_energy_cost(self.print_time_hours)
        else:
            self.energy_cost = 0.0
        
        # Post processing
        post_process = self.settings.post_processing_cost
        
        # Total
        self.total_cost = self.material_cost + self.machine_cost + self.energy_cost + post_process
        
        # Detailed breakdown
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


class FilamentDialog(simpledialog.Toplevel):
    """Dialog for adding/editing filaments"""
    def __init__(self, parent, title: str, filament: Optional[Filament] = None):
        super().__init__(parent)
        self.title(title)
        self.filament = filament
        self.result = None
        
        self.transient(parent)
        self.grab_set()
        
        self.create_widgets()
        
        if filament:
            self.populate(filament)
        
        self.protocol("WM_DELETE_WINDOW", self.cancel)
        self.center_window()
    
    def center_window(self):
        """Center dialog on screen"""
        self.update_idletasks()
        width = 400
        height = 350
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
        self.resizable(False, False)
    
    def create_widgets(self):
        """Create dialog widgets"""
        main_frame = ttk.Frame(self, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Name
        ttk.Label(main_frame, text="Name:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.name_var, width=30).grid(row=0, column=1, pady=5)
        
        # Material
        ttk.Label(main_frame, text="Material:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.material_var = tk.StringVar()
        material_combo = ttk.Combobox(main_frame, textvariable=self.material_var, width=27, state='readonly')
        material_combo['values'] = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'NYLON', 'PC', 'PVA', 'HIPS', 'OTHER']
        material_combo.grid(row=1, column=1, pady=5)
        
        # Color
        ttk.Label(main_frame, text="Color:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.color_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.color_var, width=30).grid(row=2, column=1, pady=5)
        
        # Weight
        ttk.Label(main_frame, text="Weight (grams):").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.weight_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.weight_var, width=30).grid(row=3, column=1, pady=5)
        
        # Cost
        ttk.Label(main_frame, text="Cost (PLN):").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.cost_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.cost_var, width=30).grid(row=4, column=1, pady=5)
        
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=5, column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="Save", command=self.save).pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel).pack(side=tk.LEFT, padx=10)
    
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
            weight = float(self.weight_var.get())
            cost = float(self.cost_var.get())
            
            if not name or not material or not color:
                messagebox.showerror("Error", "All fields are required", parent=self)
                return
            
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


class SettingsDialog(simpledialog.Toplevel):
    """Dialog for printer settings"""
    def __init__(self, parent, title: str, settings: PrinterSettings):
        super().__init__(parent)
        self.title(title)
        self.settings = settings
        self.result = None
        
        self.transient(parent)
        self.grab_set()
        
        self.create_widgets()
        self.populate()
        
        self.protocol("WM_DELETE_WINDOW", self.cancel)
        self.center_window()
    
    def center_window(self):
        """Center dialog on screen"""
        self.update_idletasks()
        width = 500
        height = 550
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_widgets(self):
        """Create dialog widgets"""
        main_frame = ttk.Frame(self, padding="15")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create notebook for tabs
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill=tk.BOTH, expand=True)
        
        # Tab 1: Printer
        printer_frame = ttk.Frame(notebook, padding="10")
        notebook.add(printer_frame, text="Printer")
        
        row = 0
        ttk.Label(printer_frame, text="Printer Name:").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.printer_name_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.printer_name_var, width=30).grid(row=row, column=1, pady=3)
        
        row += 1
        ttk.Label(printer_frame, text="Printer Cost (PLN):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.printer_cost_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.printer_cost_var, width=30).grid(row=row, column=1, pady=3)
        
        row += 1
        ttk.Label(printer_frame, text="Lifetime (hours):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.lifetime_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.lifetime_var, width=30).grid(row=row, column=1, pady=3)
        
        row += 1
        ttk.Label(printer_frame, text="Simple Hourly Rate (PLN):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.hourly_rate_var = tk.StringVar()
        ttk.Entry(printer_frame, textvariable=self.hourly_rate_var, width=30).grid(row=row, column=1, pady=3)
        
        row += 1
        self.use_detailed_var = tk.BooleanVar()
        ttk.Checkbutton(printer_frame, text="Use detailed calculation (amortization + energy + parts)",
                       variable=self.use_detailed_var).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        # Tab 2: Energy & Parts
        energy_frame = ttk.Frame(notebook, padding="10")
        notebook.add(energy_frame, text="Energy & Parts")
        
        row = 0
        ttk.Label(energy_frame, text="Avg Power (Watts):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.power_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.power_var, width=30).grid(row=row, column=1, pady=3)
        
        row += 1
        ttk.Label(energy_frame, text="Energy Cost (PLN/kWh):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.energy_cost_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.energy_cost_var, width=30).grid(row=row, column=1, pady=3)
        
        row += 1
        ttk.Separator(energy_frame, orient='horizontal').grid(row=row, column=0, columnspan=2, sticky='ew', pady=10)
        
        row += 1
        ttk.Label(energy_frame, text="Nozzle Cost (PLN):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.nozzle_cost_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.nozzle_cost_var, width=30).grid(row=row, column=1, pady=3)
        
        row += 1
        ttk.Label(energy_frame, text="Nozzle Lifetime (hours):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.nozzle_lifetime_var = tk.StringVar()
        ttk.Entry(energy_frame, textvariable=self.nozzle_lifetime_var, width=30).grid(row=row, column=1, pady=3)
        
        # Tab 3: Waste & Other
        waste_frame = ttk.Frame(notebook, padding="10")
        notebook.add(waste_frame, text="Waste & Other")
        
        row = 0
        ttk.Label(waste_frame, text="Purge/Waste (%):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.purge_var = tk.StringVar()
        ttk.Entry(waste_frame, textvariable=self.purge_var, width=30).grid(row=row, column=1, pady=3)
        ttk.Label(waste_frame, text="%").grid(row=row, column=2, sticky=tk.W, pady=3)
        
        row += 1
        ttk.Label(waste_frame, text="Failure Rate (%):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.failure_var = tk.StringVar()
        ttk.Entry(waste_frame, textvariable=self.failure_var, width=30).grid(row=row, column=1, pady=3)
        ttk.Label(waste_frame, text="%").grid(row=row, column=2, sticky=tk.W, pady=3)
        
        row += 1
        ttk.Label(waste_frame, text="Post-processing Cost (PLN):").grid(row=row, column=0, sticky=tk.W, pady=3)
        self.post_process_var = tk.StringVar()
        ttk.Entry(waste_frame, textvariable=self.post_process_var, width=30).grid(row=row, column=1, pady=3)
        
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(pady=10)
        
        ttk.Button(btn_frame, text="Save", command=self.save).pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel).pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="Reset to Defaults", command=self.reset_defaults).pack(side=tk.RIGHT, padx=10)
    
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
            
            if self.result.printer_cost <= 0 or self.result.printer_lifetime_hours <= 0:
                raise ValueError("Invalid values")
            
            self.destroy()
        except ValueError:
            messagebox.showerror("Error", "Invalid number format. Please check all fields.", parent=self)
    
    def cancel(self):
        """Cancel dialog"""
        self.result = None
        self.destroy()


class CostCalculatorApp:
    """Main application class"""
    
    DATA_FILE = "print_cost_data.json"
    
    def __init__(self, root):
        self.root = root
        self.root.title("3D Print Cost Calculator")
        self.root.geometry("1000x700")
        
        # Data
        self.filaments: List[Filament] = []
        self.settings = PrinterSettings()
        self.current_job: Optional[PrintJob] = None
        
        # Load saved data
        self.load_data()
        
        # Setup UI
        self.setup_ui()
        
        # Bind close event
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
    
    def setup_ui(self):
        """Setup the user interface"""
        # Main container
        main_container = ttk.Frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left panel - Filaments and Settings
        left_panel = ttk.LabelFrame(main_container, text="Filaments", padding="10")
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        
        # Filament listbox with scrollbar
        list_frame = ttk.Frame(left_panel)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        self.filament_listbox = tk.Listbox(list_frame, width=35, height=15)
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.filament_listbox.yview)
        self.filament_listbox.configure(yscrollcommand=scrollbar.set)
        
        self.filament_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Filament buttons
        fil_btn_frame = ttk.Frame(left_panel)
        fil_btn_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(fil_btn_frame, text="Add Filament", command=self.add_filament).pack(side=tk.LEFT, padx=2)
        ttk.Button(fil_btn_frame, text="Edit", command=self.edit_filament).pack(side=tk.LEFT, padx=2)
        ttk.Button(fil_btn_frame, text="Remove", command=self.remove_filament).pack(side=tk.LEFT, padx=2)
        
        # Selected filament info
        self.filament_info_label = ttk.Label(left_panel, text="", wraplength=250)
        self.filament_info_label.pack(fill=tk.X, pady=(10, 0))
        
        # Settings button
        ttk.Button(left_panel, text="⚙ Printer Settings", command=self.open_settings).pack(fill=tk.X, pady=(10, 0))
        
        # Right panel - Calculator
        right_panel = ttk.LabelFrame(main_container, text="Print Job Calculator", padding="10")
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Input section
        input_frame = ttk.LabelFrame(right_panel, text="Print Details", padding="10")
        input_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Grid layout for inputs
        row = 0
        ttk.Label(input_frame, text="Job Name:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.job_name_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.job_name_var, width=30).grid(row=row, column=1, pady=5)
        
        row += 1
        ttk.Label(input_frame, text="Select Filament:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.filament_select_var = tk.StringVar()
        self.filament_combo = ttk.Combobox(input_frame, textvariable=self.filament_select_var, width=27, state='readonly')
        self.filament_combo.grid(row=row, column=1, pady=5)
        self.filament_combo.bind('<<ComboboxSelected>>', self.on_filament_selected)
        
        row += 1
        ttk.Label(input_frame, text="Print Time (hours):").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.print_time_var = tk.StringVar(value="0")
        ttk.Entry(input_frame, textvariable=self.print_time_var, width=30).grid(row=row, column=1, pady=5)
        
        row += 1
        ttk.Label(input_frame, text="Filament Used (grams):").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.filament_used_var = tk.StringVar(value="0")
        ttk.Entry(input_frame, textvariable=self.filament_used_var, width=30).grid(row=row, column=1, pady=5)
        
        row += 1
        ttk.Label(input_frame, text="Support Material (grams):").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.support_var = tk.StringVar(value="0")
        ttk.Entry(input_frame, textvariable=self.support_var, width=30).grid(row=row, column=1, pady=5)
        
        # Calculate button
        calc_btn = ttk.Button(input_frame, text="📊 Calculate Cost", command=self.calculate_cost)
        calc_btn.grid(row=row+1, column=0, columnspan=2, pady=15)
        
        # Results section
        results_frame = ttk.LabelFrame(right_panel, text="Cost Breakdown", padding="10")
        results_frame.pack(fill=tk.BOTH, expand=True)
        
        # Results text area
        self.results_text = tk.Text(results_frame, height=18, width=60, wrap=tk.WORD, font=('Consolas', 10))
        results_scrollbar = ttk.Scrollbar(results_frame, orient=tk.VERTICAL, command=self.results_text.yview)
        self.results_text.configure(yscrollcommand=results_scrollbar.set)
        
        self.results_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        results_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Status bar
        status_frame = ttk.Frame(self.root)
        status_frame.pack(fill=tk.X, side=tk.BOTTOM)
        
        self.status_label = ttk.Label(status_frame, text="Ready", relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(fill=tk.X, padx=10, pady=5)
        
        # Update filament list
        self.update_filament_list()
    
    def update_filament_list(self):
        """Update the filament listbox and combo box"""
        self.filament_listbox.delete(0, tk.END)
        self.filament_combo['values'] = []
        
        for i, filament in enumerate(self.filaments):
            display = f"{filament.name} - {filament.material} ({filament.color})"
            self.filament_listbox.insert(tk.END, display)
            self.filament_combo['values'] = tuple(list(self.filament_combo['values']) + [display])
        
        self.status_label.config(text=f"Loaded {len(self.filaments)} filament(s)")
    
    def add_filament(self):
        """Add a new filament"""
        dialog = FilamentDialog(self.root, "Add New Filament")
        self.root.wait_window(dialog)
        
        if dialog.result:
            filament = Filament(
                name=dialog.result['name'],
                material=dialog.result['material'],
                color=dialog.result['color'],
                weight_grams=dialog.result['weight_grams'],
                cost=dialog.result['cost']
            )
            self.filaments.append(filament)
            self.update_filament_list()
            self.save_data()
            self.status_label.config(text=f"Added filament: {filament.name}")
    
    def edit_filament(self):
        """Edit selected filament"""
        selection = self.filament_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a filament to edit")
            return
        
        index = selection[0]
        filament = self.filaments[index]
        
        dialog = FilamentDialog(self.root, "Edit Filament", filament)
        self.root.wait_window(dialog)
        
        if dialog.result:
            filament.name = dialog.result['name']
            filament.material = dialog.result['material']
            filament.color = dialog.result['color']
            filament.weight_grams = dialog.result['weight_grams']
            filament.cost = dialog.result['cost']
            
            self.update_filament_list()
            self.save_data()
            self.status_label.config(text=f"Updated filament: {filament.name}")
    
    def remove_filament(self):
        """Remove selected filament"""
        selection = self.filament_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a filament to remove")
            return
        
        index = selection[0]
        filament = self.filaments[index]
        
        if messagebox.askyesno("Confirm", f"Remove filament '{filament.name}'?"):
            del self.filaments[index]
            self.update_filament_list()
            self.save_data()
            self.status_label.config(text=f"Removed filament: {filament.name}")
    
    def on_filament_selected(self, event=None):
        """Handle filament selection in combo box"""
        selection = self.filament_combo.current()
        if selection >= 0 and selection < len(self.filaments):
            filament = self.filaments[selection]
            info = (f"Price: {filament.price_per_gram:.4f} PLN/g\n"
                   f"Spool: {filament.weight_grams}g for {filament.cost:.2f} PLN")
            self.filament_info_label.config(text=info)
    
    def open_settings(self):
        """Open printer settings dialog"""
        dialog = SettingsDialog(self.root, "Printer Settings", self.settings)
        self.root.wait_window(dialog)
        
        if dialog.result:
            self.settings = dialog.result
            self.save_data()
            self.status_label.config(text="Settings updated")
            
            # Recalculate if there's a current job
            if self.current_job:
                self.calculate_cost()
    
    def calculate_cost(self):
        """Calculate print job cost"""
        # Validate inputs
        try:
            filament_idx = self.filament_combo.current()
            if filament_idx < 0:
                messagebox.showwarning("Warning", "Please select a filament")
                return
            
            print_time = float(self.print_time_var.get() or 0)
            filament_used = float(self.filament_used_var.get() or 0)
            support = float(self.support_var.get() or 0)
            
            if print_time <= 0:
                messagebox.showwarning("Warning", "Print time must be greater than 0")
                return
            
            if filament_used <= 0 and support <= 0:
                messagebox.showwarning("Warning", "Filament usage must be greater than 0")
                return
            
        except ValueError:
            messagebox.showerror("Error", "Invalid number format in inputs")
            return
        
        # Create and calculate job
        filament = self.filaments[filament_idx]
        self.current_job = PrintJob(filament, self.settings)
        self.current_job.job_name = self.job_name_var.get().strip() or "Unnamed Job"
        self.current_job.print_time_hours = print_time
        self.current_job.filament_used_grams = filament_used
        self.current_job.support_grams = support
        
        breakdown = self.current_job.calculate()
        
        # Display results
        self.display_results(breakdown)
        self.status_label.config(text=f"Calculated: {self.current_job.job_name}")
    
    def display_results(self, breakdown: dict):
        """Display calculation results"""
        self.results_text.delete(1.0, tk.END)
        
        result = f"""
{'='*50}
PRINT JOB COST ANALYSIS
{'='*50}

📦 MATERIAL COSTS
─────────────────────────────────────────
Base filament used:     {breakdown['base_filament_grams']:>10.2f} g
With purge ({breakdown['purge_added_percent']:>4.1f}%):      {breakdown['with_purge_grams']:>10.2f} g
With failures ({breakdown['failure_rate_percent']:>4.1f}%):   {breakdown['with_failure_grams']:>10.2f} g
─────────────────────────────────────────
Material Cost:          {breakdown['material_cost']:>10.2f} PLN

⏱️  MACHINE COSTS
─────────────────────────────────────────
Machine Amortization:   {breakdown['machine_amortization']:>10.2f} PLN
Parts Replacement:      {breakdown['machine_parts']:>10.2f} PLN
─────────────────────────────────────────
Total Machine Cost:     {(breakdown['machine_amortization'] + breakdown['machine_parts']):>10.2f} PLN

⚡ ENERGY COSTS
─────────────────────────────────────────
Energy Cost:            {breakdown['energy_cost']:>10.2f} PLN

🔧 OTHER COSTS
─────────────────────────────────────────
Post-processing:        {breakdown['post_processing']:>10.2f} PLN

{'='*50}
💰 TOTAL COST:           {breakdown['total']:>10.2f} PLN
{'='*50}

📊 COST PER GRAM (final): {breakdown['total'] / breakdown['with_failure_grams']:.4f} PLN/g
"""
        
        self.results_text.insert(tk.END, result)
    
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
                
                self.status_label.config(text=f"Loaded {len(self.filaments)} filament(s) from saved data")
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
    
    # Set theme
    style = ttk.Style()
    style.theme_use('clam')
    
    # Configure colors
    style.configure('Title.TLabel', font=('Segoe UI', 14, 'bold'))
    style.configure('Header.TLabel', font=('Segoe UI', 11, 'bold'))
    
    app = CostCalculatorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
