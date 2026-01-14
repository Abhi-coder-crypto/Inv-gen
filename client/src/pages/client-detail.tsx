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
        <h2 className="text-2xl font-display font-bold">Client Profile</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                {client.logoUrl ? (
                  <img src={client.logoUrl} alt={client.name} className="w-full h-full object-contain" />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{client.name}</h3>
                {client.companyName && (
                  <p className="text-sm text-primary font-medium">{client.companyName}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t text-sm text-muted-foreground">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" /> {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4" /> {client.phone}
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5" /> <span className="flex-1 leading-snug">{client.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold">Invoices</h3>
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
                <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
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
    </div>
  );
}
