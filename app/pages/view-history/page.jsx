"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Zap, TrendingUp } from "lucide-react"

export default function ViewHistory() {
  const router = useRouter()
  const [meterId, setMeterId] = useState(1)
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchReadings() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/readingsData?meter_id=${meterId}`)
        if (!res.ok) throw new Error("Failed to fetch readings")
        const data = await res.json()
        setReadings(data.readings || [])
      } catch (err) {
        setError(err.message)
        setReadings([])
      } finally {
        setLoading(false)
      }
    }
    fetchReadings()
  }, [meterId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
            <span className="text-slate-700 font-medium">Back to Home</span>
          </button>
        </div>

        {/* Title and Meter Selection */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Reading History
            </h1>
          </div>

          <div className="max-w-xs mx-auto">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Meter</label>
            <div className="relative">
              <select
                value={meterId}
                onChange={(e) => setMeterId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 font-medium appearance-none cursor-pointer transition-all duration-300"
              >
                <option value={1}>🏠 Home Meter</option>
                <option value={2}>❄️ AC Meter</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <Zap className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-slate-600 font-medium mt-4">Loading readings...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-semibold text-lg">Error Loading Data</p>
              <p className="text-slate-600 mt-2">{error}</p>
            </div>
          )}

          {!loading && !error && readings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-slate-100 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">No Readings Found</p>
              <p className="text-slate-500 mt-2">Start by adding your first meter reading</p>
            </div>
          )}

          {!loading && readings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
                    <th className="text-left px-6 py-4 text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Total Units
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {readings
                    .slice()
                    .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
                    .map((reading, index) => (
                      <tr
                        key={reading.id}
                        className={`border-b border-slate-200/50 hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white/40" : "bg-slate-50/40"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">
                            {new Date(reading.reading_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-800">
                              {reading.total_units.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500 font-medium">kWh</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
