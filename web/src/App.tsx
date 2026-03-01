import { useState } from "react";
import CategoriesTab from "./components/CategoriesTab";
import TransactionsTab from "./components/TransactionsTab";

type Tab = "transactions" | "categories";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("transactions");

  const tabs: { key: Tab; label: string }[] = [
    { key: "transactions", label: "Transactions" },
    { key: "categories", label: "Categories" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Finance Tracker
          </h1>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === "transactions" ? (
          <TransactionsTab />
        ) : (
          <CategoriesTab />
        )}
      </main>
    </div>
  );
}

export default App;
