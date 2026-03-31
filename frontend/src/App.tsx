import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { 
  FiArrowLeft, FiArrowRight, FiEdit, FiFileText, FiLogIn, FiLogOut, 
  FiPlus, FiRefreshCw, FiLock, FiTrash2, FiUser, FiX, FiChevronRight, FiCheckCircle,
  FiClock, FiLayers
} from 'react-icons/fi'

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
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 text-white">
              <FiFileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">SecureNote</h1>
            </div>
          </div>
          {isLoggedIn && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 sm:gap-3 sm:px-5 sm:py-2.5 sm:text-base"
              onClick={handleLogout}
            >
              <FiLogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Auth Section */}
        {!isLoggedIn && (
          <div className="mb-8">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <FiLock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Sign In</h2>
              </div>
              <form className="flex flex-col gap-3 sm:flex-row sm:gap-3" onSubmit={handleLogin}>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none sm:text-base"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                />
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 sm:whitespace-nowrap sm:text-base">
                  <FiLogIn className="h-4 w-4" />
                  {isLoggingIn ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              {!isLoggingIn && <p className="mt-4 text-xs text-slate-500">No account? We'll create one for you!</p>}
            </div>
          </div>
        )}

        {isLoggedIn && (
          <>
            {/* Create Note Section */}
            <div className="mb-8">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 text-green-600">
                    <FiPlus className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">New Note</h2>
                </div>
                <form className="space-y-4" onSubmit={handleCreateNote}>
                  <div>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:outline-none sm:text-base"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Title..."
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:outline-none sm:text-base"
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="Write your thoughts..."
                      rows={4}
                      required
                    />
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-50 sm:text-base">
                    <FiPlus className="h-4 w-4" />
                    {isCreating ? 'Creating...' : 'Create Note'}
                  </button>
                </form>
                {createError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="m-0 font-medium">Error</p>
                    <p className="m-0 mt-1">{createError}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Notes Section */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <FiLayers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Your Notes</h2>
                  <p className="m-0 mt-1 text-xs text-slate-500 sm:text-sm">{totalItems} note{totalItems !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50 sm:px-5 sm:py-2.5 sm:text-base"
                onClick={() => fetchNotes(currentPage)}
                disabled={isFetchingNotes}
              >
                <FiRefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isFetchingNotes ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 px-6 py-6 sm:px-8 sm:py-8">
            {isFetchingNotes ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                  <p className="text-sm text-slate-500">Loading notes...</p>
                </div>
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="group relative rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-md sm:p-5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="m-0 font-semibold text-slate-900 sm:text-lg">{note.title}</h3>
                        <p className="m-0 mt-2 line-clamp-2 break-all text-sm text-slate-600 sm:mt-1.5">{note.content}</p>
                      </div>
                      {isLoggedIn && (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg bg-white p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 sm:p-2.5"
                          onClick={() => handleViewNote(note.id)}
                          title="View and edit"
                        >
                          <FiChevronRight className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <FiUser className="h-3.5 w-3.5" />
                          User {note.user_id}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FiClock className="h-3.5 w-3.5" />
                          {new Date(note.created).toLocaleDateString()} {new Date(note.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-lg bg-slate-100 p-3 text-slate-400">
                  <FiFileText className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm text-slate-500">No notes yet. Create your first one!</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-100 px-6 py-6 sm:px-8 sm:py-8">
              <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-medium">Page {currentPage} of {totalPages}</span>
                <span className="text-xs">{totalItems} total items</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  onClick={() => fetchNotes(currentPage - 1)}
                  disabled={isFetchingNotes || currentPage <= 1}
                >
                  <FiArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  onClick={() => fetchNotes(currentPage + 1)}
                  disabled={isFetchingNotes || currentPage >= totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Edit Note */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-100 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                    <FiEdit className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Edit Note</h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 transition-all hover:bg-slate-200 sm:p-2.5"
                  onClick={handleCloseNote}
                  title="Close"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                    <p className="text-sm text-slate-500">Loading...</p>
                  </div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleUpdateNote}>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none sm:text-base"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      placeholder="Note title"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Content</label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none sm:text-base"
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      placeholder="Note content"
                      rows={6}
                      required
                    />
                  </div>

                  {detailError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <p className="m-0 font-medium">Error</p>
                      <p className="m-0 mt-1">{detailError}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 sm:text-base"
                      onClick={handleCloseNote}
                      disabled={isUpdating || isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50 sm:text-base"
                      onClick={handleDeleteNote}
                      disabled={isUpdating || isDeleting}
                    >
                      <FiTrash2 className="h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-700 disabled:opacity-50 sm:text-base"
                      disabled={isUpdating || isDeleting}
                    >
                      <FiCheckCircle className="h-4 w-4" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
