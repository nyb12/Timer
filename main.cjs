const { app, BrowserWindow, screen } = require("electron");
const path = require("node:path");

const WINDOW_WIDTH = 560;
const WINDOW_HEIGHT = 660;
const WINDOW_MARGIN = 18;

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: workArea.x + workArea.width - WINDOW_WIDTH - WINDOW_MARGIN,
    y: workArea.y + workArea.height - WINDOW_HEIGHT - WINDOW_MARGIN,
    title: "Timer",
    resizable: false,
    backgroundColor: "#0d1117",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
