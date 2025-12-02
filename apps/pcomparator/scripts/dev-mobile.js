#!/usr/bin/env node

const qrcode = require("qrcode-terminal");
const { execSync, spawn } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      const { address, family, internal } = iface;
      if (family === "IPv4" && !internal) {
        return address;
      }
    }
  }
  return "localhost";
}

function updateCapacitorConfig(url) {
  const configPath = path.join(__dirname, "..", "capacitor.config.ts");
  console.log(`\n📝 Set CAPACITOR_DEV_SERVER_URL=${url} in your environment\n`);
}

const localIP = getLocalIP();
const port = 3001;
const url = `http://${localIP}:${port}`;

console.log("\n" + "=".repeat(60));
console.log("🚀 Deazl Mobile Development Server");
console.log("=".repeat(60));
console.log("");
console.log(`📱 Mobile URL: ${url}`);
console.log(`💻 Local URL:  http://localhost:${port}`);
console.log("");
console.log("📋 Scan this QR code with your phone:");
console.log("");
qrcode.generate(url, { small: true });
console.log("");
console.log("=".repeat(60));
console.log("📖 Instructions:");
console.log("=".repeat(60));
console.log("");
console.log("1. Make sure your phone and computer are on the same WiFi network");
console.log("");
console.log("2. For Capacitor development:");
console.log(`   • Set environment variable: CAPACITOR_DEV_SERVER_URL=${url}`);
console.log("   • Or update capacitor.config.ts server.url");
console.log("   • Run: make android-run (or make ios-run)");
console.log("");
console.log("3. For browser testing on phone:");
console.log("   • Scan the QR code above");
console.log("   • Or type the URL manually");
console.log("");
console.log("=".repeat(60));
console.log("⚡ Starting Next.js development server...");
console.log("=".repeat(60));
console.log("");

const env = { ...process.env, CAPACITOR_DEV_SERVER_URL: url };

const child = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
  env
});

child.on("error", (error) => {
  console.error("Error starting server:", error.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code);
});

process.on("SIGINT", () => {
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});
