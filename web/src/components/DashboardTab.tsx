import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CashflowChart, { getStartDateForRange } from "@/components/CashflowChart";
import TableToolbar from "@/components/TableToolbar";

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

export default function DashboardTab() {
  const [rows, setRows] = useState<MergedRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [timeRange, setTimeRange] = useState("1M");
  const [filterSource, setFilterSource] = useState("all"); // all | expense | income
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      const expenseParams = new URLSearchParams();
      const incomeParams = new URLSearchParams();

      const startDate = getStartDateForRange(timeRange)?.toISOString().slice(0, 10) ?? "";
      if (startDate) {
        expenseParams.set("start_date", startDate);
        incomeParams.set("start_date", startDate);
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
  }, [timeRange, filterSource, filterCategory]);

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
      {/* Filter bar */}
      <div className="mb-4">
        <TableToolbar
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          showTypeFilter
          filterSource={filterSource}
          onFilterSourceChange={(v) => {
            setFilterSource(v);
            if (v !== "expense") setFilterCategory("all");
          }}
          showCategoryFilter={filterSource === "expense"}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
        />
      </div>

      {/* Cashflow chart */}
      <CashflowChart rows={rows} timeRange={timeRange} />

      <hr className="border-border mb-6" />

      {/* Transactions */}
      <h2 className="text-lg font-semibold text-foreground mb-3">Transactions</h2>

      <div className="rounded-md border">
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
                  <TableCell className="text-right font-medium text-foreground">
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
                    <span
                      className={`font-medium ${
                        row._source === "income"
                          ? "text-green-400/70"
                          : "text-red-400/70"
                      }`}
                    >
                      {row._source === "income" ? "Income" : "Expense"}
                    </span>
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
