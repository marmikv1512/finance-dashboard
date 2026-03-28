import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { useListAccounts, Account } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, CreditCard, Building2, Landmark, Wallet, Activity } from "lucide-react";
import { apiFetch } from "@/lib/api";

type AccountForm = {
  name: string;
  institution: string;
  type: string;
  balance: string;
  currency: string;
};

const defaultForm: AccountForm = {
  name: "",
  institution: "",
  type: "checking",
  balance: "",
  currency: "USD",
};

export default function Accounts() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading } = useListAccounts();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<AccountForm>(defaultForm);

  const accountsData: Account[] = useMemo(() => {
    if (Array.isArray(accounts)) return accounts;
    if (Array.isArray((accounts as any)?.data)) return (accounts as any).data;
    return [];
  }, [accounts]);

  const getIcon = (type: string) => {
    switch (String(type).toLowerCase()) {
      case "credit":
      case "credit_card":
        return <CreditCard className="h-6 w-6" />;
      case "investment":
        return <Activity className="h-6 w-6" />;
      case "savings":
        return <Landmark className="h-6 w-6" />;
      default:
        return <Building2 className="h-6 w-6" />;
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setSubmitError("");
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.name.trim()) {
      setSubmitError("Account name is required.");
      return;
    }

    if (!form.balance.trim() || Number.isNaN(Number(form.balance))) {
      setSubmitError("Enter a valid balance.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      institution: form.institution.trim() || null,
      type: form.type,
      balance: Number(form.balance),
      currency: form.currency,
    };

    setIsSaving(true);

    try {
      const variants = [
        payload,
        { data: payload },
        {
          ...payload,
          balance: String(payload.balance),
        },
        {
          data: {
            ...payload,
            balance: String(payload.balance),
          },
        },
      ];

      let success = false;
      let lastError = "Failed to create account.";

      for (const body of variants) {
        const response = await apiFetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          success = true;
          break;
        }

        try {
          const err = await response.json();
          lastError = err?.error || err?.message || lastError;
        } catch {
          lastError = response.statusText || lastError;
        }
      }

      if (!success) {
        throw new Error(lastError);
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });

      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Create account failed:", error);
      setSubmitError(error?.message || "Failed to create account.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your bank accounts and credit cards.</p>
        </div>
        <Button
          className="shadow-lg shadow-primary/20"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 animate-pulse h-48"></Card>
          ))
        ) : accountsData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No accounts found</p>
            <p className="mt-1">Add your first account to start tracking.</p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </div>
        ) : (
          accountsData.map((account: Account) => (
            <Card
              key={account.id}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                {getIcon(account.type)}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg text-foreground">{account.name}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  {account.institution || account.type}
                </p>
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Account"
        description="Create a new account to track balances and transactions."
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Main Checking"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Institution</label>
            <Input
              value={form.institution}
              onChange={(e) => setForm((prev) => ({ ...prev, institution: e.target.value }))}
              placeholder="Chase Bank"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Opening Balance</label>
            <Input
              type="number"
              step="0.01"
              value={form.balance}
              onChange={(e) => setForm((prev) => ({ ...prev, balance: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

          <div className="pt-4 flex justify-end gap-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Account
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}