'use client'
import { usePersonalRecords } from '@/hooks/usePersonalRecords'
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Trophy, TrendingUp } from 'lucide-react'
import { formatDate, formatKg } from '@/lib/utils'

export default function RecordPage() {
  const { records, recentPRs } = usePersonalRecords()
  const { exercises } = useExerciseLibrary()

  function getExerciseName(exerciseId: number): string {
    return exercises.find(e => e.id === exerciseId)?.name ?? `Esercizio #${exerciseId}`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy size={24} style={{ color: 'var(--accent)' }} />
          Personal Record
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
          {records.length} record totali
        </p>
      </div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Ultimi Record</h2>
          <div className="space-y-2">
            {recentPRs.map(pr => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: 'rgba(245,158,11,0.15)' }}
                  >
                    🏆
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getExerciseName(pr.exerciseId)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(pr.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
                    {formatKg(pr.value)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>1RM stimato</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Records */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Tutti i Record</h2>
        {records.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="Nessun record ancora"
            description="Completa un allenamento per stabilire i tuoi primi personal record"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {records.map(pr => (
              <Card key={pr.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-sm leading-tight">
                      {getExerciseName(pr.exerciseId)}
                    </p>
                    <Badge variant="warning" className="text-xs shrink-0 ml-2">PR</Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                        {formatKg(pr.value)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {pr.type === '1rm' ? '1RM stimato' : 'Volume'}
                      </p>
                    </div>
                    {pr.previousValue && pr.previousValue > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
                          <TrendingUp size={12} />
                          <span className="text-xs font-medium">
                            +{formatKg(pr.value - pr.previousValue)}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                          prev: {formatKg(pr.previousValue)}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
                    {formatDate(pr.date)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
