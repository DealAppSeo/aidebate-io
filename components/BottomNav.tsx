"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Radio, label: "Live", path: "/live" },
    { icon: Trophy, label: "Ranks", path: "/leaderboard" },
    { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#111827]/95 backdrop-blur-lg border-t border-white/5">
            <div className="flex justify-around items-center h-full max-w-md mx-auto px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
