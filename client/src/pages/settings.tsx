import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema } from "@shared/schema";
import type { InsertCompany } from "@shared/schema";
import { useEffect, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: company, isLoading } = useCompany();
  const { mutate: updateCompany, isPending } = useUpdateCompany();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);

  const form = useForm<InsertCompany>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: "", address: "", email: "", phone: "", website: "",
      gst: "", bankName: "", accountNumber: "", ifsc: "", upiId: "",
      logoUrl: "", qrCodeUrl: "", paymentTerms: ""
    }
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        address: company.address,
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        gst: company.gst || "",
        bankName: company.bankName || "",
        accountNumber: company.accountNumber || "",
        ifsc: company.ifsc || "",
        upiId: company.upiId || "",
        logoUrl: company.logoUrl || "",
        qrCodeUrl: company.qrCodeUrl || "",
        paymentTerms: company.paymentTerms || "",
      });
    }
  }, [company, form]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "qrCodeUrl") => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      form.setValue(field, url);
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to upload image. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = (data: InsertCompany) => {
    updateCompany(data);
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your company profile and preferences.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>These details will appear on your invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-6">
                <FormLabel>Company Logo</FormLabel>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-24 w-24 border rounded bg-muted flex items-center justify-center overflow-hidden">
                    {form.watch("logoUrl") ? (
                      <div className="relative group w-full h-full">
                        <img src={form.watch("logoUrl")!} alt="Logo" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => form.setValue("logoUrl", "")}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "logoUrl")}
                      disabled={!!uploading}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {uploading === "logoUrl" ? "Uploading..." : "Recommended size: 200x200px. Max 5MB."}
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST / Tax ID</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Payment information for your clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ifsc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC / SWIFT Code</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6">
                <FormLabel>Payment QR Code</FormLabel>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-32 w-32 border rounded bg-muted flex items-center justify-center overflow-hidden">
                    {form.watch("qrCodeUrl") ? (
                      <div className="relative group w-full h-full">
                        <img src={form.watch("qrCodeUrl")!} alt="QR Code" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => form.setValue("qrCodeUrl", "")}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "qrCodeUrl")}
                      disabled={!!uploading}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {uploading === "qrCodeUrl" ? "Uploading..." : "Upload your UPI or bank QR code. Max 5MB."}
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms & Conditions</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field} 
                        value={field.value || ''} 
                        placeholder="e.g. Please pay within 15 days. Make cheques payable to..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending || !!uploading} className="w-full md:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
