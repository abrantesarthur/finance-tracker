import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Category {
  id: number;
  name: string;
  createdAt: string;
}

const API = "http://localhost:3000";

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const res = await fetch(`${API}/categories`);
    const data = await res.json();
    setCategories(data.categories);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }

    const res = await fetch(`${API}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (res.status === 409) {
      setError("Category already exists");
      return;
    }

    if (!res.ok) {
      setError("Something went wrong");
      return;
    }

    setName("");
    setShowForm(false);
    setError(null);
    fetchCategories();
  };

  const handleCancel = () => {
    setName("");
    setError(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
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
        <h2 className="text-lg font-semibold text-foreground">Categories</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Add Category</Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Category name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      {categories.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No categories yet
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-foreground">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(cat.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
