import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    Search, LayoutDashboard, Building2, Users,
    ClipboardList, LogOut, Shield, CreditCard, Menu, X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Layout.module.css'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/search', icon: Search, label: 'Pesquisa' },
    { to: '/logs', icon: ClipboardList, label: 'Histórico' },
]

const adminItems = [
    { to: '/companies', icon: Building2, label: 'Empresas' },
    { to: '/users', icon: Users, label: 'Usuários' },
]

export default function Layout({ children }) {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    function handleLogout() {
        logout()
        navigate('/')
    }

    const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'

    return (
        <div className={styles.layout}>
            {/* Mobile Header */}
            <header className={styles.mobileHeader}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon} style={{ width: 32, height: 32 }}>
                        <Shield size={16} />
                    </div>
                    <span className={styles.brandName}>Argos Hub</span>
                </div>
                <button className={styles.menuToggle} onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar / Drawer */}
            <aside className={`${styles.sidebar} glass ${mobileOpen ? styles.mobileOpen : ''}`}>
                <div className={`${styles.brand} ${styles.desktopOnly}`}>
                    <div className={styles.brandIcon}>
                        <Shield size={20} />
                    </div>
                    <div className={styles.brandText}>
                        <span className={styles.brandName}>Argos Hub</span>
                        <span className={styles.brandSub}>Pesquisa de Histórico</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <span className={styles.navSection}>Principal</span>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <>
                            <span className={styles.navSection}>Administração</span>
                            {adminItems.map(({ to, icon: Icon, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `${styles.navItem} ${isActive ? styles.active : ''}`
                                    }
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </NavLink>
                            ))}
                            <NavLink
                                to="/payment"
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `${styles.navItem} ${isActive ? styles.active : ''}`
                                }
                            >
                                <CreditCard size={18} />
                                <span>Pagamento</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.avatar}>{initials}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name}</span>
                        <span className={styles.userRole}>{user?.role}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout} title="Sair">
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

            {/* Main Content */}
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
