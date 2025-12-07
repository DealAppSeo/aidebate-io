'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()

        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })

        if (res.ok) {
            router.push('/admin')
            router.refresh()
        } else {
            setError('Invalid password')
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <form onSubmit={handleLogin} className="bg-[#111] p-8 rounded-xl border border-[#27272a] w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition">
                    Login
                </button>
            </form>
        </div>
    )
}
