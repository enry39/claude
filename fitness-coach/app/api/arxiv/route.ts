import { NextRequest } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

const BASE = 'https://export.arxiv.org/api/query'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query) return Response.json({ error: 'Missing query' }, { status: 400 })

  const maxResults = req.nextUrl.searchParams.get('max') ?? '15'

  try {
    const searchQuery = `ti:${encodeURIComponent(query)}+OR+abs:${encodeURIComponent(query)}`
    const res = await fetch(
      `${BASE}?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`,
      { next: { revalidate: 300 } }
    )
    const xml = await res.text()

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
    const feed = parser.parse(xml)
    const entries = feed?.feed?.entry
    if (!entries) return Response.json({ results: [] })

    const arr = Array.isArray(entries) ? entries : [entries]
    const results = arr.map((entry: Record<string, unknown>) => {
      const authors = entry.author
        ? (Array.isArray(entry.author) ? entry.author : [entry.author])
            .slice(0, 5)
            .map((a: Record<string, unknown>) => String(a.name ?? ''))
        : []

      const id = String(entry.id ?? '')
      const arxivId = id.split('/abs/').pop() ?? id

      return {
        source: 'arxiv',
        externalId: arxivId,
        title: String(entry.title ?? '').replace(/\s+/g, ' ').trim(),
        authors,
        abstract: String(entry.summary ?? '').replace(/\s+/g, ' ').trim(),
        publishedDate: String(entry.published ?? '').split('T')[0],
        journal: 'arXiv',
        url: id,
      }
    })

    return Response.json({ results })
  } catch (err) {
    console.error('[arXiv API]', err)
    return Response.json({ error: 'arXiv API error' }, { status: 502 })
  }
}
