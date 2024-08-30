const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const pocketBasePath = path.resolve(__dirname, "pocketbase-win.exe");
const pbHooksPath = path.resolve(__dirname, "pb_hooks");

let pocketBase;
let restartTimer = null;

// Function to start pocketbase-win.exe
function startPocketBase() {
  console.log("Starting pocketbase-win.exe...");
  pocketBase = spawn(pocketBasePath, ["serve"], { stdio: "inherit" });

  pocketBase.on("error", (err) => {
    console.error("Error starting pocketbase-win.exe:", err);
  });

  pocketBase.on("close", (code) => {
    console.log(`pocketbase-win.exe closed with code ${code}`);
  });

  return pocketBase;
}

// Function to schedule restart of pocketbase-win.exe
function scheduleRestart() {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartPocketBase();
  }, 1000); // Wait for 1 second before restarting
}

// Function to restart pocketbase-win.exe
function restartPocketBase() {
  console.log("Restarting pocketbase-win.exe...");
  if (pocketBase) {
    pocketBase.kill();
  }
  startPocketBase();
}

// Function to watch for changes in pb_hooks directory
function watchPBHooks() {
  console.log("Watching for changes in pb_hooks directory...");
  fs.watch(pbHooksPath, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".js")) {
      console.log(
        `${filename} has been modified. Restarting pocketbase-win.exe...`
      );
      scheduleRestart(); // Schedule restart
    }
  });
}

// Start pocketbase-win.exe and watch for changes in pb_hooks
startPocketBase();
watchPBHooks();
