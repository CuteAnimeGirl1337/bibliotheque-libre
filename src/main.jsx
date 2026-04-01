import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { BooksProvider } from './context/BooksContext'
import { BookmarksProvider } from './context/BookmarksContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BooksProvider>
        <BookmarksProvider>
          <App />
        </BookmarksProvider>
      </BooksProvider>
    </BrowserRouter>
  </React.StrictMode>
)
