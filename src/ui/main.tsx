import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { mockApi } from '../api/mockApi'

// Inject mock API for browser development
if (typeof window !== 'undefined' && !window.electron) {
    (window as any).electron = mockApi;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

