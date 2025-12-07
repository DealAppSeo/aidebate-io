'use client'

import { useState, useEffect } from 'react'

const TAGLINES = [
    { text: "Reduce AI spend while promoting safe & ethical AI", url: "https://aitrinitysymphony.com" },
    { text: "Looking for a mentor or ways to grow?", url: "https://imagebearer.org" },
    { text: "Find meaning & opportunities", url: "https://purposehub.ai" }
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
        <footer className="w-full py-6 mt-12 border-t border-[#27272a] bg-black text-center">
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500">

                {/* Static Branding */}
                <a
                    href="https://aitrinitysymphony.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                    <span className="text-blue-500 text-lg">◉</span>
                    <span>Powered by AI Trinity Symphony</span>
                </a>

                {/* Rotating Tagline */}
                <div className="h-6 overflow-hidden">
                    <a
                        href={currentTagline.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:text-blue-400 transition-colors animate-fade-in-up"
                        key={index} // Force re-render for animation
                    >
                        {currentTagline.text} →
                    </a>
                </div>

                <div className="text-xs text-gray-700 mt-2">
                    © {new Date().getFullYear()} AIDebate.io
                </div>
            </div>
        </footer>
    )
}
