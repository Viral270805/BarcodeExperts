import smbus2
import time

I2C_ADDR = 0x27  # Use 0x3F if needed
bus = smbus2.SMBus(1)

# LCD Commands
LCD_BACKLIGHT = 0x08
ENABLE = 0b00000100

def lcd_command(cmd):
    high = (cmd & 0xF0) | LCD_BACKLIGHT
    low = ((cmd << 4) & 0xF0) | LCD_BACKLIGHT
    bus.write_byte(I2C_ADDR, high)
    bus.write_byte(I2C_ADDR, high | ENABLE)
    time.sleep(0.001)
    bus.write_byte(I2C_ADDR, high & ~ENABLE)
    bus.write_byte(I2C_ADDR, low)
    bus.write_byte(I2C_ADDR, low | ENABLE)
    time.sleep(0.001)
    bus.write_byte(I2C_ADDR, low & ~ENABLE)

def lcd_init():
    lcd_command(0x33)
    lcd_command(0x32)
    lcd_command(0x28)
    lcd_command(0x0C)
    lcd_command(0x06)
    lcd_command(0x01)
    time.sleep(0.2)

def lcd_display_message(message, line=1):
    lcd_init()
    lcd_command(0x80 if line == 1 else 0xC0)
    for char in message:
        bus.write_byte(I2C_ADDR, ord(char) | 1)
        time.sleep(0.05)

# Display a message
lcd_display_message("Hello, Pi!", 1)
lcd_display_message("I2C LCD Works!", 2)
