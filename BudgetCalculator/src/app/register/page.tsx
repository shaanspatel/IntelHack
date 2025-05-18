"use client"

import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Logo } from "@/components/ui/Logo"
import { RiGoogleFill } from "@remixicon/react"
import { useRouter } from "next/navigation"
import { registerWithEmail, signInWithGoogle } from "@/lib/auth"
import React from "react"

export default function Register() {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
      const name = form.querySelector<HTMLInputElement>("#name-form-item")?.value || ""
      const email = form.querySelector<HTMLInputElement>("#email-form-item")?.value || ""
      const password = form.querySelector<HTMLInputElement>("#password-form-item")?.value || ""

    try {
      await registerWithEmail(email, password, name)
      router.push("/reports")
    } catch (err) {
      console.error("Registration error:", err)
      alert("Failed to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 sm:p-6">
      <div className="flex w-full flex-col items-start sm:max-w-sm">
        <div className="relative flex items-center justify-center rounded-lg bg-white p-3 shadow-lg ring-1 ring-black/5">
          <Logo
            className="size-8 text-blue-500 dark:text-blue-500"
            aria-label="Insights logo"
          />
        </div>
        <div className="mt-6 flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <a
              className="text-blue-500 hover:text-blue-600 dark:text-blue-500 hover:dark:text-blue-400"
              href="/login"
            >
              Log in
            </a>
          </p>
        </div>
        <div className="mt-10 w-full">
          <div className="gap-2 sm:flex sm:flex-row sm:items-center">
          <div className="flex justify-center w-full">
              <Button
                onClick={() => {
                  signInWithGoogle().then(() => router.push("/dashboard"))
                }}
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <RiGoogleFill className="size-4" aria-hidden="true" />
                Sign up with Google
              </Button>
</div>
          </div>
          <Divider className="my-6">or</Divider>
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-y-6">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="name-form-item" className="font-medium">
                  Name
                </Label>
                <Input
                  type="text"
                  autoComplete="name"
                  name="name"
                  id="name-form-item"
                  placeholder="John Doe"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email-form-item" className="font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  autoComplete="email"
                  name="email"
                  id="email-form-item"
                  placeholder="hello@123.com"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password-form-item" className="font-medium">
                  Password
                </Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  name="password"
                  id="password-form-item"
                  placeholder="Create a password"
                />
              </div>
            </div>
            <Button type="submit" isLoading={loading}>
              {loading ? "" : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
