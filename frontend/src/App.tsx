import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiCalendar, FiFileText, FiLogIn, FiLogOut, FiPlus, FiRefreshCw, FiShield, FiUser } from 'react-icons/fi'

type Note = {
  id: string
  title: string
  content: string
  user_id: number
  created: string
}

type NotesResponse = {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: Note[]
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function App() {
  const [username, setUsername] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isFetchingNotes, setIsFetchingNotes] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const isLoggedIn = useMemo(() => token.length > 0, [token])

  const fetchNotes = useCallback(async (page: number) => {
    setIsFetchingNotes(true)
    try {
      const response = await fetch(`${API_BASE}/notes?page=${page}`)
      const data: NotesResponse = await response.json()
      setNotes(Array.isArray(data.items) ? data.items : [])
      setCurrentPage(typeof data.page === 'number' ? data.page : page)
      setTotalPages(typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1)
      setTotalItems(typeof data.totalItems === 'number' ? data.totalItems : 0)
    } catch {
      setNotes([])
    } finally {
      setIsFetchingNotes(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes(1)
  }, [fetchNotes])

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoggingIn(true)

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await response.json()

      if (!response.ok || !data.token) {
        return
      }

      setToken(data.token)
      localStorage.setItem('token', data.token)
    } catch {
      console.error('Login request failed')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleCreateNote = async (event: FormEvent) => {
    event.preventDefault()
    setCreateError('')

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      setCreateError('Please enter a title')
      return
    }

    if (!trimmedContent) {
      setCreateError('Please enter content')
      return
    }

    if (!token) {
      setCreateError('Please login before creating a note')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      })

      const data = await response.json()
      if (!response.ok) {
        setCreateError(data.message || 'Create note failed')
        return
      }

      setTitle('')
      setContent('')
      setCreateError('')
      fetchNotes(currentPage)
    } catch {
      setCreateError('Create note request failed')
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-4 sm:p-6">
      <header className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h1 className="m-0 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <FiFileText className="text-slate-700" />
            SecureNote
          </h1>
          {isLoggedIn && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-900 hover:bg-slate-300"
              onClick={handleLogout}
            >
              <FiLogOut />
              Logout
            </button>
          )}
        </div>
      </header>

      {!isLoggedIn && (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FiShield className="text-slate-700" />
            Auth
          </h2>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleLogin}>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="username"
              required
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800">
              <FiLogIn />
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <small className="mt-2 block text-xs text-slate-500">Not logged in</small>
        </section>
      )}

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FiPlus className="text-slate-700" />
          Create note
        </h2>
        <form className="grid gap-2" onSubmit={handleCreateNote}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="title"
            required
          />
          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="content"
            rows={4}
            required
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800">
            <FiPlus />
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </form>
        {createError && (
          <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{createError}</p>
        )}
      </section>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FiFileText className="text-slate-700" />
            Notes
          </h2>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-900 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fetchNotes(currentPage)}
            disabled={isFetchingNotes}
          >
            <FiRefreshCw className={isFetchingNotes ? 'animate-spin' : ''} />
            {isFetchingNotes ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <span>{totalItems} total items</span>
        </div>

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fetchNotes(currentPage - 1)}
            disabled={isFetchingNotes || currentPage <= 1}
          >
            <FiArrowLeft />
            Previous
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fetchNotes(currentPage + 1)}
            disabled={isFetchingNotes || currentPage >= totalPages}
          >
            Next
            <FiArrowRight />
          </button>
        </div>

        {isFetchingNotes && (
          <p className="mb-3 text-sm text-slate-500">Fetching notes...</p>
        )}

        <ul className="grid max-h-96 gap-2 overflow-y-auto pr-1">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h3 className="m-0 text-base font-semibold text-slate-900">{note.title}</h3>
              <p className="my-2 overflow-x-auto whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
              <small className="inline-flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <FiUser />
                  user {note.user_id}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FiCalendar />
                  {new Date(note.created).toLocaleString()}
                </span>
              </small>
            </li>
          ))}
          {notes.length === 0 && <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">No notes yet</li>}
        </ul>
      </section>

    </main>
  )
}

export default App
