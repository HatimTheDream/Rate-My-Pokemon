import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
console.log('Starting application...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);
if (!rootElement) {
    console.error('Root element not found!');
    throw new Error('Root element not found!');
}
console.log('Creating React root...');
ReactDOM.createRoot(rootElement).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
