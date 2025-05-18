"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Badge, BadgeProps } from "@/components/Badge"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import { Transaction, expense_statuses, categories } from "@/data/schema"
import { formatters } from "@/lib/utils"
import { db, auth } from "@/lib/firebase"
import { setDoc, doc } from "firebase/firestore"
import { File, Trash2, Download } from "lucide-react"
import { format } from "date-fns"
import { DataTableDrawerFeed } from "@/app/(dashboard)/transactions/_components/DataTableDrawerFeed"

interface DataTableDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  datas: Transaction | undefined
}

export function DataTableDrawer({
  open,
  onOpenChange,
  datas,
}: DataTableDrawerProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:5500/classify", {
  method: "POST",
  body: formData,
})

      const data = await res.json()
      if (data.result) {
        const [category, amount] = data.result.split(" ")
        console.log("Category:", category)
        console.log("Amount:", amount)
      } else {
        console.error(data.error || "Unknown error")
      }
    } catch (error: any) {
  console.error("Error saving:", error?.message || error)
  alert(`Failed to save. ${error?.message || ""}`)
  }
  }

  const { getInputProps } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles)
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0])
        await handleFileUpload(acceptedFiles[0])
      }
    },
  })

  

  const handleSubmit = async () => {
  if (!uploadedFile) {
    alert("Please upload a receipt.")
    return
  }

  setIsSubmitting(true)
  try {
    const formData = new FormData()
    formData.append("file", uploadedFile)

    const res = await fetch("http://localhost:5500/classify", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log("LLM result:", data.result)

    const match = data.result.match(/([a-zA-Z\s&]+)\s+([\d.]+)/)
    if (!match) {
      alert("Unexpected format from classification result.")
      return
    }

    const [, category, amountStr] = match
    const amount = parseFloat(amountStr)

    if (isNaN(amount)) {
      alert("Amount is not a number.")
      return
    }

    const user = auth.currentUser
    if (!user) {
      alert("Not logged in.")
      return
    }

    const docRef = doc(db, "transactions", `${Date.now()}`)
    await setDoc(docRef, {
      userId: user.uid,
      category: category.trim(),
      amount,
      createdAt: new Date().toISOString(),
    })

    alert("Saved to Firebase!")
  } catch (error) {
    console.error("Error saving:", error)
    alert("Failed to save. See console for details.")
  } finally {
    setIsSubmitting(false)
  }
}


  const status = expense_statuses.find(
    (item) => item.value === datas?.expense_status
  )

  const filesList = files.map((file) => (
    <li
      key={file.name}
      className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#090E1A]"
    >
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-rose-500"
          onClick={() =>
            setFiles((prev) => prev.filter((f) => f.name !== file.name))
          }
        >
          <Trash2 className="size-5" />
        </button>
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-500"
        >
          <Download className="size-5" />
        </button>
      </div>
      <div className="flex items-center space-x-3 truncate">
        <span className="flex size-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
          <File className="size-5 text-gray-700 dark:text-gray-300" />
        </span>
        <div className="truncate pr-20">
          <p className="text-xs font-medium text-gray-900 dark:text-gray-50 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {file.size} bytes
          </p>
        </div>
      </div>
    </li>
  ))

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-x-hidden sm:max-w-lg dark:bg-gray-925">
        <DrawerHeader>
          <DrawerTitle className="flex justify-between">
            <span>{datas?.merchant ?? "New Transaction"}</span>
            {datas?.amount && <span>${datas.amount}</span>}
          </DrawerTitle>
          {datas?.transaction_date && (
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span>{format(new Date(datas.transaction_date), "MMM dd, yyyy 'at' hh:mm")}</span>
              {status && <Badge variant={status.variant as BadgeProps["variant"]}>{status.label}</Badge>}
            </div>
          )}
        </DrawerHeader>
        <DrawerBody>
          <Tabs defaultValue="details">
            <TabsList className="px-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-6 px-6">
              <div>
                <Label htmlFor="file">Upload receipt</Label>
                <div className="mt-2 flex h-36 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="text-center">
                    <File className="mx-auto size-9 text-gray-400" />
                    <label className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                      Click <input {...getInputProps()} className="sr-only" />
                    </label>
                    <p className="text-xs text-gray-500">or drag here. JPG, PNG, PDF</p>
                  </div>
                </div>
                {filesList.length > 0 && (
                  <>
                    <h4 className="mt-6 text-sm font-medium text-gray-900 dark:text-gray-50">
                      File(s) to upload
                    </h4>
                    <ul className="mt-2 space-y-4">{filesList}</ul>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="accounting" className="space-y-6 px-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Audit trail</h3>
              <DataTableDrawerFeed />
            </TabsContent>
          </Tabs>
        </DrawerBody>
        <DrawerFooter className="gap-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
