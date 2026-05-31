'use client'
import { useState } from 'react'
import { useFoodLog } from '@/hooks/useFoodLog'
import { useMacroTargets } from '@/hooks/useSettings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Trash2, Search } from 'lucide-react'
import { MEAL_LABELS } from '@/lib/constants/muscleGroups'
import { today, toISODate, clampPercent, formatMacro } from '@/lib/utils'
import type { MealType, FoodItem } from '@/types'

const MEALS: MealType[] = ['colazione', 'pranzo', 'cena', 'spuntino_mattina', 'spuntino_pomeriggio', 'post_workout']

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = clampPercent(value, max)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="font-medium">{formatMacro(value)} / {formatMacro(max)}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function AddFoodModal({ open, onClose, onAdd, date }: {
  open: boolean
  onClose: () => void
  onAdd: (meal: MealType, foodItemId: number, foodItemName: string, amountG: number) => void
  date: string
}) {
  const { foodItems } = useFoodLog(date)
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [meal, setMeal] = useState<MealType>('pranzo')
  const [amount, setAmount] = useState('100')

  const filteredFoods = searchTerm
    ? foodItems.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : foodItems.slice(0, 30)

  const previewMacros = selected && parseFloat(amount) > 0
    ? {
        calories: (selected.caloriesPer100g * parseFloat(amount)) / 100,
        protein: (selected.proteinPer100g * parseFloat(amount)) / 100,
        carbs: (selected.carbsPer100g * parseFloat(amount)) / 100,
        fat: (selected.fatPer100g * parseFloat(amount)) / 100,
      }
    : null

  function handleAdd() {
    if (!selected || !parseFloat(amount)) return
    onAdd(meal, selected.id!, selected.name, parseFloat(amount))
    setSelected(null)
    setSearchTerm('')
    setAmount('100')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Aggiungi Alimento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col mt-2">
          <Select value={meal} onValueChange={v => setMeal(v as MealType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MEALS.map(m => <SelectItem key={m} value={m}>{MEAL_LABELS[m]}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cerca alimento..." className="pl-8" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {filteredFoods.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Nessun alimento trovato.
              </p>
            ) : (
              filteredFoods.map(food => (
                <button
                  key={food.id}
                  className="w-full text-left p-3 rounded-lg transition-colors"
                  style={{
                    background: selected?.id === food.id ? 'var(--primary-muted)' : 'var(--surface-2)',
                    border: `1px solid ${selected?.id === food.id ? 'var(--primary)' : 'transparent'}`,
                  }}
                  onClick={() => setSelected(food)}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{food.name}</p>
                    <span className="text-xs ml-2 shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {Math.round(food.caloriesPer100g)} kcal/100g
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    P:{Math.round(food.proteinPer100g)}g · C:{Math.round(food.carbsPer100g)}g · G:{Math.round(food.fatPer100g)}g
                  </p>
                </button>
              ))
            )}
          </div>
          {selected && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <label className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>Quantità (g):</label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-24" style={{ height: '32px' }} />
              </div>
              {previewMacros && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Kcal', v: Math.round(previewMacros.calories) },
                    { label: 'Prot', v: `${Math.round(previewMacros.protein)}g` },
                    { label: 'Carb', v: `${Math.round(previewMacros.carbs)}g` },
                    { label: 'Gras', v: `${Math.round(previewMacros.fat)}g` },
                  ].map(item => (
                    <div key={item.label} className="p-2 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                      <p className="text-xs font-bold">{item.v}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">Annulla</Button>
            <Button onClick={handleAdd} disabled={!selected} className="flex-1">Aggiungi</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function NutritionPage() {
  const [currentDate, setCurrentDate] = useState(today())
  const [showAdd, setShowAdd] = useState(false)
  const { entries, totalMacros, addEntry, deleteEntry } = useFoodLog(currentDate)
  const { targets } = useMacroTargets()

  function prevDay() {
    const d = new Date(currentDate + 'T12:00')
    d.setDate(d.getDate() - 1)
    setCurrentDate(toISODate(d))
  }
  function nextDay() {
    const d = new Date(currentDate + 'T12:00')
    d.setDate(d.getDate() + 1)
    setCurrentDate(toISODate(d))
  }

  const isToday = currentDate === today()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nutrizione</h1>
        <Button onClick={() => setShowAdd(true)}><Plus size={16} className="mr-2" />Aggiungi</Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={prevDay}><ChevronLeft size={18} /></Button>
        <div className="text-center">
          <p className="font-semibold">
            {new Date(currentDate + 'T12:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {isToday && <Badge variant="default" className="text-xs mt-0.5">Oggi</Badge>}
        </div>
        <Button variant="ghost" size="icon" onClick={nextDay} disabled={isToday}><ChevronRight size={18} /></Button>
      </div>

      {/* Macro Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Macronutrienti</CardTitle>
            <span
              className="text-lg font-bold"
              style={{ color: totalMacros.calories >= targets.calories ? 'var(--success)' : 'var(--text)' }}
            >
              {Math.round(totalMacros.calories)} / {targets.calories} kcal
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <MacroBar label="Proteine" value={totalMacros.proteinG} max={targets.proteinG} color="var(--primary)" />
          <MacroBar label="Carboidrati" value={totalMacros.carbsG} max={targets.carbsG} color="var(--secondary)" />
          <MacroBar label="Grassi" value={totalMacros.fatG} max={targets.fatG} color="var(--accent)" />
          <MacroBar label="Fibre" value={totalMacros.fiberG} max={targets.fiberG} color="var(--success)" />
        </CardContent>
      </Card>

      {/* Meal Sections */}
      {MEALS.map(meal => {
        const mealEntries = entries.filter(e => e.meal === meal)
        const mealCals = mealEntries.reduce((s, e) => s + e.calories, 0)
        return (
          <Card key={meal}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{MEAL_LABELS[meal]}</CardTitle>
                <div className="flex items-center gap-2">
                  {mealCals > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(mealCals)} kcal</span>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowAdd(true)}>
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {mealEntries.length === 0 ? (
                <p className="text-xs py-2" style={{ color: 'var(--text-dim)' }}>Nessun alimento</p>
              ) : (
                <div className="space-y-1">
                  {mealEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg group hover:bg-[var(--surface-2)]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.foodItemName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {entry.amountG}g · {Math.round(entry.calories)} kcal · P:{Math.round(entry.proteinG)}g C:{Math.round(entry.carbsG)}g G:{Math.round(entry.fatG)}g
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => deleteEntry(entry.id!)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <AddFoodModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        date={currentDate}
        onAdd={(meal, foodItemId, foodItemName, amountG) => addEntry({ meal, foodItemId, foodItemName, amountG })}
      />
    </div>
  )
}
