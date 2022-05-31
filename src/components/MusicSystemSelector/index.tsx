import React, { ChangeEvent } from 'react'
import { MusicSystem } from '../../types/MusicSystem'

interface MusicSystemSelectorProps {
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
}

export function MusicSystemSelector({
    onChangeMusicSystem,
}: MusicSystemSelectorProps) {
    return (
        <>
            <select
                name="musicSystem"
                id="musicSystem"
                onChange={(event) =>
                    onChangeMusicSystem(event.target.value as MusicSystem)
                }
            >
                <option value="syllabic">Syllabic</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="german">German</option>
            </select>
        </>
    )
}
