'use client'

import { Category, Difficulty, TargetRole } from '@prisma/client'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type Question = {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  category: Category
  targetRole: TargetRole
  tags: string[]
  hints: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type Props = { questions: Question[] }

const difficultyColor: Record<Difficulty, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

export function AdminQuestionsClient({ questions: initial }: Props) {
  const [questions, setQuestions] = useState(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM' as Difficulty,
    category: 'FRONTEND' as Category,
    targetRole: 'GENERAL' as TargetRole,
    tags: '',
    hints: '',
  })

  const openCreate = () => {
    setEditingId(null)
    setForm({
      title: '', description: '', difficulty: 'MEDIUM',
      category: 'FRONTEND', targetRole: 'GENERAL', tags: '', hints: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (q: Question) => {
    setEditingId(q.id)
    setForm({
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      category: q.category,
      targetRole: q.targetRole,
      tags: q.tags.join(', '),
      hints: q.hints.join('\n'),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        category: form.category,
        targetRole: form.targetRole,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        hints: form.hints.split('\n').map((h) => h.trim()).filter(Boolean),
        isActive: true,
      }

      const url = editingId ? `/api/questions/${editingId}` : '/api/questions'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to save question')
        return
      }

      toast.success(editingId ? 'Question updated' : 'Question created')
      setDialogOpen(false)

      // Update local state
      if (editingId) {
        setQuestions((prev) => prev.map((q) => q.id === editingId ? { ...q, ...json.data } : q))
      } else {
        setQuestions((prev) => [json.data, ...prev])
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this question? It will no longer appear to users.')) return
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to deactivate'); return }
      toast.success('Question deactivated')
      setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, isActive: false } : q))
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Questions table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Difficulty</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {questions.map((q) => (
              <tr key={q.id} className={`hover:bg-muted/30 transition-colors ${!q.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium max-w-xs truncate">{q.title}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`text-xs font-medium ${q.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {q.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(q)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      aria-label="Edit question"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Deactivate question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="q-title">Title</Label>
              <Input
                id="q-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Question title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-desc">Description</Label>
              <Textarea
                id="q-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Full question description..."
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm({ ...form, difficulty: v as Difficulty })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as Category })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['FRONTEND', 'BACKEND', 'DSA', 'SYSTEM_DESIGN', 'DATABASE', 'BEHAVIORAL'] as Category[]).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Select
                  value={form.targetRole}
                  onValueChange={(v) => setForm({ ...form, targetRole: v as TargetRole })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['FRONTEND_DEV', 'BACKEND_DEV', 'FULLSTACK_DEV', 'DATA_ENGINEER', 'DEVOPS', 'GENERAL'] as TargetRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-tags">Tags (comma separated)</Label>
              <Input
                id="q-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="react, hooks, state-management"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-hints">Hints (one per line)</Label>
              <Textarea
                id="q-hints"
                value={form.hints}
                onChange={(e) => setForm({ ...form, hints: e.target.value })}
                placeholder="Think about closures..."
                className="min-h-[80px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
