import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertCompany, type Company } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCompany() {
  return useQuery({
    queryKey: [api.company.get.path],
    queryFn: async () => {
      const res = await fetch(api.company.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch company details");
      return await res.json() as Company;
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCompany) => {
      const res = await fetch(api.company.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update company details");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.company.get.path], data);
      toast({ title: "Success", description: "Company profile updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
