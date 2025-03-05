'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (document.cookie.includes('auth=true')) {
            router.push('/dashboard');
        }
    }, [router]);

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
        <div className="container">
            <div className="login-box">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Entrar</button>
                </form>
            </div>

            {/* Estilos CSS */}
            <style jsx>{`
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    color: white;
                }


                .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #0c0c0c;
                }

                .login-box {
                    background: #0c0c0c;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 320px;
                    text-align: center;
                }

                h1 {
                    margin-bottom: 1.5rem;
                    font-size: 1.8rem;
                }

                form {
                    display: flex;
                    flex-direction: column;
                }

                input {
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 1rem;
                }

                button {
                    background-color: #0070f3;
                    color: white;
                    padding: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background 0.3s;
                }

                button:hover {
                    background-color: #005bb5;
                }

                @media (max-width: 400px) {
                    .login-box {
                        width: 90%;
                        padding: 1.5rem;
                    }

                    h1 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
