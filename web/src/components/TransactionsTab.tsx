import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: number;
  description: string;
  date: string;
  amount: number;
  payment_method: string;
  category_id: number;
  category_name: string;
  type: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

const API = "http://localhost:3000";

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters — use "all" instead of "" for Radix Select compatibility
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formAmount, setFormAmount] = useState("");
  const [formPayment, setFormPayment] = useState("");
  const [formCategory, setFormCategory] = useState("none");
  const [formType, setFormType] = useState<"subscription" | "discretionary">(
    "discretionary"
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (filterCategory !== "all") params.set("category_id", filterCategory);
    if (filterType !== "all") params.set("type", filterType);
    const qs = params.toString();
    const res = await fetch(`${API}/transactions${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    setTransactions(data.transactions);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    const loadCategories = async () => {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      if (!ignore) setCategories(data.categories);
    };
    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadTransactions = async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      if (filterCategory !== "all") params.set("category_id", filterCategory);
      if (filterType !== "all") params.set("type", filterType);
      const qs = params.toString();
      const res = await fetch(`${API}/transactions${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (!ignore) {
        setTransactions(data.transactions);
        setLoading(false);
      }
    };
    loadTransactions();
    return () => {
      ignore = true;
    };
  }, [startDate, endDate, filterCategory, filterType]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterCategory("all");
    setFilterType("all");
  };

  const hasFilters =
    startDate || endDate || filterCategory !== "all" || filterType !== "all";

  const handleSave = async () => {
    setFormError(null);
    if (
      !formDesc.trim() ||
      !formAmount ||
      !formPayment.trim() ||
      formCategory === "none"
    ) {
      setFormError("All fields are required");
      return;
    }

    const res = await fetch(`${API}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: formDesc.trim(),
        date: formDate,
        amount: Number(formAmount),
        payment_method: formPayment.trim(),
        category_id: Number(formCategory),
        type: formType,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Something went wrong");
      return;
    }

    resetForm();
    fetchTransactions();
  };

  const resetForm = () => {
    setFormDesc("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormAmount("");
    setFormPayment("");
    setFormCategory("none");
    setFormType("discretionary");
    setFormError(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`${API}/transactions/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return;
    }
    setDeleteTarget(null);
    fetchTransactions();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-14 w-full" />
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Transactions</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Add Transaction</Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tx-desc">Description</Label>
                <Input
                  id="tx-desc"
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  autoFocus
                  placeholder="e.g. Grocery shopping"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tx-date">Date</Label>
                <Input
                  id="tx-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tx-amount">Amount</Label>
                <Input
                  id="tx-amount"
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="e.g. -25 or 3000"
                  step="0.01"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tx-payment">Payment Method</Label>
                <Input
                  id="tx-payment"
                  type="text"
                  value={formPayment}
                  onChange={(e) => setFormPayment(e.target.value)}
                  placeholder="Credit Card, Pix, Cash"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>
                      Select a category
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <RadioGroup
                  value={formType}
                  onValueChange={(v) =>
                    setFormType(v as "subscription" | "discretionary")
                  }
                  className="flex gap-4 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="discretionary" id="type-disc" />
                    <Label htmlFor="type-disc" className="font-normal">
                      Discretionary
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="subscription" id="type-sub" />
                    <Label htmlFor="type-sub" className="font-normal">
                      Subscription
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            {formError && (
              <p className="text-sm text-destructive mt-3">{formError}</p>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Filter bar */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="discretionary">Discretionary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction table */}
      {transactions.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No transactions yet. Add one to get started.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-foreground">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {tx.description}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.amount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tx.category_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tx.payment_method}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.type === "subscription" ? "default" : "secondary"
                      }
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(tx)}
                      className="hover:text-destructive"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">
                {deleteTarget.description}
              </p>
              <p
                className={
                  deleteTarget.amount >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {formatCurrency(deleteTarget.amount)}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
