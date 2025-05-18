"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Card } from "@/components/Card"

const categoryFields = [
  { id: "entertainment", label: "Entertainment & Subscriptions" },
  { id: "dining", label: "Dining & Takeout" },
  { id: "groceries", label: "Groceries" },
  { id: "clothing", label: "Clothing" },
  { id: "personalCare", label: "Personal Care" },
  { id: "miscellaneous", label: "Miscellaneous Items" },
]

export default function BudgetPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Record<string, string>>({})

  const handleChange = (id: string, value: string) => {
    setCategories((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user) return

    setSaving(true)
    try {
      const numericValues = Object.fromEntries(
        Object.entries(categories).map(([k, v]) => [k, Number(v)])
      )

      await setDoc(doc(db, "budgets", user.uid), {
        categories: numericValues,
        updatedAt: new Date().toISOString(),
      })

      router.push("/reports")
    } catch (err) {
      console.error("Error saving budget:", err)
      alert("Failed to save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Monthly Budget Setup
      </h1>

      <Card className="space-y-8 p-8 shadow-md border border-gray-200 dark:border-gray-800 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300">
          Customize your monthly budget by category. This helps track how much you plan to spend each month and how much you have remaining.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {categoryFields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {field.label}
              </Label>
              <Input
                id={field.id}
                type="number"
                value={categories[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="h-10 text-sm"
                placeholder="$0"
              />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSave}
            isLoading={saving}
            className="w-full sm:w-auto text-base"
          >
            {saving ? "Saving..." : "Save Budget"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
