import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MergedRow } from "@/components/DashboardTab";

const chartConfig = {
  cumulative: {
    label: "Cashflow",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const TIME_RANGES = ["1W", "1M", "3M", "YTD", "1Y", "All"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

function getStartDateForRange(range: TimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case "1W":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "YTD":
      return new Date(now.getFullYear(), 0, 1);
    case "1Y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "All":
      return null;
  }
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** Fill in missing dates between min and max with 0 net */
function fillDateGaps(
  dailyNet: Map<string, number>,
  minDate: string,
  maxDate: string
): string[] {
  const dates: string[] = [];
  const [sy, sm, sd] = minDate.split("-").map(Number);
  const [ey, em, ed] = maxDate.split("-").map(Number);
  const current = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  while (current <= end) {
    const key = current.toISOString().slice(0, 10);
    dates.push(key);
    if (!dailyNet.has(key)) {
      dailyNet.set(key, 0);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

interface CashflowChartProps {
  rows: MergedRow[];
}

export default function CashflowChart({ rows }: CashflowChartProps) {
  const [range, setRange] = useState<TimeRange>("3M");

  const { data, yLimit } = useMemo(() => {
    // Filter by time range
    const rangeStart = getStartDateForRange(range);
    const filtered = rangeStart
      ? rows.filter((r) => r.date >= rangeStart.toISOString().slice(0, 10))
      : rows;

    if (filtered.length === 0) return { data: [], yLimit: 0 };

    // Group by date -> daily net
    const dailyNet = new Map<string, number>();
    for (const row of filtered) {
      const prev = dailyNet.get(row.date) ?? 0;
      const delta = row._source === "income" ? row.amount : -row.amount;
      dailyNet.set(row.date, prev + delta);
    }

    // Find date range
    const allDates = [...dailyNet.keys()].sort();
    const sortedDates = fillDateGaps(dailyNet, allDates[0], allDates[allDates.length - 1]);

    // Cumulative running total
    let cumulative = 0;
    let maxAbs = 0;
    const points = sortedDates.map((date) => {
      cumulative += dailyNet.get(date) ?? 0;
      maxAbs = Math.max(maxAbs, Math.abs(cumulative));
      return { date, cumulative };
    });

    // Symmetric domain so y=0 is always centered
    const limit = maxAbs || 1;
    return { data: points, yLimit: limit };
  }, [rows, range]);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-3">Cashflow</h2>
      <Card>
        <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data for the selected period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto cursor-pointer">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-cumulative)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-cumulative)" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDateLabel}
                tickMargin={8}
                minTickGap={40}
              />
              <YAxis hide domain={[-yLimit, yLimit]} />

              <ReferenceLine
                y={0}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />

              <ChartTooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as { date: string; cumulative: number };
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-xl">
                      <p className="text-muted-foreground">{formatDateLabel(point.date)}</p>
                      <p className="font-medium font-mono tabular-nums">
                        {formatCurrency(point.cumulative)}
                      </p>
                    </div>
                  );
                }}
              />

              <Area
                dataKey="cumulative"
                type="monotone"
                stroke="var(--color-cumulative)"
                strokeWidth={2}
                fill="url(#cashflowGradient)"
              />
            </AreaChart>
          </ChartContainer>
        )}

        {/* Time range selector */}
        <div className="flex items-center gap-1 pt-3">
          {TIME_RANGES.map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "ghost"}
              size="sm"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
