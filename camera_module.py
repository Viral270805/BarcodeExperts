import time
from picamera import PiCamera

# Initialize Camera
camera = PiCamera()
camera.resolution = (1024, 768)  # Set desired resolution

def capture_image():
    """Captures an image and saves it."""
    image_path = "/home/pi/image.jpg"  # Change path as needed
    camera.start_preview()
    time.sleep(2)  # Allow camera to adjust
    camera.capture(image_path)
    camera.stop_preview()
    print(f"Image saved at {image_path}")

if __name__ == "__main__":
    print("Capturing Image...")
    capture_image()
