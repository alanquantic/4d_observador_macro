'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Flame, Target, Calendar, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export function IntentionsManager() {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntention, setEditingIntention] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal_growth',
    frequency: 'daily',
    notes: '',
  });

  useEffect(() => {
    loadIntentions();
  }, []);

  const loadIntentions = async () => {
    try {
      const res = await fetch('/api/daily-mapping/intentions');
      if (res.ok) {
        const data = await res.json();
        setIntentions(data);
      }
    } catch (error) {
      console.error('Error loading intentions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingIntention
        ? `/api/daily-mapping/intentions/${editingIntention.id}`
        : '/api/daily-mapping/intentions';
      
      const method = editingIntention ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save intention');

      toast.success(editingIntention ? 'Intención actualizada' : 'Intención creada');
      setDialogOpen(false);
      resetForm();
      loadIntentions();
    } catch (error) {
      console.error('Error saving intention:', error);
      toast.error('Error al guardar la intención');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta intención?')) return;

    try {
      const res = await fetch(`/api/daily-mapping/intentions/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Intención eliminada');
      loadIntentions();
    } catch (error) {
      console.error('Error deleting intention:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (intention: any) => {
    setEditingIntention(intention);
    setFormData({
      title: intention.title,
      description: intention.description || '',
      category: intention.category,
      frequency: intention.frequency,
      notes: intention.notes || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingIntention(null);
    setFormData({
      title: '',
      description: '',
      category: 'personal_growth',
      frequency: 'daily',
      notes: '',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: 'bg-green-500/20 text-green-300',
      work: 'bg-blue-500/20 text-blue-300',
      relationships: 'bg-pink-500/20 text-pink-300',
      personal_growth: 'bg-purple-500/20 text-purple-300',
      spiritual: 'bg-indigo-500/20 text-indigo-300',
    };
    return colors[category] || colors.personal_growth;
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      daily: 'Diaria',
      weekly: 'Semanal',
      monthly: 'Mensual',
      one_time: 'Única',
    };
    return labels[freq] || freq;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Gestión de Intenciones
          </h2>
          <p className="text-gray-400 text-sm">Define y sigue tus intenciones conscientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Intención
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingIntention ? 'Editar Intención' : 'Nueva Intención'}
              </DialogTitle>
              <DialogDescription>
                Define una intención que deseas cumplir regularmente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Meditar 10 minutos"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles adicionales..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Salud</SelectItem>
                      <SelectItem value="work">Trabajo</SelectItem>
                      <SelectItem value="relationships">Relaciones</SelectItem>
                      <SelectItem value="personal_growth">Crecimiento Personal</SelectItem>
                      <SelectItem value="spiritual">Espiritual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diaria</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="one_time">Única</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  {editingIntention ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Intentions */}
      <div className="grid gap-4 md:grid-cols-2">
        {intentions.filter(i => i.status === 'active').map((intention) => (
          <Card key={intention.id} className="border-purple-500/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{intention.title}</CardTitle>
                  <CardDescription>{intention.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(intention)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(intention.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge className={getCategoryColor(intention.category)}>
                  {intention.category.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {getFrequencyLabel(intention.frequency)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Racha Actual</span>
                  <span className="flex items-center gap-1 text-orange-400">
                    <Flame className="h-4 w-4" />
                    {intention.currentStreak} días
                  </span>
                </div>
                <Progress value={(intention.currentStreak / Math.max(intention.longestStreak, 7)) * 100} />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Mejor racha: {intention.longestStreak} días</span>
                  <span>Total cumplidos: {intention.totalFulfilledDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          Cargando intenciones...
        </div>
      )}

      {!loading && intentions.filter(i => i.status === 'active').length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center mb-4">
              No tienes intenciones activas.
              <br />
              Crea tu primera intención para comenzar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
