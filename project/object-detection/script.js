let model = null;
let modelPromise = null;

// Load model hanya sekali
async function loadModel() {
  if (!modelPromise) modelPromise = cocoSsd.load().then(m => (model = m));
  return modelPromise;
}

// Warna bounding box berbeda
function getColor(idx) {
  const colors = [
    '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0000', '#0000FF',
    '#FFA500', '#00CED1', '#ADFF2F', '#FF69B4', '#FFD700', '#7B68EE'
  ];
  return colors[idx % colors.length];
}

// --- Live Detection ---
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const logArea = document.getElementById('log-area');
let animationId = null;
let stream = null;

function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.style.width = video.offsetWidth + 'px';
  canvas.style.height = video.offsetHeight + 'px';
}

async function setupCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      video.play();
      resizeCanvas();
      resolve();
    };
  });
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.srcObject = null;
}

function stopDetection() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  stopCamera();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  logArea.value = '';
}

async function runDetection() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  await loadModel();
  const predictions = await model.detect(video);

  logArea.value = predictions.length
    ? predictions.map(pred => `${pred.class} (${(pred.score * 100).toFixed(1)}%)`).join('\n')
    : 'No objects detected.';

  predictions.forEach((pred, idx) => {
    ctx.beginPath();
    ctx.rect(...pred.bbox);
    ctx.lineWidth = 2;
    ctx.strokeStyle = ctx.fillStyle = getColor(idx);
    ctx.stroke();
    ctx.font = '16px Arial';
    ctx.fillText(
      `${pred.class} (${(pred.score * 100).toFixed(1)}%)`,
      pred.bbox[0],
      pred.bbox[1] > 20 ? pred.bbox[1] - 5 : 10
    );
  });

  animationId = requestAnimationFrame(runDetection);
}

async function startLiveDetection() {
  await setupCamera();
  await loadModel();
  runDetection();
}

// --- Video Detection ---
const uploadedVideo = document.getElementById('uploaded-video');
const videoCanvas = document.getElementById('video-canvas');
const videoCtx = videoCanvas.getContext('2d');
const videoLogArea = document.getElementById('video-log-area');
const videoUploadContainer = document.getElementById('video-upload-container');
let videoDetectionId = null;

function resizeVideoCanvas() {
  // Ambil ukuran tampilan video
  const rect = uploadedVideo.getBoundingClientRect();
  videoCanvas.width = rect.width;
  videoCanvas.height = rect.height;
  videoCanvas.style.width = rect.width + 'px';
  videoCanvas.style.height = rect.height + 'px';
  videoCanvas.style.left = uploadedVideo.offsetLeft + 'px';
  videoCanvas.style.top = uploadedVideo.offsetTop + 'px';
}

function stopVideoDetection() {
  if (videoDetectionId) cancelAnimationFrame(videoDetectionId);
  videoDetectionId = null;
  videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
  videoLogArea.value = '';
}

async function runVideoDetection() {
  if (!uploadedVideo.paused && !uploadedVideo.ended) {
    videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
    await loadModel();
    const predictions = await model.detect(uploadedVideo);

    videoLogArea.value = predictions.length
      ? predictions.map(pred => `${pred.class} (${(pred.score * 100).toFixed(1)}%)`).join('\n')
      : 'No objects detected.';

    // Scaling bbox
    const rect = uploadedVideo.getBoundingClientRect();
    const scaleX = rect.width / uploadedVideo.videoWidth;
    const scaleY = rect.height / uploadedVideo.videoHeight;

    predictions.forEach((pred, idx) => {
      const [x, y, w, h] = pred.bbox;
      const sx = x * scaleX, sy = y * scaleY, sw = w * scaleX, sh = h * scaleY;
      videoCtx.beginPath();
      videoCtx.rect(sx, sy, sw, sh);
      videoCtx.lineWidth = 2;
      videoCtx.strokeStyle = videoCtx.fillStyle = getColor(idx);
      videoCtx.stroke();
      videoCtx.font = '16px Arial';
      videoCtx.fillText(
        `${pred.class} (${(pred.score * 100).toFixed(1)}%)`,
        sx, sy > 20 ? sy - 5 : 10
      );
    });
  }
  videoDetectionId = requestAnimationFrame(runVideoDetection);
}

document.getElementById('video-upload').addEventListener('change', function (e) {
  stopVideoDetection();
  const file = e.target.files[0];
  if (!file) {
    videoUploadContainer.style.display = 'none';
    return;
  }
  uploadedVideo.src = URL.createObjectURL(file);
  uploadedVideo.muted = true;
  uploadedVideo.loop = true;
  videoUploadContainer.style.display = 'flex';

  uploadedVideo.onloadedmetadata = async function () {
    resizeVideoCanvas();
    await loadModel();
    uploadedVideo.currentTime = 0;
    uploadedVideo.play();
  };
  uploadedVideo.onplay = function () {
    resizeVideoCanvas();
    runVideoDetection();
  };
  uploadedVideo.onpause = stopVideoDetection;
  uploadedVideo.onended = function () {
    uploadedVideo.currentTime = 0;
    uploadedVideo.play();
  };
});

// --- Image Detection ---
const uploadedImage = document.getElementById('uploaded-image');
const imageCanvas = document.getElementById('image-canvas');
const imageCtx = imageCanvas.getContext('2d');
const imageLogArea = document.getElementById('image-log-area');
const imageUploadContainer = document.getElementById('image-upload-container');

function resizeImageCanvas() {
  if (uploadedImage && imageCanvas) {
    // Ambil ukuran tampilan gambar
    const rect = uploadedImage.getBoundingClientRect();
    imageCanvas.width = rect.width;
    imageCanvas.height = rect.height;
    imageCanvas.style.width = rect.width + 'px';
    imageCanvas.style.height = rect.height + 'px';
    imageCanvas.style.left = uploadedImage.offsetLeft + 'px';
    imageCanvas.style.top = uploadedImage.offsetTop + 'px';
  }
}

function clearImageDetection(keepImage = true) {
  imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  imageLogArea.value = '';
  if (!keepImage) {
    imageUploadContainer.style.display = 'none';
    uploadedImage.src = '';
    uploadedImage.removeAttribute('src');
  }
}

async function detectImage() {
  if (!uploadedImage || !uploadedImage.src) return;
  if (uploadedImage.naturalWidth === 0 || uploadedImage.naturalHeight === 0) return;
  resizeImageCanvas();
  await loadModel();
  imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

  const predictions = await model.detect(uploadedImage);

  imageLogArea.value = predictions.length
    ? predictions.map(pred => `${pred.class} (${(pred.score * 100).toFixed(1)}%)`).join('\n')
    : 'No objects detected.';

  // Scaling bbox
  const rect = uploadedImage.getBoundingClientRect();
  const scaleX = rect.width / uploadedImage.naturalWidth;
  const scaleY = rect.height / uploadedImage.naturalHeight;

  predictions.forEach((pred, idx) => {
    let [x, y, w, h] = pred.bbox;
    let sx = x * scaleX, sy = y * scaleY, sw = w * scaleX, sh = h * scaleY;

    // Clamp bounding box to stay inside the canvas
    if (sx < 0) { sw += sx; sx = 0; }
    if (sy < 0) { sh += sy; sy = 0; }
    if (sx + sw > imageCanvas.width) sw = imageCanvas.width - sx;
    if (sy + sh > imageCanvas.height) sh = imageCanvas.height - sy;
    if (sw <= 0 || sh <= 0) return; // Skip invalid box

    imageCtx.beginPath();
    imageCtx.rect(sx, sy, sw, sh);
    imageCtx.lineWidth = 2;
    imageCtx.strokeStyle = imageCtx.fillStyle = getColor(idx);
    imageCtx.stroke();
    imageCtx.font = '16px Arial';
    imageCtx.fillText(
      `${pred.class} (${(pred.score * 100).toFixed(1)}%)`,
      sx, sy > 20 ? sy - 5 : 10
    );
  });
}

document.getElementById('image-upload').addEventListener('change', function (e) {
  clearImageDetection(false);
  const file = e.target.files[0];
  if (!file) {
    imageUploadContainer.style.display = 'none';
    return;
  }
  uploadedImage.onload = detectImage;
  uploadedImage.src = URL.createObjectURL(file);
  imageUploadContainer.style.display = 'flex';
});

// --- Tab Switching ---
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('live')?.classList.contains('active')) startLiveDetection();

  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(btn => {
    btn.addEventListener('shown.bs.tab', function (e) {
      const target = e.target.getAttribute('data-bs-target');
      if (target === '#live') {
        startLiveDetection();
        stopVideoDetection();
        clearImageDetection(true);
      } else if (target === '#video') {
        stopDetection();
        clearImageDetection(true);
        if (uploadedVideo && uploadedVideo.src) {
          videoUploadContainer.style.display = 'flex';
          uploadedVideo.play();
          runVideoDetection();
        }
      } else if (target === '#image') {
        stopDetection();
        stopVideoDetection();
        if (uploadedImage && uploadedImage.src) {
          imageUploadContainer.style.display = 'flex';
          detectImage();
        }
      }
    });
  });
});

// --- Responsive Resize ---
window.addEventListener('resize', () => {
  resizeCanvas();
  resizeVideoCanvas();
  resizeImageCanvas();
  if (document.querySelector('.nav-link.active')?.getAttribute('data-bs-target') === '#image') {
    detectImage();
  }
});