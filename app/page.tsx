'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import DebateList from '@/components/debates/DebateList'
import IntroExperience from '@/components/intro/IntroExperience'
import { getRandomMessage, HERO_TAGLINES } from '@/lib/viral-messages'
import Footer from '@/components/layout/Footer'
import { DailyDebate } from '@/components/DailyDebate'

export default function HomePage() {
  const [debates, setDebates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(false)
  const [heroTagline, setHeroTagline] = useState(HERO_TAGLINES[0])

  useEffect(() => {
    // Randomize hero on client mount
    setHeroTagline(getRandomMessage(HERO_TAGLINES))
  }, [])

  useEffect(() => {
    // Check if intro has been seen
    const hasSeenIntro = localStorage.getItem('aidebate_intro_seen')
    if (!hasSeenIntro) {
      setShowIntro(true)
    }
    fetchDebates()
  }, [])

  function handleIntroComplete() {
    setShowIntro(false)
    localStorage.setItem('aidebate_intro_seen', 'true')
  }

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
      {showIntro && <IntroExperience onComplete={handleIntroComplete} />}
      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <DailyDebate />

        <div className="text-center mb-16 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4 animate-pulse">
            LIVE: Global AI Consensus Period #42
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 mb-6 drop-shadow-2xl">
            Who Do You Trust?
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            {heroTagline}
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
