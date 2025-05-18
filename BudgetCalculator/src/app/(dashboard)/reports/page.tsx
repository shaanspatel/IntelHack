"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Header from "./_components/Header"
import { TransactionChart } from "./_components/TransactionChart"

export default function Page() {
  return (
    <>
      <Header />
      <DashboardBudgetSummary />
      <section className="my-8">
        <div className="space-y-12">
          <TransactionChart
            yAxisWidth={70}
            type="amount"
            className="hidden sm:block"
          />
          <TransactionChart
            showYAxis={false}
            type="amount"
            className="sm:hidden"
          />
          <TransactionChart
            yAxisWidth={70}
            type="count"
            className="hidden sm:block"
          />
          <TransactionChart
            showYAxis={false}
            type="count"
            className="sm:hidden"
          />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <TransactionChart yAxisWidth={100} type="category" />
            <TransactionChart yAxisWidth={100} type="merchant" />
          </div>
        </div>
      </section>
    </>
  )
}

function DashboardBudgetSummary() {
  const [budget, setBudget] = useState<{
    categories: Record<string, number>
    updatedAt: string
  } | null>(null)

  useEffect(() => {
    const fetchBudget = async () => {
      const user = auth.currentUser
      if (!user) return

      const ref = doc(db, "budgets", user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        setBudget(snap.data() as any)
      }
    }

    fetchBudget()
  }, [])

  if (!budget) return null

  const totalBudget = Object.values(budget.categories).reduce((sum, val) => sum + val, 0)
  const spent = 340 // Replace with real calculation later
  const remaining = totalBudget - spent

  // Simulated per-category spent values (replace with real data later)
  const spentPerCategory: Record<string, number> = {
    entertainment: 40,
    dining: 80,
    groceries: 120,
    clothing: 50,
    personalCare: 30,
    miscellaneous: 20
  }

  return (
    <div className="mb-8 space-y-6 rounded-lg border bg-white p-8 sm:p-10 shadow dark:border-gray-800 dark:bg-gray-950">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">This Month’s Budget</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <div className="text-xs uppercase text-gray-500">Total Budget</div>
          <div className="text-lg font-medium">${totalBudget}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500">Spent</div>
          <div className="text-lg font-medium text-red-600">${spent}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500">Remaining</div>
          <div className={`text-lg font-medium ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>${remaining}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Category Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(budget.categories).map(([key, value]) => {
            const categorySpent = spentPerCategory[key] || 0
            const categoryRemaining = value - categorySpent
            return (
              <div
                key={key}
                className="flex flex-col gap-1 rounded-md bg-gray-50 dark:bg-gray-900 p-4 shadow-sm border border-gray-200 dark:border-gray-800"
              >
                <div className="flex justify-between items-center">
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${value}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Spent: <span>${categorySpent}</span> • Remaining: <span className={`${categoryRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>${categoryRemaining}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
