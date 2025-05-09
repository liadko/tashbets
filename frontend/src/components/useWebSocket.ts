import { useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url : string, onMessage : any) {
    const wsRef = useRef<WebSocket>(null);

    useEffect(() => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event : MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (err) {
                console.error('Invalid JSON:', err);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
        };

        return () => {
            console.log("effect unmounts")
            ws.close();
        };
    }, [url, onMessage]);

    const sendMessage = useCallback((msg: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        } else {
            console.warn('WebSocket not open');
        }
    }, []);

    return { sendMessage };
}
