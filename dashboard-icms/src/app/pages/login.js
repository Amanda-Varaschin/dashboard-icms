'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Se o usuário já está autenticado, vai direto para o dashboard
        if (document.cookie.includes('auth=true')) {
            router.push('/dashboard');
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (username === 'admin' && password === '1234') {
            document.cookie = `auth=true; path=/; max-age=3600; Secure; SameSite=Strict`;
            router.push('/dashboard');
        } else {
            alert('Credenciais inválidas');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}
