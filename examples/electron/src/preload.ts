import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("toggle", {
    scale: () => ipcRenderer.send("toggle", "scale"),
    fullscreen: () => ipcRenderer.send("toggle", "fullscreen"),
    forceQuit: () => ipcRenderer.send("toggle", "force-quit"),
});