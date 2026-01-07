import { db, pool } from "./db";
import {
  users, companies, clients, invoices,
  type User, type InsertUser,
  type Company, type InsertCompany,
  type Client, type InsertClient,
  type Invoice, type InsertInvoice,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Company
  async getCompany(): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).limit(1);
    return company;
  }

  async updateCompany(insertCompany: InsertCompany): Promise<Company> {
    const existing = await this.getCompany();
    if (existing) {
      const [updated] = await db.update(companies).set(insertCompany).where(eq(companies.id, existing.id)).returning();
      return updated;
    }
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const [updated] = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return updated;
  }

  // Invoices
  async getInvoices(): Promise<(Invoice & { client: Client })[]> {
    return await db.query.invoices.findMany({
      with: { client: true },
      orderBy: desc(invoices.createdAt),
    });
  }

  async getInvoice(id: number): Promise<(Invoice & { client: Client }) | undefined> {
    return await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: { client: true },
    });
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice as any).returning();
    return invoice;
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const [updated] = await db.update(invoices).set(updates as any).where(eq(invoices.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
