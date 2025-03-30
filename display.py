import smbus2
import time

LCD_ADDR = 0x27  # Change to 0x3F if needed
bus = smbus2.SMBus(1)

def lcd_command(cmd):
    bus.write_byte(LCD_ADDR, cmd)
    time.sleep(0.002)

def lcd_write(msg):
    for char in msg:
        bus.write_byte(LCD_ADDR, ord(char))
        time.sleep(0.002)

# Initialize LCD
lcd_command(0x01)  # Clear display
lcd_command(0x80)  # Move to line 1
lcd_write("Hello, Raspberry!")
lcd_command(0xC0)  # Move to line 2
lcd_write("Simple LCD Code")

time.sleep(5)  # Show message for 5 seconds
lcd_command(0x01)  # Clear display
