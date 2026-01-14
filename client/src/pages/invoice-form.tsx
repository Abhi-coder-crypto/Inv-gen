import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvoiceSchema } from "@shared/schema";
import { useCreateInvoice, useInvoices } from "@/hooks/use-invoices";
import { useClients } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { z } from "zod";

// Extend schema to ensure numeric fields are coerced
const formSchema = insertInvoiceSchema.extend({
  items: z.array(z.object({
    description: z.string().min(1, "Description required"),
    quantity: z.coerce.number().min(1),
    rate: z.coerce.number().min(0),
    amount: z.coerce.number()
  })),
  tax: z.coerce.number().default(0),
  discount: z.coerce.number().default(0),
  subtotal: z.coerce.number(),
  total: z.coerce.number(),
  clientId: z.string().min(1, "Client required"),
  date: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
});

type FormValues = Omit<z.infer<typeof formSchema>, 'clientId'> & { clientId: any };

export default function InvoiceForm() {
  const [, setLocation] = useLocation();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { data: clients } = useClients();
  const { data: invoices } = useInvoices();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: "",
      description: "",
      date: new Date(),
      status: 'pending',
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      tax: 0,
      discount: 0,
      subtotal: 0,
      total: 0,
    }
  });

  const selectedClientId = form.watch("clientId");

  useEffect(() => {
    if (!selectedClientId || !clients || !invoices) return;

    const client = clients.find(c => (c.id || (c as any)._id).toString() === selectedClientId.toString());
    if (!client) return;

    const clientInvoices = invoices.filter(inv => 
      (inv.clientId?.toString() === selectedClientId.toString()) || 
      ((inv as any).clientId?._id?.toString() === selectedClientId.toString())
    );

    const clientPart = (client as any).customId || `client-${(client.id || (client as any)._id).toString().slice(-3)}`;
    const nextNumber = (clientInvoices.length + 1).toString().padStart(3, '0');
    const invoiceNumber = `${clientPart}-Inv-${nextNumber}`;

    form.setValue("invoiceNumber", invoiceNumber);
  }, [selectedClientId, clients, invoices, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Calculations
  const items = form.watch("items");
  const tax = form.watch("tax");
  const discount = form.watch("discount");

  useEffect(() => {
    if (!items) return;
    const subtotal = items.reduce((sum, item) => {
      const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      return sum + amount;
    }, 0);
    
    const taxAmount = Number(tax) || 0;
    const discountAmount = Number(discount) || 0;
    const total = subtotal + taxAmount - discountAmount;

    const currentValues = form.getValues();
    const numSubtotal = Number(subtotal) || 0;
    const numTotal = Number(total) || 0;

    if (Math.abs((Number(currentValues.subtotal) || 0) - numSubtotal) > 0.01) {
      form.setValue("subtotal", numSubtotal, { shouldValidate: true });
    }
    if (Math.abs((Number(currentValues.total) || 0) - numTotal) > 0.01) {
      form.setValue("total", numTotal, { shouldValidate: true });
    }
    
    items.forEach((item, index) => {
      const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const currentItemAmount = Number(form.getValues(`items.${index}.amount`)) || 0;
      if (Math.abs(currentItemAmount - amount) > 0.01) {
        form.setValue(`items.${index}.amount`, amount, { shouldValidate: true });
      }
    });
  }, [items, tax, discount, form.setValue]);

  const onSubmit = (data: FormValues) => {
    createInvoice(data);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/invoices")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-display font-bold">New Invoice</h2>
          <p className="text-muted-foreground">Create a new invoice for your client.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(val)} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => {
                          const clientId = client.id || (client as any)._id;
                          return (
                            <SelectItem key={clientId.toString()} value={clientId.toString()}>
                              {client.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Service Fee" 
                        className="resize-none"
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Item description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.rate`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Rate</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="w-32 pb-2 text-right font-medium">
                    ₹{((Number(form.watch(`items.${index}.quantity`)) || 0) * (Number(form.watch(`items.${index}.rate`)) || 0)).toFixed(2)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="mb-0.5"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{(Number(form.watch("subtotal")) || 0).toFixed(2)}</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel className="text-sm font-normal text-muted-foreground">Tax</FormLabel>
                        <FormControl>
                          <Input className="w-24 h-8 text-right" type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel className="text-sm font-normal text-muted-foreground">Discount</FormLabel>
                        <FormControl>
                          <Input className="w-24 h-8 text-right" type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{(Number(form.watch("total")) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
             <Button type="button" variant="outline" onClick={() => setLocation("/invoices")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[120px]">
              {isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Invoice</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
