import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "dist");
const defaultTarget = "C:\\inetpub\\wwwroot\\portofolio-faturachman";
const targetDir = process.env.TING_AI_DEPLOY_TARGET || defaultTarget;

if (!existsSync(sourceDir)) {
  console.error("Folder dist belum ada. Jalankan build terlebih dahulu.");
  process.exit(1);
}

if (targetDir.length < 10) {
  console.error(`Target deploy tidak aman: ${targetDir}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

for (const entry of readdirSync(targetDir)) {
  rmSync(path.join(targetDir, entry), { recursive: true, force: true });
}

cpSync(sourceDir, targetDir, { recursive: true, force: true });

console.log(`Deploy selesai ke: ${targetDir}`);
console.log(
  "Jika ingin ganti folder tujuan, jalankan dengan env TING_AI_DEPLOY_TARGET."
);
