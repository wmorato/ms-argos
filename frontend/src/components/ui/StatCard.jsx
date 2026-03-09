import styles from './StatCard.module.css'

export default function StatCard({ icon: Icon, label, value, color = 'primary' }) {
    return (
        <div className={`${styles.card} glass`}>
            <div className={`${styles.iconWrap} ${styles[color]}`}>
                {Icon && <Icon size={22} />}
            </div>
            <div className={styles.info}>
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{value ?? '–'}</span>
            </div>
        </div>
    )
}
