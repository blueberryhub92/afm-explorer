import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import AFMLearningExplorer from './AFMLearningExplorer'
import AFMSimulator from './AFMSimulator'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/afm-explorer" element={<AFMLearningExplorer />} />
        <Route path="/afm-simulator" element={<AFMSimulator />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)