const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Redis = require('ioredis');

let mainWindow;
let redisClient = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('closed', function () {
    mainWindow = null;
    if (redisClient) {
      redisClient.disconnect();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (redisClient) {
      redisClient.disconnect();
    }
    app.quit();
  }
});

ipcMain.handle('redis-connect', async (event, config) => {
  try {
    if (redisClient) {
      redisClient.disconnect();
    }
    
    redisClient = new Redis({
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || undefined,
      db: config.db || 0
    });
    
    await redisClient.ping();
    return { success: true, message: '连接成功' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('redis-disconnect', async () => {
  if (redisClient) {
    redisClient.disconnect();
    redisClient = null;
  }
  return { success: true };
});

ipcMain.handle('redis-get-keys', async (event, pattern = '*') => {
  try {
    if (!redisClient) {
      return { success: false, message: '未连接到Redis' };
    }
    
    const keys = await redisClient.keys(pattern);
    return { success: true, data: keys };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('redis-get-type', async (event, key) => {
  try {
    if (!redisClient) {
      return { success: false, message: '未连接到Redis' };
    }
    
    const type = await redisClient.type(key);
    return { success: true, data: type };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('redis-get-string', async (event, key) => {
  try {
    if (!redisClient) {
      return { success: false, message: '未连接到Redis' };
    }
    
    const value = await redisClient.get(key);
    return { success: true, data: value };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('redis-get-hash', async (event, key) => {
  try {
    if (!redisClient) {
      return { success: false, message: '未连接到Redis' };
    }
    
    const value = await redisClient.hgetall(key);
    return { success: true, data: value };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('redis-get-list', async (event, key) => {
  try {
    if (!redisClient) {
      return { success: false, message: '未连接到Redis' };
    }
    
    const value = await redisClient.lrange(key, 0, -1);
    return { success: true, data: value };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('redis-get-set', async (event, key) => {
  try {
    if (!redisClient) {
      return { success: false, message: '未连接到Redis' };
    }
    
    const value = await redisClient.smembers(key);
    return { success: true, data: value };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('redis-get-zset', async (event, key) => {
  try {
    if (!redisClient) {
      return { success: false, message: '未连接到Redis' };
    }
    
    const value = await redisClient.zrange(key, 0, -1, 'WITHSCORES');
    const result = [];
    for (let i = 0; i < value.length; i += 2) {
      result.push({ member: value[i], score: value[i + 1] });
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
