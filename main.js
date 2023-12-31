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
  // app.disableHardwareAcceleration()

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
    const x = display.workArea.x + (props.offsetSize ? 1 : 0)
    const y = display.workArea.y + (props.offsetSize ? 1 : 0)
    const width = display.workArea.width - (props.offsetSize ? 2 : 0)
    const height = display.workArea.height - (props.offsetSize ? 2 : 0)

    console.log('Overlay dimensions:', width, height)

    overlay = new BrowserWindow({
      frame: false,
      titleBarStyle: 'hidden',
      transparent: true,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      closable: false,
      fullscreen: false,
      movable: false,
      resizable: false,
      show: !props.delayShow,
      backgroundColor: props.backgroundColor,
      alwaysOnTop: props.alwaysOnTop ?? true,
      hasShadow: props.hasShadow,
      backgroundMaterial: props.backgroundMaterial,
      thickFrame: props.thickFrame,
      x,
      y,
      width,
      height
    })

    overlay.removeMenu()
    overlay.setIgnoreMouseEvents(true)

    if (props.delayShow) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (props.controlSizeAndBounds) {
        overlay.setContentSize(width, height)
        overlay.setBounds({x, y, width, height})
      }

      if (!props.alwaysOnTop) {
        overlay.setAlwaysOnTop(true, 'status')
      }
      overlay.showInactive()
    } else if (props.controlSizeAndBounds) {
      overlay.setContentSize(width, height)
      overlay.setBounds({x, y, width, height})
    }

    const overlayHtml = isDevelopment
      ? path.join(__dirname, 'src', 'renderer', 'overlay.html')
      : path.join(__dirname, 'overlay.html')

    await overlay.loadURL(`file://${overlayHtml}`)

    if (props.setBackgroundColor) {
      overlay.setBackgroundColor(props.backgroundColor ?? '#00000000')
    }

    event.reply('overlay-opened', {
      name: props.name,
      x,
      y,
      width,
      height
    })
  })
}

// run the start func
start()
