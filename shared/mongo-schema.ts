import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin", required: true },
  createdAt: { type: Date, default: Date.now },
});

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  gst: String,
  phone: String,
  email: String,
  website: String,
  bankName: String,
  accountNumber: String,
  ifsc: String,
  upiId: String,
  logoUrl: String,
  qrCodeUrl: String,
  paymentTerms: String,
});

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: String,
  serviceName: String,
  address: String,
  phone: String,
  email: String,
  gst: String,
  logoUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  dueDate: Date,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
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

export const User = mongoose.model("User", userSchema);
export const Company = mongoose.model("Company", companySchema);
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
