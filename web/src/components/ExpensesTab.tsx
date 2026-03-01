import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
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

interface Expense {
  id: number;
  description: string;
  date: string;
  amount: number;
  payment_method: string;
  category: string;
  type: string;
  created_at: string;
}

const API = "http://localhost:3000";
const PAYMENT_METHODS = ["Credit Card", "Debit Card", "Pix", "Cash"];
const CATEGORIES = [
  "Food", "Housing", "Transport", "Utilities", "Healthcare",
  "Entertainment", "Shopping", "Education", "Personal Care",
  "Travel", "Subscriptions", "Donations", "Other",
];

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
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
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const fetchExpenses = async () => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (filterCategory !== "all") params.set("category", filterCategory);
    if (filterType !== "all") params.set("type", filterType);
    const qs = params.toString();
    const res = await fetch(`${API}/expenses${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    setExpenses(data.expenses);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    const loadExpenses = async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (filterType !== "all") params.set("type", filterType);
      const qs = params.toString();
      const res = await fetch(`${API}/expenses${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (!ignore) {
        setExpenses(data.expenses);
        setLoading(false);
      }
    };
    loadExpenses();
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

    if (Number(formAmount) <= 0) {
      setFormError("Amount must be greater than zero");
      return;
    }

    const res = await fetch(`${API}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: formDesc.trim(),
        date: formDate,
        amount: Number(formAmount),
        payment_method: formPayment.trim(),
        category: formCategory,
        type: formType,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Something went wrong");
      return;
    }

    resetForm();
    fetchExpenses();
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
    const res = await fetch(`${API}/expenses/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return;
    }
    setDeleteTarget(null);
    fetchExpenses();
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
        <h2 className="text-lg font-semibold text-foreground">Expenses</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Add Expense</Button>
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
                  placeholder="e.g. 25.00"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={formPayment} onValueChange={setFormPayment}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
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
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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

      {/* Expense table */}
      {expenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No expenses yet. Add one to get started.
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
              {expenses.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-foreground">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {tx.description}
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tx.category}
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
                      <Trash2 className="h-4 w-4" />
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
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">
                {deleteTarget.description}
              </p>
              <p className="text-foreground">
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
