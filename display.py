import smbus2
import time

LCD_ADDR = 0x27  # Change to 0x3F if needed
bus = smbus2.SMBus(1)

# Send command to LCD
def lcd_command(cmd):
    bus.write_byte(LCD_ADDR, cmd)
    time.sleep(0.002)

# Send data to LCD
def lcd_write(msg):
    for char in msg:
        bus.write_byte(LCD_ADDR, ord(char))
        time.sleep(0.002)

# Proper LCD Initialization
def lcd_init():
    lcd_command(0x33)  # Initialize
    lcd_command(0x32)  # Set to 4-bit mode
    lcd_command(0x28)  # 2-line display
    lcd_command(0x0C)  # Display on, no cursor
    lcd_command(0x06)  # Move cursor right
    lcd_command(0x01)  # Clear display
    time.sleep(0.002)

# Run the LCD
lcd_init()
lcd_command(0x80)  # Move to line 1
lcd_write("Hello, World!")
lcd_command(0xC0)  # Move to line 2
lcd_write("LCD Working!")

time.sleep(5)  # Show message for 5 seconds
lcd_command(0x01)  # Clear display
