'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Bot,
    Cpu,
    DollarSign,
    Activity,
    Users,
    MessageSquare,
    Settings,
    Zap
} from 'lucide-react'

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin/agents', icon: Bot, label: 'ATS Agents' },
    { href: '/admin/providers', icon: Cpu, label: 'AI Providers' },
    { href: '/admin/queries', icon: MessageSquare, label: 'Live Queries' },
    { href: '/admin/scaling', icon: Zap, label: 'Auto-Scaling' },
    { href: '/admin/costs', icon: DollarSign, label: 'Costs' },
    { href: '/admin/engagement', icon: Activity, label: 'Engagement' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111] border-r border-[#27272a] p-4 flex flex-col h-screen fixed">
                <div className="mb-8 pl-2">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">⚡</span> ATS Control
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Trinity Symphony Dashboard</p>
                </div>

                <nav className="space-y-1 flex-1">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === item.href
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Live Status Indicator */}
                <div className="mt-8 p-3 bg-[#1a1a1a] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-400">System Online</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Current: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 pl-72 overflow-auto">
                {children}
            </main>
        </div>
    )
}
