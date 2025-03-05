import time
import RPi.GPIO as GPIO

# Setup GPIO
BUZZER_PIN = 18  # Change this to your connected GPIO pin
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUZZER_PIN, GPIO.OUT)

def buzz(duration=1):
    """Activates the buzzer for a given duration."""
    GPIO.output(BUZZER_PIN, GPIO.HIGH)
    time.sleep(duration)
    GPIO.output(BUZZER_PIN, GPIO.LOW)
    print("Buzzer activated")

if __name__ == "__main__":
    try:
        print("Activating Buzzer...")
        buzz(0.5)  # Buzz for 0.5 seconds
    except KeyboardInterrupt:
        print("Process interrupted")
    finally:
        GPIO.cleanup()  # Clean up GPIO on exit
