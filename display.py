import smbus2
import time

# Define I2C address (Check using i2cdetect -y 1)
LCD_ADDRESS = 0x27  # Change to 0x3F if needed

# I2C bus (for Raspberry Pi Zero 2W)
bus = smbus2.SMBus(1)

# LCD Commands
LCD_CHR = 1  # Character mode
LCD_CMD = 0  # Command mode
LINE_1 = 0x80  # LCD RAM address for the 1st line
LINE_2 = 0xC0  # LCD RAM address for the 2nd line
ENABLE = 0b00000100  # Enable bit

# Send byte to LCD
def lcd_byte(bits, mode):
    high_bits = mode | (bits & 0xF0) | ENABLE
    low_bits = mode | ((bits << 4) & 0xF0) | ENABLE
    bus.write_byte(LCD_ADDRESS, high_bits)
    time.sleep(0.0005)
    bus.write_byte(LCD_ADDRESS, low_bits)
    time.sleep(0.0005)

# Send string to LCD
def lcd_string(message, line):
    lcd_byte(line, LCD_CMD)
    for char in message.ljust(16):  # Pad to 16 chars
        lcd_byte(ord(char), LCD_CHR)

# Initialize LCD
def lcd_init():
    lcd_byte(0x33, LCD_CMD)  # 4-bit mode
    lcd_byte(0x32, LCD_CMD)
    lcd_byte(0x28, LCD_CMD)  # 2-line, 5x8 matrix
    lcd_byte(0x0C, LCD_CMD)  # Display on, no cursor
    lcd_byte(0x06, LCD_CMD)  # Auto-increment cursor
    lcd_byte(0x01, LCD_CMD)  # Clear display
    time.sleep(0.002)

# Main function
lcd_init()
lcd_string("Hello, World!", LINE_1)
lcd_string("Raspberry Pi", LINE_2)

time.sleep(5)  # Display for 5 seconds
lcd_byte(0x01, LCD_CMD)  # Clear display
