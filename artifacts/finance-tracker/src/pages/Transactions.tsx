import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { useListTransactions, useDeleteTransaction, useCreateTransaction, Transaction, CreateTransactionRequestType } from "@workspace/api-client-react";
import { Plus, Search, Filter, MoreHorizontal, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense", "transfer"]),
  date: z.string(),
  accountId: z.coerce.number(),
  categoryId: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Transactions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: transactionsData, isLoading } = useListTransactions({ search });
  const deleteMutation = useDeleteTransaction({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/transactions"] })
    }
  });
  
  const createMutation = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        setIsCreateModalOpen(false);
        reset();
      }
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: "expense",
      accountId: 1 // Defaulting to 1 for simplicity in mockup
    }
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate({ data: data as any });
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your income and expenses.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search transactions..." 
              className="pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="shrink-0">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted-foreground bg-secondary/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-secondary rounded w-1/4 ml-auto"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : transactionsData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactionsData?.data?.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.type === 'expense' ? 'bg-destructive/10 text-destructive' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : 
                           tx.type === 'expense' ? <ArrowDownRight className="h-4 w-4" /> : 
                           <ArrowRightLeft className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.account?.name || `Account #${tx.accountId}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {tx.category?.name ? (
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-normal">
                          {tx.category.name}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(parseISO(tx.date), "MMM d, yyyy")}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-medium whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-400' :
                        tx.type === 'expense' ? 'text-foreground' :
                        'text-blue-400'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this transaction?')) {
                            deleteMutation.mutate({ id: tx.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Transaction"
        description="Enter the details of your transaction."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-4">
              {['expense', 'income', 'transfer'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input type="radio" value={type} {...register("type")} className="text-primary bg-background border-border focus:ring-primary" />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input {...register("description")} placeholder="Grocery, Salary, etc." />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" step="0.01" {...register("amount")} placeholder="0.00" />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2 hidden">
             {/* Hidden for simplicity, default value handled by form */}
            <Input type="number" {...register("accountId")} />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Save Transaction</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
