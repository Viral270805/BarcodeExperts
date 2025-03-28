import smbus
import cv2
import numpy as np
import time

# Initialize I2C communication
bus = smbus.SMBus(1)
OV7670_I2C_ADDRESS = 0x21  # Default address (may vary)

# Function to write to OV7670 registers
def ov7670_write_register(register, value):
    try:
        bus.write_byte_data(OV7670_I2C_ADDRESS, register, value)
    except Exception as e:
        print(f"Error writing to register {hex(register)}: {e}")

# Initialize camera settings
def ov7670_init():
    # Set camera format, exposure, and color settings
    ov7670_write_register(0x12, 0x80)  # Reset Camera
    time.sleep(0.1)
    ov7670_write_register(0x12, 0x14)  # Set QVGA mode
    ov7670_write_register(0x11, 0x01)  # Clock Prescaler
    ov7670_write_register(0x6B, 0x0A)  # PLL Control
    print("Camera Initialized!")

# Read image data (dummy processing - replace with actual SPI/I2C reading)
def capture_image():
    # Simulated capture
    frame = np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8)  # Dummy Image
    return frame

# Main function
if __name__ == "__main__":
    ov7670_init()
    print("Capturing Image...")
    
    image = capture_image()
    
    # Show and save image
    cv2.imshow("Captured Image", image)
    cv2.imwrite("captured_image.jpg", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
