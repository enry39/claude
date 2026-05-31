'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import type { VideoEntry, VideoCategory } from '@/types'
import { useState } from 'react'

export function useVideoLibrary() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<VideoCategory | 'all'>('all')

  const allVideos = useLiveQuery(
    () => getDB().videoEntries.orderBy('createdAt').reverse().toArray(),
    []
  ) ?? []

  const videos = allVideos.filter(v => {
    const matchesSearch = search === '' || v.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'all' || v.category === filterCategory
    return matchesSearch && matchesCategory
  })

  async function addVideo(data: Omit<VideoEntry, 'id' | 'watchedCount' | 'createdAt'>) {
    await getDB().videoEntries.add({
      ...data,
      watchedCount: 0,
      createdAt: new Date().toISOString(),
    })
  }

  async function deleteVideo(id: number) {
    await getDB().videoEntries.delete(id)
  }

  async function incrementWatchCount(id: number) {
    const v = await getDB().videoEntries.get(id)
    if (v) {
      await getDB().videoEntries.update(id, {
        watchedCount: (v.watchedCount || 0) + 1,
        lastWatchedAt: new Date().toISOString(),
      })
    }
  }

  async function updateNotes(id: number, notes: string) {
    await getDB().videoEntries.update(id, { notes })
  }

  return {
    videos,
    allVideos,
    search, setSearch,
    filterCategory, setFilterCategory,
    addVideo, deleteVideo, incrementWatchCount, updateNotes,
    isLoading: allVideos === undefined,
  }
}
