import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext.jsx'

import Layout from './Layout.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Dashboard from './Dashboard.jsx'
import AddFood from './AddFood.jsx'
import Inventory from './Inventory.jsx'
import WasteTracker from './WasteTracker.jsx'
import ExpiryReminder from './ExpiryReminder.jsx'
import ShoppingList from './ShoppingList.jsx'
import DonateFood from './DonateFood.jsx'
import NGOSection from './NGOSection.jsx'
import DonationHistory from './DonationHistory.jsx'
import History from './History.jsx'
import MoneySaved from './MoneySaved.jsx'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-food"
        element={
          <ProtectedRoute>
            <Layout>
              <AddFood />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/waste"
        element={
          <ProtectedRoute>
            <Layout>
              <WasteTracker />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expiry"
        element={
          <ProtectedRoute>
            <Layout>
              <ExpiryReminder />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shopping"
        element={
          <ProtectedRoute>
            <Layout>
              <ShoppingList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/donate"
        element={
          <ProtectedRoute>
            <Layout>
              <DonateFood />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo"
        element={
          <ProtectedRoute>
            <Layout>
              <NGOSection />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/donation-history"
        element={
          <ProtectedRoute>
            <Layout>
              <DonationHistory />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/money-saved"
        element={
          <ProtectedRoute>
            <Layout>
              <MoneySaved />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
