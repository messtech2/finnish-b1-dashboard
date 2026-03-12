const fs = require('fs');
const { createCanvas } = require('canvas');

// Create canvas for icon
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Blue background (Finnish flag blue)
  ctx.fillStyle = '#003580';
  ctx.fillRect(0, 0, size, size);
  
  // White cross (simplified Finnish flag)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(size * 0.15, size * 0.4, size * 0.2, size * 0.2);
  ctx.fillRect(size * 0.4, size * 0.15, size * 0.2, size * 0.7);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.25}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FI', size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
}

// Generate icons
fs.writeFileSync('public/pwa-192x192.png', createIcon(192));
fs.writeFileSync('public/pwa-512x512.png', createIcon(512));
console.log('✅ Icons created in public/ folder');
