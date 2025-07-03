import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("projects");
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

  // Queries
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    }
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<CurrentAccount[]>({
    queryKey: ["/api/admin/accounts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return res.json();
    }
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<AccountTransaction[]>({
    queryKey: ["/api/admin/transactions", selectedAccount],
    enabled: selectedAccount !== null,
    queryFn: async () => {
      const res = await fetch(`/api/admin/transactions?accountId=${selectedAccount}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    }
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof projectForm) => {
      return await apiRequest("POST", "/api/admin/projects", data);
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
      return await apiRequest("DELETE", `/api/admin/projects/${id}`);
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
      return await apiRequest("POST", "/api/admin/accounts", data);
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
    onError: () => {
      toast({ title: "Cari hesap eklenemedi", variant: "destructive" });
    }
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: typeof transactionForm) => {
      return await apiRequest("POST", "/api/admin/transactions", {
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
    createTransactionMutation.mutate(transactionForm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
        <p className="text-gray-600 mt-2">Proje yönetimi ve cari hesap takibi</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">📋 Proje Yönetimi</TabsTrigger>
          <TabsTrigger value="accounts">💰 Cari Hesaplar</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <div className="grid gap-6">
            {/* Add Project Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Yeni Proje Ekle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">Proje Adı</Label>
                      <Input
                        id="projectName"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                        className="thin-border"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientName">Müşteri Adı</Label>
                      <Input
                        id="clientName"
                        value={projectForm.clientName}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, clientName: e.target.value }))}
                        className="thin-border"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectType">Proje Tipi</Label>
                      <Select value={projectForm.projectType} onValueChange={(value) => setProjectForm(prev => ({ ...prev, projectType: value }))}>
                        <SelectTrigger className="thin-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="signage">Tabela</SelectItem>
                          <SelectItem value="digital">Dijital Baskı</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="vehicle">Araç Giydirme</SelectItem>
                          <SelectItem value="other">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="totalAmount">Toplam Tutar</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={projectForm.totalAmount}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                        className="thin-border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      className="thin-border"
                    />
                  </div>
                  <Button type="submit" disabled={createProjectMutation.isPending} className="w-full">
                    {createProjectMutation.isPending ? "Ekleniyor..." : "Proje Ekle"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Projects List */}
            <Card>
              <CardHeader>
                <CardTitle>Projeler</CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div>Yükleniyor...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proje Adı</TableHead>
                          <TableHead>Müşteri</TableHead>
                          <TableHead>Tip</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project: Project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>{project.clientName}</TableCell>
                            <TableCell>{project.projectType}</TableCell>
                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                            <TableCell>{project.totalAmount ? formatCurrency(project.totalAmount) : '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteProjectMutation.mutate(project.id)}
                                  disabled={deleteProjectMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {accounts.map((account: CurrentAccount) => (
                        <Card key={account.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedAccount(account.id)}>
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
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}