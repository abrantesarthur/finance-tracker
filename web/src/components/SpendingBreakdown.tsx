import { useMemo } from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { CATEGORY_COLORS } from "@/lib/categories";
import { getStartDateForRange } from "@/components/CashflowChart";
import type { MergedRow } from "@/components/DashboardTab";

interface SpendingBreakdownProps {
  rows: MergedRow[];
  timeRange: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const RADIAN = Math.PI / 180;

function renderOuterLabel(props: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  category: string;
  amount: number;
  percentage: number;
  fill: string;
}) {
  const { cx, cy, midAngle, outerRadius, category, amount, percentage, fill } =
    props;
  const labelRadius = outerRadius + 24;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  const isRight = x > cx;
  const anchor = isRight ? "start" : "end";

  return (
    <g>
      {/* Colored dot */}
      <circle
        cx={isRight ? x : x}
        cy={y - 4}
        r={4}
        fill={fill}
      />
      {/* Category name */}
      <text
        x={isRight ? x + 10 : x - 10}
        y={y}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="fill-foreground text-xs font-medium"
      >
        {category}
      </text>
      {/* Amount + percentage */}
      <text
        x={isRight ? x + 10 : x - 10}
        y={y + 15}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="fill-muted-foreground text-[10px]"
      >
        {formatCurrency(amount)} ({percentage}%)
      </text>
    </g>
  );
}

export default function SpendingBreakdown({
  rows,
  timeRange,
}: SpendingBreakdownProps) {
  const periodLabel: Record<string, string> = {
    "1W": "/ week",
    "1M": "/ month",
    "3M": "/ 3 months",
    "1Y": "/ year",
    "YTD": "/ YTD",
    "All": "/ transaction",
  };

  const {
    chartData,
    totalSpending,
    avgSpending,
    largestOutflow,
    mostFrequentCategory,
    chartConfig,
  } = useMemo(() => {
    const expenses = rows.filter((r) => r._source === "expense");

    if (expenses.length === 0) {
      return {
        chartData: [],
        totalSpending: 0,
        avgSpending: 0,
        largestOutflow: null,
        mostFrequentCategory: null,
        chartConfig: {} as ChartConfig,
      };
    }

    // Group by category
    const categoryMap = new Map<
      string,
      { amount: number; count: number }
    >();
    for (const row of expenses) {
      const cat = row.category || "Other";
      const existing = categoryMap.get(cat) ?? { amount: 0, count: 0 };
      existing.amount += row.amount;
      existing.count += 1;
      categoryMap.set(cat, existing);
    }

    const totalSpending = expenses.reduce((sum, r) => sum + r.amount, 0);

    // Build chart data sorted by amount descending
    const chartData = [...categoryMap.entries()]
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([category, { amount }]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        fill: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other,
        percentage: Math.round((amount / totalSpending) * 100),
      }));

    // Build chart config for tooltips
    const chartConfig: ChartConfig = {
      amount: { label: "Amount" },
    };
    for (const d of chartData) {
      chartConfig[d.category] = {
        label: d.category,
        color: d.fill,
      };
    }

    // Average spending per period
    // For concrete ranges (1W, 1M, 3M, 1Y, YTD), count how many full periods fit
    // and divide total by that count. For "All", average per transaction.
    const rangeStart = getStartDateForRange(timeRange);
    const now = new Date();
    let avgSpending: number;
    if (rangeStart) {
      const days = Math.max(
        1,
        Math.ceil(
          (now.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      const periodDays: Record<string, number> = {
        "1W": 7,
        "1M": 30,
        "3M": 90,
        "1Y": 365,
        "YTD": days, // single period
      };
      const pd = periodDays[timeRange] ?? days;
      const periods = Math.max(1, days / pd);
      avgSpending = totalSpending / periods;
    } else {
      // "All" — average per transaction
      avgSpending = totalSpending / expenses.length;
    }

    // Largest single outflow
    const largestExpense = expenses.reduce((max, r) =>
      r.amount > max.amount ? r : max
    );
    const largestOutflow = {
      description: largestExpense.description,
      amount: largestExpense.amount,
    };

    // Most frequent category
    let maxCount = 0;
    let freqCategory = "";
    for (const [cat, { count }] of categoryMap) {
      if (count > maxCount) {
        maxCount = count;
        freqCategory = cat;
      }
    }
    const mostFrequentCategory = {
      category: freqCategory,
      count: maxCount,
      color: CATEGORY_COLORS[freqCategory] ?? CATEGORY_COLORS.Other,
    };

    return {
      chartData,
      totalSpending,
      avgSpending,
      largestOutflow,
      mostFrequentCategory,
      chartConfig,
    };
  }, [rows, timeRange]);

  if (chartData.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Spending Breakdown
        </h2>
        <Card>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No expense data for the selected period.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-3">
        Spending Breakdown
      </h2>
      <Card className="overflow-visible">
        <CardContent className="overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10">
            {/* Donut Chart */}
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-[480px] w-full !aspect-auto overflow-visible [&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible [&_.recharts-responsive-container]:overflow-visible"
            >
              <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius="40%"
                  outerRadius="58%"
                  strokeWidth={2}
                  stroke="var(--background)"
                  label={renderOuterLabel}
                  labelLine={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.category} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-foreground text-xl font-bold"
                          >
                            {formatCurrency(totalSpending)}
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 content-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Average Spending{" "}
                  <span className="text-muted-foreground/60">
                    {periodLabel[timeRange] ?? ""}
                  </span>
                </p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {formatCurrency(avgSpending)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Most Frequent Category
                </p>
                {mostFrequentCategory && (
                  <div className="mt-1">
                    <p className="text-xl font-bold text-foreground flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: mostFrequentCategory.color,
                        }}
                      />
                      {mostFrequentCategory.category}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mostFrequentCategory.count} Transaction
                      {mostFrequentCategory.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Largest Outflow</p>
                {largestOutflow && (
                  <div className="mt-1">
                    <p className="text-xl font-bold text-foreground">
                      {largestOutflow.description}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono tabular-nums">
                      {formatCurrency(largestOutflow.amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
