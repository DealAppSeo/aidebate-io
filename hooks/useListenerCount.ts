import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export const useListenerCount = (debateId: string) => {
    const [count, setCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase.channel(`debate:${debateId}`, {
            config: { presence: { key: debateId } }
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                setCount(Object.keys(state).length);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        joined_at: new Date().toISOString(),
                        online_at: new Date().toISOString()
                    });
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, [debateId, supabase]);

    return count;
};
