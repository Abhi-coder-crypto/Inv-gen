import { Link } from "wouter";
import { useInvoices, useDeleteInvoice } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: deleteInvoice } = useDeleteInvoice();
  const [search, setSearch] = useState("");

  const filteredInvoices = invoices?.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.client?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Invoices</h2>
          <p className="text-muted-foreground mt-1">Manage and track your billings.</p>
        </div>
        <Link href="/invoices/new">
          <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoices..." 
            className="pl-9 bg-card border-border/50 focus:border-primary focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices?.map((invoice) => {
            const invoiceId = invoice.id || (invoice as any)._id;
            return (
              <div key={invoiceId} className="relative group">
                <Link href={`/invoices/${invoiceId}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer group pr-16">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{invoice.client?.name}</h4>
                          <p className="text-sm text-muted-foreground">{invoice.invoiceNumber} • {format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="font-bold text-foreground">₹{invoice.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">INR</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border
                          ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-700 border-green-200' : 
                            invoice.status === 'pending' ? 'bg-amber-500/10 text-amber-700 border-amber-200' : 
                            'bg-red-500/10 text-red-700 border-red-200'}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this invoice? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteInvoice(invoiceId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}

          {filteredInvoices?.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No invoices found</h3>
              <p className="text-muted-foreground">Create a new invoice to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
