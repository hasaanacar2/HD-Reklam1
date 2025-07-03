import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Edit, Eye, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContentEditor from "@/components/content-editor";

interface Project {
  id: number;
  name: string;
  description: string | null;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  projectType: string;
  status: string;
  totalAmount: string | null;
  paidAmount: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CurrentAccount {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  accountType: string;
  totalDebt: string;
  totalCredit: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountTransaction {
  id: number;
  accountId: number;
  projectId: number | null;
  type: string;
  amount: string;
  description: string;
  transactionDate: string;
  createdAt: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLocation('/admin-login');
    }
  }, [setLocation]);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  // Project form state
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    projectType: "signage",
    status: "planned",
    totalAmount: "",
    paidAmount: "0",
    startDate: "",
    endDate: ""
  });

  // Current account form state
  const [accountForm, setAccountForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    accountType: "customer"
  });

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    accountId: "",
    type: "debt",
    amount: "",
    description: "",
    transactionDate: new Date().toISOString().split('T')[0]
  });

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  // Queries
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects", {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        setLocation('/admin-login');
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    }
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<CurrentAccount[]>({
    queryKey: ["/api/admin/accounts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/accounts", {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        setLocation('/admin-login');
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return res.json();
    }
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<AccountTransaction[]>({
    queryKey: ["/api/admin/transactions", selectedAccount],
    enabled: selectedAccount !== null,
    queryFn: async () => {
      const res = await fetch(`/api/admin/transactions?accountId=${selectedAccount}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        setLocation('/admin-login');
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    }
  });

  // Custom API request with auth headers
  const apiRequestWithAuth = async (method: string, url: string, data?: any) => {
    const res = await fetch(url, {
      method,
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });
    
    if (res.status === 401) {
      setLocation('/admin-login');
      throw new Error("Unauthorized");
    }
    
    if (!res.ok) {
      throw new Error(`Request failed: ${res.statusText}`);
    }
    
    return res.json();
  };

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof projectForm) => {
      return await apiRequestWithAuth("POST", "/api/admin/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      setProjectForm({
        name: "",
        description: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        projectType: "signage",
        status: "planned",
        totalAmount: "",
        paidAmount: "0",
        startDate: "",
        endDate: ""
      });
      toast({ title: "Proje başarıyla eklendi" });
    },
    onError: () => {
      toast({ title: "Proje eklenemedi", variant: "destructive" });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequestWithAuth("DELETE", `/api/admin/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Proje silindi" });
    },
    onError: () => {
      toast({ title: "Proje silinemedi", variant: "destructive" });
    }
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: typeof accountForm) => {
      return await apiRequestWithAuth("POST", "/api/admin/accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      setAccountForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        accountType: "customer"
      });
      toast({ title: "Cari hesap eklendi" });
    },
    onError: (error: any) => {
      console.error("Account creation error:", error);
      toast({ title: "Cari hesap eklenemedi", description: error.message, variant: "destructive" });
    }
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: typeof transactionForm) => {
      return await apiRequestWithAuth("POST", "/api/admin/transactions", {
        ...data,
        accountId: parseInt(data.accountId),
        amount: parseFloat(data.amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      setTransactionForm({
        accountId: "",
        type: "debt",
        amount: "",
        description: "",
        transactionDate: new Date().toISOString().split('T')[0]
      });
      toast({ title: "İşlem eklendi" });
    },
    onError: () => {
      toast({ title: "İşlem eklenemedi", variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      planned: "outline",
      in_progress: "default",
      completed: "secondary",
      cancelled: "destructive"
    };
    
    const labels: Record<string, string> = {
      planned: "Planlanan",
      in_progress: "Devam Eden",
      completed: "Tamamlanan",
      cancelled: "İptal"
    };

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  const getAccountTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      customer: "Müşteri",
      supplier: "Tedarikçi",
      other: "Diğer"
    };

    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(projectForm);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    createAccountMutation.mutate(accountForm);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionForm.accountId) {
      toast({ title: "Lütfen bir cari hesap seçin", variant: "destructive" });
      return;
    }
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast({ title: "Lütfen geçerli bir tutar girin", variant: "destructive" });
      return;
    }
    createTransactionMutation.mutate(transactionForm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
        <p className="text-gray-600 mt-2">İçerik düzenleme ve cari hesap takibi</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">✏️ İçerik Editörü</TabsTrigger>
          <TabsTrigger value="accounts">💰 Cari Hesaplar</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <ContentEditor />
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <div className="grid gap-6">
            {/* Add Account Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Yeni Cari Hesap Ekle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountName">İsim/Firma Adı</Label>
                      <Input
                        id="accountName"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                        className="thin-border"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountType">Hesap Tipi</Label>
                      <Select value={accountForm.accountType} onValueChange={(value) => setAccountForm(prev => ({ ...prev, accountType: value }))}>
                        <SelectTrigger className="thin-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Müşteri</SelectItem>
                          <SelectItem value="supplier">Tedarikçi</SelectItem>
                          <SelectItem value="other">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="accountPhone">Telefon</Label>
                      <Input
                        id="accountPhone"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="thin-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountEmail">E-posta</Label>
                      <Input
                        id="accountEmail"
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                        className="thin-border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accountAddress">Adres</Label>
                    <Textarea
                      id="accountAddress"
                      value={accountForm.address}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, address: e.target.value }))}
                      className="thin-border"
                    />
                  </div>
                  <Button type="submit" disabled={createAccountMutation.isPending} className="w-full">
                    {createAccountMutation.isPending ? "Ekleniyor..." : "Cari Hesap Ekle"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Accounts List */}
            <Card>
              <CardHeader>
                <CardTitle>Cari Hesaplar</CardTitle>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div>Yükleniyor...</div>
                ) : (
                  <div className="space-y-4">
                    {/* Scrollable Accounts */}
                    <div className="overflow-x-auto pb-4">
                      <div className="flex gap-4 min-w-max">
                        {accounts.map((account: CurrentAccount) => (
                          <Card 
                            key={account.id} 
                            className={`cursor-pointer hover:bg-gray-50 min-w-[300px] ${selectedAccount === account.id ? 'ring-2 ring-blue-500' : ''}`} 
                            onClick={() => setSelectedAccount(account.id)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{account.name}</CardTitle>
                                {getAccountTypeBadge(account.accountType)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Bakiye:</span>
                                  <span className={`font-semibold ${parseFloat(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(account.balance)}
                                    {parseFloat(account.balance) >= 0 ? 
                                      <TrendingUp className="inline h-4 w-4 ml-1" /> : 
                                      <TrendingDown className="inline h-4 w-4 ml-1" />
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Borç:</span>
                                  <span>{formatCurrency(account.totalDebt)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Alacak:</span>
                                  <span>{formatCurrency(account.totalCredit)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Total Summary */}
                    <Card className="bg-gray-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Genel Toplam</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Toplam Borç</p>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency(
                                accounts.reduce((sum, acc) => sum + parseFloat(acc.totalDebt), 0)
                              )}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Toplam Alacak</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(
                                accounts.reduce((sum, acc) => sum + parseFloat(acc.totalCredit), 0)
                              )}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Net Bakiye</p>
                            <p className={`text-xl font-bold ${
                              accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) >= 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {formatCurrency(
                                accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Account Transactions */}
            {selectedAccount && (
                      <div className="mt-4 space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>İşlem Geçmişi - {accounts.find(a => a.id === selectedAccount)?.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {transactionsLoading ? (
                              <div>Yükleniyor...</div>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Borçlar Tablosu */}
                                <div>
                                  <h4 className="font-semibold mb-3 text-red-600">Borçlar</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>Açıklama</TableHead>
                                        <TableHead className="text-right">Tutar</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {transactions
                                        .filter(t => t.type === 'debt' || t.type === 'payment_made')
                                        .map((transaction) => (
                                          <TableRow key={transaction.id}>
                                            <TableCell className="text-sm">{formatDate(transaction.transactionDate)}</TableCell>
                                            <TableCell className="text-sm">{transaction.description}</TableCell>
                                            <TableCell className="text-right font-semibold text-red-600">
                                              {formatCurrency(transaction.amount)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      {transactions.filter(t => t.type === 'debt' || t.type === 'payment_made').length === 0 && (
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-center text-gray-500">
                                            Borç kaydı bulunmuyor
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Alacaklar Tablosu */}
                                <div>
                                  <h4 className="font-semibold mb-3 text-green-600">Alacaklar</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>Açıklama</TableHead>
                                        <TableHead className="text-right">Tutar</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {transactions
                                        .filter(t => t.type === 'credit' || t.type === 'payment_received')
                                        .map((transaction) => (
                                          <TableRow key={transaction.id}>
                                            <TableCell className="text-sm">{formatDate(transaction.transactionDate)}</TableCell>
                                            <TableCell className="text-sm">{transaction.description}</TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                              {formatCurrency(transaction.amount)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      {transactions.filter(t => t.type === 'credit' || t.type === 'payment_received').length === 0 && (
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-center text-gray-500">
                                            Alacak kaydı bulunmuyor
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Transaction Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Yeni İşlem Ekle
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="transactionAccount">Cari Hesap</Label>
                              <Select value={transactionForm.accountId} onValueChange={(value) => setTransactionForm(prev => ({ ...prev, accountId: value }))}>
                                <SelectTrigger className="thin-border">
                                  <SelectValue placeholder="Hesap seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts.map((account: CurrentAccount) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                      {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="transactionType">İşlem Tipi</Label>
                              <Select value={transactionForm.type} onValueChange={(value) => setTransactionForm(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger className="thin-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="debt">Borç</SelectItem>
                                  <SelectItem value="credit">Alacak</SelectItem>
                                  <SelectItem value="payment_received">Ödeme Alındı</SelectItem>
                                  <SelectItem value="payment_made">Ödeme Yapıldı</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="transactionAmount">Tutar</Label>
                              <Input
                                id="transactionAmount"
                                type="number"
                                step="0.01"
                                value={transactionForm.amount}
                                onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                                className="thin-border"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="transactionDate">Tarih</Label>
                              <Input
                                id="transactionDate"
                                type="date"
                                value={transactionForm.transactionDate}
                                onChange={(e) => setTransactionForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                                className="thin-border"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="transactionDescription">Açıklama</Label>
                            <Input
                              id="transactionDescription"
                              value={transactionForm.description}
                              onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                              className="thin-border"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={createTransactionMutation.isPending} className="w-full">
                            {createTransactionMutation.isPending ? "Ekleniyor..." : "İşlem Ekle"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}