import userEvent from '@testing-library/user-event'

export const pressKey = async (key: string, count: number = 1) => {
    const keySeries = Array(count).fill(key).join('')
    await userEvent.keyboard(keySeries)
}
