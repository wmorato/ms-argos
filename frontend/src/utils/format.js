/** Formata CPF: 12345678900 → 123.456.789-00 */
export function formatCpf(digits) {
    if (!digits) return ''
    let d = digits.substring(0, 3)
    if (digits.length > 3) d += '.' + digits.substring(3, 6)
    if (digits.length > 6) d += '.' + digits.substring(6, 9)
    if (digits.length > 9) d += '-' + digits.substring(9, 11)
    return d
}

/** Formata CNPJ: 00000000000100 → 00.000.000/0001-00 */
export function formatCnpj(digits) {
    if (!digits) return ''
    let d = digits.substring(0, 2)
    if (digits.length > 2) d += '.' + digits.substring(2, 5)
    if (digits.length > 5) d += '.' + digits.substring(5, 8)
    if (digits.length > 8) d += '/' + digits.substring(8, 12)
    if (digits.length > 12) d += '-' + digits.substring(12, 14)
    return d
}

/** Mascara CPF: 12345678900 → 123.***.***-00 */
export function maskCpf(digits) {
    if (!digits) return ''
    const padded = digits.padEnd(11, '*').substring(0, 11)
    const first3 = padded.substring(0, 3)
    const last2 = padded.substring(9, 11)
    return `${first3}.***.***-${last2}`
}

/** Extrai apenas dígitos */
export function digitsOnly(str) {
    return (str || '').replace(/\D/g, '')
}

/** Formata valor BRL */
export function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

/** Formata data pt-BR */
export function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR')
}

/** Formata datetime pt-BR */
export function formatDateTime(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('pt-BR')
}
