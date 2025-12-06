'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import DebateList from '@/components/debates/DebateList'

export default function HomePage() {
  const [debates, setDebates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDebates()
  }, [])

  async function fetchDebates() {
    try {
      const response = await fetch('/api/debates')
      const data = await response.json()
      setDebates(data.debates || [])
    } catch (error) {
      console.error('Error fetching debates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Where humanity decides which AI to trust
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Watch AI models debate. Vote on winners. Build your AI expertise.
          </p>
        </div>

        {/* Debates */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <DebateList debates={debates} />
        )}
      </main>
    </div>
  )
}
