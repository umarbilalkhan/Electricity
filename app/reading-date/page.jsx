"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ReadingDatePage() {
  const router = useRouter()
  const [meterId, setMeterId] = useState(1)
  const [readingDate, setReadingDate] = useState("")
  const [units, setUnits] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!readingDate || !units) {
      setError("Please fill in all fields")
      return
    }

    if (isNaN(units) || Number(units) < 0) {
      setError("Please enter a valid units number")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setReadingDate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meter_id: meterId,
          reading_date: readingDate,
          units: Number(units),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save reading date")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Set Reading Date
            </h1>
          </div>
          <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
            Configure your last meter reading date and units for accurate usage calculations
          </p>
        </header>

        {/* Success Message */}
        {success && (
          <div className="mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-800 font-semibold">Reading date saved successfully!</p>
                  <p className="text-emerald-600 text-sm">Redirecting to home page...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Meter Selection */}
            <div>
              <label className="block text-slate-700 font-semibold text-lg mb-3">Select Meter</label>
              <div className="relative">
                <select
                  value={meterId}
                  onChange={(e) => setMeterId(Number(e.target.value))}
                  className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-6 py-4 text-lg font-medium text-slate-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  disabled={loading}
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
              <label className="block text-slate-700 font-semibold text-lg mb-3">Last Reading Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={readingDate}
                  onChange={(e) => setReadingDate(e.target.value)}
                  className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-6 py-4 text-lg font-medium text-slate-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  disabled={loading}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-2">
                Enter the date when your last meter reading was taken (typically between 25th-31st of the month)
              </p>
            </div>

            {/* Units */}
            <div>
              <label className="block text-slate-700 font-semibold text-lg mb-3">Units Reading</label>
              <div className="relative">
                <input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="Enter units from your meter"
                  className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-6 py-4 text-lg font-medium text-slate-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  disabled={loading}
                  min="0"
                  step="0.01"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-slate-400 font-medium">kWh</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-2">
                Enter the exact units shown on your electricity meter on the reading date
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Reading Date...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Reading Date</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-900 font-semibold text-lg mb-2">How This Works</h3>
              <p className="text-blue-800 leading-relaxed">
                By setting your last reading date and units, the system will calculate your electricity usage from that
                specific date onwards. This is perfect for readings taken between the 25th-31st of each month, providing
                more accurate usage tracking than calendar month calculations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
