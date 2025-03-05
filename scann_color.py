import tkinter as tk
from tkinter import Label

def on_scan(event):
    scanner_box.config(text="Scan Complete!", bg="green")
    root.after(2000, reset_scanner)

def reset_scanner():
    scanner_box.config(text="Waiting for Scan...", bg="red")

# Initialize the main window
root = tk.Tk()
root.title("Barcode Scanner")
root.geometry("300x150")

# Scanner display
scanner_box = Label(root, text="Waiting for Scan...", bg="red", fg="white", font=("Arial", 16), width=25, height=5)
scanner_box.pack(pady=20)

# Bind Enter key to simulate scanning
root.bind("<Return>", on_scan)

root.mainloop()
