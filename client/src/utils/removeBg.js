/**
 * Headshot Studio Background Remover & White Replacer
 * Samples ONLY top corners/edges for studio backdrops (orange/blue/gray).
 * Protects skin tones, dark hair, and clothing, replacing outer backdrop with crisp pure white (#FFFFFF).
 */

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, v * 100];
}

export const removeImageBackground = (imageSource) => {
  return new Promise((resolve) => {
    if (!imageSource) return resolve(imageSource);

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    let src = imageSource;
    if (typeof imageSource === 'object') {
      src = URL.createObjectURL(imageSource);
    }

    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 1. Sample ONLY top-left and top-right corners (top 12% height, outer 20% width)
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        const sampleCorner = (xStart, xEnd, yEnd) => {
          for (let x = xStart; x < xEnd; x += 2) {
            for (let y = 1; y < yEnd; y += 2) {
              const idx = (y * width + x) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              count++;
            }
          }
        };

        // Top-left corner
        sampleCorner(1, Math.floor(width * 0.2), Math.floor(height * 0.12));
        // Top-right corner
        sampleCorner(Math.floor(width * 0.8), width - 1, Math.floor(height * 0.12));

        if (count === 0) count = 1;
        const rBg = Math.round(rSum / count);
        const gBg = Math.round(gSum / count);
        const bBg = Math.round(bSum / count);
        const [hBg, sBg, vBg] = rgbToHsv(rBg, gBg, bBg);

        // 2. BFS flood fill starting strictly from top perimeter
        const totalPixels = width * height;
        const isBackdrop = new Uint8Array(totalPixels);
        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0, tail = 0;

        // Populate top row into queue
        for (let x = 0; x < width; x++) {
          const idx = x;
          visited[idx] = 1;
          queue[tail++] = idx;
        }
        // Populate upper left/right edges (top 30%)
        for (let y = 1; y < height * 0.3; y++) {
          const leftIdx = y * width;
          const rightIdx = y * width + (width - 1);
          if (!visited[leftIdx]) { visited[leftIdx] = 1; queue[tail++] = leftIdx; }
          if (!visited[rightIdx]) { visited[rightIdx] = 1; queue[tail++] = rightIdx; }
        }

        while (head < tail) {
          const idx = queue[head++];
          const px = idx % width;
          const py = Math.floor(idx / width);

          const i4 = idx * 4;
          const r = data[i4];
          const g = data[i4 + 1];
          const b = data[i4 + 2];

          // Check if pixel is human skin tone -> SHIELD SKIN TONE
          const isSkin = (r > 65 && g > 35 && b > 20 && (r - g) >= 6 && (r - b) >= 12);
          // Check if pixel is dark hair/features -> SHIELD DARK HAIR
          const [h, s, v] = rgbToHsv(r, g, b);
          const isDarkFeature = (v < 22) || (r < 45 && g < 45 && b < 45);

          if (isSkin || isDarkFeature) {
            // Stop BFS traversal at subject boundary
            continue;
          }

          // Calculate color distance to top backdrop
          const dr = r - rBg;
          const dg = g - gBg;
          const db = b - bBg;
          const rgbDist = Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);

          let dh = Math.abs(h - hBg);
          if (dh > 180) dh = 360 - dh;
          const ds = Math.abs(s - sBg);
          const dv = Math.abs(v - vBg);

          const isMatch = (rgbDist < 42) || (sBg > 15 && dh < 22 && ds < 30 && dv < 35);

          if (isMatch) {
            isBackdrop[idx] = 1;

            // Expand to 4-connected neighbors
            if (px > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; queue[tail++] = idx - 1; }
            if (px < width - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; queue[tail++] = idx + 1; }
            if (py > 0 && !visited[idx - width]) { visited[idx - width] = 1; queue[tail++] = idx - width; }
            if (py < height - 1 && !visited[idx + width]) { visited[idx + width] = 1; queue[tail++] = idx + width; }
          }
        }

        // 3. Replace backdrop pixels with pure WHITE (RGB 255, 255, 255)
        for (let idx = 0; idx < totalPixels; idx++) {
          if (isBackdrop[idx]) {
            const i4 = idx * 4;
            data[i4] = 255;     // R
            data[i4 + 1] = 255; // G
            data[i4 + 2] = 255; // B
            data[i4 + 3] = 255; // A (Fully opaque white)
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const whiteFile = new File([blob], 'processed_white_bg.png', { type: 'image/png' });
            resolve({
              dataUrl: canvas.toDataURL('image/png'),
              file: whiteFile
            });
          } else {
            resolve({ dataUrl: canvas.toDataURL('image/png') });
          }
        }, 'image/png');
      } catch (err) {
        console.warn("[BackgroundRemoval] Canvas processing fallback:", err.message);
        resolve({ dataUrl: src });
      }
    };

    img.onerror = (err) => {
      console.warn("[BackgroundRemoval] Image load error:", err);
      resolve({ dataUrl: src });
    };
  });
};


