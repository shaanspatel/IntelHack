"use client"
"use client"

import React, { useState } from "react"
import { Row } from "@tanstack/react-table"
import { Transaction } from "@/data/schema"
import { getColumns } from "./_components/Columns"
import { DataTable } from "./_components/DataTable"
import { DataTableDrawer } from "./_components/DataTableDrawer"
import { Button } from "@/components/Button"


import { createBlankTransaction } from "./_components/utils"

export default function TransactionsPage() {
  const [row, setRow] = useState<Row<Transaction> | null>(null)
  const [datas, setDatas] = useState<Transaction | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const handleNewTransaction = () => {
    setDatas(createBlankTransaction()) // See below for this helper
    setIsOpen(true)
  }

  const columns = getColumns({
    onEditClick: (row) => {
      setRow(row)
      setDatas(row.original)
      setIsOpen(true)
    },
  })

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Details
        </h1>
        <Button variant="primary" onClick={handleNewTransaction}>
          New Transaction
        </Button>
      </div>

      <div className="mt-4 sm:mt-6 lg:mt-10">
        <DataTable
          data={[]}
          columns={columns}
          onRowClick={(row) => {
            setRow(row)
            setDatas(row.original)
            setIsOpen(true)
          }}
        />
        <DataTableDrawer open={isOpen} onOpenChange={setIsOpen} datas={datas} />
      </div>
    </>
  )
}

