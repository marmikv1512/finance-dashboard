import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useListGoals, Goal } from "@workspace/api-client-react";
import { Plus, Target, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Goals() {
  const { data: goals, isLoading } = useListGoals();

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Plan and track your future savings.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          [1, 2].map(i => (
            <Card key={i} className="bg-card/50 animate-pulse h-48"></Card>
          ))
        ) : goals?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No saving goals yet</p>
            <p className="mt-1">Define what you're saving for.</p>
            <Button className="mt-6" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Goal</Button>
          </div>
        ) : (
          goals?.map((goal: Goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            
            return (
              <Card key={goal.id} className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Target className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{goal.name}</CardTitle>
                  {goal.targetDate && (
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Calendar className="mr-1.5 h-4 w-4" />
                      Target: {format(parseISO(goal.targetDate), "MMM yyyy")}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="mt-4">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-3xl font-bold font-mono text-primary">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-muted-foreground ml-2">/ {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <span className="font-semibold text-foreground">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
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
