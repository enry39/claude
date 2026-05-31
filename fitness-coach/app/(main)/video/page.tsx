'use client'

import { useState } from 'react'
import { useVideoLibrary } from '@/hooks/useVideoLibrary'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  Plus, Search, Play, Trash2, Eye, Clock, ExternalLink, Video, Tag,
} from 'lucide-react'
import { extractYouTubeId, formatDate } from '@/lib/utils'
import { VIDEO_CATEGORY_LABELS } from '@/lib/constants/muscleGroups'
import type { VideoCategory } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  esercizi: 'var(--primary)',
  nutrizione: 'var(--success)',
  integrazione: 'var(--accent)',
  tecnica: 'var(--secondary)',
  mindset: 'var(--danger)',
  altro: 'var(--text-muted)',
}

const ALL_CATEGORIES = ['all', ...Object.keys(VIDEO_CATEGORY_LABELS)] as const

function VideoCard({
  video,
  onWatch,
  onDelete,
}: {
  video: any
  onWatch: () => void
  onDelete: () => void
}) {
  const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`
  const catColor = CATEGORY_COLORS[video.category] ?? 'var(--text-muted)'

  return (
    <Card className="flex flex-col gap-0 overflow-hidden p-0 group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <img
          src={thumbUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onWatch}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
            style={{ background: 'var(--danger)' }}
          >
            <Play size={22} fill="white" className="text-white ml-1" />
          </button>
        </div>
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-medium rounded-full px-2 py-0.5"
            style={{ background: `color-mix(in srgb, ${catColor} 25%, rgba(0,0,0,0.7))`, color: catColor }}>
            {VIDEO_CATEGORY_LABELS[video.category] ?? video.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        <p className="text-sm font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text)' }}>
          {video.title}
        </p>
        {video.channelName && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{video.channelName}</p>
        )}

        {/* Tags */}
        {video.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((t: string) => (
              <span key={t} className="text-xs rounded-full px-2 py-0.5"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                #{t}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{video.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {video.watchedCount ?? 0}
            </span>
            {video.lastWatchedAt && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatDate(video.lastWatchedAt.split('T')[0])}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="default" onClick={onWatch}
              style={{ background: 'var(--danger)', fontSize: '11px', height: '28px', padding: '0 10px' }}>
              <Play size={11} /> Guarda
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}
              style={{ width: '28px', height: '28px' }}>
              <Trash2 size={12} style={{ color: 'var(--danger)' }} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function VideoPage() {
  const {
    videos, allVideos, search, setSearch, filterCategory, setFilterCategory,
    addVideo, deleteVideo, incrementWatchCount,
  } = useVideoLibrary()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    youtubeUrl: '',
    category: 'esercizi' as VideoCategory,
    channelName: '',
    tags: '',
    notes: '',
  })
  const [urlError, setUrlError] = useState('')

  function handleUrlChange(url: string) {
    setForm(f => ({ ...f, youtubeUrl: url }))
    if (url) {
      const id = extractYouTubeId(url)
      setUrlError(id ? '' : 'URL YouTube non valido')
    } else {
      setUrlError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const youtubeId = extractYouTubeId(form.youtubeUrl)
    if (!youtubeId) { setUrlError('URL non valido'); return }
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    await addVideo({
      title: form.title,
      youtubeId,
      category: form.category,
      channelName: form.channelName || undefined,
      tags,
      notes: form.notes || undefined,
    })
    setOpen(false)
    setForm({ title: '', youtubeUrl: '', category: 'esercizi', channelName: '', tags: '', notes: '' })
    setUrlError('')
  }

  function handleWatch(video: any) {
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')
    if (video.id !== undefined) incrementWatchCount(video.id)
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Video size={22} style={{ color: 'var(--danger)' }} />
            Biblioteca Video
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {allVideos.length} video salvati
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Aggiungi Video
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <Input
            placeholder="Cerca video..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {ALL_CATEGORIES.map(cat => {
          const isActive = filterCategory === cat
          const label = cat === 'all' ? 'Tutti' : VIDEO_CATEGORY_LABELS[cat] ?? cat
          const color = cat !== 'all' ? CATEGORY_COLORS[cat] : 'var(--primary)'
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as VideoCategory | 'all')}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: isActive ? `color-mix(in srgb, ${color} 20%, transparent)` : 'var(--surface-2)',
                color: isActive ? color : 'var(--text-muted)',
                border: `1px solid ${isActive ? color : 'var(--border)'}`,
              }}
            >
              {label}
              {cat === 'all' && allVideos.length > 0 && (
                <span className="ml-1.5" style={{ color: isActive ? color : 'var(--text-muted)' }}>
                  {allVideos.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Videos grid */}
      {videos.length === 0 ? (
        <EmptyState
          icon={<Video size={24} />}
          title="Nessun video trovato"
          description={search || filterCategory !== 'all' ? 'Prova con altri filtri' : 'Aggiungi il tuo primo video'}
          action={<Button onClick={() => setOpen(true)}><Plus size={14} /> Aggiungi</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <VideoCard
              key={v.id}
              video={v}
              onWatch={() => handleWatch(v)}
              onDelete={() => v.id !== undefined && deleteVideo(v.id)}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aggiungi Video</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>URL YouTube *</label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtubeUrl}
                onChange={e => handleUrlChange(e.target.value)}
                required
              />
              {urlError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{urlError}</p>}
              {!urlError && form.youtubeUrl && extractYouTubeId(form.youtubeUrl) && (
                <div className="rounded-lg overflow-hidden mt-1" style={{ background: 'var(--surface-2)' }}>
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(form.youtubeUrl)}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Titolo *</label>
              <Input
                placeholder="Titolo del video"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Categoria</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as VideoCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(VIDEO_CATEGORY_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Canale</label>
                <Input
                  placeholder="Nome canale"
                  value={form.channelName}
                  onChange={e => setForm(f => ({ ...f, channelName: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Tag (separati da virgola)</label>
              <Input
                placeholder="es. squat, tecnica, gambe"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Note (opzionale)</label>
              <Textarea
                placeholder="Perché l'hai salvato?"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
              <Button type="submit" disabled={!!urlError}>Salva</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
