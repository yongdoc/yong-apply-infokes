export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const value = record.value

    if (typeof value === 'object' && value !== null) {
      const valueRecord = value as Record<string, unknown>
      if ('message' in valueRecord) {
        const message = valueRecord.message
        if (Array.isArray(message)) return message.join('; ')
        if (typeof message === 'string') return message
      }
    }

    if ('message' in record && typeof record.message === 'string') {
      return record.message
    }
  }

  return fallback
}
