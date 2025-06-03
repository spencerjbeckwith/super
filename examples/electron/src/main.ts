import { app, BrowserWindow, Menu, MenuItem, ipcMain } from "electron";
import path from "path";
import { spawnSync } from "child_process";

const BASE_WIDTH = 400;
const BASE_HEIGHT = 240;
let scale = 2;
const MAX_SCALE = 4;

// Most of this file is basic electron boilerplate, plus some other useful gamedev features.
// For example: the app running in dev mode adds a menu bar to help the development workflow.

function initialize(win: BrowserWindow, reload: boolean) {
    win.loadFile("index.html");
}

function createWindow() {
    const win = new BrowserWindow({
        minWidth: BASE_WIDTH + 2,
        minHeight: BASE_WIDTH + 2,
        width: (BASE_WIDTH * scale) + 2,
        height: (BASE_HEIGHT * scale) + 2,
        autoHideMenuBar: true,
        resizable: true,
        fullscreenable: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        }
    });

    // In development, add dev actions to menu
    if (app.isPackaged) {
        // Disable app menu in production
        win.setMenu(null);
        Menu.setApplicationMenu(null); // Needed on Mac
    } else {
        const devMenu = new Menu();
        devMenu.append(new MenuItem({
            label: "Development",
            submenu: [
                {
                    role: "toggleDevTools",
                },
                {
                    label: "Reload",
                    click: () => {
                        initialize(win, true);
                    },
                },
                {
                    label: "Rebuild",
                    click: () => {
                        const result = spawnSync("npm", ["run", "build:renderer"], {
                            stdio: [
                                process.stdin,
                                process.stdout,
                                process.stderr,
                            ],
                        });
                        if (!result.error) {
                            initialize(win, true);
                        }
                    },
                },
            ],
        }));

        win.setMenu(devMenu);
        Menu.setApplicationMenu(devMenu);
    }
    
    // Handle config events from user input
    ipcMain.on("toggle", (event, data) => {
        switch (data) {
            case "scale": {
                scale++;
                if (scale > MAX_SCALE) {
                    scale = 1;
                }
                win.setSize((BASE_WIDTH * scale + 2), (BASE_HEIGHT * scale) + 2);
                win.center();
                break;
            }
            case "fullscreen": {
                const target = !win.isFullScreen();
                win.setFullScreen(target);
                win.center();
                break;
            }
            case "force-quit": {
                app.quit();
                break;
            }
            default: break;
        }
    });

    initialize(win, false);
}

app.whenReady().then(createWindow);
app.on("window-all-closed", app.quit);