import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiCalendar, FiEdit, FiFileText, FiLogIn, FiLogOut, FiPlus, FiRefreshCw, FiShield, FiTrash2, FiUser, FiX } from 'react-icons/fi'

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
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [detailError, setDetailError] = useState('')

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

  const handleViewNote = async (noteId: string) => {
    setIsLoadingDetail(true)
    setDetailError('')

    try {
      const response = await fetch(`${API_BASE}/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        setDetailError((data as { message?: string }).message || 'Failed to load note')
        return
      }

      setSelectedNote(data as Note)
      setEditTitle(data.title)
      setEditContent(data.content)
    } catch {
      setDetailError('Failed to load note')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleUpdateNote = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedNote) return

    setDetailError('')
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle) {
      setDetailError('Please enter a title')
      return
    }

    if (!trimmedContent) {
      setDetailError('Please enter content')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`${API_BASE}/notes/${selectedNote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      })

      const data = await response.json()
      if (!response.ok) {
        setDetailError(data.message || 'Update failed')
        return
      }

      setSelectedNote(null)
      setEditTitle('')
      setEditContent('')
      fetchNotes(currentPage)
    } catch {
      setDetailError('Update request failed')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!selectedNote) return

    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    setIsDeleting(true)
    setDetailError('')

    try {
      const response = await fetch(`${API_BASE}/notes/${selectedNote.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        setDetailError(data.message || 'Delete failed')
        return
      }

      setSelectedNote(null)
      setEditTitle('')
      setEditContent('')
      fetchNotes(currentPage)
    } catch {
      setDetailError('Delete request failed')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseNote = () => {
    setSelectedNote(null)
    setEditTitle('')
    setEditContent('')
    setDetailError('')
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
              <p className="my-2 line-clamp-2 break-all whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
              <div className="flex items-center justify-between gap-2">
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
                {isLoggedIn && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                    onClick={() => handleViewNote(note.id)}
                  >
                    <FiFileText className="text-xs" />
                    View
                  </button>
                )}
              </div>
            </li>
          ))}
          {notes.length === 0 && <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">No notes yet</li>}
        </ul>
      </section>

      {selectedNote && (
        <section className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:max-w-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
                <FiEdit className="text-slate-700" />
                Edit Note
              </h2>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-200 px-2 py-2 font-medium text-slate-900 hover:bg-slate-300 sm:px-3"
                onClick={handleCloseNote}
              >
                <FiX />
              </button>
            </div>

            {isLoadingDetail && <p className="text-sm text-slate-500">Loading note...</p>}

            {!isLoadingDetail && (
              <form className="grid gap-4 sm:gap-5" onSubmit={handleUpdateNote}>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700 sm:text-sm">Title</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500 sm:text-base"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    placeholder="title"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700 sm:text-sm">Content</label>
                  <textarea
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500 sm:text-base"
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    placeholder="content"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    className="order-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:order-none sm:text-base"
                    disabled={isUpdating || isDeleting}
                  >
                    <FiEdit />
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    className="order-2 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:order-none sm:text-base"
                    onClick={handleDeleteNote}
                    disabled={isUpdating || isDeleting}
                  >
                    <FiTrash2 />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

                {detailError && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{detailError}</p>
                )}
              </form>
            )}
          </div>
        </section>
      )}

    </main>
  )
}

export default App
