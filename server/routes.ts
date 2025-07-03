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
    } catch (error) {
      res.status(500).json({ message: "Failed to create account" });
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
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
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
      const project = await storage.createPortfolioProject(req.body);
      res.json(project);
    } catch (error) {
      console.error("Error creating portfolio project:", error);
      res.status(500).json({ message: "Failed to create portfolio project" });
    }
  });

  app.put("/api/admin/portfolio-projects/:id", authenticateAdmin, async (req, res) => {
    try {
      const project = await storage.updatePortfolioProject(parseInt(req.params.id), req.body);
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
