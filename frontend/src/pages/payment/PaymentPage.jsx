import { CreditCard, Clock } from 'lucide-react'
import styles from './PaymentPage.module.css'

export default function PaymentPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Pagamento & Planos</h1>
                <p className={styles.subtitle}>Gerenciamento de assinaturas e cobranças</p>
            </div>

            <div className={`${styles.card} glass`}>
                <div className={styles.iconWrap}>
                    <Clock size={48} />
                </div>
                <h2 className={styles.cardTitle}>Em Construção</h2>
                <p className={styles.cardDesc}>
                    Esta funcionalidade está em desenvolvimento e será disponibilizada em breve.
                    Aqui você poderá gerenciar planos, formas de pagamento, emissão de NF e
                    histórico de cobranças das empresas conveniadas.
                </p>
                <div className={styles.features}>
                    <div className={styles.feature}><CreditCard size={16} /> Integração com gateway de pagamento</div>
                    <div className={styles.feature}><CreditCard size={16} /> Planos por uso ou mensalidade</div>
                    <div className={styles.feature}><CreditCard size={16} /> Emissão de nota fiscal</div>
                    <div className={styles.feature}><CreditCard size={16} /> Histórico de faturas</div>
                </div>
            </div>
        </div>
    )
}
