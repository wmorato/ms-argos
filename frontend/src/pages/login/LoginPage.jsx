import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import styles from './LoginPage.module.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        if (!email || !password) return
        setLoading(true)
        try {
            const { data } = await api.post('/auth/login', { email, password })
            login(data.token, data.user)
            if (data.user.mustChangePassword) {
                navigate('/change-password')
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Erro ao fazer login.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <ToastContainer theme="dark" position="top-right" />

            <div className={`${styles.card} glass`}>
                <div className={styles.header}>
                    <div className={styles.iconWrap}>
                        <Shield size={28} />
                    </div>
                    <h1 className={styles.title}>Argos Hub</h1>
                    <p className={styles.subtitle}>Pesquisa Centralizada de Histórico</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Senha</label>
                        <div className={styles.passWrap}>
                            <input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className={styles.eyeBtn}
                                onClick={() => setShowPass(v => !v)}
                                aria-label={showPass ? 'Ocultar senha' : 'Ver senha'}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
                        Acessar Sistema
                    </Button>
                </form>

                <p className={styles.footer}>
                    Hub exclusivo para empresas conveniadas
                </p>
            </div>
        </div>
    )
}
