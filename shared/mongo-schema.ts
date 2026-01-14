import mongoose from "mongoose";

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Client Schema (Embedded in Invoices or referenced)
const clientSchema = new mongoose.Schema({
  customId: { type: String, unique: true }, // For "client-001" format
  name: { type: String, required: true },
  companyName: String,
  serviceName: String,
  address: String,
  phone: String,
  email: String,
  gst: String,
  logoUrl: String,
  createdAt: { type: Date, default: Date.now },
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }]
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  dueDate: Date,
  client: { 
    type: clientSchema, // Embedding client info directly as requested
    required: true 
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  companyName: String,
  clientName: String,
  status: { type: String, default: "pending", required: true },
  items: [{
    description: String,
    quantity: Number,
    rate: Number,
    amount: Number
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0, required: true },
  discount: { type: Number, default: 0, required: true },
  total: { type: Number, required: true },
  description: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

export const Admin = mongoose.model("Admin", adminSchema);
export const Client = mongoose.model("Client", clientSchema);
export const Invoice = mongoose.model("Invoice", invoiceSchema);

// Existing types for compatibility
export type UserType = any;
export type InsertUser = any;
export type CompanyType = any;
export type InsertCompany = any;
export type ClientType = any;
export type InsertClient = any;
export type InvoiceType = any;
export type InsertInvoice = any;
export type InvoiceItem = { description: string; quantity: number; rate: number; amount: number };
