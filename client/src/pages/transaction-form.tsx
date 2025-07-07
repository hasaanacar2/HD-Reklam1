import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type TransactionType = 'debt' | 'credit' | 'expense' | 'income';

type Account = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  name: string;
};

type TransactionFormProps = {
  onClose?: () => void;
};

export default function TransactionForm({ onClose }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [form, setForm] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    description: '',
    transactionDate: format(new Date(), 'yyyy-MM-dd'),
    accountId: '',
    projectId: '',
  });

  // Fetch accounts and projects
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/admin/accounts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/current-accounts');
      return await res.json();
    }
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/admin/projects'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/projects');
      return await res.json();
    }
  });

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/admin/transactions', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats/monthly'] });
      
      // Reset form
      setForm({
        type: 'expense',
        amount: '',
        description: '',
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        accountId: '',
        projectId: '',
      });
      
      toast({
        title: "İşlem başarıyla eklendi",
        variant: "default",
      });
      
      // Close the form if onClose is provided
      if (onClose) {
        onClose();
      }
    },
    onError: (error: any) => {
      console.error('Error creating transaction:', error);
      toast({
        title: "İşlem eklenirken hata oluştu",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Geçersiz tutar",
        description: "Lütfen geçerli bir tutar girin",
        variant: "destructive",
      });
      return;
    }

    // Map form type to transaction type
    let transactionType = form.type;
    if (form.type === 'expense') transactionType = 'debt';
    if (form.type === 'income') transactionType = 'credit';

    createTransaction.mutate({
      type: transactionType,
      amount: amount.toString(),
      description: form.description,
      transactionDate: form.transactionDate,
      accountId: form.accountId ? parseInt(form.accountId) : null,
      projectId: form.projectId ? parseInt(form.projectId) : null,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni İşlem Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">İşlem Türü</Label>
              <Select 
                value={form.type} 
                onValueChange={(value) => setForm({...form, type: value as TransactionType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="İşlem türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Gider</SelectItem>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="debt">Borç</SelectItem>
                  <SelectItem value="credit">Alacak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="İşlem açıklaması"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">İşlem Tarihi</Label>
              <Input
                id="date"
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm({...form, transactionDate: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Cari Hesap (Opsiyonel)</Label>
              <Select 
                value={form.accountId}
                onValueChange={(value) => setForm({...form, accountId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cari hesap seçin" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Proje (Opsiyonel)</Label>
              <Select 
                value={form.projectId}
                onValueChange={(value) => setForm({...form, projectId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Proje seçin" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={createTransaction.isPending}
            >
              {createTransaction.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ekleniyor...
                </>
              ) : (
                'İşlem Ekle'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
