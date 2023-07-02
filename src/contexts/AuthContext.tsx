import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import Router, { useRouter } from "next/router";

import { api } from "../services/api";
import { useToast } from "@chakra-ui/react";

interface IProvide {
    children: ReactNode;
}

interface IAuthContext {
    isAuthenticated: boolean;
    user: IUser | null;
    signIn: (data: ISignInData) => Promise<unknown | void>;
    signOut: () => Promise<void>;
}

interface ISignInData {
    user: string;
    password: string;
}

interface IUser {
    name: string;
    user: string;
}

const AuthContext = createContext({} as IAuthContext);

export function AuthProvider({ children }: IProvide) {
    const toast = useToast();
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);

    const isAuthenticated = !!user;

    async function signIn({ user, password }: ISignInData) {
        try {

            const newPassword = Buffer.from(password, 'utf-8').toString('base64');

            const { data: { token, userInfo }, status } = await api.get(`/auth?user=${user.trim()}&password=${newPassword.trim()}`);

            destroyCookie(null, 'sol.token');
            destroyCookie(undefined, 'sol.token');
            setCookie(undefined, 'sol.token', token, {
                maxAge: 60 * 60 * 6 // 24 hour
            });

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(userInfo);
            
            const url = Router.asPath;

            if(url.indexOf('/?url=') != -1) {
                Router.push(url.substring(6));
            } else {
                Router.push(`/records`);
            }
        } catch (error: any) {
            throw error.response;
        }

    }

    async function signOut() {
        destroyCookie(null, 'sol.token');
        destroyCookie(null, 'sol.token');
        destroyCookie(null, 'sol.token');
        Router.push('/');
    }

    async function recoverDataUser() {
        try {
            const { data } = await api.get('/auth/me');
            const routeActive = router.pathname;
            setUser(data);

            if(routeActive === '/') {
                router.push('/records');
            }
        } catch (error: any) {
            const status = error?.response?.status
            
            if(status === 401) {
                signOut()
                toast({
                    description: 'Seu acesso expirou, realize o login novamente.',
                    status: 'warning',
                    duration: 4000
                });
                return
            }

            toast({
                description: 'Houve um erro ao recuperar as informações do seu usuário, contate o T.I.',
                duration: 4000,
                status: 'warning'
            });
        }
    }
    
    useEffect(() => {
        const { 'sol.token': token } = parseCookies();

        if(token) {
            recoverDataUser();
        }
    },[]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            signIn,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);