import { Transaction } from "@/data/schema"

export function createBlankTransaction(): Transaction {
    return {
      transaction_id: "",
      transaction_date: new Date().toISOString(),
      expense_status: "pending",
      payment_status: "unpaid",
      merchant: "",
      category: "",
      amount: 0,
      currency: "USD",
      lastEdited: new Date().toISOString(),
      continent: "",
      country: ""
    }
  }
  