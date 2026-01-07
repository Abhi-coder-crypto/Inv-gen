import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // Protected middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

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
    const input = api.invoices.create.input.parse(req.body);
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
