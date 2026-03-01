import { useEffect, useState } from "react";

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

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formAmount, setFormAmount] = useState("");
  const [formPayment, setFormPayment] = useState("");
  const [formCategory, setFormCategory] = useState("");
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
    if (filterCategory) params.set("category_id", filterCategory);
    if (filterType) params.set("type", filterType);
    const qs = params.toString();
    const res = await fetch(`${API}/transactions${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    setTransactions(data.transactions);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API}/categories`);
    const data = await res.json();
    setCategories(data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, filterCategory, filterType]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterCategory("");
    setFilterType("");
  };

  const hasFilters = startDate || endDate || filterCategory || filterType;

  const handleSave = async () => {
    setFormError(null);
    if (!formDesc.trim() || !formAmount || !formPayment.trim() || !formCategory) {
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
    setFormCategory("");
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
    return <p className="text-center text-gray-500 py-12">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Transaction
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                autoFocus
                placeholder="e.g. Grocery shopping"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="e.g. -25 or 3000"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={formPayment}
                onChange={(e) => setFormPayment(e.target.value)}
                placeholder="Credit Card, Pix, Cash"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="discretionary"
                    checked={formType === "discretionary"}
                    onChange={() => setFormType("discretionary")}
                    className="accent-indigo-600"
                  />
                  Discretionary
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="subscription"
                    checked={formType === "subscription"}
                    onChange={() => setFormType("subscription")}
                    className="accent-indigo-600"
                  />
                  Subscription
                </label>
              </div>
            </div>
          </div>
          {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="discretionary">Discretionary</option>
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Transaction table */}
      {transactions.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          No transactions yet. Add one to get started.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Description
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Amount
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Payment Method
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Type
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{tx.description}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      tx.amount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {tx.category_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {tx.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        tx.type === "subscription"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteTarget(tx)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
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
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Transaction
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this transaction?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-gray-900">
                {deleteTarget.description}
              </p>
              <p
                className={`${
                  deleteTarget.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(deleteTarget.amount)}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
