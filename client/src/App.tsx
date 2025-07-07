import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AdminLogin from "@/pages/admin-login";
import FinanceDashboard from "@/pages/finance-dashboard";
import { AdminLayout } from "@/components/admin/admin-layout";
import NotFound from "@/pages/not-found";
import ContentEditor from "@/components/content-editor";
import { Helmet, HelmetProvider } from "react-helmet-async";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin/finance">
        <AdminLayout>
          <FinanceDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/content">
        <AdminLayout>
          <ContentEditor />
        </AdminLayout>
      </Route>
      <Route path="/admin">
        <AdminLayout>
          <ContentEditor />
        </AdminLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>HD Reklam - Profesyonel Tabela ve Reklam Çözümleri | Antalya</title>
        <meta name="description" content="HD Reklam, Antalya'da işletmenizin görünürlüğünü artıracak yüksek kaliteli tabela ve reklam ürünleri sunar. LED tabela, dijital baskı, cephe giydirme ve daha fazlası." />
        <meta name="keywords" content="tabela, reklam, LED tabela, dijital baskı, cephe giydirme, araç giydirme, Antalya tabela, HD Reklam" />
        <meta name="author" content="HD Reklam" />
        <meta property="og:title" content="HD Reklam - Profesyonel Tabela ve Reklam Çözümleri | Antalya" />
        <meta property="og:description" content="15 yıllık deneyimimizle Antalya'da her türlü tabela ve reklam ihtiyacınıza çözüm sunuyoruz. Bize ulaşın: 05325518051" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo.jpeg" />
        <meta property="og:locale" content="tr_TR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HD Reklam - Profesyonel Tabela ve Reklam Çözümleri | Antalya" />
        <meta name="twitter:description" content="15 yıllık deneyimimizle Antalya'da her türlü tabela ve reklam ihtiyacınıza çözüm sunuyoruz. Bize ulaşın: 05325518051" />
        <meta name="twitter:image" content="/logo.jpeg" />
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
