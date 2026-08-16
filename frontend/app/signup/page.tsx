"use client"

import { useState } from "react"
import Link from "next/link"
import { Pill, Upload as UploadIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

type Role = "patient" | "shop"

export default function SignUpPage() {
  const [role, setRole] = useState<Role>("patient")
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
    shopAddress: "",
  })
  const { register } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
      ...(role === "shop" && { shopName: formData.shopName }),
      ...(role === "shop" && { shopAddress: formData.shopAddress }),
    })

    if (!result.success) {
      setError(result.error || "An error occurred during signup")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Bright animated background */}
      <div className="fixed inset-0 -z-10 animated-gradient opacity-70" />
      <div className="fixed inset-0 -z-10 pattern-dots" />
      <div className="absolute top-20 left-10 w-80 h-80 orb-blue rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}} />
      <div className="absolute bottom-20 right-10 w-96 h-96 orb-green rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s'}} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 orb-teal rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDuration: '7s'}} />
      
      <Link href="/" className="mb-8 flex items-center gap-2 group relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient-blue shadow-xl shadow-sky-200 group-hover:scale-110 transition-transform">
          <Pill className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">MediBridge</span>
      </Link>

      <Card className="w-full max-w-md border border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl shadow-sky-100">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-extrabold text-slate-800">Create an Account</CardTitle>
          <CardDescription className="text-base text-slate-600">Choose your role and fill in the <span className="font-semibold bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">details</span></CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Toggle */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                role === "patient"
                  ? "icon-gradient-blue text-white shadow-lg shadow-sky-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🩺 Patient
            </button>
            <button
              type="button"
              onClick={() => setRole("shop")}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                role === "shop"
                  ? "icon-gradient-green text-white shadow-lg shadow-emerald-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🏪 Shopkeeper
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm font-medium text-rose-600">
                ⚠️ {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-bold text-slate-700">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                className="border-2 border-slate-200 focus:border-sky-400 bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-bold text-slate-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className="border-2 border-slate-200 focus:border-sky-400 bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="font-bold text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                required
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="border-2 border-slate-200 focus:border-sky-400 bg-white"
              />
            </div>

            {role === "shop" && (
              <>
                <div className="my-2 border-t-2 border-dashed border-emerald-200" />
                <p className="text-sm font-bold text-emerald-600">🏪 Shop Information</p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="shopName" className="font-bold text-slate-700">Shop Name</Label>
                  <Input
                    id="shopName"
                    placeholder="MediCare Pharmacy"
                    required
                    value={formData.shopName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="border-2 border-slate-200 focus:border-emerald-400 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="shopAddress" className="font-bold text-slate-700">Shop Address</Label>
                  <Input
                    id="shopAddress"
                    placeholder="123 Health St, Medical District"
                    required
                    value={formData.shopAddress}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="border-2 border-slate-200 focus:border-emerald-400 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="license" className="font-bold text-slate-700">License Upload</Label>
                  <label
                    htmlFor="license"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 transition-colors hover:border-emerald-400 hover:bg-emerald-100"
                  >
                    <UploadIcon className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      {fileName || "Click to upload license document"}
                    </span>
                    <input
                      id="license"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isLoading}
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                    />
                  </label>
                </div>
              </>
            )}

            <Button type="submit" className="mt-4 w-full font-bold text-base bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 hover:scale-[1.02] transition-all border-0" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-sky-500 hover:text-sky-600 hover:underline">
              Login →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


