import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Admin, Client, Invoice } from "@shared/mongo-schema";
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
    try {
      const admin = await Admin.findOne({ username: "admin" });
      if (!admin) {
        // Import hashing function from auth to store password securely
        const { hashPassword } = await import("./auth");
        const hashedPassword = await hashPassword("admin123");
        await Admin.create({
          username: "admin",
          password: hashedPassword,
          role: "admin"
        });
      }
    } catch (err) {
      console.error("Admin init error:", err);
    }
  }

  async getUser(id: any): Promise<any> {
    return Admin.findById(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Admin.findOne({ username });
  }

  async createUser(user: any): Promise<any> {
    return Admin.create(user);
  }

  async getCompany(): Promise<any> {
    return Admin.findOne({ role: "admin" });
  }

  async updateCompany(company: any): Promise<any> {
    return Admin.findOneAndUpdate({ role: "admin" }, company, { new: true });
  }

  async getClients(): Promise<any[]> {
    return Client.find().populate('invoices').sort({ createdAt: -1 });
  }

  async getClient(id: any): Promise<any> {
    return Client.findById(id).populate('invoices');
  }

  async createClient(clientData: any): Promise<any> {
    const count = await Client.countDocuments();
    const customId = `client-${(count + 1).toString().padStart(3, '0')}`;
    return Client.create({ ...clientData, customId });
  }

  async updateClient(id: any, clientData: any): Promise<any> {
    return Client.findByIdAndUpdate(id, clientData, { new: true });
  }

  async getInvoices(): Promise<any[]> {
    return Invoice.find().sort({ createdAt: -1 });
  }

  async getInvoice(id: any): Promise<any> {
    return Invoice.findById(id);
  }

  async createInvoice(invoiceData: any): Promise<any> {
    const client = await Client.findById(invoiceData.clientId);
    if (!client) throw new Error("Client not found");

    // Generate sequential invoice number: client-001-Inv-001
    const invoiceCount = await Invoice.countDocuments({ clientId: client._id });
    const clientPart = client.customId || `client-${client._id.toString().slice(-3)}`;
    const invoiceNumber = `${clientPart}-Inv-${(invoiceCount + 1).toString().padStart(3, '0')}`;

    const invoice = await Invoice.create({
      ...invoiceData,
      invoiceNumber,
      client: client.toObject(),
      companyName: client.companyName || client.name,
      clientName: client.name
    });

    await Client.findByIdAndUpdate(client._id, {
      $push: { invoices: invoice._id }
    });

    return invoice;
  }

  async updateInvoice(id: any, invoiceData: any): Promise<any> {
    return Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
  }

  async deleteInvoice(id: any): Promise<boolean> {
    const invoice = await Invoice.findById(id);
    if (!invoice) return false;

    await Client.findByIdAndUpdate(invoice.clientId, {
      $pull: { invoices: id }
    });

    await Invoice.findByIdAndDelete(id);
    return true;
  }
}

export const storage = new MongoStorage();
