'use client'

import { useState } from 'react'
import { useSavedPapers } from '@/hooks/useSavedPapers'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Search, BookOpen, ExternalLink, Bookmark, BookmarkCheck, Loader2,
  Star, Trash2, Tag, ChevronDown, ChevronUp,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PAPER_TAGS } from '@/lib/constants/muscleGroups'
import type { PaperSearchResult, SavedPaper } from '@/types'

const SOURCE_COLORS: Record<string, string> = {
  pubmed: 'var(--success)',
  arxiv: 'var(--primary)',
}

function StarRating({ rating, onChange }: { rating?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className={onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          style={{ color: i <= (rating ?? 0) ? 'var(--accent)' : 'var(--border)', fontSize: '15px', background: 'none', border: 'none', padding: 0 }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function SearchResultCard({
  paper,
  isSaved,
  onSave,
}: {
  paper: PaperSearchResult
  isSaved: boolean
  onSave: (paper: PaperSearchResult) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const srcColor = SOURCE_COLORS[paper.source] ?? 'var(--text-muted)'

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold rounded-full px-2 py-0.5"
              style={{ background: `color-mix(in srgb, ${srcColor} 15%, transparent)`, color: srcColor }}>
              {paper.source.toUpperCase()}
            </span>
            {paper.journal && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{paper.journal}</span>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {paper.publishedDate?.slice(0, 10)}
            </span>
          </div>
          <a href={paper.url} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold hover:underline leading-tight line-clamp-2"
            style={{ color: 'var(--text)' }}>
            {paper.title}
          </a>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ` +${paper.authors.length - 3}` : ''}
          </p>
        </div>
        <Button
          size="sm"
          variant={isSaved ? 'outline' : 'default'}
          onClick={() => !isSaved && onSave(paper)}
          disabled={isSaved}
          className="shrink-0"
        >
          {isSaved ? (
            <><BookmarkCheck size={13} /> Salvato</>
          ) : (
            <><Bookmark size={13} /> Salva</>
          )}
        </Button>
      </div>
      <div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {expanded ? paper.abstract : paper.abstract?.slice(0, 200) + (paper.abstract?.length > 200 ? '...' : '')}
        </p>
        {paper.abstract?.length > 200 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs mt-1 flex items-center gap-1 hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            {expanded ? <><ChevronUp size={12} /> Mostra meno</> : <><ChevronDown size={12} /> Leggi di più</>}
          </button>
        )}
      </div>
      <a href={paper.url} target="_blank" rel="noopener noreferrer"
        className="text-xs flex items-center gap-1 hover:underline w-fit"
        style={{ color: 'var(--primary)' }}>
        <ExternalLink size={11} /> Apri articolo
      </a>
    </Card>
  )
}

function SavedPaperCard({
  paper,
  onDelete,
  onUpdate,
}: {
  paper: SavedPaper
  onDelete: () => void
  onUpdate: (updates: Partial<Pick<SavedPaper, 'tags' | 'notes' | 'rating'>>) => void
}) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesVal, setNotesVal] = useState(paper.notes ?? '')
  const [expanded, setExpanded] = useState(false)
  const srcColor = SOURCE_COLORS[paper.source] ?? 'var(--text-muted)'

  function saveNotes() {
    onUpdate({ notes: notesVal })
    setEditingNotes(false)
  }

  function toggleTag(tag: string) {
    const newTags = paper.tags.includes(tag)
      ? paper.tags.filter(t => t !== tag)
      : [...paper.tags, tag]
    onUpdate({ tags: newTags })
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold rounded-full px-2 py-0.5"
              style={{ background: `color-mix(in srgb, ${srcColor} 15%, transparent)`, color: srcColor }}>
              {paper.source.toUpperCase()}
            </span>
            {paper.journal && (
              <span className="text-xs truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{paper.journal}</span>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {paper.publishedDate?.slice(0, 10)}
            </span>
          </div>
          <a href={paper.url} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold hover:underline leading-snug"
            style={{ color: 'var(--text)' }}>
            {paper.title}
          </a>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ` +${paper.authors.length - 3}` : ''}
          </p>
        </div>
        <Button size="icon" variant="ghost" onClick={onDelete}>
          <Trash2 size={13} style={{ color: 'var(--danger)' }} />
        </Button>
      </div>

      {/* Abstract */}
      {paper.abstract && (
        <div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {expanded ? paper.abstract : paper.abstract.slice(0, 180) + (paper.abstract.length > 180 ? '...' : '')}
          </p>
          {paper.abstract.length > 180 && (
            <button onClick={() => setExpanded(v => !v)}
              className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--primary)' }}>
              {expanded ? <><ChevronUp size={11} /> Meno</> : <><ChevronDown size={11} /> Più</>}
            </button>
          )}
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center gap-3">
        <StarRating rating={paper.rating} onChange={v => onUpdate({ rating: v })} />
        <a href={paper.url} target="_blank" rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 hover:underline ml-auto"
          style={{ color: 'var(--primary)' }}>
          <ExternalLink size={11} /> Articolo
        </a>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {PAPER_TAGS.slice(0, 8).map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className="text-xs rounded-full px-2 py-0.5 transition-colors"
            style={{
              background: paper.tags.includes(tag)
                ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
                : 'var(--surface-2)',
              color: paper.tags.includes(tag) ? 'var(--primary)' : 'var(--text-muted)',
              border: `1px solid ${paper.tags.includes(tag) ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Notes */}
      <div className="border-t pt-2" style={{ borderColor: 'var(--border)' }}>
        {editingNotes ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
              rows={3}
              placeholder="Le tue note sul paper..."
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveNotes}>Salva</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingNotes(false); setNotesVal(paper.notes ?? '') }}>
                Annulla
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            className="text-xs w-full text-left hover:opacity-80 transition-opacity"
            style={{ color: paper.notes ? 'var(--text-muted)' : 'var(--primary)' }}
          >
            {paper.notes ? paper.notes : '+ Aggiungi note'}
          </button>
        )}
      </div>

      <p className="text-xs" style={{ color: 'var(--border)' }}>
        Salvato il {formatDate(paper.savedAt.split('T')[0])}
      </p>
    </Card>
  )
}

export default function PaperPage() {
  const {
    papers, search, setSearch, filterTag, setFilterTag, allTags,
    searchResults, searching, searchSource, setSearchSource,
    searchPapers, savePaper, updatePaper, deletePaper, isPaperSaved,
  } = useSavedPapers()

  const [queryInput, setQueryInput] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    await searchPapers(queryInput)
  }

  function handleSave(paper: PaperSearchResult) {
    savePaper(paper, [], '')
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <BookOpen size={22} style={{ color: 'var(--primary)' }} />
          Paper Accademici
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Ricerca e salva studi scientifici da PubMed e arXiv
        </p>
      </div>

      <Tabs defaultValue="cerca">
        <TabsList>
          <TabsTrigger value="cerca">
            <Search size={14} /> Cerca
          </TabsTrigger>
          <TabsTrigger value="salvati">
            <BookmarkCheck size={14} /> Salvati ({papers.length})
          </TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="cerca" className="mt-4 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="es. muscle hypertrophy protein intake..."
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* Source toggle */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              {(['pubmed', 'arxiv', 'both'] as const).map(src => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSearchSource(src)}
                  className="px-3 py-2 text-xs font-medium transition-colors"
                  style={{
                    background: searchSource === src ? 'var(--primary)' : 'var(--surface-2)',
                    color: searchSource === src ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {src === 'both' ? 'Entrambi' : src.charAt(0).toUpperCase() + src.slice(1)}
                </button>
              ))}
            </div>
            <Button type="submit" disabled={searching || !queryInput.trim()}>
              {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {searching ? 'Cercando...' : 'Cerca'}
            </Button>
          </form>

          {searching && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Ricerca in corso...</p>
            </div>
          )}

          {!searching && searchResults.length === 0 && queryInput && (
            <EmptyState icon="🔬" title="Nessun risultato" description="Prova con termini diversi in inglese" />
          )}

          {!searching && searchResults.length === 0 && !queryInput && (
            <div className="flex flex-col items-center gap-3 py-12">
              <BookOpen size={32} style={{ color: 'var(--text-muted)' }} />
              <div className="text-center">
                <p className="font-medium" style={{ color: 'var(--text)' }}>Cerca studi scientifici</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Usa termini in inglese per migliori risultati
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {['hypertrophy training', 'protein synthesis', 'sleep recovery', 'creatine strength'].map(q => (
                  <button
                    key={q}
                    onClick={() => setQueryInput(q)}
                    className="text-xs rounded-full px-3 py-1.5 transition-colors"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {searchResults.length} risultati trovati
              </p>
              {searchResults.map(r => (
                <SearchResultCard
                  key={`${r.source}-${r.externalId}`}
                  paper={r}
                  isSaved={isPaperSaved(r.externalId)}
                  onSave={handleSave}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* SAVED TAB */}
        <TabsContent value="salvati" className="mt-4 flex flex-col gap-4">
          {/* Local search + tag filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Cerca nei salvati..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tag cloud */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterTag('all')}
                className="text-xs rounded-full px-2.5 py-1 transition-colors"
                style={{
                  background: filterTag === 'all' ? 'var(--primary)' : 'var(--surface-2)',
                  color: filterTag === 'all' ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${filterTag === 'all' ? 'var(--primary)' : 'var(--border)'}`,
                }}
              >
                Tutti
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag === filterTag ? 'all' : tag)}
                  className="text-xs rounded-full px-2.5 py-1 transition-colors"
                  style={{
                    background: filterTag === tag ? 'color-mix(in srgb, var(--primary) 20%, transparent)' : 'var(--surface-2)',
                    color: filterTag === tag ? 'var(--primary)' : 'var(--text-muted)',
                    border: `1px solid ${filterTag === tag ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {papers.length === 0 ? (
            <EmptyState
              icon="📚"
              title="Nessun paper salvato"
              description="Cerca e salva studi dalla scheda Cerca"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {papers.map(p => (
                <SavedPaperCard
                  key={p.id}
                  paper={p}
                  onDelete={() => p.id !== undefined && deletePaper(p.id)}
                  onUpdate={updates => p.id !== undefined && updatePaper(p.id, updates)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
