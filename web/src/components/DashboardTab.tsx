import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CashflowChart from "@/components/CashflowChart";

export interface MergedRow {
  id: number;
  description: string;
  date: string;
  amount: number;
  payment_method?: string;
  category?: string;
  created_at: string;
  _source: "expense" | "income";
}

const API = "http://localhost:3000";
const CATEGORIES = [
  "Food", "Housing", "Transport", "Utilities", "Healthcare",
  "Entertainment", "Shopping", "Education", "Personal Care",
  "Travel", "Subscriptions", "Donations", "Other",
];

export default function DashboardTab() {
  const [rows, setRows] = useState<MergedRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterSource, setFilterSource] = useState("all"); // all | expense | income
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      const expenseParams = new URLSearchParams();
      const incomeParams = new URLSearchParams();

      if (startDate) {
        expenseParams.set("start_date", startDate);
        incomeParams.set("start_date", startDate);
      }
      if (endDate) {
        expenseParams.set("end_date", endDate);
        incomeParams.set("end_date", endDate);
      }
      if (filterCategory !== "all") {
        expenseParams.set("category", filterCategory);
      }

      const fetchExpenses = filterSource !== "income";
      const fetchIncome = filterSource !== "expense";

      const promises: Promise<MergedRow[]>[] = [];

      if (fetchExpenses) {
        const eqs = expenseParams.toString();
        promises.push(
          fetch(`${API}/expenses${eqs ? `?${eqs}` : ""}`)
            .then((r) => r.json())
            .then((data) =>
              data.expenses.map((e: MergedRow) => ({ ...e, _source: "expense" as const }))
            )
        );
      }

      if (fetchIncome) {
        const iqs = incomeParams.toString();
        promises.push(
          fetch(`${API}/income${iqs ? `?${iqs}` : ""}`)
            .then((r) => r.json())
            .then((data) =>
              data.income.map((i: MergedRow) => ({ ...i, _source: "income" as const }))
            )
        );
      }

      const results = await Promise.all(promises);
      const merged = results.flat().sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.created_at.localeCompare(a.created_at);
      });

      if (!ignore) {
        setRows(merged);
        setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [startDate, endDate, filterSource, filterCategory]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterSource("all");
    setFilterCategory("all");
  };

  const hasFilters =
    startDate ||
    endDate ||
    filterSource !== "all" ||
    filterCategory !== "all";

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
        <Skeleton className="h-[350px] w-full rounded-xl" />
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
      {/* Cashflow chart */}
      <CashflowChart rows={rows} />

      <hr className="border-border mb-6" />

      {/* Transactions */}
      <h2 className="text-lg font-semibold text-foreground mb-3">Transactions</h2>

      <div className="rounded-md border">
        {/* Toolbar */}
        <div className="flex items-center justify-end gap-1 px-4 py-2 border-b">
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <HugeiconsIcon icon={FilterIcon} size={16} />
                {hasFilters && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={filterSource} onValueChange={(v) => {
                  setFilterSource(v);
                  if (v !== "expense") {
                    setFilterCategory("all");
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filterSource === "expense" && (
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
              )}
              {hasFilters && (
                <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        {rows.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No records found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row._source}-${row.id}`}>
                  <TableCell className="text-foreground">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {row.description}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      row._source === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row._source === "expense" ? row.category || "-" : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row._source === "expense"
                      ? row.payment_method || "-"
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row._source === "income" ? "default" : "secondary"
                      }
                    >
                      {row._source === "income" ? "Income" : "Expense"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
