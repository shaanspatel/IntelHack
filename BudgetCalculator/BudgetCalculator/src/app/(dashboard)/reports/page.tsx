"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import Header from "./_components/Header"
import { TransactionChart } from "./_components/TransactionChart"

export default function Page() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          where("createdAt", ">=", startOfMonth.toISOString())
        )

        const snap = await getDocs(q)
        setTransactions(snap.docs.map(doc => doc.data()))
      } catch (err: any) {
        console.error("Error fetching transactions:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Error loading transactions: {error}</p>
        <p className="mt-2">
          Please create the required Firestore index by visiting this URL:
          <br />
          <a 
            href="https://console.firebase.google.com/v1/r/project/intelhack2025/firestore/indexes?create_composite=ClJwcm9qZWN0cy9pbnRlbGhhY2syMDI1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy90cmFuc2FjdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAEaDAoIX19uYW1lX18QAQ" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Create Firestore Index
          </a>
        </p>
      </div>
    )
  }

  if (loading) return <div className="p-4">Loading transactions...</div>

  return (
    <>
      <Header />
      <DashboardBudgetSummary transactions={transactions} />
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

interface DashboardBudgetSummaryProps {
  transactions: any[]
}

function DashboardBudgetSummary({ transactions }: DashboardBudgetSummaryProps) {
  const [budget, setBudget] = useState<{
    categories: Record<string, number>
    updatedAt: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const ref = doc(db, "budgets", user.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          setBudget(snap.data() as any)
        }
      } catch (err: any) {
        console.error("Error fetching budget:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBudget()
  }, [])

  if (error) return <div className="p-4 text-red-600">Error loading budget: {error}</div>
  if (loading) return <div className="p-4">Loading budget...</div>
  if (!budget) return <div className="p-4">No budget data found</div>

  const totalBudget = Object.values(budget.categories).reduce((sum, val) => sum + val, 0)
  const spent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
  const remaining = totalBudget - spent

  const spentPerCategory = transactions.reduce((acc: Record<string, number>, tx) => {
    const key = tx.category?.toLowerCase() || 'miscellaneous'
    acc[key] = (acc[key] || 0) + (tx.amount || 0)
    return acc
  }, {})

  return (
    <div className="mb-8 space-y-6 rounded-lg border bg-white p-8 sm:p-10 shadow dark:border-gray-800 dark:bg-gray-950">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">This Month's Budget</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <div className="text-xs uppercase text-gray-500">Total Budget</div>
          <div className="text-lg font-medium">${totalBudget.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500">Spent</div>
          <div className="text-lg font-medium text-red-600">${spent.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500">Remaining</div>
          <div className={`text-lg font-medium ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${remaining.toFixed(2)}
          </div>
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
                    ${value.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Spent: <span>${categorySpent.toFixed(2)}</span> • Remaining: <span className={`${categoryRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${categoryRemaining.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}