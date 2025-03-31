import cv2

# Open camera (0 for default camera, try 1 if needed)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Error: Camera not detected!")
    exit()

print("✅ Camera detected! Press 'q' to exit.")

while True:
    ret, frame = cap.read()  # Capture frame-by-frame
    if not ret:
        print("❌ Failed to grab frame")
        break

    cv2.imshow("OV7670 Camera Test", frame)  # Show the live feed

    # Press 'q' to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()  # Release the camera
cv2.destroyAllWindows()  # Close the window
