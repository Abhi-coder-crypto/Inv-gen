import { useInvoices } from "@/hooks/use-invoices";
import { useClients } from "@/hooks/use-clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DollarSign, FileText, Users, Clock, TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";

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

  const StatCard = ({ title, value, icon: Icon, desc, trend }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <h3 className="text-2xl font-bold font-display tracking-tight">{value}</h3>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your financial performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={DollarSign}
          desc="Lifetime earnings"
        />
        <StatCard 
          title="Pending" 
          value={`₹${pendingAmount.toLocaleString()}`} 
          icon={Clock}
          desc="Unpaid invoices"
        />
        <StatCard 
          title="Invoices" 
          value={totalInvoices} 
          icon={FileText}
          desc="Total generated"
        />
        <StatCard 
          title="Clients" 
          value={totalClients} 
          icon={Users}
          desc="Active customers"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices?.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{invoice.client?.name}</p>
                    <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{invoice.total.toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize 
                      ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        invoice.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
              {invoices?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
