import { useEffect, useState, useRef, useCallback } from 'react'

export function useWebSocket(url: string) {
    const wsRef = useRef<WebSocket>(null)
    const handlerRef = useRef<(msg: any) => void>(() => { console.log("Message Handler Called But Not Set") })
    const retryRef = useRef<NodeJS.Timeout | null>(null)
    const [serverStatus, setServerStatus] = useState<'connecting' | 'open' | 'closed'>('connecting')
    const retryDelay = 1000 // ms

    const connect = useCallback(() => {

        clearTimeout(retryRef.current!)          // cancel pending retries

        const ws = new WebSocket(url)
        wsRef.current = ws;


        ws.onopen = () => {
            console.log('WebSocket connected')
            setServerStatus('open')
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data)
                handlerRef.current(data)
            } catch (err) {
                console.warn('Invalid JSON:', err)
            }
        };

        ws.onclose = (event) => {
            setServerStatus('closed')
            console.warn("Websocket Closed:", event.reason)
            retryRef.current = setTimeout(connect, retryDelay)
        }
        ws.onerror = (event) => {
            setServerStatus('closed')
            console.warn("Websocket Error:", event.target)

            retryRef.current = setTimeout(connect, retryDelay)

        }

    }, [url, retryDelay])

    // Connecter
    useEffect(() => {

        connect()


        return () => {
            console.log("effect unmounts")
            setServerStatus('closed')
            clearTimeout(retryRef.current!)
            wsRef.current?.close()
        };
    }, [connect])

    /* Outward API */

    const sendMessage = useCallback((msg: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg))
            return true
        } else {
            console.warn('WebSocket not open')
            return false
        }
    }, [])

    const setMessageHandler = useCallback((fn: (msg: any) => void) => {
        handlerRef.current = fn
    }, [])

    return { sendMessage, setMessageHandler, serverStatus }
}
