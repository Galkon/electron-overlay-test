import React, {useEffect, useState} from 'react'
import { createRoot } from 'react-dom/client';
import styled from 'styled-components'
import Button from './components/Button'

const Body = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 32px;
  gap: 32px;
`

const Buttons = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`

const ActiveTest = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: mediumspringgreen;
`

const OverlayTests = [
  {
    name: 'Overlay Test 1',
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    delayShow: true
  },
  {
    name: 'Overlay Test 2',
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    delayShow: false
  },
  {
    name: 'Overlay Test 3',
    alwaysOnTop: false,
    backgroundColor: '#00000000',
    delayShow: true
  },
  {
    name: 'Overlay Test 4',
    alwaysOnTop: false,
    backgroundColor: '#00000000',
    delayShow: false
  },
  {
    name: 'Overlay Test 5',
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    delayShow: true,
    offsetSize: true
  },
  {
    name: 'Overlay Test 6',
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    delayShow: false,
    offsetSize: true
  },
  {
    name: 'Overlay Test 7',
    alwaysOnTop: false,
    backgroundColor: '#00000000',
    delayShow: false,
    offsetSize: true
  }
]

const App = () => {
  const [activeTest, setActiveTest] = useState(null)
  const [busy, setBusy] = useState(false)

  const runTest = (props) => {
    setBusy(true)
    window.ipc.send('open-overlay', props)
  }

  useEffect(() => {
    const onOverlayOpened = (props) => {
      setActiveTest(props)
      setBusy(false)
    }

    window.ipc.on('overlay-opened', onOverlayOpened)

    return () => {
      window.ipc.off('overlay-opened', onOverlayOpened)
    }
  }, [])

  return (
    <Body>
      {
        activeTest &&
        <ActiveTest>Active Test: {activeTest.name}, {activeTest.width}x{activeTest.height} at {activeTest.x},{activeTest.y}</ActiveTest>
      }
      <Buttons>
        {
          OverlayTests.map(test => {
            return (
              <Button
                onClick={() => {
                  runTest(test)
                }}
                disabled={busy}
              >
                {test.name}
              </Button>
            )
          })
        }
      </Buttons>
    </Body>
  )
}

const domNode = document.getElementById('root')
const root = createRoot(domNode)
root.render(<App />)
