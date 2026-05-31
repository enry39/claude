import { NextRequest } from 'next/server'

const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const API_KEY = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : ''

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query) return Response.json({ error: 'Missing query' }, { status: 400 })

  const maxResults = req.nextUrl.searchParams.get('max') ?? '20'

  try {
    // Step 1: search for PMIDs
    const searchRes = await fetch(
      `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance${API_KEY}`,
      { next: { revalidate: 300 } }
    )
    const searchData = await searchRes.json()
    const ids: string[] = searchData.esearchresult?.idlist ?? []
    if (ids.length === 0) return Response.json({ results: [] })

    // Step 2: fetch summaries
    const summaryRes = await fetch(
      `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json${API_KEY}`,
      { next: { revalidate: 300 } }
    )
    const summaryData = await summaryRes.json()
    const uids = summaryData.result?.uids ?? []

    const results = uids.map((uid: string) => {
      const item = summaryData.result[uid]
      return {
        source: 'pubmed',
        externalId: uid,
        title: item.title ?? '',
        authors: (item.authors ?? []).slice(0, 5).map((a: { name: string }) => a.name),
        abstract: item.fulljournalname ?? '',
        publishedDate: item.pubdate ?? '',
        journal: item.fulljournalname ?? '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
      }
    })

    return Response.json({ results })
  } catch (err) {
    console.error('[PubMed API]', err)
    return Response.json({ error: 'PubMed API error' }, { status: 502 })
  }
}
