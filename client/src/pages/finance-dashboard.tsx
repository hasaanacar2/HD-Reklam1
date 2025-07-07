import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, DollarSign, Calculator, Check, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TransactionForm from "./transaction-form";
import { formatCurrency } from "@/lib/utils";

type Transaction = {
  id: number;
  type: 'debt' | 'credit';
  amount: string;
  paidAmount: string;
  remainingAmount: string;
  description: string;
  transactionDate: string;
  accountId: number | null;
};

type PaymentForm = {
  amount: string;
  description: string;
  transactionDate: string;
};

type FinanceStats = {
  totalReceivables: number;
  totalPayables: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
};

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    amount: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month"); // Default to current month
  const [availableMonths, setAvailableMonths] = useState<{ value: string, label: string }[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  // Get auth headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  // Fetch available months for selection
  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await fetch(`/api/admin/stats/monthly?year=${year}`, {
          headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch monthly summary');
        const summary = await res.json();
        const months = summary.map((item: { month: string }) => {
          const [year, month] = item.month.split('-');
          return {
            value: item.month,
            label: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' })
          };
        }).reverse();
        setAvailableMonths(months);
        // Keep the default as 'month' for current month view
      } catch (error) {
        console.error("Failed to fetch available months:", error);
        toast({
          title: "Hata",
          description: "Aylık veriler yüklenemedi.",
          variant: "destructive",
        });
      }
    };
    fetchMonths();
  }, [toast]);

  // Fetch finance stats with selected period
  const { data: financeStats } = useQuery<FinanceStats>({
    queryKey: ["/api/admin/finance/stats", selectedPeriod],
    queryFn: async () => {
      const res = await fetch("/api/admin/finance/stats", {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch finance stats');
      const stats = await res.json();
      console.log("Finance Stats:", stats);
      return stats;
    }
  });

  // Fetch pending transactions
  const { data: pendingTransactions = [], isLoading: pendingLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/pending"],
    queryFn: async () => {
      const res = await fetch("/api/admin/transactions/pending", {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch pending transactions');
      return res.json();
    }
  });

  // Fetch recent transactions with selected period
  const { data: recentTransactions = [], isLoading: recentLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/recent", selectedPeriod],
    queryFn: async () => {
      const url = selectedPeriod === 'all' 
        ? "/api/admin/transactions/recent" 
        : `/api/admin/transactions/recent?period=${selectedPeriod}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch recent transactions');
      return res.json();
    }
  });

  // Mutation for partial payment
  const partialPaymentMutation = useMutation({
    mutationFn: async (data: { parentId: number; amount: number; description: string; transactionDate: string }) => {
      const res = await fetch("/api/admin/transactions/partial-settle", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to process payment');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/stats"] });
      setPaymentForm({ amount: '', description: '', transactionDate: new Date().toISOString().split('T')[0] });
      setIsPaymentDialogOpen(false);
      toast({
        title: "Ödeme başarıyla eklendi",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ödeme eklenirken hata oluştu",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handlePayment = () => {
    if (!selectedTransaction) return;
    
    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Geçersiz tutar",
        description: "Lütfen geçerli bir tutar girin",
        variant: "destructive",
      });
      return;
    }

    partialPaymentMutation.mutate({
      parentId: selectedTransaction.id,
      amount,
      description: paymentForm.description || `${selectedTransaction.description} - Kısmi Ödeme`,
      transactionDate: paymentForm.transactionDate,
    });
  };

  const handleFullPayment = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPaymentForm({
      amount: transaction.remainingAmount,
      description: `${transaction.description} - Tam Ödeme`,
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setIsPaymentDialogOpen(true);
  };

  const handlePartialPayment = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPaymentForm({
      amount: '',
      description: `${transaction.description} - Kısmi Ödeme`,
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setIsPaymentDialogOpen(true);
  };

  const pendingReceivables = pendingTransactions.filter(t => t.type === 'credit');
  const pendingPayables = pendingTransactions.filter(t => t.type === 'debt');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finans Tablosu</h1>
          <p className="text-muted-foreground">Gelir ve giderlerinizi yönetin</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-64">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Dönem Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="year">Bu Yıl</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowTransactionForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni İşlem Ekle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📊 Genel Bakış</TabsTrigger>
          <TabsTrigger value="receivables">💰 Bekleyen Gelirler</TabsTrigger>
          <TabsTrigger value="payables">📋 Bekleyen Giderler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Finance Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Gelirler</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {financeStats ? formatCurrency(financeStats.totalReceivables) : '₺0,00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingReceivables.length} bekleyen işlem (hesaba dahil değil)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Giderler</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {financeStats ? formatCurrency(financeStats.totalPayables) : '₺0,00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingPayables.length} bekleyen işlem (hesaba dahil değil)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {financeStats ? formatCurrency(financeStats.monthlyIncome) : '₺0,00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === 'month' ? 'Bu Ay' : selectedPeriod === 'all' ? 'Tüm Zamanlar' : selectedPeriod === 'week' ? 'Bu Hafta' : selectedPeriod === 'year' ? 'Bu Yıl' : new Date(selectedPeriod + '-01').toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aylık Gider</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {financeStats ? formatCurrency(financeStats.monthlyExpenses) : '₺0,00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === 'month' ? 'Bu Ay' : selectedPeriod === 'all' ? 'Tüm Zamanlar' : selectedPeriod === 'week' ? 'Bu Hafta' : selectedPeriod === 'year' ? 'Bu Yıl' : new Date(selectedPeriod + '-01').toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Bakiye</CardTitle>
                <Calculator className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${financeStats && financeStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financeStats ? formatCurrency(financeStats.netBalance) : '₺0,00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Alacak - Verecek
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Son İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                          {transaction.type === 'credit' ? 'Gelir' : 'Gider'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(parseFloat(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        Henüz işlem kaydı bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Bekleyen Gelirler
                <Badge variant="outline" className="ml-2">
                  {pendingReceivables.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-right">Kalan</TableHead>
                    <TableHead className="text-right">İşlem Tarihi</TableHead>
                    <TableHead className="w-40">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReceivables.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(parseFloat(tx.amount))}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(parseFloat(tx.remainingAmount))}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(tx.transactionDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePartialPayment(tx)}
                      >
                        Kısmi Ödeme
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleFullPayment(tx)}
                      >
                        Tam Ödeme
                      </Button>
                    </TableCell>
                    </TableRow>
                  ))}
                  {pendingReceivables.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Bekleyen gelir bulunmamaktadır
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                Bekleyen Giderler
                <Badge variant="outline" className="ml-2">
                  {pendingPayables.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-right">Kalan</TableHead>
                    <TableHead className="text-right">İşlem Tarihi</TableHead>
                    <TableHead className="w-40">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayables.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(parseFloat(tx.amount))}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(parseFloat(tx.remainingAmount))}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(tx.transactionDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePartialPayment(tx)}
                      >
                        Kısmi Ödeme
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleFullPayment(tx)}
                      >
                        Tam Ödeme
                      </Button>
                    </TableCell>
                    </TableRow>
                  ))}
                  {pendingPayables.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Bekleyen gider bulunmamaktadır
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Form Dialog */}
      {showTransactionForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTransactionForm(false);
            }
          }}
        >
          <div className="bg-background p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowTransactionForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
              type="button"
            >
              ×
            </button>
            <TransactionForm onClose={() => setShowTransactionForm(false)} />
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Yap</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.type === 'credit' 
                ? 'Gelir tahsilatı yapıyorsunuz' 
                : 'Gider ödemesi yapıyorsunuz'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
              {selectedTransaction && (
                <p className="text-sm text-muted-foreground">
                  Kalan tutar: {formatCurrency(parseFloat(selectedTransaction.remainingAmount))}
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">İşlem Tarihi</Label>
              <Input
                id="date"
                type="date"
                value={paymentForm.transactionDate}
                onChange={(e) => setPaymentForm({...paymentForm, transactionDate: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Input
                id="description"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                placeholder="Ödeme açıklaması"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={partialPaymentMutation.isPending}
            >
              İptal
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!paymentForm.amount || partialPaymentMutation.isPending}
            >
              {partialPaymentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Ödemeyi Onayla
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
