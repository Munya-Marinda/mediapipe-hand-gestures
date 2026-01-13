const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

// 1️⃣ Initialize MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

// 2️⃣ Handle results
hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks?.length) {
    const landmarks = results.multiHandLandmarks[0];
    drawLandmarks(landmarks);
  }
});

// 3️⃣ Start camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480,
});

camera.start();

function drawLandmarks(landmarks) {
  ctx.fillStyle = "lime";

  for (const point of landmarks) {
    ctx.beginPath();
    ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function isFingerExtended(landmarks, tip, base) {
  return landmarks[tip].y < landmarks[base].y;
}

function detectGesture(landmarks) {
  const fingers = [
    isFingerExtended(landmarks, 8, 6), // index
    isFingerExtended(landmarks, 12, 10), // middle
    isFingerExtended(landmarks, 16, 14), // ring
    isFingerExtended(landmarks, 20, 18), // pinky
  ];

  const extendedCount = fingers.filter(Boolean).length;

  if (extendedCount >= 3) return "OPEN";
  if (extendedCount <= 1) return "FIST";
  return "UNKNOWN";
}

hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks?.length) {
    const landmarks = results.multiHandLandmarks[0];
    drawLandmarks(landmarks);

    const gesture = detectGesture(landmarks);
    console.log(gesture);
  }
});
