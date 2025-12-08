import Header from '@/components/layout/Header'
import { EmailCapture } from '@/components/EmailCapture'

export default function JoinPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            <main className="container mx-auto px-4 py-16 max-w-2xl">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        The AI Ethics Council
                    </h1>
                    <p className="text-xl text-gray-400">
                        AI rates you every day. Now you rate AI.
                    </p>
                </div>

                <EmailCapture source="join_page" />

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-4">
                        <div className="text-3xl mb-2">⚖️</div>
                        <h3 className="font-bold text-white mb-2">Weekly Votes</h3>
                        <p className="text-sm text-gray-400">Influence real ethical dilemmas facing AI development.</p>
                    </div>
                    <div className="p-4">
                        <div className="text-3xl mb-2">🛡️</div>
                        <h3 className="font-bold text-white mb-2">Safety Digest</h3>
                        <p className="text-sm text-gray-400">Curated news on AI safety, risks, and regulations.</p>
                    </div>
                    <div className="p-4">
                        <div className="text-3xl mb-2">🚀</div>
                        <h3 className="font-bold text-white mb-2">Early Access</h3>
                        <p className="text-sm text-gray-400">Test new debate features and models before anyone else.</p>
                    </div>
                </div>

                <div className="mt-16 text-center text-sm text-gray-500">
                    <p>Join 10,000+ members • Unsubscribe anytime</p>
                </div>
            </main>
        </div>
    )
}
