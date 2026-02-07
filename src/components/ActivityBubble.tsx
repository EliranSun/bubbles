import { useEffect, useRef, useState } from 'react'
import type { PointerEventHandler } from 'react'
import { getElapsedText } from '../utils/timeAgo'

type BubbleBounds = {
  width: number
  height: number
}

type ActivityBubbleProps = {
  id: string
  label: string
  imageUrl: string
  createdAt: string
  lastResetAt?: string
  x: number
  y: number
  size?: number
  bounds: BubbleBounds
  now: number
  onMove: (id: string, nextX: number, nextY: number) => void
  onReset: (id: string) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function ActivityBubble({
  id,
  label,
  imageUrl,
  createdAt,
  lastResetAt,
  x,
  y,
  size = 120,
  bounds,
  now,
  onMove,
  onReset,
}: ActivityBubbleProps) {
  const pointerIdRef = useRef<number | null>(null)
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, startX: 0, startY: 0 })
  const movedRef = useRef(false)
  const mountedRef = useRef(false)
  const [isResetAnimating, setIsResetAnimating] = useState(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }

    setIsResetAnimating(true)
    const timer = window.setTimeout(() => setIsResetAnimating(false), 420)
    return () => window.clearTimeout(timer)
  }, [lastResetAt])

  const elapsedText = getElapsedText(lastResetAt ?? createdAt, now)

  const maxX = Math.max(0, bounds.width - size)
  const maxY = Math.max(0, bounds.height - size)

  const handlePointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    pointerIdRef.current = event.pointerId
    movedRef.current = false
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: x,
      startY: y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - dragStartRef.current.pointerX
    const deltaY = event.clientY - dragStartRef.current.pointerY

    if (!movedRef.current && Math.hypot(deltaX, deltaY) > 4) {
      movedRef.current = true
    }

    const nextX = clamp(dragStartRef.current.startX + deltaX, 0, maxX)
    const nextY = clamp(dragStartRef.current.startY + deltaY, 0, maxY)
    onMove(id, nextX, nextY)
  }

  const handlePointerEnd: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return
    }

    pointerIdRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)

    if (!movedRef.current) {
      onReset(id)
    }
  }

  return (
    <button
      type="button"
      className={`absolute touch-none select-none rounded-full text-white shadow-xl transition-transform duration-300 ${
        isResetAnimating ? 'animate-bubble-reset' : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      aria-label={`${label}, ${elapsedText}`}
      style={{
        width: size,
        height: size,
        transform: `translate(${x}px, ${y}px)`,
        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.2) 60%, rgba(0,0,0,0.15)), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <span className="absolute inset-x-2 bottom-2 text-center">
        <span className="block truncate text-sm font-semibold leading-tight">{label}</span>
        <span className="block text-xs text-neutral-200">{elapsedText}</span>
      </span>
    </button>
  )
}
