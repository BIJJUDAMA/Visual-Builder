import { useEffect } from 'react';
import { supabase } from '../lib/supabase';


export function useRealtime(
    sessionId: string,
    onRemoteMutation: (payload: any) => void
) {
    useEffect(() => {
        // 1. Subscribe to the mutation log for this session
        const channel = supabase
            .channel(`session-${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mutations',
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    onRemoteMutation(payload.new.payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    // 2. Function to push a mutation to the cloud
    const sendMutation = async (mutation: any) => {
        await supabase.from('mutations').insert({
            session_id: sessionId,
            payload: mutation,
        });
    };

    return { sendMutation };
}