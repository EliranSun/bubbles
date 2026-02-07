import { useEffect, useRef, useState } from 'react'
import type { ChangeEventHandler, PointerEventHandler } from 'react'
import { getElapsedText } from '../utils/timeAgo'

type BubbleBounds = {
  width: number
  height: number
}

type ActivityBubbleProps = {
  id: string
  label: string
  imageUrl: string
  defaultImageUrl: string
  createdAt: string
  lastResetAt?: string
  x: number
  y: number
  size?: number
  bounds: BubbleBounds
  now: number
  onMove: (id: string, nextX: number, nextY: number) => void
  onReset: (id: string) => void
  onImageChange: (id: string, imageDataUrl: string) => void
  onImageLoadError: (id: string) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function ActivityBubble({
  id,
  label,
  imageUrl,
  defaultImageUrl,
  createdAt,
  lastResetAt,
  x,
  y,
  size = 120,
  bounds,
  now,
  onMove,
  onReset,
  onImageChange,
  onImageLoadError,
}: ActivityBubbleProps) {
  const pointerIdRef = useRef<number | null>(null)
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, startX: 0, startY: 0 })
  const movedRef = useRef(false)
  const mountedRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isResetAnimating, setIsResetAnimating] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [imageUrl])

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

  const resolvedImageUrl = hasImageError ? defaultImageUrl : imageUrl

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

  const handleImageChangeClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return
      }

      onImageChange(id, reader.result)
    }

    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleImageError = () => {
    if (hasImageError) {
      return
    }

    setHasImageError(true)
    onImageLoadError(id)
  }

  return (
    <div
      className={`absolute touch-none select-none overflow-hidden rounded-full text-white shadow-xl transition-transform duration-300 ${
        isResetAnimating ? 'animate-bubble-reset' : ''
      }`}
      style={{
        width: size,
        height: size,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <button
        type="button"
        className="absolute inset-0 z-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        aria-label={`${label}, ${elapsedText}`}
      >
        <img
          src={resolvedImageUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={handleImageError}
          draggable={false}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/15" />
        <span className="absolute inset-x-2 bottom-2 text-center">
          <span className="block truncate text-sm font-semibold leading-tight">{label}</span>
          <span className="block text-xs text-neutral-200">{elapsedText}</span>
        </span>
      </button>

      <button
        type="button"
        className="absolute right-2 top-2 z-20 rounded-full bg-black/55 p-1.5 text-xs leading-none text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white/70"
        onClick={handleImageChangeClick}
        aria-label={`Change image for ${label}`}
      >
        🖼️
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  )
}
