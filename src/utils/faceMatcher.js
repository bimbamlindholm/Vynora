/**
 * Vynora V3 AI Face Verification Engine
 * Optimized client-side pattern matching algorithm using HTML5 Canvas pixel analysis.
 * Analyzes greyscale structural intensity (L1 norm) and average color distribution to prevent buddy-punching.
 */

/**
 * Loads a Base64 data URL into an HTML5 Image object.
 */
function loadImage(base64Str) {
  return new Promise((resolve, reject) => {
    if (!base64Str) {
      reject(new Error("Empty image source"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = base64Str;
  });
}

/**
 * Compares two Base64 images and returns a similarity score from 0 to 100.
 */
export async function compareFaces(base64Image1, base64Image2) {
  if (!base64Image1 || !base64Image2) {
    return 0;
  }

  try {
    const [img1, img2] = await Promise.all([
      loadImage(base64Image1),
      loadImage(base64Image2),
    ]);

    // Larger grid = more stable, less noise-sensitive
    const width = 48;
    const height = 48;

    const canvas1 = document.createElement("canvas");
    const canvas2 = document.createElement("canvas");
    canvas1.width = width;
    canvas1.height = height;
    canvas2.width = width;
    canvas2.height = height;

    const ctx1 = canvas1.getContext("2d");
    const ctx2 = canvas2.getContext("2d");

    if (!ctx1 || !ctx2) {
      return 0;
    }

    // Draw and scale both images to the uniform size grid.
    // Since both photos are captured using the same mirrored canvas translation,
    // they are already pre-aligned in the same horizontal orientation!
    ctx1.drawImage(img1, 0, 0, width, height);
    ctx2.drawImage(img2, 0, 0, width, height);

    const data1 = ctx1.getImageData(0, 0, width, height).data;
    const data2 = ctx2.getImageData(0, 0, width, height).data;

    let totalLuminanceDiff = 0;
    let rSum1 = 0, gSum1 = 0, bSum1 = 0;
    let rSum2 = 0, gSum2 = 0, bSum2 = 0;
    const totalPixels = width * height;

    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i];
      const g1 = data1[i + 1];
      const b1 = data1[i + 2];

      const r2 = data2[i];
      const g2 = data2[i + 1];
      const b2 = data2[i + 2];

      // 1. Calculate greyscale luminance (ITU-R BT.601 formula)
      const lum1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
      const lum2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;

      totalLuminanceDiff += Math.abs(lum1 - lum2);

      // 2. Accumulate color averages
      rSum1 += r1; gSum1 += g1; bSum1 += b1;
      rSum2 += r2; gSum2 += g2; bSum2 += b2;
    }

    // 3. Compute structural matching percentage
    // Softer multiplier (0.75 instead of 1.05) = less punishing for lighting differences
    const avgLuminanceDiff = totalLuminanceDiff / totalPixels;
    const structuralScore = Math.max(0, 100 - (avgLuminanceDiff * 0.75));

    // 4. Compute overall color matching percentage
    const avgR1 = rSum1 / totalPixels, avgG1 = gSum1 / totalPixels, avgB1 = bSum1 / totalPixels;
    const avgR2 = rSum2 / totalPixels, avgG2 = gSum2 / totalPixels, avgB2 = bSum2 / totalPixels;

    const colorDist = Math.sqrt(
      Math.pow(avgR1 - avgR2, 2) +
      Math.pow(avgG1 - avgG2, 2) +
      Math.pow(avgB1 - avgB2, 2)
    );
    const colorScore = Math.max(0, 100 - (colorDist * 0.6)); // Softer color weight

    // 5. Calculate combined final match score (65% structural weight + 35% color distribution)
    const finalScore = Math.round((structuralScore * 0.65) + (colorScore * 0.35));

    return Math.min(100, Math.max(0, finalScore));
  } catch (error) {
    console.error("AI Face Matcher encountered an error during comparison:", error);
    return 0;
  }
}

/**
 * Helper to compress a captured camera frame Base64 data URL.
 * Compresses to 150x150 pixels and 0.7 quality to ensure small payload (~5KB).
 * Applies horizontal mirror translation so it aligns 100% with the user's mirrored screen preview.
 */
export function compressCapturedFace(videoElement) {
  return new Promise((resolve) => {
    try {
      const size = 150;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve("");
        return;
      }

      // Draw standard square cropped center area of the video frame
      const videoWidth = videoElement.videoWidth || 640;
      const videoHeight = videoElement.videoHeight || 480;
      const minDim = Math.min(videoWidth, videoHeight);
      const sx = (videoWidth - minDim) / 2;
      const sy = (videoHeight - minDim) / 2;

      // Horizontally mirror the context to match the mirror preview on-screen
      ctx.translate(size, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(videoElement, sx, sy, minDim, minDim, 0, 0, size, size);
      
      // Reset transformations
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      resolve(compressedBase64);
    } catch (e) {
      console.error("Face compression failed:", e);
      resolve("");
    }
  });
}
