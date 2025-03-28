import smbus
import time
from RPLCD.i2c import CharLCD

# Define LCD (Use the detected I2C address, usually 0x27 or 0x3F)
lcd = CharLCD(i2c_expander='PCF8574', address=0x27, port=1, cols=16, rows=2, charmap='A02')

# Function to display message
def display_message():
    lcd.clear()
    lcd.write_string("Hello, User!")
    time.sleep(2)
    lcd.clear()
    lcd.write_string("Raspberry Pi Zero 2 W")
    time.sleep(2)

if __name__ == "__main__":
    display_message()
