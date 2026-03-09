import { useEffect, useState } from 'react'
import { Building2, Users, Search, TrendingUp } from 'lucide-react'
import api from '../../services/api'
import StatCard from '../../components/ui/StatCard'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/dashboard')
            .then(r => setStats(r.data.stats))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Visão geral do sistema Argos Hub</p>
            </div>

            {loading ? (
                <div className={styles.skeleton}>
                    {[...Array(4)].map((_, i) => <div key={i} className={`${styles.skeletonCard} glass`} />)}
                </div>
            ) : (
                <div className={styles.grid}>
                    <StatCard icon={Building2} label="Empresas Ativas" value={stats?.totalCompanies} color="primary" />
                    <StatCard icon={Users} label="Usuários Ativos" value={stats?.totalUsers} color="secondary" />
                    <StatCard icon={Search} label="Total de Pesquisas" value={stats?.totalSearches} color="success" />
                    <StatCard icon={TrendingUp} label="Pesquisas (24h)" value={stats?.searchesLast24h} color="warning" />
                </div>
            )}

            <div className={`${styles.infoBox} glass`}>
                <h2 className={styles.infoTitle}>Bem-vindo ao Argos Hub</h2>
                <p className={styles.infoDesc}>
                    Plataforma centralizada para pesquisa de histórico de clientes em múltiplos provedores conveniados.
                    Utilize o menu lateral para acessar as funcionalidades disponíveis.
                </p>
                <ul className={styles.featureList}>
                    <li><span className="badge badge-success">✓</span> Pesquisa paralela em todos os provedores</li>
                    <li><span className="badge badge-success">✓</span> CPF ofuscado conforme LGPD</li>
                    <li><span className="badge badge-success">✓</span> Resultados em tempo real</li>
                    <li><span className="badge badge-success">✓</span> Histórico de consultas auditado</li>
                </ul>
            </div>
        </div>
    )
}
