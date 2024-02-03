const removeMidiFileExtension = (string: string) => {
    const results = string.match(/.midi|.mid/) ?? []

    if (results.length > 0) {
        const lengthFileExtension = results[0] ? results[0].length : 0
        return string.slice(0, string.length - lengthFileExtension)
    }

    return string
}

export function normalizeMidiFileTitle(title: string) {
    const normalizedTitle = title.replace('_', ' ')

    return removeMidiFileExtension(normalizedTitle)
}
