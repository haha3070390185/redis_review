const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  redisConnect: (config) => ipcRenderer.invoke('redis-connect', config),
  redisDisconnect: () => ipcRenderer.invoke('redis-disconnect'),
  redisGetKeys: (pattern) => ipcRenderer.invoke('redis-get-keys', pattern),
  redisGetType: (key) => ipcRenderer.invoke('redis-get-type', key),
  redisGetString: (key) => ipcRenderer.invoke('redis-get-string', key),
  redisGetHash: (key) => ipcRenderer.invoke('redis-get-hash', key),
  redisGetList: (key) => ipcRenderer.invoke('redis-get-list', key),
  redisGetSet: (key) => ipcRenderer.invoke('redis-get-set', key),
  redisGetZset: (key) => ipcRenderer.invoke('redis-get-zset', key)
});
