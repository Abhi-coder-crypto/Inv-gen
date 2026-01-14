import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import { User, Company, Client, Invoice } from "@shared/mongo-schema";
import type { IStorage } from "./storage";

export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    });
    this.initAdmin();
  }

  private async initAdmin() {
    const admin = await User.findOne({ username: "admin" });
    if (!admin) {
      await User.create({
        username: "admin",
        password: "admin123", // In a real app, this should be hashed
        role: "admin"
      });
    }
  }

  async getUser(id: any): Promise<any> {
    return User.findById(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return User.findOne({ username });
  }

  async createUser(user: any): Promise<any> {
    return User.create(user);
  }

  async getCompany(): Promise<any> {
    return Company.findOne();
  }

  async updateCompany(company: any): Promise<any> {
    const existing = await this.getCompany();
    if (existing) {
      return Company.findByIdAndUpdate(existing._id, company, { new: true });
    }
    return Company.create(company);
  }

  async getClients(): Promise<any[]> {
    return Client.find().sort({ createdAt: -1 });
  }

  async getClient(id: any): Promise<any> {
    return Client.findById(id);
  }

  async createClient(client: any): Promise<any> {
    return Client.create(client);
  }

  async updateClient(id: any, client: any): Promise<any> {
    return Client.findByIdAndUpdate(id, client, { new: true });
  }

  async getInvoices(): Promise<any[]> {
    const invoices = await Invoice.find().populate('clientId').sort({ createdAt: -1 });
    return invoices.map(inv => ({
      ...inv.toObject(),
      client: inv.clientId,
      id: inv._id
    }));
  }

  async getInvoice(id: any): Promise<any> {
    const invoice = await Invoice.findById(id).populate('clientId');
    if (!invoice) return undefined;
    return {
      ...invoice.toObject(),
      client: invoice.clientId,
      id: invoice._id
    };
  }

  async createInvoice(invoice: any): Promise<any> {
    return Invoice.create(invoice);
  }

  async updateInvoice(id: any, invoice: any): Promise<any> {
    return Invoice.findByIdAndUpdate(id, invoice, { new: true });
  }

  async deleteInvoice(id: any): Promise<boolean> {
    const result = await Invoice.findByIdAndDelete(id);
    return !!result;
  }
}

export const storage = new MongoStorage();
