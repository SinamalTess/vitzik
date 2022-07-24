import userEvent from '@testing-library/user-event'

export const pressKey = (key: string) => {
    userEvent.keyboard(key)
}
