import { createContext } from 'react';

export type AuthContextValue = {
  user: null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
