import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CATEGORIES, CATEGORY_COLORS } from "@/lib/categories";

const TIME_RANGES = [
  { value: "1W", label: "Last Week" },
  { value: "1M", label: "Last Month" },
  { value: "3M", label: "Last 3M" },
  { value: "1Y", label: "Last Year" },
  { value: "YTD", label: "YTD" },
  { value: "All", label: "Always" },
];

interface TableToolbarProps {
  timeRange: string;
  onTimeRangeChange: (v: string) => void;

  /** Show the Type (All/Expense/Income) filter — Dashboard only */
  showTypeFilter?: boolean;
  filterSource?: string;
  onFilterSourceChange?: (value: string) => void;

  /** Show the Category filter — Expenses tab always, Dashboard when type=expense */
  showCategoryFilter?: boolean;
  filterCategory?: string;
  onFilterCategoryChange?: (value: string) => void;
}

export default function TableToolbar({
  timeRange,
  onTimeRangeChange,
  showTypeFilter,
  filterSource,
  onFilterSourceChange,
  showCategoryFilter,
  filterCategory,
  onFilterCategoryChange,
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-[130px] h-8 text-xs bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showTypeFilter && onFilterSourceChange && (
        <Select value={filterSource} onValueChange={onFilterSourceChange}>
          <SelectTrigger className="w-[100px] h-8 text-xs bg-card">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showCategoryFilter && onFilterCategoryChange && (
        <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-card">
            <SelectValue placeholder="Category" />
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
      )}
    </div>
  );
}
