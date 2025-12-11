import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // Check localStorage first (persistent), then sessionStorage (session only)
                const storedUser = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Auth check failed", error);
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password, rememberMe = false) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            setUser(data);

            if (rememberMe) {
                localStorage.setItem('userInfo', JSON.stringify(data));
            } else {
                sessionStorage.setItem('userInfo', JSON.stringify(data));
            }

            toast.success(`Welcome back, ${data.name}!`);
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
            localStorage.removeItem('userInfo');
            sessionStorage.removeItem('userInfo');
            toast.info('Logged out successfully');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
