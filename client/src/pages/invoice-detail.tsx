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
              <div className="space-y-1">
                 {/* Company Logo placeholder - Use Initials if no logo */}
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl mb-4">
                  {company?.name ? company.name.charAt(0) : "I"}
                </div>
                <h1 className="text-2xl font-bold text-primary">{company?.name || "Your Company"}</h1>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{company?.address}</p>
                <p className="text-sm text-muted-foreground">{company?.email}</p>
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
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Bill To</h3>
              <p className="font-bold text-lg">{invoice.client.name}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.client.address}</p>
              <p className="text-sm text-muted-foreground mt-1">{invoice.client.email}</p>
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
                {invoice.items.map((item, index) => (
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
          {(company?.bankName || invoice.notes) && (
            <div className="bg-muted/30 p-8 border-t border-border">
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                {company?.bankName && (
                  <div>
                    <h4 className="font-bold mb-2">Payment Details</h4>
                    <p><span className="text-muted-foreground">Bank:</span> {company.bankName}</p>
                    <p><span className="text-muted-foreground">Account:</span> {company.accountNumber}</p>
                    <p><span className="text-muted-foreground">IFSC:</span> {company.ifsc}</p>
                  </div>
                )}
                {invoice.notes && (
                  <div>
                    <h4 className="font-bold mb-2">Notes</h4>
                    <p className="text-muted-foreground">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
