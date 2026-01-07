import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage_config,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WEBP are allowed."));
    }
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  }, express.static(uploadDir));

  // Protected middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Upload Route
  app.post("/api/upload", isAuthenticated, upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Company
  app.get(api.company.get.path, isAuthenticated, async (req, res) => {
    const company = await storage.getCompany();
    if (!company) return res.status(404).json({ message: "Company profile not set" });
    res.json(company);
  });

  app.post(api.company.update.path, isAuthenticated, async (req, res) => {
    const input = api.company.update.input.parse(req.body);
    const company = await storage.updateCompany(input);
    res.json(company);
  });

  // Clients
  app.get(api.clients.list.path, isAuthenticated, async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get(api.clients.get.path, isAuthenticated, async (req, res) => {
    const client = await storage.getClient(Number(req.params.id));
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  });

  app.post(api.clients.create.path, isAuthenticated, async (req, res) => {
    const input = api.clients.create.input.parse(req.body);
    const client = await storage.createClient(input);
    res.status(201).json(client);
  });

  app.put(api.clients.update.path, isAuthenticated, async (req, res) => {
    const input = api.clients.update.input.parse(req.body);
    const client = await storage.updateClient(Number(req.params.id), input);
    res.json(client);
  });

  // Invoices
  app.get(api.invoices.list.path, isAuthenticated, async (req, res) => {
    const invoices = await storage.getInvoices();
    res.json(invoices);
  });

  app.get(api.invoices.get.path, isAuthenticated, async (req, res) => {
    const invoice = await storage.getInvoice(Number(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  });

  app.post(api.invoices.create.path, isAuthenticated, async (req, res) => {
    const rawInput = req.body;
    if (typeof rawInput.date === "string") rawInput.date = new Date(rawInput.date);
    if (typeof rawInput.dueDate === "string") rawInput.dueDate = new Date(rawInput.dueDate);
    
    const input = api.invoices.create.input.parse(rawInput);
    const invoice = await storage.createInvoice(input);
    res.status(201).json(invoice);
  });

  app.put(api.invoices.update.path, isAuthenticated, async (req, res) => {
    const input = api.invoices.update.input.parse(req.body);
    const invoice = await storage.updateInvoice(Number(req.params.id), input);
    res.json(invoice);
  });

  // Seed Data
  if ((await storage.getClients()).length === 0) {
    console.log("Seeding data...");
    await storage.createClient({
      name: "Acme Corp",
      address: "123 Business Rd",
      phone: "555-0123",
      email: "contact@acme.com",
      gst: "GST12345",
      logoUrl: "https://placehold.co/100x100?text=Acme",
    });
  }

  return httpServer;
}
