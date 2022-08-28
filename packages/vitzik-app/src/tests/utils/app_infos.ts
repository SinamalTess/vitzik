import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const clickAppInfos = async () => {
    const button = screen.getByLabelText(/infos/)
    await userEvent.click(button)
}
