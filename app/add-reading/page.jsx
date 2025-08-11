"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Calendar, Zap } from "lucide-react"

export default function AddReadingPage() {
  const router = useRouter()
  const [meterId, setMeterId] = useState(1)
  const [readingDate, setReadingDate] = useState("")
  const [totalUnits, setTotalUnits] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = (today.getMonth() + 1).toString().padStart(2, "0")
    const dd = today.getDate().toString().padStart(2, "0")
    setReadingDate(`${yyyy}-${mm}-${dd}`)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)

    if (!readingDate || totalUnits === "") {
      alert("Please fill all fields.")
      setIsSubmitting(false)
      return
    }

    const unitsNumber = Number(totalUnits)
    if (isNaN(unitsNumber) || unitsNumber < 0) {
      alert("Please enter a valid non-negative number for total units.")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meter_id: meterId,
          reading_date: readingDate,
          total_units: unitsNumber,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to save reading.")
        setIsSubmitting(false)
        return
      }

      alert("Reading saved successfully!")
      router.push("/")
    } catch (error) {
      alert("Network error: failed to save reading.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
            <span className="text-slate-700 font-medium">Back</span>
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Add Reading
              </h1>
            </div>
            <p className="text-slate-600">Record your latest meter reading</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meter Selection */}
            <div>
              <label htmlFor="meter" className="block text-sm font-semibold text-slate-700 mb-3">
                Select Meter
              </label>
              <div className="relative">
                <select
                  id="meter"
                  value={meterId}
                  onChange={(e) => setMeterId(Number(e.target.value))}
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 font-medium appearance-none cursor-pointer transition-all duration-300"
                >
                  <option value={1}>🏠 Home Meter</option>
                  <option value={2}>❄️ AC Meter</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Reading Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reading Date
                </div>
              </label>
              <input
                type="date"
                id="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 font-medium transition-all duration-300"
                required
              />
            </div>

            {/* Total Units */}
            <div>
              <label htmlFor="units" className="block text-sm font-semibold text-slate-700 mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Total Units (kWh)
                </div>
              </label>
              <input
                type="number"
                id="units"
                min={0}
                step="0.01"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                placeholder="Enter total meter reading"
                className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 font-medium transition-all duration-300 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Reading...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Save Reading
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
