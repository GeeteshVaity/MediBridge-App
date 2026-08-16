"use client"

import Link from "next/link"
import {
  Heart,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Pill,
  Store,
  Upload,
  Package,
  Bell,
  TrendingUp,
  Users,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const patientFeatures = [
  {
    icon: Upload,
    title: "Upload Prescriptions",
    description:
      "Simply upload your prescription and let nearby stores prepare your order.",
    color: "blue",
  },
  {
    icon: MapPin,
    title: "Find Nearby Stores",
    description:
      "Discover medical stores close to you with real-time availability.",
    color: "green",
  },
  {
    icon: Clock,
    title: "Fastest Delivery Wins",
    description:
      "Your order goes to all nearby stores - the fastest one to respond delivers it to you.",
    color: "orange",
  },
]

const shopkeeperFeatures = [
  {
    icon: Bell,
    title: "Instant Order Alerts",
    description:
      "Get notified instantly when patients nearby need medicines from your store.",
    color: "purple",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Easily manage your stock, track medicines, and get low-stock alerts.",
    color: "teal",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description:
      "Reach more customers in your area and increase your daily sales.",
    color: "pink",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background pattern */}
      <div className="fixed inset-0 -z-10 animated-gradient opacity-50" />
      <div className="fixed inset-0 -z-10 pattern-dots" />
      
      <header className="sticky top-0 z-50 border-b glass-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient-blue shadow-lg group-hover:scale-110 transition-transform">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">MediBridge</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="font-semibold">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(147,197,253,0.2),transparent)]" />
        <div className="absolute top-20 left-10 w-80 h-80 orb-blue rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}} />
        <div className="absolute bottom-20 right-10 w-96 h-96 orb-green rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s'}} />
        <div className="absolute top-40 right-20 w-56 h-56 orb-yellow rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}} />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 orb-pink rounded-full blur-3xl animate-pulse" style={{animationDuration: '7s'}} />
        
        <div className="mx-auto max-w-4xl text-center relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-2 text-sm font-bold text-rose-500 shadow-sm">
            <Heart className="h-4 w-4 animate-pulse" fill="currentColor" />
            Healthcare made simple
          </div>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-800 md:text-6xl">
            Connecting Patients with <span className="bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 bg-clip-text text-transparent">Nearby Medical Stores</span> in Real Time
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600">
            MediBridge bridges the gap between patients and medical stores. Upload prescriptions, search for medicines, and get your orders fulfilled by verified stores near you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2 font-bold bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all border-0">
              <Link href="/signup">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-bold border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-105 transition-all">
              <Link href="/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/60 via-white to-emerald-50/60" />
        <div className="mx-auto max-w-6xl relative">
          {/* Patient Features */}
          <div className="mb-20">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-100 to-cyan-100 px-5 py-2 text-sm font-bold text-sky-600 mb-4 shadow-sm border border-sky-200/50">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400">
                  <Users className="h-3 w-3 text-white" />
                </div>
                For Patients
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800">Features for <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">Patients</span></h2>
              <p className="mt-3 text-slate-600 font-medium">Get your medicines quickly and conveniently</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {patientFeatures.map((f) => (
                <Card key={f.title} className="group border border-slate-100 bg-white/90 backdrop-blur-sm shadow-lg shadow-sky-100 hover:shadow-xl hover:shadow-sky-200/50 transition-all hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${f.color === 'blue' ? 'icon-gradient-blue' : f.color === 'green' ? 'icon-gradient-green' : 'icon-gradient-orange'} group-hover:scale-110 transition-transform`}>
                      <f.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 font-bold text-slate-800 text-lg">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Shopkeeper Features */}
          <div>
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-5 py-2 text-sm font-bold text-emerald-600 mb-4 shadow-sm border border-emerald-200/50">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400">
                  <Store className="h-3 w-3 text-white" />
                </div>
                For Pharmacy Owners
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800">Features for <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Shopkeepers</span></h2>
              <p className="mt-3 text-slate-600 font-medium">Grow your pharmacy business with MediBridge</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shopkeeperFeatures.map((f) => (
                <Card key={f.title} className="group border border-slate-100 bg-white/90 backdrop-blur-sm shadow-lg shadow-emerald-100 hover:shadow-xl hover:shadow-emerald-200/50 transition-all hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${f.color === 'purple' ? 'icon-gradient-purple' : f.color === 'teal' ? 'icon-gradient-teal' : 'icon-gradient-pink'} group-hover:scale-110 transition-transform`}>
                      <f.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 font-bold text-slate-800 text-lg">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
        <div className="absolute top-0 left-1/4 w-72 h-72 orb-blue rounded-full blur-3xl animate-pulse" style={{animationDuration: '9s'}} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 orb-teal rounded-full blur-3xl animate-pulse" style={{animationDuration: '11s'}} />
        
        <div className="mx-auto max-w-6xl relative">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold text-slate-800">How It <span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">Works</span></h2>
            <p className="mt-3 text-slate-600 font-medium">Get your medicines in three simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", icon: Pill, title: "Search or Upload", desc: "Search for medicines or upload your prescription image.", gradient: "icon-gradient-blue" },
              { step: "02", icon: Store, title: "Choose a Store", desc: "Browse nearby stores with stock availability and pricing.", gradient: "icon-gradient-green" },
              { step: "03", icon: MapPin, title: "Track & Receive", desc: "Place your order and track it in real time until delivery.", gradient: "icon-gradient-orange" },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="relative">
                  <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl ${item.gradient} text-white shadow-xl shadow-slate-200 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                    <item.icon className="h-9 w-9" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center font-extrabold text-xs text-sky-500">
                    {item.step}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-800">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 relative">
        <div className="mx-auto max-w-4xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 rounded-3xl blur-xl opacity-30" />
          <div className="relative rounded-3xl bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 px-8 py-16 text-center text-white shadow-2xl shadow-teal-200/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/15 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/10 rounded-full" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Get Started?</h2>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-white/95 font-medium text-lg">
                Join thousands of patients and medical stores already using MediBridge to streamline their healthcare experience.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2 font-bold bg-white text-teal-600 hover:bg-white/90 shadow-lg hover:scale-105 transition-transform">
                  <Link href="/signup">
                    Sign Up as Patient
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 font-bold hover:scale-105 transition-transform">
                  <Link href="/signup">Register Your Store</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient-blue shadow-lg">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent text-lg">MediBridge</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">© 2026 MediBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


