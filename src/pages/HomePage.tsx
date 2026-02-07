import { useEffect, useMemo, useRef, useState } from 'react'
import defaultAbstractImage from '../assets/default-abstract.svg'
import { ActivityBubble } from '../components'

type Activity = {
  id: string
  label: string
  imageUrl: string
  createdAt: string
  lastResetAt?: string
  x: number
  y: number
  size: number
}

const STORAGE_KEY = 'bubble-activities'

const seedActivities: Omit<Activity, 'createdAt' | 'lastResetAt'>[] = [
  {
    id: 'walk',
    label: 'Morning Walk',
    imageUrl:
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=700&q=80',
    x: 40,
    y: 40,
    size: 130,
  },
  {
    id: 'read',
    label: 'Read Book',
    imageUrl:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=80',
    x: 220,
    y: 160,
    size: 120,
  },
  {
    id: 'yoga',
    label: 'Yoga',
    imageUrl:
      'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=700&q=80',
    x: 120,
    y: 320,
    size: 125,
  },
]

function loadActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const now = new Date().toISOString()
      return seedActivities.map((activity) => ({ ...activity, createdAt: now }))
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return [] as Activity[]
    }

    return parsed as Activity[]
  } catch {
    return [] as Activity[]
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const [now, setNow] = useState(() => Date.now())
  const [activities, setActivities] = useState<Activity[]>(loadActivities)
  const [newActivityTitle, setNewActivityTitle] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
  }, [activities])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const updateBounds = () => {
      setBounds({ width: element.clientWidth, height: element.clientHeight })
    }

    updateBounds()

    const observer = new ResizeObserver(() => {
      updateBounds()
    })

    observer.observe(element)
    window.addEventListener('resize', updateBounds)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateBounds)
    }
  }, [])

  useEffect(() => {
    if (!bounds.width || !bounds.height) {
      return
    }

    setActivities((current) =>
      current.map((activity) => {
        const maxX = Math.max(0, bounds.width - activity.size)
        const maxY = Math.max(0, bounds.height - activity.size)

        return {
          ...activity,
          x: clamp(activity.x, 0, maxX),
          y: clamp(activity.y, 0, maxY),
        }
      }),
    )
  }, [bounds.height, bounds.width])

  const orderedActivities = useMemo(() => [...activities], [activities])

  const handleMove = (id: string, nextX: number, nextY: number) => {
    setActivities((current) =>
      current.map((activity) => (activity.id === id ? { ...activity, x: nextX, y: nextY } : activity)),
    )
  }

  const handleReset = (id: string) => {
    const resetAt = new Date().toISOString()
    setNow(Date.now())
    setActivities((current) =>
      current.map((activity) => (activity.id === id ? { ...activity, lastResetAt: resetAt } : activity)),
    )
  }

  const handleAddActivity = () => {
    const label = newActivityTitle.trim()

    if (!label) {
      return
    }

    const size = 124
    const maxX = Math.max(0, bounds.width - size)
    const maxY = Math.max(0, bounds.height - size)

    const createdAt = new Date().toISOString()
    const newActivity: Activity = {
      id: generateId(),
      label,
      imageUrl: defaultAbstractImage,
      createdAt,
      lastResetAt: createdAt,
      x: clamp(bounds.width / 2 - size / 2, 0, maxX),
      y: clamp(bounds.height / 2 - size / 2, 0, maxY),
      size,
    }

    setActivities((current) => [...current, newActivity])
    setNewActivityTitle('')
  }

  const handleImageChange = (id: string, imageDataUrl: string) => {
    setActivities((current) =>
      current.map((activity) => (activity.id === id ? { ...activity, imageUrl: imageDataUrl } : activity)),
    )
  }

  const handleImageLoadError = (id: string) => {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id && activity.imageUrl !== defaultAbstractImage
          ? { ...activity, imageUrl: defaultAbstractImage }
          : activity,
      ),
    )
  }

  return (
    <main className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bubble Canvas</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
            Drag activity bubbles, tap one to reset its timer, or upload a custom image.
          </p>
        </header>

        <div className="mb-4 flex w-full max-w-lg gap-2">
          <input
            type="text"
            value={newActivityTitle}
            onChange={(event) => setNewActivityTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleAddActivity()
              }
            }}
            placeholder="Add activity"
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddActivity}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Add
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60 shadow-inner"
        >
          {orderedActivities.map((activity) => (
            <ActivityBubble
              key={activity.id}
              id={activity.id}
              label={activity.label}
              imageUrl={activity.imageUrl}
              defaultImageUrl={defaultAbstractImage}
              createdAt={activity.createdAt}
              lastResetAt={activity.lastResetAt}
              x={activity.x}
              y={activity.y}
              size={activity.size}
              bounds={bounds}
              now={now}
              onMove={handleMove}
              onReset={handleReset}
              onImageChange={handleImageChange}
              onImageLoadError={handleImageLoadError}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
