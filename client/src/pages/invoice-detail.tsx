import { useRoute, Link } from "wouter";
import { useInvoice } from "@/hooks/use-invoices";
import { useCompany } from "@/hooks/use-company";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download, Mail } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceDetail() {
  const [, params] = useRoute("/invoices/:id");
  const id = Number(params?.id);
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: company } = useCompany();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading invoice...</div>;
  if (!invoice) return <div className="p-8 text-center text-destructive">Invoice not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-['Inter',_sans-serif]">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-display font-bold">Invoice {invoice.invoiceNumber}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button>
            <Mail className="h-4 w-4 mr-2" /> Email Client
          </Button>
        </div>
      </div>

      <Card className="print-content overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-white p-10 border-b">
            <div className="flex justify-between items-start">
              <div className="flex gap-10 items-start">
                {company?.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="h-40 w-auto object-contain" />
                ) : (
                  <div className="h-24 w-24 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-4xl">
                    {company?.name ? company.name.charAt(0) : "I"}
                  </div>
                )}
                <div className="space-y-1.5">
                  <h1 className="text-3xl font-bold tracking-tight text-black">{company?.name || "Your Company"}</h1>
                  <div className="text-sm text-black space-y-0.5">
                    <p className="whitespace-pre-wrap max-w-sm">{company?.address}</p>
                    {company?.phone && <p>Phone: <span className="text-black font-medium">{company.phone}</span></p>}
                    {company?.email && <p>Email: <span className="text-black font-medium">{company.email}</span></p>}
                    {company?.website && <p className="text-black">{company.website}</p>}
                    {company?.gst && <p className="mt-2 inline-block px-2 py-0.5 bg-slate-200 text-black rounded text-xs font-bold uppercase">GST: {company.gst}</p>}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="mb-6">
                  <h2 className="text-5xl font-black text-slate-200 uppercase tracking-tighter leading-none">Invoice</h2>
                </div>
                <div className="space-y-1">
                  <p className="text-black text-xs uppercase font-bold tracking-wider">Invoice Number</p>
                  <p className="text-xl font-mono font-bold text-black">{invoice.invoiceNumber}</p>
                  <div className="pt-2 flex flex-col items-end gap-1 text-sm">
                    <p className="text-black">Issued: <span className="text-black font-semibold">{format(new Date(invoice.date), 'MMMM dd, yyyy')}</span></p>
                    <p className="text-black">Due: <span className="text-black font-semibold">{invoice.dueDate ? format(new Date(invoice.dueDate), 'MMMM dd, yyyy') : 'On Receipt'}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-10 grid md:grid-cols-2 gap-12 border-b">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-black uppercase tracking-[0.2em]">Bill To</h3>
              <div className="flex gap-10 items-start">
                {(invoice.client as any).logoUrl ? (
                  <img src={(invoice.client as any).logoUrl} alt={invoice.client.name} className="h-40 w-auto object-contain" />
                ) : (
                  <div className="h-24 w-24 bg-slate-100 rounded flex items-center justify-center text-black font-bold text-4xl border">
                    {invoice.client.name.charAt(0)}
                  </div>
                )}
                <div className="space-y-1">
                  <p className="font-bold text-xl text-black leading-none">{invoice.client.name}</p>
                  {(invoice.client as any).companyName && <p className="text-black font-bold">{(invoice.client as any).companyName}</p>}
                  {(invoice.client as any).serviceName && <p className="text-sm text-black italic">{(invoice.client as any).serviceName}</p>}
                  <div className="pt-2 text-sm text-black space-y-0.5">
                    {(invoice.client as any).address && <p className="whitespace-pre-wrap">{(invoice.client as any).address}</p>}
                    {(invoice.client as any).email && <p>{(invoice.client as any).email}</p>}
                    {(invoice.client as any).phone && <p>{(invoice.client as any).phone}</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-start space-y-4">
              <h3 className="text-xs font-black text-black uppercase tracking-[0.2em]">Status</h3>
              <div className={`px-4 py-1 rounded text-xs font-black uppercase tracking-widest border-2
                ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  invoice.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                  'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-10">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black text-black">
                  <th className="py-4 text-left font-black text-xs uppercase tracking-widest">Description</th>
                  <th className="py-4 text-center font-black text-xs uppercase tracking-widest w-24">Qty</th>
                  <th className="py-4 text-right font-black text-xs uppercase tracking-widest w-32">Rate</th>
                  <th className="py-4 text-right font-black text-xs uppercase tracking-widest w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-black">
                {invoice.items.map((item: any, index: number) => (
                  <tr key={index} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-5 font-semibold text-black">{item.description}</td>
                    <td className="py-5 text-center text-black font-medium">{item.quantity}</td>
                    <td className="py-5 text-right text-black font-medium">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-5 text-right font-bold text-black">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-10 pb-10 flex justify-end">
            <div className="w-72 space-y-3 bg-slate-50 p-6 rounded-lg border">
              <div className="flex justify-between text-sm">
                <span className="text-black font-medium uppercase tracking-wider text-[10px]">Subtotal</span>
                <span className="font-bold text-black">₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black font-medium uppercase tracking-wider text-[10px]">Tax</span>
                <span className="font-bold text-black">₹{invoice.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black font-medium uppercase tracking-wider text-[10px]">Discount</span>
                <span className="font-bold text-rose-600">-₹{invoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-baseline">
                <span className="text-black font-black uppercase tracking-widest text-xs">Total Amount</span>
                <span className="text-2xl font-black text-black font-mono">₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          {(company?.bankName || company?.qrCodeUrl || company?.paymentTerms || invoice.notes) && (
            <div className="p-10 border-t-2 border-black bg-slate-50">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] mb-4">Payment Information</h3>
                    <div className="flex gap-8 items-start">
                      {company?.qrCodeUrl && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-white p-3 rounded shadow-sm border">
                            <img src={company.qrCodeUrl} alt="Payment QR" className="h-32 w-32 object-contain" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-black">Scan to Pay</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {company?.bankName && <p className="text-black font-black text-lg leading-tight uppercase tracking-tight">{company.bankName}</p>}
                        <div className="space-y-1 text-sm text-black">
                          {company?.accountName && <p><span className="text-black font-bold uppercase text-[10px] tracking-widest block mb-0.5">Account Name</span><span className="text-black font-bold">{(company as any).accountName}</span></p>}
                          {company?.accountNumber && <p><span className="text-black font-bold uppercase text-[10px] tracking-widest block mb-0.5">Account Number</span><span className="text-black font-mono font-bold text-base leading-none">{company.accountNumber}</span></p>}
                          {(company as any)?.ifscCode && <p><span className="text-black font-bold uppercase text-[10px] tracking-widest block mb-0.5">IFSC Code</span><span className="text-black font-bold">{ (company as any).ifscCode }</span></p>}
                          {(company as any)?.upiId && <p><span className="text-black font-bold uppercase text-[10px] tracking-widest block mb-0.5">UPI ID</span><span className="text-black font-bold">{ (company as any).upiId }</span></p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  {invoice.notes && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-black uppercase tracking-[0.2em]">Notes</h4>
                      <p className="text-sm text-black font-medium leading-relaxed italic border-l-4 border-slate-200 pl-4">{invoice.notes}</p>
                    </div>
                  )}
                  {company?.paymentTerms && (
                    <div className="space-y-3 bg-white p-6 rounded border shadow-sm">
                      <h3 className="text-xs font-black text-black uppercase tracking-[0.2em]">Terms & Conditions</h3>
                      <p className="text-xs text-black leading-relaxed whitespace-pre-wrap">{company.paymentTerms}</p>
                    </div>
                  )}
                  <div className="pt-6 border-t border-slate-200 text-center md:text-right">
                    <p className="text-sm font-bold text-black">Thank you for your business!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
