import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { insertContactRequestSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
