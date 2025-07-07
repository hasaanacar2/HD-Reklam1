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

  // New account/project forms
  const [newAccountForm, setNewAccountForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    accountType: 'customer'
  });

  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    projectType: 'signage',
    status: 'planned',
    totalAmount: '',
    paidAmount: '0',
    startDate: '',
    endDate: ''
  });

  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  // Auth headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  // Fetch accounts and projects
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/admin/accounts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/accounts', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      return res.json();
    }
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/admin/projects'],
    queryFn: async () => {
      const res = await fetch('/api/admin/projects', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  // Create account mutation
  const createAccount = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create account');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/accounts'] });
    }
  });

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create project');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
    }
  });

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error('Server response:', res.status, errorData);
        try {
          const parsedError = JSON.parse(errorData);
          throw new Error(parsedError.message || `Server error: ${res.status}`);
        } catch {
          throw new Error(`Server error: ${res.status} - ${errorData}`);
        }
      }
      
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
      
      // Reset new forms
      setNewAccountForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        accountType: 'customer'
      });
      setNewProjectForm({
        name: '',
        description: '',
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        projectType: 'signage',
        status: 'planned',
        totalAmount: '',
        paidAmount: '0',
        startDate: '',
        endDate: ''
      });
      setShowNewAccountForm(false);
      setShowNewProjectForm(false);
      
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    let accountId = form.accountId ? parseInt(form.accountId) : null;
    let projectId = form.projectId ? parseInt(form.projectId) : null;

    // Create new account if needed
    if (showNewAccountForm && newAccountForm.name) {
      if (!newAccountForm.name.trim()) {
        toast({
          title: "Hesap adı gerekli",
          description: "Lütfen hesap adını girin",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const newAccount = await createAccount.mutateAsync(newAccountForm);
        accountId = newAccount.id;
        toast({
          title: "Yeni hesap oluşturuldu",
          description: `${newAccountForm.name} hesabı başarıyla eklendi`,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Hesap oluşturulurken hata oluştu",
          description: "Lütfen tekrar deneyin",
          variant: "destructive",
        });
        return;
      }
    }

    // Create new project if needed
    if (showNewProjectForm && newProjectForm.name) {
      if (!newProjectForm.name.trim() || !newProjectForm.clientName.trim()) {
        toast({
          title: "Proje bilgileri eksik",
          description: "Lütfen proje adı ve müşteri adını girin",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const newProject = await createProject.mutateAsync(newProjectForm);
        projectId = newProject.id;
        toast({
          title: "Yeni proje oluşturuldu",
          description: `${newProjectForm.name} projesi başarıyla eklendi`,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Proje oluşturulurken hata oluştu",
          description: "Lütfen tekrar deneyin",
          variant: "destructive",
        });
        return;
      }
    }

    // Map form type to transaction type
    let transactionType: string = form.type;
    if (form.type === 'expense') transactionType = 'payment_made'; // Gider direkt ödeme olarak
    if (form.type === 'income') transactionType = 'payment_received'; // Gelir direkt tahsilat olarak
    // debt ve credit bekleyen olarak kalır

    // Create transaction
    const transactionData = {
      type: transactionType,
      amount: amount.toString(),
      description: form.description,
      transactionDate: form.transactionDate,
      accountId: accountId,
      projectId: projectId,
    };
    
    console.log("Sending transaction data:", transactionData);
    createTransaction.mutate(transactionData);
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
              <div className="flex items-center justify-between">
                <Label htmlFor="account">Cari Hesap (Opsiyonel)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewAccountForm(!showNewAccountForm)}
                >
                  {showNewAccountForm ? 'İptal' : 'Yeni Hesap Ekle'}
                </Button>
              </div>
              {!showNewAccountForm ? (
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
              ) : (
                <div className="space-y-2 p-3 border rounded-md">
                  <Input
                    placeholder="Hesap adı"
                    value={newAccountForm.name}
                    onChange={(e) => setNewAccountForm({...newAccountForm, name: e.target.value})}
                  />
                  <Input
                    placeholder="Telefon"
                    value={newAccountForm.phone}
                    onChange={(e) => setNewAccountForm({...newAccountForm, phone: e.target.value})}
                  />
                  <Input
                    placeholder="E-posta"
                    value={newAccountForm.email}
                    onChange={(e) => setNewAccountForm({...newAccountForm, email: e.target.value})}
                  />
                  <Select 
                    value={newAccountForm.accountType}
                    onValueChange={(value) => setNewAccountForm({...newAccountForm, accountType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Müşteri</SelectItem>
                      <SelectItem value="supplier">Tedarikçi</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="project">Proje (Opsiyonel)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                >
                  {showNewProjectForm ? 'İptal' : 'Yeni Proje Ekle'}
                </Button>
              </div>
              {!showNewProjectForm ? (
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
              ) : (
                <div className="space-y-2 p-3 border rounded-md">
                  <Input
                    placeholder="Proje adı"
                    value={newProjectForm.name}
                    onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                  />
                  <Textarea
                    placeholder="Proje açıklaması"
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                  />
                  <Input
                    placeholder="Müşteri adı"
                    value={newProjectForm.clientName}
                    onChange={(e) => setNewProjectForm({...newProjectForm, clientName: e.target.value})}
                  />
                  <Input
                    placeholder="Müşteri telefonu"
                    value={newProjectForm.clientPhone}
                    onChange={(e) => setNewProjectForm({...newProjectForm, clientPhone: e.target.value})}
                  />
                  <Select 
                    value={newProjectForm.projectType}
                    onValueChange={(value) => setNewProjectForm({...newProjectForm, projectType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signage">Tabela</SelectItem>
                      <SelectItem value="printing">Baskı</SelectItem>
                      <SelectItem value="design">Tasarım</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
