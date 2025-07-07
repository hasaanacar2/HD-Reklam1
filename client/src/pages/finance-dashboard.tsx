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
import { Plus, TrendingUp, TrendingDown, DollarSign, Calculator, Check } from "lucide-react";
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

  // Fetch finance stats
  const { data: financeStats } = useQuery<FinanceStats>({
    queryKey: ["/api/admin/finance/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/finance/stats", {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch finance stats');
      return res.json();
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

  // Fetch recent transactions
  const { data: recentTransactions = [], isLoading: recentLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/recent"],
    queryFn: async () => {
      const res = await fetch("/api/admin/transactions/recent", {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch recent transactions');
      return res.json();
    }
  });

  // Mutation for partial payment
  const partialPaymentMutation = useMutation({
    mutationFn: async (data: { parentId: number; amount: number; description: string; transactionDate: string }) => {
      const res = await apiRequest("POST", "/api/admin/transactions/partial-settle", data);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Finans Tablosu</h1>
          <p className="text-muted-foreground">Finansal durumunuzu ve bekleyen işlemlerinizi yönetin</p>
        </div>
        <Button onClick={() => setShowTransactionForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni İşlem Ekle
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📊 Genel Bakış</TabsTrigger>
          <TabsTrigger value="receivables">💰 Bekleyen Alacaklar</TabsTrigger>
          <TabsTrigger value="payables">📋 Bekleyen Verecekler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Finance Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Alacaklar</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {financeStats ? formatCurrency(financeStats.totalReceivables) : '₺0,00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingReceivables.length} bekleyen işlem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Verecekler</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {financeStats ? formatCurrency(financeStats.totalPayables) : '₺0,00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingPayables.length} bekleyen işlem
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
                  Bu ay
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
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                          {transaction.type === 'credit' ? 'Alacak' : 'Verecek'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
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
                Bekleyen Alacaklar
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
                      <TableCell className="text-right text-green-600">{formatCurrency(tx.amount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(tx.remainingAmount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(tx.transactionDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePartialPayment(tx)}
                        >
                          Kısmi Tahsil
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleFullPayment(tx)}
                        >
                          Tam Tahsil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingReceivables.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Bekleyen alacak bulunmamaktadır
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
                Bekleyen Verecekler
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
                      <TableCell className="text-right text-red-600">{formatCurrency(tx.amount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(tx.remainingAmount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(tx.transactionDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePartialPayment(tx)}
                        >
                          Kısmi Öde
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleFullPayment(tx)}
                        >
                          Tam Öde
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingPayables.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Bekleyen verecek bulunmamaktadır
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
                ? 'Alacak tahsilatı yapıyorsunuz' 
                : 'Verecek ödemesi yapıyorsunuz'}
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
                  Kalan tutar: {formatCurrency(selectedTransaction.remainingAmount)}
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
