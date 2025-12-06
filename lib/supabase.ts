import { createClient } from '@supabase/supabase-js';

// Define Database Types based on schema
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            ai_models: {
                Row: {
                    id: number
                    name: string
                    provider: string
                    model_version: string | null
                    avatar_url: string | null
                    overall_repid: number
                    score_honesty: number
                    score_ethics: number
                    score_safety: number
                    score_helpfulness: number
                    score_transparency: number
                    score_capability: number
                    total_votes: number
                    total_debates: number
                    total_flags: number
                    win_rate: number
                    confidence: number
                    benchmark_source: string | null
                    last_updated: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    name: string
                    provider: string
                    model_version?: string | null
                    avatar_url?: string | null
                    overall_repid?: number
                    score_honesty?: number
                    score_ethics?: number
                    score_safety?: number
                    score_helpfulness?: number
                    score_transparency?: number
                    score_capability?: number
                    total_votes?: number
                    total_debates?: number
                    total_flags?: number
                    win_rate?: number
                    confidence?: number
                    benchmark_source?: string | null
                    last_updated?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: number
                    name?: string
                    provider?: string
                    model_version?: string | null
                    avatar_url?: string | null
                    overall_repid?: number
                    score_honesty?: number
                    score_ethics?: number
                    score_safety?: number
                    score_helpfulness?: number
                    score_transparency?: number
                    score_capability?: number
                    total_votes?: number
                    total_debates?: number
                    total_flags?: number
                    win_rate?: number
                    confidence?: number
                    benchmark_source?: string | null
                    last_updated?: string | null
                    created_at?: string | null
                }
            }
            aidebate_users: {
                Row: {
                    id: number
                    email: string
                    display_name: string | null
                    avatar_url: string | null
                    repid_balance: number
                    tier: string
                    alter_ego_name: string | null
                    alter_ego_avatar: string | null
                    total_votes: number
                    vote_streak: number
                    longest_streak: number
                    last_vote_at: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: number
                    email: string
                    display_name?: string | null
                    avatar_url?: string | null
                    repid_balance?: number
                    tier?: string
                    alter_ego_name?: string | null
                    alter_ego_avatar?: string | null
                    total_votes?: number
                    vote_streak?: number
                    longest_streak?: number
                    last_vote_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: number
                    email?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    repid_balance?: number
                    tier?: string
                    alter_ego_name?: string | null
                    alter_ego_avatar?: string | null
                    total_votes?: number
                    vote_streak?: number
                    longest_streak?: number
                    last_vote_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            debates: {
                Row: {
                    id: number
                    topic_id: number
                    model_a_response: string | null
                    model_b_response: string | null
                    model_c_response: string | null
                    model_a_votes: number
                    model_b_votes: number
                    model_c_votes: number
                    total_views: number
                    total_shares: number
                    status: string
                    voting_ends_at: string | null
                    created_at: string | null
                    completed_at: string | null
                }
                Insert: {
                    id?: number
                    topic_id: number
                    model_a_response?: string | null
                    model_b_response?: string | null
                    model_c_response?: string | null
                    model_a_votes?: number
                    model_b_votes?: number
                    model_c_votes?: number
                    total_views?: number
                    total_shares?: number
                    status?: string
                    voting_ends_at?: string | null
                    created_at?: string | null
                    completed_at?: string | null
                }
                Update: {
                    id?: number
                    topic_id?: number
                    model_a_response?: string | null
                    model_b_response?: string | null
                    model_c_response?: string | null
                    model_a_votes?: number
                    model_b_votes?: number
                    model_c_votes?: number
                    total_views?: number
                    total_shares?: number
                    status?: string
                    voting_ends_at?: string | null
                    created_at?: string | null
                    completed_at?: string | null
                }
            }
            aidebate_topics: {
                Row: {
                    id: number
                    title: string
                    model_a: string
                    model_a_position: string | null
                    model_b: string
                    model_b_position: string | null
                    model_c: string | null
                    model_c_position: string | null
                    viral_hook: string | null
                    primary_dimension: string | null
                    controversy_score: number
                    status: string
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    title: string
                    model_a: string
                    model_a_position?: string | null
                    model_b: string
                    model_b_position?: string | null
                    model_c?: string | null
                    model_c_position?: string | null
                    viral_hook?: string | null
                    primary_dimension?: string | null
                    controversy_score?: number
                    status?: string
                    created_at?: string | null
                }
                Update: {
                    id?: number
                    title?: string
                    model_a?: string
                    model_a_position?: string | null
                    model_b?: string
                    model_b_position?: string | null
                    model_c?: string | null
                    model_c_position?: string | null
                    viral_hook?: string | null
                    primary_dimension?: string | null
                    controversy_score?: number
                    status?: string
                    created_at?: string | null
                }
            }
            votes: {
                Row: {
                    id: number
                    user_id: number
                    debate_id: number
                    voted_for: string
                    repid_earned: number
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    user_id: number
                    debate_id: number
                    voted_for: string
                    repid_earned?: number
                    created_at?: string | null
                }
                Update: {
                    id?: number
                    user_id?: number
                    debate_id?: number
                    voted_for?: string
                    repid_earned?: number
                    created_at?: string | null
                }
            }
        }
        Views: {
            active_debates: {
                Row: {
                    id: number
                    title: string
                    viral_hook: string | null
                    model_a: string
                    model_b: string
                    model_c: string | null
                    model_a_votes: number
                    model_b_votes: number
                    model_c_votes: number
                    total_views: number
                    status: string
                    created_at: string | null
                }
            }
            ai_leaderboard: {
                Row: {
                    name: string
                    provider: string
                    overall_repid: number
                    total_votes: number
                    rank: number
                }
            }
        }
    }
}

// Use environment variables or fallback to empty strings to prevent build errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Realtime subscription helper
export function subscribeToDebate(debateId: string, callback: (payload: any) => void) {
    return supabase
        .channel(`debate:${debateId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'debates',
            filter: `id=eq.${debateId}`
        }, callback)
        .subscribe();
}

// Mock data for development when no DB connection
export const MOCK_DEBATES = [
    {
        id: "1",
        topic: "Is AI More Creative Than Humans?",
        participants: [
            { name: "Claude 3.5 Sonnet", provider: "Anthropic", score: 85, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Claude" },
            { name: "GPT-4o", provider: "OpenAI", score: 82, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GPT4" }
        ],
        votes: { "Claude 3.5 Sonnet": 1240, "GPT-4o": 1150 },
        status: "active",
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString() // 2 hours from now
    },
    {
        id: "2",
        topic: "Should AI Ever Lie to Protect Someone?",
        participants: [
            { name: "Gemini 1.5 Pro", provider: "Google", score: 78, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Gemini" },
            { name: "GPT-4o", provider: "OpenAI", score: 82, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GPT4" }
        ],
        votes: { "Gemini 1.5 Pro": 890, "GPT-4o": 920 },
        status: "active",
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString()
    },
    {
        id: "3",
        topic: "Will AI Replace Programmers by 2030?",
        participants: [
            { name: "Llama 3", provider: "Meta", score: 74, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Llama" },
            { name: "Mistral Large", provider: "Mistral", score: 71, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Mistral" }
        ],
        votes: { "Llama 3": 540, "Mistral Large": 480 },
        status: "active",
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString()
    }
];
