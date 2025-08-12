"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [meterId, setMeterId] = useState(1) // default Home meter
  const [readings, setReadings] = useState([])
  const [lastReadingInfo, setLastReadingInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        // Fetch readings
        const readingsRes = await fetch(`/api/readingsData?meter_id=${meterId}`)
       
        if (!readingsRes.ok) throw new Error("Failed to fetch readings")
        const readingsData = await readingsRes.json()
        setReadings(readingsData.readings || [])

        // Fetch last reading info
        const lastReadingRes = await fetch(`/api/getReadingDate?meter_id=${meterId}`)
        if (lastReadingRes.ok) {
          const lastReadingData = await lastReadingRes.json()
          setLastReadingInfo(lastReadingData)
        } else {
          setLastReadingInfo(null)
        }
      } catch (err) {
        setError(err.message)
        setReadings([])
        setLastReadingInfo(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [meterId])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-based
  const monthName = now.toLocaleString("default", { month: "long" })

  // Updated calculation logic to use last reading date instead of current month
  let totalUnitsUsed = 0
  let daysSinceReading = 0
  let averageDailyUsage = "0.00"
  let progressPercent = "0.0"
  let progressLabel = "No reading date set"
  let timeLabel = "Set reading date first"

  if (lastReadingInfo) {
  const lastReadingDate = new Date(lastReadingInfo.reading_date);
  const lastReadingUnits = lastReadingInfo.units;

  // Calculate days since last reading
  const timeDiff = now.getTime() - lastReadingDate.getTime();
  daysSinceReading = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Filter readings after last reading date
  const readingsAfterLastDate = readings.filter((r) => {
    const readingDate = new Date(r.reading_date);
    return readingDate > lastReadingDate;
  });

  if (readingsAfterLastDate.length > 0) {
    // Sort descending by date, get the latest reading
    const sortedReadings = [...readingsAfterLastDate].sort(
      (a, b) => new Date(b.reading_date) - new Date(a.reading_date)
    );
    const latestReading = sortedReadings[0];

    // Make sure property names are consistent (change to `.units` if needed)
    const latestUnits = latestReading.units ?? latestReading.total_units;

    if (typeof latestUnits === "number" && typeof lastReadingUnits === "number") {
      totalUnitsUsed = Math.max(0, latestUnits - lastReadingUnits);
    } else {
      totalUnitsUsed = 0;
    }
  }
  
  if (daysSinceReading > 0) {
    averageDailyUsage = (totalUnitsUsed / daysSinceReading).toFixed(2);
  }

  const cycleDays = 30;
  progressPercent = Math.min((daysSinceReading / cycleDays) * 100, 100).toFixed(1);
  progressLabel = `${daysSinceReading} days since last reading`;
  timeLabel = `${daysSinceReading} days elapsed`;
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              NIAZI HOUSE
            </h1>
          </div>
          <p className="text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto">
            Smart electricity monitoring for efficient energy management
          </p>
        </header>

        {/* Meter Selector */}
        <div className="max-w-sm mx-auto mb-12">
          <label className="block text-slate-700 font-semibold text-lg mb-3">Select Meter</label>
          <div className="relative">
            <select
              value={meterId}
              onChange={(e) => setMeterId(Number(e.target.value))}
              className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-6 py-4 text-lg font-medium text-slate-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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

        {/* Loading & Error States */}
        {loading && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-sm">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Loading readings...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
              <p className="text-red-700 font-medium">⚠️ Error: {error}</p>
            </div>
          </div>
        )}

        {/* Added warning message when no reading date is set */}
        {!loading && !lastReadingInfo && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-800 font-semibold">No reading date configured</p>
                  <p className="text-amber-700 text-sm">Set your last reading date for accurate calculations</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Units Used */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Total Units Used</h2>
                <p className="text-slate-500 font-medium">
                  {/* Updated label to show since last reading */}
                  {lastReadingInfo
                    ? `Since ${new Date(lastReadingInfo.reading_date).toLocaleDateString()}`
                    : "Set reading date"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {totalUnitsUsed}
              </p>
              <p className="text-slate-500 font-medium mt-1">kWh</p>
            </div>
          </div>

          {/* Average Daily Usage */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Daily Average</h2>
                <p className="text-slate-500 font-medium">units per day</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {averageDailyUsage}
              </p>
              <p className="text-slate-500 font-medium mt-1">kWh/day</p>
            </div>
          </div>

          {/* Reading Progress */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Reading Progress</h2>
                <p className="text-slate-500 font-medium">{progressLabel}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-600">{progressPercent}% of cycle</span>
                <span className="text-sm text-slate-500">{timeLabel}</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">{daysSinceReading}</p>
                <p className="text-slate-500">Days elapsed</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">{Math.max(0, 30 - daysSinceReading)}</p>
                <p className="text-slate-500">Days to next</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div
            onClick={() => router.push("/add-reading")}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">Add New Reading</h2>
                  <p className="text-blue-100">Record your latest meter data</p>
                </div>
              </div>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Keep your energy tracking up to date by recording your latest meter reading. Monitor usage patterns and
                optimize your electricity consumption.
              </p>
              <div className="flex items-center gap-3 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                <span>Add Reading</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push("/view-history")}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">View History</h2>
                  <p className="text-emerald-100">Analyze your usage trends</p>
                </div>
              </div>
              <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                Explore detailed historical data and monthly trends. Gain insights into your electricity consumption
                patterns to make informed decisions.
              </p>
              <div className="flex items-center gap-3 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                <span>View History</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Set Reading Date */}
          <div
            onClick={() => router.push("/reading-date")}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">Set Reading Date</h2>
                  <p className="text-purple-100">Configure last reading info</p>
                </div>
              </div>
              <p className="text-purple-100 text-lg mb-8 leading-relaxed">
                Set your last meter reading date and units to calculate accurate usage from that specific date onwards.
                Perfect for readings done between 25th-31st of each month.
              </p>
              <div className="flex items-center gap-3 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                <span>Set Date</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">© {year} Niazi House — All rights reserved</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
