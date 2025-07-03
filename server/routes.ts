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

// İletişim talepleri için sahte depolama
const contactRequests: any[] = [];

export async function registerRoutes(app: Express): Promise<Server> {
  // İletişim formu gönderimi endpoint'i
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactRequestSchema.parse(req.body);
      
      // Gerçek bir uygulamada bu veritabanına kaydedilir
      const contactRequest = {
        id: contactRequests.length + 1,
        ...validatedData,
        createdAt: new Date().toISOString(),
      };
      
      contactRequests.push(contactRequest);
      
      res.json({ 
        success: true, 
        message: "Talebiniz başarıyla alındı.",
        id: contactRequest.id 
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

  // İletişim taleplerini getir (admin amaçlı)
  app.get("/api/contact", async (req, res) => {
    res.json(contactRequests);
  });

  // AI Tabela üretimi endpoint'i
  app.post("/api/ai-signage/generate", async (req, res) => {
    try {
      const { text, type, style, colors, building_description, prompt } = req.body;
      
      console.log("Received signage generation request:", { text, type, style, colors });
      
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
      console.error("AI signage generation error:", error);
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
      console.error("Image analysis error:", error);
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
      
      // Eğer varsa data:image/jpeg;base64, önekini kaldır
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const analysis = await analyzeImageForSignage(base64Image);
      
      res.json({ 
        success: true, 
        data: analysis
      });
    } catch (error) {
      console.error("Reference image analysis error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Referans görsel analizi yapılırken hata oluştu." 
      });
    }
  });

  // Proje yönetimi için admin rotaları
  app.get("/api/admin/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/admin/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.delete("/api/admin/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Cari hesaplar için admin rotaları
  app.get("/api/admin/accounts", async (req, res) => {
    try {
      const accounts = await storage.getCurrentAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/admin/accounts", async (req, res) => {
    try {
      const validatedData = insertCurrentAccountSchema.parse(req.body);
      const account = await storage.createCurrentAccount(validatedData);
      res.json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // İşlemler için admin rotaları
  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const transactions = await storage.getAccountTransactions(accountId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/admin/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
