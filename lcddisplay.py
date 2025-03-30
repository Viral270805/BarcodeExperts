import smbus2
import time

# Use the I2C address found from 'i2cdetect -y 1' (0x27 or 0x3F)
I2C_ADDR = 0x27  # Change to 0x3F if needed
bus = smbus2.SMBus(1)

# LCD Commands
LCD_CLEARDISPLAY = 0x01
LCD_RETURNHOME = 0x02
LCD_ENTRYMODESET = 0x04
LCD_DISPLAYCONTROL = 0x08
LCD_FUNCTIONSET = 0x20

# Functions to send data
def lcd_send_byte(data, mode):
    bus.write_byte_data(I2C_ADDR, mode, data)
    time.sleep(0.001)

def lcd_init():
    lcd_send_byte(LCD_FUNCTIONSET | 0x08, 0)  # 4-bit mode
    lcd_send_byte(LCD_DISPLAYCONTROL | 0x04, 0)  # Display on
    lcd_send_byte(LCD_CLEARDISPLAY, 0)  # Clear display
    time.sleep(0.2)

def lcd_display_message(message):
    lcd_init()
    for char in message:
        lcd_send_byte(ord(char), 1)
        time.sleep(0.05)

# Run the display message
lcd_display_message("Hello, World!")
