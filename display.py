import RPi.GPIO as GPIO
import time
import smbus

# Set GPIO mode to BCM
GPIO.setmode(GPIO.BCM)

# I2C address (Check using i2cdetect -y 1)
I2C_ADDR = 0x27  # Change to 0x3F if needed
bus = smbus.SMBus(1)

# LCD Commands
LCD_CHR = 1  # Sending data
LCD_CMD = 0  # Sending command
LCD_LINE_1 = 0x80  # 1st line
LCD_LINE_2 = 0xC0  # 2nd line
ENABLE = 0b00000100  # Enable bit

# Send command to LCD
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

# Send string to LCD
def lcd_string(message, line):
    lcd_byte(line, LCD_CMD)
    for char in message:
        lcd_byte(ord(char), LCD_CHR)

# Setup GPIO 3 for LED (Same as your sample code)
LED_PIN = 3
GPIO.setup(LED_PIN, GPIO.OUT)

# Main function
def main():
    lcd_init()

    try:
        while True:
            # Display First Message
            lcd_string("Hello, User!", LCD_LINE_1)
            lcd_string("Raspberry Pi", LCD_LINE_2)
            GPIO.output(LED_PIN, GPIO.HIGH)  # LED ON
            time.sleep(1)

            # Display Second Message
            lcd_string("I2C LCD Ready!", LCD_LINE_1)
            lcd_string("Enjoy!", LCD_LINE_2)
            GPIO.output(LED_PIN, GPIO.LOW)   # LED OFF
            time.sleep(1)

    except KeyboardInterrupt:
        pass

    # Cleanup GPIO on exit
    GPIO.cleanup()

if __name__ == "__main__":
    main()
