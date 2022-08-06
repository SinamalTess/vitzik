import React, { useState } from 'react'
import { Link } from '../_presentational/Link'
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
            <Button onClick={handleClick} className={'mg-md'}>
                ?
            </Button>
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
                    <h2>About this app</h2>
                    <p>
                        At this stage the application is still experimental, you can follow along
                        the updates on its github page.
                    </p>
                    <Link href="https://www.linkedin.com/in/tesssinamal/" icon={'linkedin'}>
                        Linkedin
                    </Link>
                    <Link href="https://github.com/SinamalTess/vitzik" icon={'github'}>
                        Github
                    </Link>
                </div>
            </SideBar>
        </>
    )
}