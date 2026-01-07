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
    <div className="space-y-6 max-w-4xl mx-auto">
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
          <div className="bg-primary/5 p-8 border-b border-border/50">
            <div className="flex justify-between items-start">
              <div className="flex gap-6 items-start">
                {company?.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="h-20 w-auto object-contain bg-white p-1 rounded border" />
                ) : (
                  <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-2xl">
                    {company?.name ? company.name.charAt(0) : "I"}
                  </div>
                )}
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-primary">{company?.name || "Your Company"}</h1>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap max-w-xs">{company?.address}</p>
                  {company?.phone && <p className="text-sm text-muted-foreground">Phone: {company.phone}</p>}
                  {company?.email && <p className="text-sm text-muted-foreground">{company.email}</p>}
                  {company?.website && <p className="text-sm text-muted-foreground">{company.website}</p>}
                  {company?.gst && <p className="text-sm text-muted-foreground font-medium uppercase">GST: {company.gst}</p>}
                </div>
              </div>
              <div className="text-right space-y-1">
                <h2 className="text-4xl font-display font-bold text-foreground/20 tracking-wider">INVOICE</h2>
                <p className="font-semibold text-lg">{invoice.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">Date: {format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
                <p className="text-sm text-muted-foreground">Due: {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'On Receipt'}</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              {invoice.client.logoUrl ? (
                <img src={invoice.client.logoUrl} alt={invoice.client.name} className="h-14 w-14 object-contain bg-white p-1 rounded border" />
              ) : (
                <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-bold text-xl">
                  {invoice.client.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wide">Bill To</h3>
                <p className="font-bold text-lg leading-tight">{invoice.client.name}</p>
                {(invoice.client as any).companyName && <p className="text-sm font-medium text-primary">{(invoice.client as any).companyName}</p>}
                {(invoice.client as any).serviceName && <p className="text-xs italic text-muted-foreground mb-1">Service: {(invoice.client as any).serviceName}</p>}
                {(invoice.client as any).address && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(invoice.client as any).address}</p>}
                {(invoice.client as any).email && <p className="text-sm text-muted-foreground mt-1">{(invoice.client as any).email}</p>}
                {(invoice.client as any).phone && <p className="text-sm text-muted-foreground">{(invoice.client as any).phone}</p>}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Payment Status</h3>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold capitalize border
                ${invoice.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 
                  invoice.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                  'bg-red-100 text-red-700 border-red-200'}`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-3 text-left font-medium">Description</th>
                  <th className="py-3 text-center font-medium w-24">Qty</th>
                  <th className="py-3 text-right font-medium w-32">Rate</th>
                  <th className="py-3 text-right font-medium w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoice.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="py-4 font-medium">{item.description}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">${item.rate.toFixed(2)}</td>
                    <td className="py-4 text-right font-bold">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-8 flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span>-${invoice.discount.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          {(company?.bankName || company?.qrCodeUrl || company?.paymentTerms || invoice.notes) && (
            <div className="p-8 border-t border-border/50 bg-secondary/5 mt-auto">
              <div className="grid md:grid-cols-2 gap-8 items-end">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex gap-4 items-start">
                      {company?.qrCodeUrl && (
                        <div className="bg-white p-2 rounded-lg border shadow-sm">
                          <img src={company.qrCodeUrl} alt="Payment QR" className="h-28 w-28 object-contain" />
                          <p className="text-[10px] text-center text-muted-foreground mt-1 font-medium">Scan to Pay</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        {company?.bankName && <p className="text-sm font-semibold text-primary">{company.bankName}</p>}
                        {company?.accountName && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Acc Name:</span> {company.accountName}</p>}
                        {company?.accountNumber && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Acc No:</span> {company.accountNumber}</p>}
                        {(company as any)?.ifscCode && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">IFSC:</span> {(company as any).ifscCode}</p>}
                        {(company as any)?.upiId && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">UPI:</span> {(company as any).upiId}</p>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {invoice.notes && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">Notes</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                  )}
                  {company?.paymentTerms && (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Terms & Conditions</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{company.paymentTerms}</p>
                    </div>
                  )}
                  <div className="text-right pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground italic">Thank you for your business!</p>
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
