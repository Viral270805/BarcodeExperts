import RPi.GPIO as GPIO
import time

# Define Pins
RED_LED = 17
GREEN_LED = 27
BUZZER = 18

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(RED_LED, GPIO.OUT)
GPIO.setup(GREEN_LED, GPIO.OUT)
GPIO.setup(BUZZER, GPIO.OUT)

try:
    while True:
        GPIO.output(RED_LED, GPIO.HIGH)  # Red LED ON
        GPIO.output(GREEN_LED, GPIO.LOW)  # Green LED OFF
        GPIO.output(BUZZER, GPIO.LOW)  # Buzzer OFF
        
        time.sleep(10)  # Wait for 10 seconds
        
        GPIO.output(RED_LED, GPIO.LOW)  # Red LED OFF
        GPIO.output(GREEN_LED, GPIO.HIGH)  # Green LED ON
        GPIO.output(BUZZER, GPIO.HIGH)  # Buzzer ON
        
        time.sleep(2)  # Green LED & Buzzer ON for 2 seconds
        
        GPIO.output(GREEN_LED, GPIO.LOW)  # Green LED OFF
        GPIO.output(BUZZER, GPIO.LOW)  # Buzzer OFF
        
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
