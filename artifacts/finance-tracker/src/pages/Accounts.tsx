import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useListAccounts, Account } from "@workspace/api-client-react";
import { Plus, CreditCard, Building2, Landmark, Wallet } from "lucide-react";

export default function Accounts() {
  const { data: accounts, isLoading } = useListAccounts();

  const getIcon = (type: string) => {
    switch (type) {
      case 'credit': return <CreditCard className="h-6 w-6" />;
      case 'investment': return <Activity className="h-6 w-6" />;
      case 'savings': return <Landmark className="h-6 w-6" />;
      default: return <Building2 className="h-6 w-6" />;
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your bank accounts and credit cards.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 animate-pulse h-48"></Card>
          ))
        ) : accounts?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No accounts found</p>
            <p className="mt-1">Add your first account to start tracking.</p>
            <Button className="mt-6" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
          </div>
        ) : (
          accounts?.map((account: Account) => (
            <Card key={account.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                {getIcon(account.type)}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg text-foreground">{account.name}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{account.institution || account.type}</p>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-3xl font-bold font-mono text-foreground tracking-tight">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
