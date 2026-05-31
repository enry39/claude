'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import type { SavedPaper, PaperSearchResult } from '@/types'
import { useState, useCallback } from 'react'

export function useSavedPapers() {
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<string | 'all'>('all')
  const [searchResults, setSearchResults] = useState<PaperSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchSource, setSearchSource] = useState<'pubmed' | 'arxiv' | 'both'>('both')

  const papers = useLiveQuery(
    () => getDB().savedPapers.orderBy('savedAt').reverse().toArray(),
    []
  ) ?? []

  const filteredPapers = papers.filter(p => {
    const matchesSearch = search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.join(' ').toLowerCase().includes(search.toLowerCase()) ||
      (p.notes ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesTag = filterTag === 'all' || p.tags.includes(filterTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(papers.flatMap(p => p.tags))).sort()

  async function searchPapers(query: string) {
    if (!query.trim()) return
    setSearching(true)
    setSearchResults([])
    try {
      const fetches: Promise<Response>[] = []
      if (searchSource === 'pubmed' || searchSource === 'both') {
        fetches.push(fetch(`/api/pubmed?q=${encodeURIComponent(query)}&max=15`))
      }
      if (searchSource === 'arxiv' || searchSource === 'both') {
        fetches.push(fetch(`/api/arxiv?q=${encodeURIComponent(query)}&max=10`))
      }

      const responses = await Promise.allSettled(fetches)
      const results: PaperSearchResult[] = []
      for (const r of responses) {
        if (r.status === 'fulfilled') {
          const data = await r.value.json()
          if (data.results) results.push(...data.results)
        }
      }
      setSearchResults(results)
    } finally {
      setSearching(false)
    }
  }

  async function savePaper(paper: PaperSearchResult, tags: string[] = [], notes?: string) {
    const existing = await getDB().savedPapers
      .where('externalId').equals(paper.externalId).first()
    if (existing) return

    const now = new Date().toISOString()
    await getDB().savedPapers.add({
      ...paper,
      tags,
      notes,
      savedAt: now,
      updatedAt: now,
    })
  }

  async function updatePaper(id: number, updates: Partial<Pick<SavedPaper, 'tags' | 'notes' | 'rating'>>) {
    await getDB().savedPapers.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  }

  async function deletePaper(id: number) {
    await getDB().savedPapers.delete(id)
  }

  function isPaperSaved(externalId: string) {
    return papers.some(p => p.externalId === externalId)
  }

  return {
    papers: filteredPapers,
    allPapers: papers,
    search, setSearch,
    filterTag, setFilterTag,
    allTags,
    searchResults, setSearchResults,
    searching,
    searchSource, setSearchSource,
    searchPapers,
    savePaper,
    updatePaper,
    deletePaper,
    isPaperSaved,
    isLoading: papers === undefined,
  }
}
