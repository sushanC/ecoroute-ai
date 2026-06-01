import './Loader.css'
import { Leaf } from 'lucide-react'

export default function Loader({ message = "Loading EcoRoute AI..." }) {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="loader-icon-wrapper">
          <div className="loader-ring"></div>
          <div className="loader-ring loader-ring-inner"></div>
          <Leaf className="loader-icon pulse-green" size={28} color="var(--primary-green)" />
        </div>
        <h2 className="loader-title">EcoRoute <span style={{ color: 'var(--primary-green)' }}>AI</span></h2>
        <p className="loader-text">{message}</p>
      </div>
    </div>
  )
}
