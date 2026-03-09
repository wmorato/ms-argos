import { useState, useRef, useEffect } from 'react'
import { Search, Eye, EyeOff, CheckCircle, AlertCircle, XCircle, X, MapPin } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import { formatCpf, maskCpf, digitsOnly, formatBRL, formatDate } from '../../utils/format'
import styles from './SearchPage.module.css'

const QUICK_TESTS = [
    { cpf: '31028924852', label: '310.***.***-** — sem pendência' },
    { cpf: '32289392863', label: '322.***.***-** — com faturas' },
]

export default function SearchPage() {
    const [digits, setDigits] = useState('')
    const [visible, setVisible] = useState(true)
    const [inputVal, setInputVal] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [selectedResult, setSelectedResult] = useState(null)
    // const timerRef = useRef(null) // Removendo timer de ofuscacao

    // Handlers
    function handleChange(e) {
        const raw = digitsOnly(e.target.value).substring(0, 11)
        setDigits(raw)
        setInputVal(visible ? formatCpf(raw) : maskCpf(raw))
    }

    function handleFocus() {
        if (!visible) setInputVal(formatCpf(digits))
    }

    function handleBlur() {
        if (!visible && digits) setInputVal(maskCpf(digits))
    }

    function toggleVisible() {
        setVisible(v => {
            const next = !v
            setInputVal(next ? formatCpf(digits) : maskCpf(digits))
            return next
        })
    }

    function fillQuick(cpf) {
        setDigits(cpf)
        setInputVal(visible ? formatCpf(cpf) : maskCpf(cpf))
    }

    async function handleSearch(e) {
        e.preventDefault()
        if (!digits || digits.length < 11) {
            toast.warn('Informe um CPF completo (11 dígitos).')
            return
        }
        setLoading(true)
        setResults(null)
        try {
            const { data } = await api.post('/search', { document: digits })
            setResults(data.results)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao realizar pesquisa.')
        } finally {
            setLoading(false)
        }
    }

    const queryDisplay = digits ? maskCpf(digits) : '...'

    return (
        <div className={styles.page}>
            <ToastContainer theme="dark" position="top-right" />

            <div className={styles.header}>
                <h1 className={styles.title}>Pesquisa de Histórico</h1>
                <p className={styles.subtitle}>Consulta simultânea em todos os provedores conveniados</p>
            </div>

            <div className={styles.layout}>
                <aside className={`${styles.quickPanel} glass`}>
                    <h3 className={styles.quickTitle}>Testes Rápidos</h3>
                    <p className={styles.quickSub}>Clique para preencher</p>
                    <ul className={styles.quickList}>
                        {QUICK_TESTS.map(({ cpf, label }) => (
                            <li key={cpf} className={styles.quickItem} onClick={() => fillQuick(cpf)}>
                                {label}
                            </li>
                        ))}
                    </ul>
                </aside>

                <div className={styles.content}>
                    <div className={`${styles.searchBox} glass`}>
                        <h2 className={styles.searchTitle}>Nova Pesquisa</h2>
                        <p className={styles.searchSub}>Consulte o histórico do cliente em nossa rede de provedores.</p>
                        <form onSubmit={handleSearch} className={styles.form}>
                            <div className={styles.inputWrap}>
                                <Search size={18} className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Digite o CPF (ex: 310.***.***-**)"
                                    value={inputVal}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    autoComplete="off"
                                />
                                <button type="button" className={styles.eyeBtn} onClick={toggleVisible}>
                                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <Button type="submit" variant="primary" size="lg" loading={loading}>
                                {loading ? 'Pesquisando...' : 'Pesquisar'}
                            </Button>
                        </form>
                    </div>

                    {results && (
                        <div className={styles.results}>
                            <div className={styles.resultsHeader}>
                                <h2 className={styles.resultsTitle}>Resultados</h2>
                                <p className={styles.resultsQuery}>
                                    Pesquisa para: <strong className={styles.queryHighlight}>{queryDisplay}</strong>
                                </p>
                            </div>
                            <div className={styles.grid}>
                                {results.map((r, i) => (
                                    <ResultCard key={i} result={r} onClick={() => setSelectedResult(r)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedResult && (
                <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />
            )}
        </div>
    )
}

function ResultCard({ result, onClick }) {
    let statusClass = styles.statusOk
    let statusText = 'Nada Consta'
    let StatusIcon = CheckCircle

    if (result.hasDebt) {
        statusClass = styles.statusPending
        statusText = 'Pendências'
        StatusIcon = AlertCircle
    } else if (result.isError) {
        statusClass = styles.statusError
        statusText = 'Erro'
        StatusIcon = XCircle
    }

    return (
        <div className={`${styles.card} glass ${statusClass}`} onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className={styles.cardHeader} style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <span className={styles.providerName}>{result.provider}</span>
                <div className={`${styles.statusBadge} ${statusClass}`}>
                    <StatusIcon size={13} />
                    {statusText}
                </div>
            </div>
        </div>
    )
}


function ResultModal({ result, onClose }) {
    const [showDetails, setShowDetails] = useState(false)

    // Bloqueia scroll do body
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => document.body.style.overflow = 'auto'
    }, [])

    let statusClass = styles.badgeSuccess
    let statusText = 'Em Dia'
    let situationText = 'Regular'
    let situationColor = '#10b981'

    if (result.hasDebt) {
        statusClass = styles.badgeDanger
        statusText = 'Pendências'
        situationText = 'Atrasado'
        situationColor = '#fca5a5'
    } else if (result.isError) {
        statusClass = styles.badgeError
        statusText = 'Erro'
        situationText = 'Falha'
        situationColor = '#f59e0b'
    }

    // Mocking some values that might not be in the real result for the visuals
    const contractsCount = result.hasDebt ? 1 : 0
    const invoicesCount = result.invoices?.length || 0

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalProviderInfo}>
                        <h3>{result.provider}</h3>
                        <div className={styles.modalAddress}>
                            <MapPin size={14} />
                            {result.address || 'Unidade Central de Atendimento'}
                        </div>
                    </div>
                    <span className={`${styles.badge} ${statusClass}`}>{statusText}</span>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.metricsGrid}>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>{result.hasDebt ? 'Contratos' : 'Contratos Ativos'}</span>
                            <div className={styles.metricValue}>{String(contractsCount).padStart(2, '0')}</div>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>{result.hasDebt ? 'Boletos em Aberto' : 'Faturas Pendentes'}</span>
                            <div className={styles.metricValue}>{String(invoicesCount).padStart(2, '0')}</div>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>{result.hasDebt ? 'Situação' : 'Saldo Devedor'}</span>
                            <div className={styles.metricValue} style={{ color: situationColor }}>
                                {result.hasDebt ? situationText : formatBRL(0)}
                            </div>
                        </div>
                    </div>

                    <p className={styles.cardMessage} style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '1.5rem' }}>
                        {result.message}
                    </p>

                    <div className={styles.modalFooter}>
                        <div className={styles.totalInfo}>
                            <span className={styles.totalLabel}>{result.hasDebt ? 'Total consolidado' : 'Status da conta'}</span>
                            <span className={`${styles.totalAmount} ${result.hasDebt ? styles.alert : ''}`} style={!result.hasDebt ? { fontSize: '1rem', color: '#10b981' } : {}}>
                                {result.hasDebt ? formatBRL(result.totalDebt) : 'Nenhuma ação necessária'}
                            </span>
                        </div>
                        {result.hasDebt ? (
                            <button className="btn btn-primary" onClick={() => setShowDetails(!showDetails)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                {showDetails ? 'Ocultar detalhes' : 'Ver detalhes dos boletos'}
                            </button>
                        ) : (
                            <button className="btn btn-outline" style={{ background: 'transparent', color: '#fafafa', border: '1px solid #27272a', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                Verificar Disponibilidade
                            </button>
                        )}
                    </div>

                    {showDetails && result.invoices?.length > 0 && (
                        <div className={styles.expandableSection}>
                            <table className={styles.modalInvoiceTable}>
                                <thead>
                                    <tr>
                                        <th>Vencimento</th>
                                        <th>Valor</th>
                                        <th style={{ textAlign: 'right' }}>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.invoices.map((inv, i) => (
                                        <tr key={i}>
                                            <td>{formatDate(inv.vencimento)}</td>
                                            <td><strong>{formatBRL(inv.valor)}</strong></td>
                                            <td style={{ textAlign: 'right' }}>
                                                <a href="#" className={styles.payLink} onClick={e => { e.preventDefault(); toast.info('Funcionalidade de pagamento será implementada em breve.'); }}>
                                                    Pagar via Pix
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

