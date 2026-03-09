import styles from './Button.module.css'

export default function Button({
    children, variant = 'primary', size = 'md',
    loading = false, disabled = false, className = '', ...rest
}) {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? <span className={styles.spinner} /> : children}
        </button>
    )
}
