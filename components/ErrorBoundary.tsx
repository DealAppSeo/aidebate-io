'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h1>
                    <p className="text-gray-400 mb-6">We encountered an unexpected error.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
