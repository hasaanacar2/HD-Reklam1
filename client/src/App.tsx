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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
