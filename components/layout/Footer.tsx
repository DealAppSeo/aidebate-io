'use client'

import { useState, useEffect } from 'react'

// PurposeHub is intentionally omitted until we audit that site (2026-07-23).
const TAGLINES = [
    { text: "Reduce AI spend while promoting safe & ethical AI", url: "https://aitrinitysymphony.com" },
    { text: "Looking for a mentor or ways to grow?", url: "https://imagebearer.org" }
]

export default function Footer() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % TAGLINES.length)
        }, 10000) // 10 seconds

        return () => clearInterval(interval)
    }, [])

    const currentTagline = TAGLINES[index]

    return (
        <footer className="w-full py-8 mt-12 border-t border-[#27272a] bg-black text-center">
            <div className="flex flex-col items-center gap-3 text-sm text-gray-500">

                {/* Ecosystem anchor */}
                <a
                    href="https://hyperdag.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                    <span className="text-blue-500 text-lg">◉</span>
                    <span>Part of the HyperDAG trust ecosystem</span>
                </a>

                {/* Invitation + updates — links only, no capture (that lives on hyperdag.org) */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
                    <a
                        href="https://github.com/DealAppSeo/trust-commons/discussions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                    >
                        Join the conversation →
                    </a>
                    <span className="text-gray-700" aria-hidden="true">·</span>
                    <a
                        href="https://hyperdag.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                    >
                        Get updates →
                    </a>
                </div>

                {/* Rotating tagline (mission properties) */}
                <div className="h-6 overflow-hidden">
                    <a
                        href={currentTagline.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-gray-600 hover:text-blue-400 transition-colors animate-fade-in-up"
                        key={index} // Force re-render for animation
                    >
                        {currentTagline.text} →
                    </a>
                </div>

                <div className="text-xs text-gray-700 mt-1">
                    Powered by AI Trinity Symphony · © {new Date().getFullYear()} AIDebate.io
                </div>
            </div>
        </footer>
    )
}
