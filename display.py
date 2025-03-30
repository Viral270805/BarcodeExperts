import RPi.GPIO as GPIO
import smbus
import time

# Set GPIO numbering mode
GPIO.setmode(GPIO.BCM)

# Define I2C Address (Check using i2cdetect -y 1)
I2C_ADDR = 0x27  # Change to 0x3F if needed
bus = smbus.SMBus(1)

# LCD Constants
LCD_CHR = 1  # Data mode
LCD_CMD = 0  # Command mode
LCD_LINE_1 = 0x80  # First line
LCD_LINE_2 = 0xC0  # Second line
ENABLE = 0b00000100  # Enable bit

# LED Pin
LED_PIN = 3
GPIO.setup(LED_PIN, GPIO.OUT)

# Function to send data/command to LCD
def lcd_byte(bits, mode):
    high_bits = mode | (bits & 0xF0) | ENABLE
    low_bits = mode | ((bits << 4) & 0xF0) | ENABLE
    bus.write_byte(I2C_ADDR, high_bits)
    bus.write_byte(I2C_ADDR, low_bits)

# Initialize LCD
def lcd_init():
    lcd_byte(0x33, LCD_CMD)
    lcd_byte(0x32, LCD_CMD)
    lcd_byte(0x06, LCD_CMD)
    lcd_byte(0x0C, LCD_CMD)
    lcd_byte(0x28, LCD_CMD)
    lcd_byte(0x01, LCD_CMD)
    time.sleep(0.5)

# Display message on LCD
def lcd_string(message, line):
    lcd_byte(line, LCD_CMD)
    for char in message:
        lcd_byte(ord(char), LCD_CHR)

# Main Function
def main():
    lcd_init()

    try:
        while True:
            # Display message while LED blinks
            lcd_string("Project Running", LCD_LINE_1)
            lcd_string("LED Blinking...", LCD_LINE_2)
            GPIO.output(LED_PIN, GPIO.HIGH)  # LED ON
            time.sleep(1)

            lcd_string("16x2 LCD Ready", LCD_LINE_1)
            lcd_string("Raspberry Pi!", LCD_LINE_2)
            GPIO.output(LED_PIN, GPIO.LOW)  # LED OFF
            time.sleep(1)

    except KeyboardInterrupt:
        pass

    # Cleanup GPIO
    GPIO.cleanup()

