import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Thêm .jsx cho chắc chắn

// THÊM DÒNG NÀY ĐỂ CHẠY ĐƯỢC BOOTSTRAP

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)