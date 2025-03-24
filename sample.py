import RPi.GPIO as GPIO
import time

# Set pin numbering mode to BCM (Broadcom SOC channel)
GPIO.setmode(GPIO.BCM)

# Set GPIO 17 as an output pin
GPIO.setup(3, GPIO.OUT)

# Blink the LED indefinitely
try:
    while True:
        GPIO.output(3, GPIO.HIGH)  # Turn LED on
        time.sleep(1)
        GPIO.output(3, GPIO.LOW)   # Turn LED off
        time.sleep(1)
except KeyboardInterrupt:
    pass

# Clean up GPIO pins on exit
GPIO.cleanup()