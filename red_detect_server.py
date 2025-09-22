# red_detect_server.py
import cv2
import numpy as np
from flask import Flask, jsonify
from flask_cors import CORS
import threading

app = Flask(__name__)
CORS(app)

state = "OFF"
AREA_THRESHOLD = 1000

def camera_loop():
    global state
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lower_red1 = np.array([0, 100, 100])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([160, 100, 100])
        upper_red2 = np.array([179, 255, 255])

        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask = mask1 | mask2

        red_area = cv2.countNonZero(mask)

        if red_area > AREA_THRESHOLD:
            state = "ON"
        else:
            state = "OFF"

        cv2.putText(frame, f"{state} (Area={red_area})", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0) if state=="ON" else (0,0,255), 2)
        cv2.imshow("Camera", frame)
        cv2.imshow("Mask", mask)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

@app.route("/status")
def get_status():
    return jsonify({"state": state})

if __name__ == "__main__":
    threading.Thread(target=camera_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
