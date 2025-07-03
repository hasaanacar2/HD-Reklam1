import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioProject {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  clientName: string | null;
  completionDate: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PortfolioProjectEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    clientName: '',
    completionDate: '',
    isActive: true
  });

  // Get auth headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<PortfolioProject[]>({
    queryKey: ['/api/admin/portfolio-projects'],
    queryFn: async () => {
      const res = await fetch('/api/admin/portfolio-projects', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: number }) => {
      const url = data.id 
        ? `/api/admin/portfolio-projects/${data.id}` 
        : '/api/admin/portfolio-projects';
      const method = data.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to save project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-projects'] });
      toast({ title: editingProject ? 'Proje güncellendi' : 'Proje eklendi' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: 'İşlem başarısız', variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/portfolio-projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-projects'] });
      toast({ title: 'Proje silindi' });
    },
    onError: () => {
      toast({ title: 'Proje silinemedi', variant: 'destructive' });
    }
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/admin/portfolio-projects/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error('Failed to update project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-projects'] });
    }
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (projectIds: number[]) => {
      const res = await fetch('/api/admin/portfolio-projects/reorder', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectIds })
      });
      if (!res.ok) throw new Error('Failed to reorder projects');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-projects'] });
      toast({ title: 'Sıralama güncellendi' });
    }
  });

  const handleEdit = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      imageUrl: project.imageUrl || '',
      category: project.category || '',
      clientName: project.clientName || '',
      completionDate: project.completionDate ? new Date(project.completionDate).toISOString().split('T')[0] : '',
      isActive: project.isActive
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      category: '',
      clientName: '',
      completionDate: '',
      isActive: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingProject?.id
    });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newProjects = [...projects];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= projects.length) return;
    
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];
    
    const projectIds = newProjects.map(p => p.id);
    reorderMutation.mutate(projectIds);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Portföy Projeleri</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleEdit(null as any)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Proje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Proje Düzenle' : 'Yeni Proje Ekle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Proje Başlığı</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientName">Müşteri Adı</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="örn: Tabela, LED, Dijital Baskı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completionDate">Tamamlanma Tarihi</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={formData.completionDate}
                      onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">Görsel URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Önizleme" 
                        className="h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Aktif (Sitede görünsün)</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Henüz proje eklenmemiş. Yeni proje ekleyerek başlayın.
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
              >
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{project.title}</h4>
                    {project.category && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {project.category}
                      </span>
                    )}
                    {!project.isActive && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Pasif
                      </span>
                    )}
                  </div>
                  {project.clientName && (
                    <p className="text-sm text-gray-600">Müşteri: {project.clientName}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveProject(index, 'up')}
                    disabled={index === 0 || reorderMutation.isPending}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveProject(index, 'down')}
                    disabled={index === projects.length - 1 || reorderMutation.isPending}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActiveMutation.mutate({ 
                      id: project.id, 
                      isActive: !project.isActive 
                    })}
                  >
                    {project.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}