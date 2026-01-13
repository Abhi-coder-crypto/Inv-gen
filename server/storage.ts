import fs from "fs";
import path from "path";
import {
  users, companies, clients, invoices,
  type User, type InsertUser,
  type Company, type InsertCompany,
  type Client, type InsertClient,
  type Invoice, type InsertInvoice,
} from "@shared/schema";
import session from "express-session";
import MemoryStoreFactory from "memorystore";

const MemoryStore = MemoryStoreFactory(session);

export interface IStorage {
  sessionStore: session.Store;
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Company
  getCompany(): Promise<Company | undefined>;
  updateCompany(company: InsertCompany): Promise<Company>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;

  // Invoices
  getInvoices(): Promise<(Invoice & { client: Client })[]>;
  getInvoice(id: number): Promise<(Invoice & { client: Client }) | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private clients: Map<number, Client>;
  private invoices: Map<number, Invoice>;
  sessionStore: session.Store;
  currentId: { [key: string]: number };
  private dataFilePath: string;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.clients = new Map();
    this.invoices = new Map();
    this.currentId = { users: 1, companies: 1, clients: 1, invoices: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.dataFilePath = path.join(process.cwd(), "data.json");
    
    this.loadData();

    // Ensure admin user exists if no users loaded
    if (this.users.size === 0) {
      const adminUser: User = {
        id: this.currentId.users++,
        username: "admin",
        password: "admin123",
        role: "admin",
        createdAt: new Date()
      };
      this.users.set(adminUser.id, adminUser);
      this.saveData();
    }
  }

  private loadData() {
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const rawData = fs.readFileSync(this.dataFilePath, "utf8");
        const data = JSON.parse(rawData);
        
        // Helper to revive dates
        const revive = (obj: any) => {
          if (obj && typeof obj === 'object') {
            for (const key in obj) {
              if (typeof obj[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj[key])) {
                obj[key] = new Date(obj[key]);
              } else if (typeof obj[key] === 'object') {
                revive(obj[key]);
              }
            }
          }
          return obj;
        };

        const revivedData = revive(data);
        
        if (revivedData.users) revivedData.users.forEach((u: User) => this.users.set(u.id, u));
        if (revivedData.companies) revivedData.companies.forEach((c: Company) => this.companies.set(c.id, c));
        if (revivedData.clients) revivedData.clients.forEach((c: Client) => this.clients.set(c.id, c));
        if (revivedData.invoices) revivedData.invoices.forEach((i: Invoice) => this.invoices.set(i.id, i));
        if (revivedData.currentId) this.currentId = revivedData.currentId;
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    }
  }

  private saveData() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        companies: Array.from(this.companies.values()),
        clients: Array.from(this.clients.values()),
        invoices: Array.from(this.invoices.values()),
        currentId: this.currentId
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "admin",
      createdAt: new Date()
    };
    this.users.set(id, user);
    this.saveData();
    return user;
  }

  async getCompany(): Promise<Company | undefined> {
    return Array.from(this.companies.values())[0];
  }

  async updateCompany(insertCompany: InsertCompany): Promise<Company> {
    const existing = await this.getCompany();
    let result: Company;
    if (existing) {
      result = { 
        ...existing, 
        ...insertCompany,
        gst: insertCompany.gst ?? null,
        phone: insertCompany.phone ?? null,
        email: insertCompany.email ?? null,
        website: insertCompany.website ?? null,
        bankName: insertCompany.bankName ?? null,
        accountNumber: insertCompany.accountNumber ?? null,
        qrCodeUrl: insertCompany.qrCodeUrl ?? null,
        logoUrl: insertCompany.logoUrl ?? null,
        paymentTerms: insertCompany.paymentTerms ?? null,
        ifsc: (insertCompany as any).ifsc ?? null,
        upiId: (insertCompany as any).upiId ?? null
      };
      this.companies.set(existing.id, result);
    } else {
      const id = this.currentId.companies++;
      result = { 
        ...insertCompany, 
        id,
        gst: insertCompany.gst ?? null,
        phone: insertCompany.phone ?? null,
        email: insertCompany.email ?? null,
        website: insertCompany.website ?? null,
        bankName: insertCompany.bankName ?? null,
        accountNumber: insertCompany.accountNumber ?? null,
        qrCodeUrl: insertCompany.qrCodeUrl ?? null,
        logoUrl: insertCompany.logoUrl ?? null,
        paymentTerms: insertCompany.paymentTerms ?? null,
        ifsc: (insertCompany as any).ifsc ?? null,
        upiId: (insertCompany as any).upiId ?? null
      };
      this.companies.set(id, result);
    }
    this.saveData();
    return result;
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentId.clients++;
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: new Date(),
      logoUrl: insertClient.logoUrl || null,
      gst: insertClient.gst || null,
      address: insertClient.address || null,
      phone: insertClient.phone || null,
      email: insertClient.email || null,
      companyName: insertClient.companyName || null,
      serviceName: insertClient.serviceName || null
    };
    this.clients.set(id, client);
    this.saveData();
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const client = this.clients.get(id);
    if (!client) throw new Error("Client not found");
    const updated = { ...client, ...updates } as Client;
    this.clients.set(id, updated);
    this.saveData();
    return updated;
  }

  async getInvoices(): Promise<(Invoice & { client: Client })[]> {
    return Array.from(this.invoices.values())
      .map(invoice => ({
        ...invoice,
        client: this.clients.get(invoice.clientId)!
      }))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getInvoice(id: number): Promise<(Invoice & { client: Client }) | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    const client = this.clients.get(invoice.clientId);
    if (!client) return undefined;
    return { ...invoice, client };
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentId.invoices++;
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      createdAt: new Date(),
      status: insertInvoice.status || 'pending',
      dueDate: insertInvoice.dueDate || null,
      notes: insertInvoice.notes || null,
      tax: insertInvoice.tax ? Number(insertInvoice.tax) : 0,
      discount: insertInvoice.discount ? Number(insertInvoice.discount) : 0,
      subtotal: insertInvoice.subtotal ? Number(insertInvoice.subtotal) : 0,
      total: insertInvoice.total ? Number(insertInvoice.total) : 0,
      items: (insertInvoice.items as any) || []
    };
    this.invoices.set(id, invoice);
    this.saveData();
    return invoice;
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const invoice = this.invoices.get(id);
    if (!invoice) throw new Error("Invoice not found");
    const updated = { ...invoice, ...updates } as Invoice;
    this.invoices.set(id, updated);
    this.saveData();
    return updated;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const deleted = this.invoices.delete(id);
    if (deleted) this.saveData();
    return deleted;
  }
}

export const storage = new MemStorage();
