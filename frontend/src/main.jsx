import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 공통 스타일 임포트
import './styles/base.css'
import './styles/form.css'
import './styles/layout.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)