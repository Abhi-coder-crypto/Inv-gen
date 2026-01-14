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
    const admin = await Admin.findOne({ username: "admin" });
    if (!admin) {
      await Admin.create({
        username: "admin",
        password: "admin123",
        role: "admin"
      });
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
    // For this specific structure, we'll keep company details separate or treat Admin as the company owner
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
    return Client.create(clientData);
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

    const invoice = await Invoice.create({
      ...invoiceData,
      client: client.toObject() // Embed client in invoice
    });

    // Add invoice reference to client
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

    // Remove reference from client
    await Client.findByIdAndUpdate(invoice.clientId, {
      $pull: { invoices: id }
    });

    await Invoice.findByIdAndDelete(id);
    return true;
  }
}

export const storage = new MongoStorage();
