import { useState } from "react";
import ExpensesTab from "./components/ExpensesTab";
import IncomeTab from "./components/IncomeTab";
import DashboardTab from "./components/DashboardTab";
import { ModeToggle } from "./components/mode-toggle";

type Tab = "dashboard" | "expenses" | "income";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "expenses", label: "Expenses" },
    { key: "income", label: "Income" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            Finance Tracker
          </h1>
          <ModeToggle />
        </div>
      </header>

      <nav className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "expenses" && <ExpensesTab />}
        {activeTab === "income" && <IncomeTab />}
      </main>
    </div>
  );
}

export default App;
