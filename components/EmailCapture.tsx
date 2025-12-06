"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EmailCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string) => void;
}

export function EmailCapture({ isOpen, onClose, onSuccess }: EmailCaptureProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Integrate with Supabase

        setIsLoading(false);
        toast.success("Welcome to the debate!", {
            description: "You can now vote and track your impact.",
        });
        onSuccess(email);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-center">
                        One quick step to vote
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Your votes help keep AI honest and accountable.
                        <br />
                        We'll never spam. Just important AI safety updates.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary/50 border-white/10 focus:border-primary h-12"
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isLoading}
                    >
                        {isLoading ? "Joining..." : "Start Voting"}
                    </Button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                    >
                        Just watching
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
