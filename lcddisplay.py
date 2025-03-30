import smbus2
import time

I2C_ADDR = 0x27  # Change to 0x3F if needed
bus = smbus2.SMBus(1)

LCD_BACKLIGHT = 0x08
ENABLE = 0b00000100

def lcd_command(cmd):
    high = (cmd & 0xF0) | LCD_BACKLIGHT
    low = ((cmd << 4) & 0xF0) | LCD_BACKLIGHT
    for val in (high, high | ENABLE, high & ~ENABLE, low, low | ENABLE, low & ~ENABLE):
        bus.write_byte(I2C_ADDR, val)
        time.sleep(0.001)

def lcd_write_char(char):
    high = (ord(char) & 0xF0) | LCD_BACKLIGHT | 1
    low = ((ord(char) << 4) & 0xF0) | LCD_BACKLIGHT | 1
    for val in (high, high | ENABLE, high & ~ENABLE, low, low | ENABLE, low & ~ENABLE):
        bus.write_byte(I2C_ADDR, val)
        time.sleep(0.001)

def lcd_clear():
    lcd_command(0x01)
    time.sleep(0.2)

def lcd_init():
    for cmd in (0x33, 0x32, 0x28, 0x0C, 0x06, 0x01):
        lcd_command(cmd)
        time.sleep(0.05)

def lcd_display_message(message, line=1):
    lcd_command(0x80 if line == 1 else 0xC0)
    for char in message:
        lcd_write_char(char)

# Initialize LCD only ONCE
lcd_init()
lcd_clear()

# Display Messages (Change as needed)
lcd_display_message("Raspberry Pi", 1)
lcd_display_message("LCD Working!", 2)
