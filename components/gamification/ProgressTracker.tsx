'use client'

interface ProgressTrackerProps {
    current: number
    total: number
    label: string
}

export default function ProgressTracker({ current, total, label }: ProgressTrackerProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${i < current ? 'bg-blue-500' : 'bg-gray-700'
                            }`}
                    />
                ))}
            </div>
            <span className="text-sm text-gray-400">
                {current}/{total} {label}
            </span>
        </div>
    )
}
