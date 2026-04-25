import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Income from './pages/Income'
import Budget from './pages/Budget'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import './index.css'

const AUTH_KEY = 'mf_is_logged_in'
const PROFILE_KEY = 'mf_profile'
const THEME_KEY = 'mf_theme'
const THEMES = ['dark', 'light']

// Load the saved signup profile so returning users do not have to sign up again.
const loadProfile = () => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export default function App() {
  const [profile, setProfile] = useState(loadProfile)
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem(AUTH_KEY) === 'true')
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY)
    return THEMES.includes(savedTheme) ? savedTheme : 'dark'
  })

  // Put the current theme on <html> so every CSS file can react to dark/light mode.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('theme-light', theme === 'light')
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark')

  // This is a local demo login. It stores a flag in the browser, not on a server.
  const handleLogin = () => {
    localStorage.setItem(AUTH_KEY, 'true')
    setIsLoggedIn(true)
  }

  // Signup saves the user's profile locally and immediately lets them into the app.
  const handleSignup = (nextProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile))
    localStorage.setItem(AUTH_KEY, 'true')
    setProfile(nextProfile)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <Login profile={profile} onLogin={handleLogin} onSignup={handleSignup} />
  }

  return (
    <AppProvider profile={profile} theme={theme} toggleTheme={toggleTheme}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"             element={<Dashboard />}    />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/income"       element={<Income />}       />
          <Route path="/budget"       element={<Budget />}       />
          <Route path="/settings"     element={<Settings onLogout={handleLogout} />} />
          <Route path="/profile"      element={<Profile onLogout={handleLogout} />} />
          <Route path="/reports"      element={<Reports />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
