import { useState } from 'react'
import styles from './Login.module.css'

const initialForm = { name: '', email: '', password: '' }

const initialsFor = (name) => name
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0].toUpperCase())
  .join('')

export default function Login({ profile, onLogin, onSignup }) {
  const [mode, setMode] = useState(profile ? 'login' : 'signup')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setForm(initialForm)
  }

  const submit = (ev) => {
    ev.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const password = form.password.trim()

    if (isSignup) {
      if (!name || !email || !password) {
        setError('Enter your name, email, and password.')
        return
      }

      onSignup({ name, email, password, initials: initialsFor(name) })
      return
    }

    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }

    if (!profile) {
      setError('Create your profile first.')
      return
    }

    if (email !== profile.email || password !== profile.password) {
      setError('Email or password does not match your profile.')
      return
    }

    setError('')
    onLogin()
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.logo}>M</div>
        <h1 className={styles.title}>{isSignup ? 'Create profile' : 'Welcome back'}</h1>
        <p className={styles.sub}>
          {isSignup ? 'Sign up before entering MoneyFlow.' : 'Login to continue to your finance dashboard.'}
        </p>

        {isSignup && (
          <>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              autoComplete="name"
              value={form.name}
              onChange={ev => set('name', ev.target.value)}
            />
          </>
        )}

        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={ev => set('email', ev.target.value)}
        />

        <label className={styles.label}>Password</label>
        <input
          className={styles.input}
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={ev => set('password', ev.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit">{isSignup ? 'Sign up' : 'Login'}</button>

        <button
          className={styles.switchBtn}
          type="button"
          onClick={() => switchMode(isSignup ? 'login' : 'signup')}
        >
          {isSignup ? 'Already have a profile? Login' : 'Need a profile? Sign up'}
        </button>
      </form>
    </main>
  )
}
