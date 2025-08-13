const photoUpload = document.getElementById('photo-upload');
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

let imgData = null;
let drawingPoints = [];
let drawIndex = 0;

photoUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Resize canvas to fit image with max constraints
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.7;
      let scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw the uploaded image first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Extract image data from canvas for processing
      imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Prepare points to draw automatically
      prepareDrawingPoints();

      // Clear canvas for drawing trace
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Start automatic drawing animation
      drawIndex = 0;
      animateDrawing();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Prepare points to draw: identify darker pixels as edges for sketching
function prepareDrawingPoints() {
  drawingPoints = [];
  const pixels = imgData.data;
  const width = imgData.width;
  const height = imgData.height;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      // Calculate brightness using luminance formula
      const index = (y * width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      // Threshold for detecting "dark" pixels as edges
      if (brightness < 100) {
        drawingPoints.push({x, y});
      }
    }
  }
  // Shuffle points for more natural drawing effect
  shuffleArray(drawingPoints);
}

// Fisher-Yates shuffle to randomize points order
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Animate drawing points progressively to simulate sketch
function animateDrawing() {
  if (drawIndex >= drawingPoints.length) return;

  // Draw a batch of points per frame for speed
  ctx.strokeStyle = "#0040ffff";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  for (let i = 0; i < 100 && drawIndex < drawingPoints.length; i++, drawIndex++) {
    const p = drawingPoints[drawIndex];
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + (Math.random() * 2 - 1), p.y + (Math.random() * 2 - 1)); // small jitter for natural lines
  }
  ctx.stroke();

  // Continue animation on next frame
  requestAnimationFrame(animateDrawing);
}