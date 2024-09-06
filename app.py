from flask import Flask, Response, render_template
import cv2
import mediapipe as mp
import numpy as np

app = Flask(__name__)

# Color definitions
ANGLE_TXT_COLOR = (0, 255, 0)  # Green
COUNTER_COLOR = (0, 0, 255)    # Red
LANDMARK_COLOR = (245, 177, 66)  # Orange
CONNECTION_COLOR = (245, 66, 230)  # Pink

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

cap = cv2.VideoCapture(0)
cap.set(3, 1280)  # Set width
cap.set(4, 720)   # Set height

# Counters and detection flags
left_counter = 0
right_counter = 0
left_detect = False
right_detect = False

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ab = a - b
    bc = c - b
    dot_product = np.dot(ab, bc)
    magnitude_ab = np.linalg.norm(ab)
    magnitude_bc = np.linalg.norm(bc)
    cos_theta = dot_product / (magnitude_ab * magnitude_bc)
    angle = np.degrees(np.arccos(np.clip(cos_theta, -1.0, 1.0)))
    return angle

def generate_frames():
    global left_counter, right_counter, left_detect, right_detect
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while True:
            ret, img = cap.read()
            if not ret:
                print("Failed to grab frame")
                break

            image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    image,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=LANDMARK_COLOR, thickness=2, circle_radius=2),
                    mp_drawing.DrawingSpec(color=CONNECTION_COLOR, thickness=2, circle_radius=2)
                )

                landmarks = results.pose_landmarks.landmark

                # Left arm landmarks
                left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                 landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

                left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
                if left_angle > 160 and not left_detect:
                    left_detect = True
                    left_counter += 1
                if left_angle < 40:
                    left_detect = False

                # Right arm landmarks
                right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                                  landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                               landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                               landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

                right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
                if right_angle > 160 and not right_detect:
                    right_detect = True
                    right_counter += 1
                if right_angle < 40:
                    right_detect = False

                # Draw the angle text and counters
                cv2.putText(image, f'Left Angle: {int(left_angle)}',
                            (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, ANGLE_TXT_COLOR, 2, cv2.LINE_AA)
                cv2.putText(image, f'Right Angle: {int(right_angle)}',
                            (50, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, ANGLE_TXT_COLOR, 2, cv2.LINE_AA)
                counter_text = f'Left Curls: {left_counter-1} | Right Curls: {right_counter-1}'
                cv2.putText(image, counter_text,
                            (50, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, COUNTER_COLOR, 2, cv2.LINE_AA)

            _, buffer = cv2.imencode('.jpg', image)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('camera.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
