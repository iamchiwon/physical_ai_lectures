import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(webRoot, "../../ebook/book");
const destination = path.join(webRoot, "public/textbook-assets");
await mkdir(destination, { recursive: true });
await cp(source, destination, {
  recursive: true,
  filter: (file) => ![".DS_Store", "__pycache__"].includes(path.basename(file)) && !file.endsWith(".pyc"),
});
console.log("Textbook images, original manuscripts and example files prepared.");
