// Placeholder icon generation script
// You should replace these with actual VidyaVerse logo icons

const fs = require("fs");
const path = require("path");

// This creates a simple SVG that can be converted to PNG
const createSVGIcon = (size, text = "V") => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${
    size * 0.6
  }" font-weight="bold">${text}</text>
</svg>`;
};

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "..", "public", "icons");

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size
iconSizes.forEach((size) => {
  const svgContent = createSVGIcon(size);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(iconsDir, fileName);

  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${fileName}`);
});

console.log("Placeholder icons created successfully!");
console.log(
  "Please replace these with actual VidyaVerse logo icons in PNG format."
);
