import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'
import './index.css'

// Handle GitHub Pages SPA routing
const redirect = sessionStorage.redirect
if (redirect) {
  sessionStorage.removeItem('redirect')
  window.history.replaceState(null, '', redirect)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/TercihApp">
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

