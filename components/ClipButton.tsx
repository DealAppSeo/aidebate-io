'use client'

import { useState } from 'react'
import { Scissors } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner or basic toast, falling back to alert if not
import { useDebateStore } from '@/lib/store/debateStore'

export const ClipButton = () => {
    const [isClipping, setIsClipping] = useState(false)
    const { currentTime } = useDebateStore()

    const handleClip = async () => {
        setIsClipping(true)

        // Mocking Clip Generation via Howler buffer slicing
        // In a real app this would use the AudioBufferSourceNode from Howler's internal context
        // For "MVP" visual, we simulate the delay.

        await new Promise(resolve => setTimeout(resolve, 1500));

        // In real impl: extract 15s from currentTime - 15 to currentTime
        // const blob = ...

        setIsClipping(false)
        alert(`✂️ Clip generated at ${Math.floor(currentTime)}s! (MVP Simulation)`)
    }

    return (
        <button
            onClick={handleClip}
            disabled={isClipping}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-300 transition-colors border border-gray-700 hover:border-pink-500"
        >
            <Scissors className={`w-3 h-3 ${isClipping ? 'animate-spin' : ''}`} />
            {isClipping ? 'Clipping...' : 'Clip That'}
        </button>
    )
}
