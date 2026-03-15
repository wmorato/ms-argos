import { useEffect, useState } from 'react'
import { Users, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'
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
    const initialForm = { name: '', email: '', password: '', role: 'user', companyId: '' }
    const [form, setForm] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)

    function load() {
        setLoading(true)
        Promise.all([api.get('/users'), api.get('/companies')])
            .then(([u, c]) => { 
                setUsers(u.data.users); 
                const comps = c.data.companies;
                setCompanies(comps);
                
                // Define Acme como default se estiver criando novo
                if (!editingId && !form.companyId) {
                    const acme = comps.find(comp => comp.name.toLowerCase() === 'acme');
                    if (acme) setForm(f => ({ ...f, companyId: acme.id }));
                }
            })
            .catch(() => toast.error('Erro ao carregar dados.'))
            .finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingId) {
                await api.patch(`/users/${editingId}`, {
                    ...form,
                    companyId: form.companyId || null,
                    password: form.password || undefined
                })
                toast.success('Usuário atualizado com sucesso!')
            } else {
                await api.post('/users', { ...form, companyId: form.companyId || undefined })
                toast.success('Usuário criado! Ele deverá trocar a senha no 1º acesso.')
            }
            setShowForm(false)
            setEditingId(null)
            setForm(initialForm)
            load()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao salvar.')
        } finally { setSaving(false) }
    }

    function handleEdit(user) {
        setEditingId(user.id)
        setForm({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: user.role || 'user',
            companyId: user.company_id || ''
        })
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleToggle(user) {
        try {
            await api.patch(`/users/${user.id}`, { active: !user.active })
            toast.success(`Usuário ${user.active ? 'desativado' : 'ativado'}.`)
            load()
        } catch { toast.error('Erro ao atualizar usuário.') }
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
                <Button variant="primary" onClick={() => {
                    if (showForm && editingId) {
                        setEditingId(null)
                        setForm(initialForm)
                    } else {
                        setShowForm(!showForm)
                        if (editingId) {
                            setEditingId(null)
                            setForm(initialForm)
                        }
                    }
                }}>
                    {showForm && editingId ? <Plus size={16} /> : (showForm ? <Trash2 size={16} /> : <Plus size={16} />)}
                    {showForm && editingId ? ' Novo Usuário' : (showForm ? ' Fechar' : ' Novo Usuário')}
                </Button>
            </div>

            {showForm && (
                <div className={`${styles.formBox} glass`}>
                    <h2 className={styles.formTitle}>{editingId ? 'Editar Usuário' : 'Cadastrar Usuário'}</h2>
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
                                <label>Senha {editingId ? '(deixe em branco para manter)' : '*'}</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder={editingId ? "********" : "Mín. 8 caracteres"}
                                    required={!editingId}
                                    minLength={8}
                                />
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
                            <Button type="submit" variant="primary" loading={saving}>{editingId ? 'Atualizar' : 'Salvar'}</Button>
                            <Button type="button" variant="secondary" onClick={() => {
                                setShowForm(false)
                                setEditingId(null)
                                setForm(initialForm)
                            }}>Cancelar</Button>
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
                                            <button className={styles.actionBtn} onClick={() => handleEdit(u)} title="Editar">
                                                <Edit2 size={15} />
                                            </button>
                                            <button className={styles.actionBtn} onClick={() => handleToggle(u)} title={u.active ? 'Desativar' : 'Ativar'}>
                                                {u.active ? <XCircle size={15} /> : <CheckCircle size={15} />}
                                            </button>
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
