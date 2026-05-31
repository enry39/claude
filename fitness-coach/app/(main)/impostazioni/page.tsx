'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Settings, User, Target, Download, Info, CheckCircle2, Calculator } from 'lucide-react'
import { GOAL_LABELS, ACTIVITY_LABELS } from '@/lib/constants/muscleGroups'
import { today } from '@/lib/utils'
import type { UserProfile, MacroTargets } from '@/types'

// Harris-Benedict TDEE estimate
function estimateTDEE(profile: UserProfile): number {
  // Mifflin-St Jeor
  const bmr = 10 * (profile.targetWeightKg ?? 80)
    + 6.25 * (profile.heightCm ?? 178)
    - 5 * (profile.age ?? 25)
    + 5 // male
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  return Math.round(bmr * (multipliers[profile.activityLevel] ?? 1.55))
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b mb-5" style={{ borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
    </div>
  )
}

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
      {hint && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

export default function ImpostazioniPage() {
  const { profile, macroTargets, saveProfile, saveMacroTargets, isLoading } = useSettings()

  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({})
  const [macroForm, setMacroForm] = useState<Partial<MacroTargets>>({})
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        age: profile.age,
        heightCm: profile.heightCm,
        targetWeightKg: profile.targetWeightKg,
        goal: profile.goal,
        activityLevel: profile.activityLevel,
      })
    }
  }, [profile?.updatedAt])

  useEffect(() => {
    if (macroTargets) {
      setMacroForm({
        calories: macroTargets.calories,
        proteinG: macroTargets.proteinG,
        carbsG: macroTargets.carbsG,
        fatG: macroTargets.fatG,
        fiberG: macroTargets.fiberG,
      })
    }
  }, [macroTargets?.updatedAt])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    await saveProfile(profileForm)
    flashSaved('profile')
  }

  async function handleSaveMacros(e: React.FormEvent) {
    e.preventDefault()
    await saveMacroTargets(macroForm)
    flashSaved('macros')
  }

  function flashSaved(key: string) {
    setSaved(key)
    setTimeout(() => setSaved(null), 2500)
  }

  function handleExport() {
    const data = {
      profile,
      macroTargets,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitness-data-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tdee = estimateTDEE(profile)

  const macroCalCheck = Math.round(
    (macroForm.proteinG ?? 0) * 4 +
    (macroForm.carbsG ?? 0) * 4 +
    (macroForm.fatG ?? 0) * 9
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Settings size={22} style={{ color: 'var(--primary)' }} />
          Impostazioni
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Configura il tuo profilo e gli obiettivi</p>
      </div>

      {/* Profile section */}
      <Card>
        <SectionHeader icon={<User size={16} />} title="Profilo" description="Le tue informazioni personali" />
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nome">
              <Input
                value={profileForm.name ?? ''}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Il tuo nome"
              />
            </FormField>
            <FormField label="Età (anni)">
              <Input
                type="number" min="14" max="100"
                value={profileForm.age ?? ''}
                onChange={e => setProfileForm(f => ({ ...f, age: parseInt(e.target.value) || 0 }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Altezza (cm)">
              <Input
                type="number" min="100" max="250"
                value={profileForm.heightCm ?? ''}
                onChange={e => setProfileForm(f => ({ ...f, heightCm: parseFloat(e.target.value) || 0 }))}
              />
            </FormField>
            <FormField label="Peso Obiettivo (kg)">
              <Input
                type="number" min="30" max="250" step="0.1"
                value={profileForm.targetWeightKg ?? ''}
                onChange={e => setProfileForm(f => ({ ...f, targetWeightKg: parseFloat(e.target.value) || 0 }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Obiettivo">
              <Select value={profileForm.goal ?? 'bulk'} onValueChange={v => setProfileForm(f => ({ ...f, goal: v as UserProfile['goal'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(GOAL_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Livello di attività">
              <Select value={profileForm.activityLevel ?? 'active'} onValueChange={v => setProfileForm(f => ({ ...f, activityLevel: v as UserProfile['activityLevel'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTIVITY_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'color-mix(in srgb, var(--secondary) 10%, transparent)' }}>
              <Calculator size={14} style={{ color: 'var(--secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--secondary)' }}>
                TDEE stimato: <strong>{tdee.toLocaleString('it-IT')} kcal</strong>
              </span>
            </div>
            <Button type="submit">
              {saved === 'profile' ? <><CheckCircle2 size={14} /> Salvato!</> : 'Salva Profilo'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Macro targets section */}
      <Card>
        <SectionHeader
          icon={<Target size={16} />}
          title="Obiettivi Macro"
          description="Calorie e macronutrienti giornalieri"
        />

        {/* TDEE reference */}
        <div className="rounded-lg p-3 mb-4 flex items-start gap-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <Calculator size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--secondary)' }} />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              TDEE stimato: {tdee.toLocaleString('it-IT')} kcal
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {profile.goal === 'bulk' && `Bulk: suggerito ${tdee + 300}–${tdee + 500} kcal`}
              {profile.goal === 'cut' && `Cut: suggerito ${tdee - 500}–${tdee - 300} kcal`}
              {profile.goal === 'maintain' && `Mantenimento: circa ${tdee} kcal`}
              {profile.goal === 'recomp' && `Recomp: circa ${tdee} kcal con proteine alte`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveMacros} className="flex flex-col gap-4">
          <FormField
            label="Calorie (kcal)"
            hint={`Calorie da macro: ${macroCalCheck} kcal${macroCalCheck ? ` (differenza: ${macroCalCheck - (macroForm.calories ?? 0)} kcal)` : ''}`}
          >
            <Input
              type="number" min="800" max="10000"
              value={macroForm.calories ?? ''}
              onChange={e => setMacroForm(f => ({ ...f, calories: parseInt(e.target.value) || 0 }))}
            />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Proteine (g)" hint={`${Math.round((macroForm.proteinG ?? 0) * 4)} kcal`}>
              <Input
                type="number" min="0" max="500"
                value={macroForm.proteinG ?? ''}
                onChange={e => setMacroForm(f => ({ ...f, proteinG: parseInt(e.target.value) || 0 }))}
              />
            </FormField>
            <FormField label="Carboidrati (g)" hint={`${Math.round((macroForm.carbsG ?? 0) * 4)} kcal`}>
              <Input
                type="number" min="0" max="800"
                value={macroForm.carbsG ?? ''}
                onChange={e => setMacroForm(f => ({ ...f, carbsG: parseInt(e.target.value) || 0 }))}
              />
            </FormField>
            <FormField label="Grassi (g)" hint={`${Math.round((macroForm.fatG ?? 0) * 9)} kcal`}>
              <Input
                type="number" min="0" max="300"
                value={macroForm.fatG ?? ''}
                onChange={e => setMacroForm(f => ({ ...f, fatG: parseInt(e.target.value) || 0 }))}
              />
            </FormField>
          </div>
          <FormField label="Fibre (g)">
            <Input
              type="number" min="0" max="100"
              value={macroForm.fiberG ?? ''}
              onChange={e => setMacroForm(f => ({ ...f, fiberG: parseInt(e.target.value) || 0 }))}
            />
          </FormField>

          {/* Macro donut preview */}
          <div className="rounded-lg p-3 flex items-center gap-4"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex gap-4 text-xs flex-wrap">
              {[
                { label: 'P', g: macroForm.proteinG ?? 0, color: 'var(--primary)', cal: (macroForm.proteinG ?? 0) * 4 },
                { label: 'C', g: macroForm.carbsG ?? 0, color: 'var(--secondary)', cal: (macroForm.carbsG ?? 0) * 4 },
                { label: 'F', g: macroForm.fatG ?? 0, color: 'var(--accent)', cal: (macroForm.fatG ?? 0) * 9 },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                  <span style={{ color: 'var(--text-muted)' }}>{m.label}:</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{m.g}g</span>
                  <span style={{ color: 'var(--text-muted)' }}>({m.cal} kcal)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {saved === 'macros' ? <><CheckCircle2 size={14} /> Salvato!</> : 'Salva Obiettivi'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Export */}
      <Card>
        <SectionHeader icon={<Download size={16} />} title="Esportazione Dati" description="Scarica tutti i tuoi dati" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm" style={{ color: 'var(--text)' }}>Esporta tutti i dati come JSON</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Include profilo, obiettivi macro e impostazioni
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download size={14} /> Esporta JSON
          </Button>
        </div>
      </Card>

      {/* Info */}
      <Card>
        <SectionHeader icon={<Info size={16} />} title="Info App" />
        <div className="flex flex-col gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex justify-between">
            <span>Versione</span>
            <span className="font-mono" style={{ color: 'var(--text)' }}>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span style={{ color: 'var(--text)' }}>IndexedDB (locale)</span>
          </div>
          <div className="flex justify-between">
            <span>Ultimo aggiornamento profilo</span>
            <span style={{ color: 'var(--text)' }}>{profile.updatedAt}</span>
          </div>
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs">
              Tutti i dati sono salvati localmente nel browser. Nessun dato viene inviato a server esterni.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
