import { useRoute, Link } from "wouter";
import { useClients } from "@/hooks/use-clients";
import { useInvoices } from "@/hooks/use-invoices";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, Mail, MapPin, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ClientDetail() {
  const [, params] = useRoute("/clients/:id");
  const id = params?.id;
  const { data: clients } = useClients();
  const { data: invoices } = useInvoices();

  const client = clients?.find(c => (c as any)._id === id || String(c.id) === String(id));
  const clientInvoices = invoices?.filter(inv => String(inv.clientId) === String(id) || (inv as any).clientId?._id === id);

  if (!client) return <div className="p-8 text-center animate-pulse">Loading client details...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-2xl font-display font-bold">{client.name}'s Invoices</h2>
      </div>

      <div className="space-y-4">
        {clientInvoices?.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No invoices found for this client.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {clientInvoices?.map((invoice) => (
              <Link key={invoice.id || (invoice as any)._id} href={`/invoices/${invoice.id || (invoice as any)._id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <p className="font-bold text-sm">₹{invoice.total.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                        ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-700 border-green-200' : 
                          invoice.status === 'pending' ? 'bg-amber-500/10 text-amber-700 border-amber-200' : 
                          'bg-red-500/10 text-red-700 border-red-200'}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
