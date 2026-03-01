import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const CATEGORIES = [
  "Food", "Housing", "Transport", "Utilities", "Healthcare",
  "Entertainment", "Shopping", "Education", "Personal Care",
  "Travel", "Subscriptions", "Donations", "Other",
];

interface TableToolbarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;

  /** Show the Type (All/Expense/Income) filter — Dashboard only */
  showTypeFilter?: boolean;
  filterSource?: string;
  onFilterSourceChange?: (value: string) => void;

  /** Show the Category filter — Expenses tab always, Dashboard when type=expense */
  showCategoryFilter?: boolean;
  filterCategory?: string;
  onFilterCategoryChange?: (value: string) => void;

  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function TableToolbar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showTypeFilter,
  filterSource,
  onFilterSourceChange,
  showCategoryFilter,
  filterCategory,
  onFilterCategoryChange,
  hasFilters,
  onClearFilters,
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-1 px-4 py-2 border-b">
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
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
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
          {showTypeFilter && onFilterSourceChange && (
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={filterSource} onValueChange={onFilterSourceChange}>
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
          )}
          {showCategoryFilter && onFilterCategoryChange && (
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={filterCategory}
                onValueChange={onFilterCategoryChange}
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
            <Button variant="ghost" size="sm" className="w-full" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
