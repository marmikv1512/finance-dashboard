import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useListBudgets, Budget } from "@workspace/api-client-react";
import { Plus, PieChart } from "lucide-react";

export default function Budgets() {
  const { data: budgets, isLoading } = useListBudgets({});

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1">Track your monthly spending limits.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="bg-card/50 animate-pulse h-48"></Card>
          ))
        ) : budgets?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No active budgets</p>
            <p className="mt-1">Set up budgets to control your spending.</p>
            <Button className="mt-6" variant="outline"><Plus className="mr-2 h-4 w-4" /> Create Budget</Button>
          </div>
        ) : (
          budgets?.map((budget: Budget) => {
            const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
            const isOver = budget.spent > budget.amount;
            
            return (
              <Card key={budget.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{budget.category?.name || "General"}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isOver ? 'bg-destructive' : 'bg-primary'}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className={isOver ? 'text-destructive' : 'text-muted-foreground'}>
                        {percentage.toFixed(1)}% spent
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(Math.max(budget.amount - budget.spent, 0))} remaining
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
