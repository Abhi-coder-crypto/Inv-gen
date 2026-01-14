import { useState } from "react";
import { Link } from "wouter";
import { useClients, useCreateClient } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { Search, Plus, User, Phone, Mail, MapPin, Upload, Briefcase, Building2, X } from "lucide-react";
import type { InsertClient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Clients() {
  const { data: clients, isLoading } = useClients();
  const { mutate: createClient, isPending } = useCreateClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: { 
      name: "", 
      companyName: "",
      serviceName: "",
      email: "", 
      phone: "", 
      address: "", 
      gst: "",
      logoUrl: ""
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      form.setValue("logoUrl", url);
      toast({ title: "Success", description: "Logo uploaded successfully" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to upload logo",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: InsertClient) => {
    createClient(data, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  };

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">Clients</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your customer base and service partnerships.</p>
        </div>
        
        {!isOpen && (
          <Button 
            onClick={() => setIsOpen(true)}
            className="shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white px-6 h-11 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Add New Client
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="border-none shadow-xl animate-in slide-in-from-top-4 duration-500 overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">New Client Registration</CardTitle>
                <CardDescription className="font-medium">Enter the details for the new business partner.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="space-y-4">
                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-slate-500">Client Visuals</FormLabel>
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 transition-colors hover:border-primary/50 group">
                      <div className="h-32 w-32 border-2 border-white dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                        {form.watch("logoUrl") ? (
                          <img src={form.watch("logoUrl")!} alt="Client Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Building2 className="h-12 w-12 text-slate-200" />
                        )}
                      </div>
                      <div className="w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                          id="client-logo-upload"
                        />
                        <label 
                          htmlFor="client-logo-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <Upload className="h-4 w-4" />
                          {uploading ? "Processing..." : "Upload Logo"}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Contact Person Name</FormLabel>
                          <FormControl><Input {...field} className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Business Entity Name</FormLabel>
                          <FormControl><Input {...field} value={field.value || ''} className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serviceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Professional Service</FormLabel>
                          <FormControl><Input {...field} value={field.value || ''} placeholder="e.g. Enterprise Solutions" className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Tax Registration (GST)</FormLabel>
                          <FormControl><Input {...field} value={field.value || ''} className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Communication Email</FormLabel>
                          <FormControl><Input type="email" {...field} value={field.value || ''} className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Direct Phone Number</FormLabel>
                          <FormControl><Input {...field} value={field.value || ''} className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">Physical Address</FormLabel>
                            <FormControl><Input {...field} value={field.value || ''} className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="px-6 h-11 rounded-xl font-bold">Cancel</Button>
                  <Button type="submit" className="px-8 h-11 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95" disabled={isPending}>
                    {isPending ? "Syncing..." : "Confirm & Register Client"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search clients..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && [1,2,3].map(i => <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />)}
        
        {filteredClients?.map((client) => (
          <Link key={client.id || (client as any)._id} href={`/clients/${client.id || (client as any)._id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="w-full h-full object-contain" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{client.name}</h4>
                    {client.companyName && (
                      <p className="text-xs text-primary font-medium truncate">{client.companyName}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">ID: #{(client as any).customId || client.id}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {client.serviceName && (
                    <div className="flex items-center gap-2 text-foreground font-medium bg-primary/5 p-2 rounded-md">
                      <Briefcase className="h-3 w-3" /> {client.serviceName}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" /> {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" /> {client.phone}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
