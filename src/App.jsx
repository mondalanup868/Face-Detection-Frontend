import { useState } from 'react'
import './App.css'
import WebcamCapture from './components/WebcamCapture'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  <WebcamCapture/>
    </>
  )
}

export default App
