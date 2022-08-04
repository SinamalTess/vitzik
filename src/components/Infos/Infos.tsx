import React, { useState } from 'react'
import { Button } from '../_presentational/Button'
import { SideBar } from '../_presentational/SideBar'
import './Infos.scss'

const BASE_CLASS = 'infos'

export function Infos() {
    const [isOpen, setIsOpen] = useState(false)

    function handleClose() {
        setIsOpen(false)
    }

    function handleClick() {
        setIsOpen(true)
    }

    return (
        <>
            <Button onClick={handleClick}>?</Button>
            <SideBar open={isOpen} onClose={handleClose}>
                <div className={`${BASE_CLASS} pd-lg`}>
                    <h2>Keyboard shortcuts</h2>
                    <div className={`${BASE_CLASS}__keyboard-shortcuts`}>
                        <p>
                            <span>M</span> mute / unmute{' '}
                        </p>
                        <p>
                            <span>L</span> start / end edition of loop
                        </p>
                        <p>
                            <span>↑</span> forward midi song
                        </p>
                        <p>
                            <span>↓</span> rewind midi song
                        </p>
                        <p>
                            <span>space bar</span> pause / play midi song
                        </p>
                    </div>
                </div>
            </SideBar>
        </>
    )
}
