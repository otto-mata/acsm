import { IUserProfile } from '@/lib/client.models';
import { createContext, useState } from 'react';

interface IUserContext {
    user: IUserProfile | null;
}

const UserContext = createContext<IUserContext>({ user: null });

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<IUserProfile | null>(null);
    return <UserContext.Provider value={{ user }}></UserContext.Provider>;
}
