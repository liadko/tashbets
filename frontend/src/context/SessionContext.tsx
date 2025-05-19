import { createContext, useContext, useState, ReactNode } from 'react';

type Session = {
    name: string;
    roomCode: string;
    id: string;
    setName: (name: string) => void;
    setRoomCode: (code: string) => void;
    setId: (id: string) => void;
};

const SessionContext = createContext<Session | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [id, setId] = useState('');

    return (
        <SessionContext.Provider value={{ name, roomCode, id, setName, setRoomCode, setId }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within SessionProvider');
    return ctx;
};