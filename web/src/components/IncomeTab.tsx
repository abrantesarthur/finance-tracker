import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Income {
  id: number;
  description: string;
  date: string;
  amount: number;
  created_at: string;
}

const API = "http://localhost:3000";

export default function IncomeTab() {
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formAmount, setFormAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null);

  const fetchIncome = async () => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    const qs = params.toString();
    const res = await fetch(`${API}/income${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    setIncomeList(data.income);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    const loadIncome = async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      const qs = params.toString();
      const res = await fetch(`${API}/income${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (!ignore) {
        setIncomeList(data.income);
        setLoading(false);
      }
    };
    loadIncome();
    return () => {
      ignore = true;
    };
  }, [startDate, endDate]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const hasFilters = startDate || endDate;

  const handleSave = async () => {
    setFormError(null);
    if (!formDesc.trim() || !formAmount) {
      setFormError("All fields are required");
      return;
    }

    if (Number(formAmount) <= 0) {
      setFormError("Amount must be greater than zero");
      return;
    }

    const res = await fetch(`${API}/income`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: formDesc.trim(),
        date: formDate,
        amount: Number(formAmount),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Something went wrong");
      return;
    }

    resetForm();
    fetchIncome();
  };

  const resetForm = () => {
    setFormDesc("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormAmount("");
    setFormError(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`${API}/income/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return;
    }
    setDeleteTarget(null);
    fetchIncome();
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
      <div className="flex items-center justify-end mb-6">
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Add Income</Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="inc-desc">Description</Label>
                <Input
                  id="inc-desc"
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  autoFocus
                  placeholder="e.g. Monthly salary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inc-date">Date</Label>
                <Input
                  id="inc-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inc-amount">Amount</Label>
                <Input
                  id="inc-amount"
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="e.g. 3000.00"
                  step="0.01"
                  min="0.01"
                />
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
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Income table */}
      {incomeList.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No income yet. Add one to get started.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeList.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="text-foreground">
                    {formatDate(inc.date)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {inc.description}
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatCurrency(inc.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(inc)}
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
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income entry?
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
