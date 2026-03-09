import { useEffect, useState } from 'react'
import { Users, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import { formatDateTime } from '../../utils/format'
import styles from '../admin/AdminPage.module.css'

export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', companyId: '' })
    const [saving, setSaving] = useState(false)

    function load() {
        setLoading(true)
        Promise.all([api.get('/users'), api.get('/companies')])
            .then(([u, c]) => { setUsers(u.data.users); setCompanies(c.data.companies) })
            .catch(() => toast.error('Erro ao carregar dados.'))
            .finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/users', { ...form, companyId: form.companyId || undefined })
            toast.success('Usuário criado! Ele deverá trocar a senha no 1º acesso.')
            setShowForm(false)
            setForm({ name: '', email: '', password: '', role: 'user', companyId: '' })
            load()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao salvar.')
        } finally { setSaving(false) }
    }

    async function handleDelete(id) {
        if (!confirm('Confirmar exclusão?')) return
        try {
            await api.delete(`/users/${id}`)
            toast.success('Usuário removido.')
            load()
        } catch { toast.error('Erro ao remover.') }
    }

    return (
        <div className={styles.page}>
            <ToastContainer theme="dark" position="top-right" />

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>Usuários</h1>
                    <p className={styles.subtitle}>Gerencie os usuários com acesso ao sistema</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(v => !v)}>
                    <Plus size={16} /> Novo Usuário
                </Button>
            </div>

            {showForm && (
                <div className={`${styles.formBox} glass`}>
                    <h2 className={styles.formTitle}>Cadastrar Usuário</h2>
                    <form onSubmit={handleSave} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label>Nome *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" required />
                            </div>
                            <div className={styles.field}>
                                <label>E-mail *</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@empresa.com" required />
                            </div>
                            <div className={styles.field}>
                                <label>Senha *</label>
                                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Mín. 8 caracteres" required minLength={8} />
                            </div>
                            <div className={styles.field}>
                                <label>Perfil</label>
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                    <option value="user">Usuário</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Empresa Vinculada</label>
                                <select value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}>
                                    <option value="">— Nenhuma (admin global) —</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <Button type="submit" variant="primary" loading={saving}>Salvar</Button>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className={`${styles.tableWrap} glass`}>
                {loading ? <div className={styles.loadingMsg}>Carregando...</div> : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Perfil</th>
                                <th>Empresa</th>
                                <th>Último Acesso</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{u.name}</td>
                                    <td className={styles.mono}>{u.email}</td>
                                    <td><span className={`badge badge-${u.role === 'admin' ? 'warning' : 'info'}`}>{u.role}</span></td>
                                    <td>{u.company_name || '—'}</td>
                                    <td>{formatDateTime(u.last_login)}</td>
                                    <td>
                                        {u.active
                                            ? <span className="badge badge-success"><CheckCircle size={11} /> Ativo</span>
                                            : <span className="badge badge-danger"><XCircle size={11} /> Inativo</span>
                                        }
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(u.id)} title="Remover">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!users.length && <tr><td colSpan={7} className={styles.empty}>Nenhum usuário cadastrado.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
