import userEvent from '@testing-library/user-event'

export const pressKey = async (key: string) => {
    await userEvent.keyboard(key)
}
