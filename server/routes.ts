import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { 
  insertContactRequestSchema, 
  insertProjectSchema, 
  insertCurrentAccountSchema, 
  insertTransactionSchema 
} from "@shared/schema";
import { generateToken, verifyPassword, authenticateAdmin, AuthRequest, hashPassword } from "./auth";
import { generateSignageDesign, analyzeImageForSignage } from "./ai-service";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Kullanıcı adı ve şifre gerekli." 
        });
      }
      
      // Fetch user from database
      const user = await storage.getUserByUsername(username);
      if (user && user.isAdmin && user.password) {
        const isValidPassword = await verifyPassword(password, user.password);
        if (isValidPassword) {
          const token = generateToken(username);
          res.json({ 
            success: true, 
            token,
            message: "Giriş başarılı." 
          });
          return;
        }
      }
      
      res.status(401).json({ 
        success: false, 
        message: "Geçersiz kullanıcı adı veya şifre." 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Sunucu hatası oluştu." 
      });
    }
  });

  // Verify admin token
  app.get("/api/admin/verify", authenticateAdmin, (req: AuthRequest, res) => {
    res.json({ 
      success: true, 
      user: req.user 
    });
  });
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactRequestSchema.parse(req.body);
      res.json({ 
        success: true, 
        message: "Talebiniz başarıyla alındı."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Geçersiz form verisi.",
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Sunucu hatası oluştu." 
        });
      }
    }
  });

  app.post("/api/ai-signage/generate", async (req, res) => {
    try {
      const { text, type, style, colors, building_description, prompt } = req.body;
      
      if (!text || !type) {
        return res.status(400).json({ 
          success: false, 
          message: "Tabela metni ve tipi gerekli." 
        });
      }
      
      const result = await generateSignageDesign({
        text,
        type,
        style: style || "modern",
        colors: colors || "professional",
        building_description: building_description || "commercial building",
        prompt: prompt || undefined
      });
      
      res.json({ 
        success: true, 
        data: result 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Tabela tasarımı oluşturulurken hata oluştu." 
      });
    }
  });

  // Görsel analizi endpoint'i
  app.post("/api/ai-signage/analyze", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ 
          success: false, 
          message: "Görsel gerekli." 
        });
      }
      
      // Eğer varsa data:image/jpeg;base64, önekini kaldır
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const analysis = await analyzeImageForSignage(base64Image);
      
      res.json({ 
        success: true, 
        analysis 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Görsel analizi yapılırken hata oluştu." 
      });
    }
  });

  // Referans tabela analizi endpoint'i  
  app.post("/api/ai-signage/analyze-reference", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ 
          success: false, 
          message: "Referans görsel gerekli." 
        });
      }
      
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');
      const analysis = await analyzeImageForSignage(base64Image);
      
      res.json({ 
        success: true, 
        data: analysis
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Referans görsel analizi yapılırken hata oluştu." 
      });
    }
  });

  app.get("/api/admin/projects", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/admin/projects", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.delete("/api/admin/projects/:id", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.get("/api/admin/accounts", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const accounts = await storage.getCurrentAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/admin/accounts", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertCurrentAccountSchema.parse(req.body);
      const account = await storage.createCurrentAccount(validatedData);
      res.json(account);
    } catch (error: any) {
      console.error("Cari hesap oluşturma hatası:", error);
      if (error.code === 'XX000' && error.message?.includes('endpoint is disabled')) {
        res.status(503).json({ message: "Veritabanı geçici olarak erişilemez durumda. Lütfen birkaç saniye sonra tekrar deneyin." });
      } else if (error.message === 'Veritabanı bağlantısı kurulamadı') {
        res.status(503).json({ message: "Veritabanı bağlantısı kurulamadı. Lütfen tekrar deneyin." });
      } else {
        res.status(500).json({ message: "Cari hesap oluşturulurken hata oluştu." });
      }
    }
  });

  app.get("/api/admin/transactions", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const transactions = await storage.getAccountTransactions(accountId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/admin/transactions", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      console.log("Transaction request body:", req.body);
      const data = { ...req.body };
      
      // Ensure required fields exist
      if (!data.type || !data.amount || !data.description) {
        return res.status(400).json({ 
          message: "Missing required fields: type, amount, description" 
        });
      }
      
      // Convert types to match schema expectations
      if (data.accountId) {
        data.accountId = typeof data.accountId === 'string' ? parseInt(data.accountId) : data.accountId;
      } else {
        data.accountId = null;
      }
      
      if (data.projectId) {
        data.projectId = typeof data.projectId === 'string' ? parseInt(data.projectId) : data.projectId;
      } else {
        data.projectId = null;
      }
      
      // parentId should be null for new transactions
      data.parentId = null;
      
      if (data.amount !== undefined && data.amount !== null) {
        data.amount = String(data.amount);
      }
      
      if (data.transactionDate) {
        // Ensure proper date format
        const date = new Date(data.transactionDate);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid transaction date" });
        }
        data.transactionDate = date;
      } else {
        data.transactionDate = new Date();
      }
      
      console.log("Data after conversion:", data);
      
      try {
        const validatedData = insertTransactionSchema.parse(data);
        console.log("Validated data:", validatedData);
        
        // Test database connection first
        console.log("Testing database connection...");
        await storage.getCurrentAccounts(); // Simple query to test connection
        console.log("Database connection OK");
        
        const transaction = await storage.createTransaction(validatedData);
        console.log("Transaction created successfully:", transaction);
        
        res.json(transaction);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Validation failed", 
            errors: validationError.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
        }
        throw validationError;
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ 
        message: "Failed to create transaction",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Tahsil / Ödeme onayı
  app.put("/api/admin/transactions/:id/settle", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.settleTransaction(id);
      if (!updated) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Settle transaction error:", error);
      res.status(500).json({ message: "Failed to settle transaction" });
    }
  });

  // Finans İstatistik Rotaları
  app.get("/api/admin/transactions/pending", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const pending = await storage.getPendingTransactions();
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  app.get("/api/admin/transactions/recent", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const period = req.query.period as string || 'all'; // all, week, month, year, or YYYY-MM
      const recent = await storage.getRecentTransactions(limit, period);
      res.json(recent);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  app.post("/api/admin/transactions/partial-settle", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const { parentId, amount, description, transactionDate } = req.body;
      
      if (!parentId || !amount || !description || !transactionDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const payment = await storage.partialSettle(
        Number(parentId),
        Number(amount),
        description,
        new Date(transactionDate)
      );
      
      res.json(payment);
    } catch (error: any) {
      console.error("Error processing partial payment:", error);
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ message: error.message || "Failed to process payment" });
    }
  });

  app.get("/api/admin/stats/monthly", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const summary = await storage.getMonthlySummary(year);
      res.json(summary);
    } catch (error) {
      console.error("Monthly summary error:", error);
      res.status(500).json({ message: "Failed to fetch monthly summary" });
    }
  });

  // Finance Stats Endpoint
  app.get("/api/admin/finance/stats", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      const year = new Date().getFullYear();
      const monthlySummary = await storage.getMonthlySummary(year);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const period = req.query.period as string || 'month';
      
      let selectedMonthData;
      if (period === 'month') {
        selectedMonthData = monthlySummary.find(s => s.month === currentMonth) || {
          income: "0",
          expense: "0",
          net: "0",
          month: currentMonth
        };
      } else if (period === 'all') {
        // Sum up all months for 'all'
        const totalIncome = monthlySummary.reduce((sum, s) => sum + Number(s.income), 0);
        const totalExpense = monthlySummary.reduce((sum, s) => sum + Number(s.expense), 0);
        selectedMonthData = {
          income: totalIncome.toString(),
          expense: totalExpense.toString(),
          net: (totalIncome - totalExpense).toString(),
          month: 'all'
        };
      } else if (period === 'year') {
        // Sum up for the current year
        const yearData = monthlySummary.filter(s => s.month.startsWith(year.toString()));
        const totalIncome = yearData.reduce((sum, s) => sum + Number(s.income), 0);
        const totalExpense = yearData.reduce((sum, s) => sum + Number(s.expense), 0);
        selectedMonthData = {
          income: totalIncome.toString(),
          expense: totalExpense.toString(),
          net: (totalIncome - totalExpense).toString(),
          month: year.toString()
        };
      } else if (period === 'week') {
        // For week, we'll use the current month's data as a placeholder (could be refined)
        selectedMonthData = monthlySummary.find(s => s.month === currentMonth) || {
          income: "0",
          expense: "0",
          net: "0",
          month: currentMonth
        };
      } else {
        // Specific month selected (YYYY-MM)
        selectedMonthData = monthlySummary.find(s => s.month === period) || {
          income: "0",
          expense: "0",
          net: "0",
          month: period
        };
      }

      // Income and expenses are based on completed transactions only
      // Pending transactions are not included in the net balance calculation
      res.json({
        totalReceivables: 0, // Excluded as per user request
        totalPayables: 0,    // Excluded as per user request
        monthlyIncome: Number(selectedMonthData.income),
        monthlyExpenses: Number(selectedMonthData.expense),
        netBalance: Number(selectedMonthData.income) - Number(selectedMonthData.expense)
      });
    } catch (error) {
      console.error("Finance stats error:", error);
      res.status(500).json({ message: "Failed to fetch finance stats" });
    }
  });

  // Test endpoint for database connection
  app.get("/api/admin/test", authenticateAdmin, async (req: AuthRequest, res) => {
    try {
      console.log("Testing database connection...");
      const accounts = await storage.getCurrentAccounts();
      console.log("Found", accounts.length, "accounts");
      
      const projects = await storage.getProjects();
      console.log("Found", projects.length, "projects");
      
      res.json({ 
        message: "Database connection successful",
        accounts: accounts.length,
        projects: projects.length
      });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({ 
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Portfolio Projects API Routes
  app.get("/api/portfolio-projects", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const projects = await storage.getPortfolioProjects(activeOnly);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching portfolio projects:", error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  app.get("/api/admin/portfolio-projects", authenticateAdmin, async (req, res) => {
    try {
      const projects = await storage.getPortfolioProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching portfolio projects:", error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  app.post("/api/admin/portfolio-projects", authenticateAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      // Convert completionDate string to Date object if provided
      if (data.completionDate) {
        data.completionDate = new Date(data.completionDate);
      }
      const project = await storage.createPortfolioProject(data);
      res.json(project);
    } catch (error) {
      console.error("Error creating portfolio project:", error);
      res.status(500).json({ message: "Failed to create portfolio project" });
    }
  });

  app.put("/api/admin/portfolio-projects/:id", authenticateAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      // Convert completionDate string to Date object if provided
      if (data.completionDate) {
        data.completionDate = new Date(data.completionDate);
      }
      const project = await storage.updatePortfolioProject(parseInt(req.params.id), data);
      res.json(project);
    } catch (error) {
      console.error("Error updating portfolio project:", error);
      res.status(500).json({ message: "Failed to update portfolio project" });
    }
  });

  app.delete("/api/admin/portfolio-projects/:id", authenticateAdmin, async (req, res) => {
    try {
      await storage.deletePortfolioProject(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio project:", error);
      res.status(500).json({ message: "Failed to delete portfolio project" });
    }
  });

  app.put("/api/admin/portfolio-projects/reorder", authenticateAdmin, async (req, res) => {
    try {
      const { projectIds } = req.body;
      await storage.updatePortfolioProjectOrder(projectIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering portfolio projects:", error);
      res.status(500).json({ message: "Failed to reorder portfolio projects" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
