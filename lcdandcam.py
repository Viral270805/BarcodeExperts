import time
import sqlite3
from RPLCD import CharLCD
from picamera import PiCamera
from gpiozero import Button
from pyzbar import pyzbar
from PIL import Image

# Initialize the LCD
lcd = CharLCD(cols=16, rows=2, pin_rs=37, pin_e=35, pins_data=[33, 31, 29, 23])

# Initialize the camera
camera = PiCamera()

# Initialize the button
button = Button(17)  # Replace with the actual GPIO pin number


def connect_to_database():
    conn = sqlite3.connect('items.db')
    return conn, conn.cursor()

# Function to display a message on the LCD
def display_message(message, line):
    lcd.cursor_pos = (line, 0)
    lcd.write_string(message)

# Function to capture an image and decode QR code
def scan_qr_code():
    image_path = "qr_code.jpg"
    camera.capture(image_path)
    image = Image.open(image_path)
    qr_codes = pyzbar.decode(image)
    if qr_codes:
        return qr_codes[0].data.decode('utf-8')
    return None


def get_item_name(cursor, qr_data):
    cursor.execute("SELECT item_name FROM items WHERE qr_code=?", (qr_data,))
    result = cursor.fetchone()
    return result[0] if result else None


def create_database():
    conn, cursor = connect_to_database()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            qr_code TEXT PRIMARY KEY NOT NULL,
            item_name TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    print("Database created with 'items' table.")


def main():
    conn, cursor = connect_to_database()
    try:
        while True:
            display_message("Scan QR Code", 0)
            qr_data = scan_qr_code()
            if qr_data:
                item_name = get_item_name(cursor, qr_data)
                if item_name:
                    display_message(f"Item: {item_name}", 0)
                    display_message("Short: Confirm", 1)
                    display_message("Long: Rescan", 1)
                    start_time = time.time()
                    while True:
                        if button.is_pressed:
                            press_duration = time.time() - start_time
                            if press_duration < 1:  # Short press
                                display_message("Confirmed!", 0)
                                time.sleep(2)
                                break
                            else:  # Long press
                                display_message("Rescanning...", 0)
                                time.sleep(1)
                                break
                        time.sleep(0.1)
                else:
                    display_message("Item not found", 0)
                    time.sleep(2)
            else:
                display_message("No QR Code found", 0)
                time.sleep(2)
    finally:
        
        lcd.clear()
        camera.close()
        conn.close()


if __name__ == "__main__":
    create_database()  
    main() 