import { createContext, useContext, useState, ReactNode } from 'react';

type Session = {
    name: string;
    roomCode: string;
    setName: (name: string) => void;
    setRoomCode: (code: string) => void;
};

const SessionContext = createContext<Session | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');

    return (
        <SessionContext.Provider value={{ name, roomCode, setName, setRoomCode }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within SessionProvider');
    return ctx;
};