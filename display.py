from RPLCD.i2c import CharLCD
import time

# Initialize LCD (Change address if needed: 0x27 or 0x3F)
lcd = CharLCD('PCF8574', 0x27)

# Display message
lcd.clear()
lcd.write_string("Hello, Raspberry Pi!")

# Hold message for 5 seconds
time.sleep(5)

# Clear LCD
lcd.clear()
