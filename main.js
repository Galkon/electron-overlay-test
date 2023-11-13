const { app, BrowserWindow, ipcMain, shell, screen} = require('electron')
const path = require('path')
const http = require('http')

const isDevelopment = process.env.NODE_ENV === 'development'

function pollServer(url) {
  return new Promise(resolve => {
    const request = http.get(url, (res) => {
      resolve(true);
      request.abort(); // We don't need to read the response, just knowing the server is up is enough
    });

    request.on('error', (err) => {
      setTimeout(() => {
        console.log(`Polling for dev server:`, url);
        resolve(pollServer(url)); // Retry after a delay
      }, 1000);
    });
  });
}

/**
 * Create and return the {@link BrowserWindow} instance.
 * @returns {Promise<Electron.CrossProcessExports.BrowserWindow>}
 */
const createWindow = async () => {
  const win = new BrowserWindow({
    show: false,
    width: 700,
    height: 420,
    minWidth: 700,
    minHeight: 420,
    backgroundColor: '#161617',
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: isDevelopment
        ? path.join(__dirname, 'src', 'main', 'preload.js')
        : path.join(__dirname, 'preload.js')
    }
  })

  const startUrl =
    isDevelopment
      ? `http://127.0.0.1:3000`
      : `file://${path.join(__dirname, 'index.html')}`

  win.removeMenu()
  win.once('ready-to-show', () => {
    win.show()
  })

  if (isDevelopment) {
    await pollServer(startUrl)
  }

  await win.loadURL(startUrl)
  return win
}

/**
 * Wait for app ready and initialize the window.
 * @returns {Promise<void>}
 */
const start = async () => {
  await app.whenReady()
  let window = await createWindow()
  let overlay
  let activating = false

  const closeOverlay = async () => {
    if (overlay) {
      await new Promise(resolve => {
        overlay.once('closed', () => {
          console.log('Closed overlay window!')
          overlay = null
          resolve()
        })
        console.log('Destroying overlay window...')
        overlay.destroy()
      })
    }
  }

  window.on('closed', async () => {
    await closeOverlay()
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', async () => {
    if (!activating && window.isDestroyed()) {
      activating = true
      window = await createWindow()
      activating = false
    }
  })

  ipcMain.on('open-overlay', async (event, props) => {
    await closeOverlay()

    console.log('Initializing overlay with properties:', props)

    const display = screen.getPrimaryDisplay()
    const width = display.workArea.width
    const height = display.workArea.height

    console.log('Overlay dimensions:', width, height)

    overlay = new BrowserWindow({
      show: !props.delayShow,
      frame: false,
      transparent: true,
      backgroundColor: props.backgroundColor,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      closable: false,
      fullscreen: false,
      movable: false,
      alwaysOnTop: props.alwaysOnTop ?? true,
      width,
      height
    })

    overlay.setIgnoreMouseEvents(true)

    if (props.delayShow) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      if (!props.alwaysOnTop) {
        overlay.setAlwaysOnTop(true, 'status')
      }
      overlay.showInactive()
    }

    const overlayHtml = isDevelopment
      ? path.join(__dirname, 'src', 'renderer', 'overlay.html')
      : path.join(__dirname, 'overlay.html')

    await overlay.loadURL(`file://${overlayHtml}`)

    event.reply('overlay-opened', {
      name: props.name,
      width,
      height
    })
  })
}

// run the start func
start()
