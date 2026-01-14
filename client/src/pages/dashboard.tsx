import { useInvoices } from "@/hooks/use-invoices";
import { useClients } from "@/hooks/use-clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DollarSign, FileText, Users, Clock } from "lucide-react";
import { format, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const { data: clients, isLoading: loadingClients } = useClients();

  if (loadingInvoices || loadingClients) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  // Calculate Stats
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0) || 0;
  const pendingAmount = invoices?.reduce((sum, inv) => sum + (inv.status === 'pending' ? inv.total : 0), 0) || 0;
  const totalInvoices = invoices?.length || 0;
  const totalClients = clients?.length || 0;

  // Prepare Chart Data (Last 6 months revenue)
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i); // 5 months ago to now
    const monthKey = format(date, 'MMM');
    const monthYear = format(date, 'MMM yyyy');
    
    const monthlyTotal = invoices?.filter(inv => {
      const invDate = new Date(inv.date);
      return format(invDate, 'MMM yyyy') === monthYear && inv.status === 'paid';
    }).reduce((sum, inv) => sum + inv.total, 0) || 0;

    return { name: monthKey, total: monthlyTotal };
  });

  const StatCard = ({ title, value, desc }: any) => (
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-white dark:bg-slate-900 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          {desc && <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">{desc}</span>}
        </div>
        <h3 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">{value}</h3>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Track your business performance and revenue metrics in real-time.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border shadow-sm">
          <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            Live Updates
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          desc="Settled"
        />
        <StatCard 
          title="Outstanding" 
          value={`₹${pendingAmount.toLocaleString()}`} 
          desc="Invoiced"
        />
        <StatCard 
          title="Documents" 
          value={totalInvoices} 
          desc="Generated"
        />
        <StatCard 
          title="Partner Clients" 
          value={totalClients} 
          desc="Registered"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Revenue Growth</CardTitle>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Monthly Paid</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)', radius: 4 }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--primary))" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-sm flex flex-col">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b pb-4">
            <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="space-y-5">
              {invoices?.slice(0, 6).map((invoice: any, index: number) => (
                <div key={invoice.id || index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors shadow-sm
                      ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 
                        invoice.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 
                        'bg-slate-100 text-slate-500'}`}>
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{invoice.client?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">₹{invoice.total.toLocaleString()}</p>
                    <div className="flex justify-end mt-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest border
                        ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                          invoice.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                          'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {invoices?.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">No recent transactions to display.</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t mt-auto">
            <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5" asChild>
              <Link href="/invoices">View All Activity</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
