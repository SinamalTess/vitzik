import { act } from '@testing-library/react'
import Soundfont from 'soundfont-player'
import { requestMIDIAccess } from '../mocks/requestMIDIAccess'

export const waitSoundFontInstrumentPromise = async () => {
    await act(async () => {
        await Soundfont.instrument
    })
}
export const waitRequestMIDIAccessPromise = async () => {
    await act(async () => {
        await requestMIDIAccess
    })
}
