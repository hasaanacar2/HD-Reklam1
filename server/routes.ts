import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { insertContactRequestSchema } from "@shared/schema";
import { generateSignageDesign, analyzeImageForSignage } from "./ai-service";

// Mock storage for contact requests
const contactRequests: any[] = [];

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactRequestSchema.parse(req.body);
      
      // In a real application, this would be saved to a database
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

  // Get contact requests (for admin purposes)
  app.get("/api/contact", async (req, res) => {
    res.json(contactRequests);
  });

  // AI Signage generation endpoint
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

  // Image analysis endpoint
  app.post("/api/ai-signage/analyze", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ 
          success: false, 
          message: "Görsel gerekli." 
        });
      }
      
      // Remove data:image/jpeg;base64, prefix if present
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

  const httpServer = createServer(app);
  return httpServer;
}
