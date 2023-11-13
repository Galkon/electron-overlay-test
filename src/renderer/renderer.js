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

const App = () => {
  const [activeTest, setActiveTest] = useState(null)

  useEffect(() => {
    const onOverlayOpened = (props) => {
      setActiveTest(props)
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
        <Button onClick={() => {
          window.ipc.send('open-overlay', {
            name: 'Overlay Test 1',
            alwaysOnTop: true,
            backgroundColor: '#00000000',
            delayShow: true
          })
        }}>
          Overlay Test 1
        </Button>
        <Button  onClick={() => {
          window.ipc.send('open-overlay', {
            name: 'Overlay Test 2',
            alwaysOnTop: true,
            backgroundColor: '#00000000',
            delayShow: false
          })
        }}>
          Overlay Test 2
        </Button>
        <Button  onClick={() => {
          window.ipc.send('open-overlay', {
            name: 'Overlay Test 3',
            alwaysOnTop: false,
            backgroundColor: '#00000000',
            delayShow: true
          })
        }}>
          Overlay Test 3
        </Button>
        <Button  onClick={() => {
          window.ipc.send('open-overlay', {
            name: 'Overlay Test 4',
            alwaysOnTop: false,
            backgroundColor: '#00000000',
            delayShow: false
          })
        }}>
          Overlay Test 4
        </Button>
        <Button  onClick={() => {
          window.ipc.send('open-overlay', {
            name: 'Overlay Test 5',
            alwaysOnTop: true,
            backgroundColor: '#00000000',
            delayShow: true,
            offsetSize: true
          })
        }}>
          Overlay Test 5
        </Button>
        <Button  onClick={() => {
          window.ipc.send('open-overlay', {
            name: 'Overlay Test 6',
            alwaysOnTop: true,
            backgroundColor: '#00000000',
            delayShow: false,
            offsetSize: true
          })
        }}>
          Overlay Test 6
        </Button>
        <Button  onClick={() => {
          window.ipc.send('open-overlay', {
            name: 'Overlay Test 7',
            alwaysOnTop: false,
            backgroundColor: '#00000000',
            delayShow: false,
            offsetSize: true
          })
        }}>
          Overlay Test 7
        </Button>
      </Buttons>
    </Body>
  )
}

const domNode = document.getElementById('root')
const root = createRoot(domNode)
root.render(<App />)
