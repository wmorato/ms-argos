import { useEffect, useState } from 'react'
import { Building2, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import { formatCnpj, digitsOnly } from '../../utils/format'
import styles from '../admin/AdminPage.module.css'

export default function CompaniesPage() {
    const { isAdmin } = useAuth()
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const initialForm = { cnpj: '', name: '', site: '', crm: 'sgp_tsmx', token: '', tokenName: 'chatbot', baseUrl: '' }
    const [form, setForm] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)

    function load() {
        setLoading(true)
        api.get('/companies')
            .then(r => setCompanies(r.data.companies))
            .catch(() => toast.error('Erro ao carregar empresas.'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingId) {
                await api.patch(`/companies/${editingId}`, form)
                toast.success('Empresa atualizada com sucesso!')
            } else {
                await api.post('/companies', form)
                toast.success('Empresa cadastrada com sucesso!')
            }
            setShowForm(false)
            setEditingId(null)
            setForm(initialForm)
            load()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao salvar.')
        } finally {
            setSaving(false)
        }
    }

    function handleEdit(company) {
        setEditingId(company.id)
        setForm({
            cnpj: formatCnpj(digitsOnly(company.cnpj)) || '',
            name: company.name || '',
            site: company.site || '',
            crm: company.crm || 'sgp_tsmx',
            token: company.token || '',
            tokenName: company.token_name || company.tokenName || 'chatbot',
            baseUrl: company.base_url || company.baseUrl || ''
        })
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleToggle(company) {
        try {
            await api.patch(`/companies/${company.id}`, { active: !company.active })
            toast.success(`Empresa ${company.active ? 'desativada' : 'ativada'}.`)
            load()
        } catch { toast.error('Erro ao atualizar empresa.') }
    }

    async function handleDelete(id) {
        if (!confirm('Confirmar exclusão?')) return
        try {
            await api.delete(`/companies/${id}`)
            toast.success('Empresa removida.')
            load()
        } catch { toast.error('Erro ao remover.') }
    }

    return (
        <div className={styles.page}>
            <ToastContainer theme="dark" position="top-right" />

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>Empresas Conveniadas</h1>
                    <p className={styles.subtitle}>Gerencie os provedores com acesso ao hub</p>
                </div>
                {isAdmin && (
                    <Button variant="primary" size="md" onClick={() => {
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
                        {showForm && editingId ? ' Nova Empresa' : (showForm ? ' Fechar' : ' Nova Empresa')}
                    </Button>
                )}
            </div>

            {showForm && (
                <div className={`${styles.formBox} glass`}>
                    <h2 className={styles.formTitle}>{editingId ? 'Editar Empresa' : 'Cadastrar Empresa'}</h2>
                    <form onSubmit={handleSave} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label>CNPJ *</label>
                                <input
                                    value={form.cnpj}
                                    onChange={e => {
                                        const raw = digitsOnly(e.target.value).substring(0, 14)
                                        setForm(f => ({ ...f, cnpj: formatCnpj(raw) }))
                                    }}
                                    placeholder="00.000.000/0001-00"
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Nome *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da empresa" required />
                            </div>
                            <div className={styles.field}>
                                <label>Site</label>
                                <input value={form.site} onChange={e => setForm(f => ({ ...f, site: e.target.value }))} placeholder="https://..." />
                            </div>
                            <div className={styles.field}>
                                <label>CRM *</label>
                                <select value={form.crm} onChange={e => setForm(f => ({ ...f, crm: e.target.value }))}>
                                    <option value="sgp_tsmx">SGP TSMX</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Token *</label>
                                <input value={form.token} onChange={e => setForm(f => ({ ...f, token: e.target.value }))} placeholder="Token de acesso" required />
                            </div>
                            <div className={styles.field}>
                                <label>Nome do Token</label>
                                <input value={form.tokenName} onChange={e => setForm(f => ({ ...f, tokenName: e.target.value }))} placeholder="chatbot" />
                            </div>
                            <div className={`${styles.field} ${styles.full}`}>
                                <label>URL Base *</label>
                                <input value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))} placeholder="https://empresa.sgp.tsmx.com.br/" required />
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
                {loading ? (
                    <div className={styles.loadingMsg}>Carregando...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>CNPJ</th>
                                <th>CRM</th>
                                <th>Status</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div className={styles.companyCell}>
                                            <span className={styles.companyIcon}><Building2 size={14} /></span>
                                            <div>
                                                <div className={styles.companyName}>{c.name}</div>
                                                {c.site && <div className={styles.companySite}>{c.site}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.mono}>{formatCnpj(digitsOnly(c.cnpj))}</td>
                                    <td><span className="badge badge-info">{c.crm}</span></td>
                                    <td>
                                        {c.active
                                            ? <span className="badge badge-success"><CheckCircle size={11} /> Ativa</span>
                                            : <span className="badge badge-danger"><XCircle size={11} /> Inativa</span>
                                        }
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.actionBtn} onClick={() => handleEdit(c)} title="Editar">
                                                    <Edit2 size={15} />
                                                </button>
                                                <button className={styles.actionBtn} onClick={() => handleToggle(c)} title={c.active ? 'Desativar' : 'Ativar'}>
                                                    {c.active ? <XCircle size={15} /> : <CheckCircle size={15} />}
                                                </button>
                                                <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(c.id)} title="Remover">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {!companies.length && (
                                <tr><td colSpan={5} className={styles.empty}>Nenhuma empresa cadastrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
