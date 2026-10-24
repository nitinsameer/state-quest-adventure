import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const srcDir = path.join(rootDir, "dist", "client");
const destDir = path.join(rootDir, "android", "app", "src", "main", "assets", "public");

try {
  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy all files from dist/client to android assets
  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) {
      console.error(`Source directory not found: ${src}`);
      process.exit(1);
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);

    files.forEach((file) => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };

  copyDir(srcDir, destDir);
  console.log(`✅ Assets copied to Android: ${destDir}`);
  console.log(`   Source: ${srcDir}`);
} catch (error) {
  console.error("❌ Failed to copy assets:", error.message);
  process.exit(1);
}
