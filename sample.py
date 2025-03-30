import RPi.GPIO as GPIO
import time

BUZZER_PIN = 18  # Buzzer connected to GPIO 18

GPIO.setmode(GPIO.BCM)
GPIO.setup(BUZZER_PIN, GPIO.OUT)

try:
    for _ in range(5):  # Rings 5 times
        GPIO.output(BUZZER_PIN, GPIO.HIGH)
        time.sleep(0.2)  # Beep ON for 0.2 sec
        GPIO.output(BUZZER_PIN, GPIO.LOW)
        time.sleep(0.2)  # Pause for 0.2 sec
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
