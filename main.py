import RPi.GPIO as GPIO
import time
import cv2
import csv
from i2c_lcd import I2CLcd
import requests
from pyzbar.pyzbar import decode

# ==== GPIO & LCD SETUP ====
RED_LED = 17
GREEN_LED = 27
BUZZER = 22
BUTTON = 23
SERVER_IP = "192.168.1.10"  # ✅ Replace with your system/server IP

GPIO.setmode(GPIO.BCM)
GPIO.setup(RED_LED, GPIO.OUT)
GPIO.setup(GREEN_LED, GPIO.OUT)
GPIO.setup(BUZZER, GPIO.OUT)
GPIO.setup(BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_UP)

lcd = I2CLcd(0x27)
lcd.clear()
lcd.write("Welcome", line=1)
GPIO.output(RED_LED, GPIO.HIGH)
GPIO.output(GREEN_LED, GPIO.HIGH)
time.sleep(5)

lcd.clear()
lcd.write("Ready to Scan", line=1)
GPIO.output(GREEN_LED, GPIO.LOW)

# ==== Load Items from CSV ====
def load_items():
    items = {}
    with open("items.csv", mode="r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            items[row["barcode"]] = {
                "name": row["name"],
                "price": float(row["price"])
            }
    return items

# ==== Barcode Scan (EAN-13 supported) ====
def scan_barcode():
    cap = cv2.VideoCapture(0)
    lcd.clear()
    lcd.write("Scanning...", line=1)
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        barcodes = decode(frame)
        if barcodes:
            for barcode in barcodes:
                if barcode.type == "EAN13" or barcode.type == "EAN-13":
                    code = barcode.data.decode('utf-8')
                    cap.release()
                    cv2.destroyAllWindows()
                    return code

        if time.time() - start_time > 10:
            cap.release()
            cv2.destroyAllWindows()
            return None

        time.sleep(0.1)

# ==== Load Items ====
items_data = load_items()

# ==== Main Loop ====
try:
    while True:
        if GPIO.input(BUTTON) == GPIO.LOW:  # Button pressed
            GPIO.output(RED_LED, GPIO.LOW)
            barcode = scan_barcode()

            if barcode:
                item = items_data.get(barcode)
                if item:
                    lcd.clear()
                    lcd.write(item["name"][:16], line=1)
                    lcd.write("Added to Cart", line=2)

                    GPIO.output(GREEN_LED, GPIO.HIGH)
                    GPIO.output(BUZZER, GPIO.HIGH)
                    time.sleep(3)
                    GPIO.output(GREEN_LED, GPIO.LOW)
                    GPIO.output(BUZZER, GPIO.LOW)

                    try:
                        requests.get(f"http://{SERVER_IP}:5000/api/add-item?barcode={barcode}")
                        print("✅ Sent:", barcode)
                    except Exception as e:
                        print("❌ Send failed:", e)
                else:
                    lcd.clear()
                    lcd.write("Item Not Found", line=1)
                    GPIO.output(BUZZER, GPIO.HIGH)
                    time.sleep(2)
                    GPIO.output(BUZZER, GPIO.LOW)
            else:
                lcd.clear()
                lcd.write("No Code Found", line=1)
                GPIO.output(BUZZER, GPIO.HIGH)
                time.sleep(2)
                GPIO.output(BUZZER, GPIO.LOW)

            lcd.clear()
            lcd.write("Ready to Scan", line=1)
            GPIO.output(RED_LED, GPIO.HIGH)

        time.sleep(0.1)

except KeyboardInterrupt:
    GPIO.cleanup()
    lcd.clear()
