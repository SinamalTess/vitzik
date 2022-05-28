import React, { ChangeEvent } from 'react'

interface MusicSystemSelectorProps {
    onChangeMusicSystem: (musicSystem: ChangeEvent<HTMLSelectElement>) => void
}

export function MusicSystemSelector({
    onChangeMusicSystem,
}: MusicSystemSelectorProps) {
    return (
        <>
            <label htmlFor="musicSystem">Choose a music system</label>
            <select
                name="musicSystem"
                id="musicSystem"
                onChange={onChangeMusicSystem}
            >
                <option value="syllabic">Syllabic</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="german">German</option>
            </select>
        </>
    )
}
