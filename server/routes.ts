import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { 
  insertContactRequestSchema, 
  insertProjectSchema, 
  insertCurrentAccountSchema, 
  insertTransactionSchema 
} from "@shared/schema";
import { generateSignageDesign, analyzeImageForSignage } from "./ai-service";
import { storage } from "./storage";
import { authenticateAdmin, generateToken, verifyPassword, hashPassword, AuthRequest } from "./auth";

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
      
      // For demo purposes, using a simple check
      // In production, you should store hashed passwords in database
      if (username === 'admin' && password === 'HDreklam2025') {
        const token = generateToken(username);
        res.json({ 
          success: true, 
          token,
          message: "Giriş başarılı." 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Geçersiz kullanıcı adı veya şifre." 
        });
      }
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
      
      // Convert types to match schema expectations
      if (data.accountId) {
        data.accountId = typeof data.accountId === 'string' ? parseInt(data.accountId) : data.accountId;
      }
      if (data.amount !== undefined && data.amount !== null) {
        data.amount = String(data.amount);
      }
      if (data.transactionDate) {
        data.transactionDate = new Date(data.transactionDate);
      }
      
      console.log("Data after conversion:", data);
      const validatedData = insertTransactionSchema.parse(data);
      const transaction = await storage.createTransaction(validatedData);
      // Update account balance after creating transaction if accountId exists
      if (validatedData.accountId) {
        await storage.updateAccountBalance(validatedData.accountId);
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
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
