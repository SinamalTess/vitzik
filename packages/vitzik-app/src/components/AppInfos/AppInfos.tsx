import React, { useState } from 'react'
import { Link, Button, SideBar } from 'vitzik-ui'
import './AppInfos.scss'

interface ShortcutsListProps {
    shortcuts: {
        key: string
        description: string
    }[]
}

const BASE_CLASS = 'app-infos'

const SHORTCUTS = [
    {
        key: 'M',
        description: 'mute / unmute',
    },
    {
        key: 'L',
        description: 'start / end edition of loop',
    },
    {
        key: '↑',
        description: 'forward midi song',
    },
    {
        key: '↓',
        description: 'rewind midi song',
    },
    {
        key: 'space bar',
        description: 'pause / play midi song',
    },
]

function ShortCutsList({ shortcuts }: ShortcutsListProps) {
    return (
        <div className={`${BASE_CLASS}__keyboard-shortcuts`}>
            {shortcuts.map(({ description, key }) => (
                <p key={key}>
                    <span>{key}</span> {description}
                </p>
            ))}
        </div>
    )
}

export function AppInfos() {
    const [isOpen, setIsOpen] = useState(false)

    function handleClose() {
        setIsOpen(false)
    }

    function handleClick() {
        setIsOpen(true)
    }

    return (
        <>
            <Button onClick={handleClick} className={'mg-md'} aria-label={'infos'}>
                ?
            </Button>
            <SideBar open={isOpen} onClose={handleClose}>
                <div className={`${BASE_CLASS} pd-lg`}>
                    <h2>Keyboard shortcuts</h2>
                    <ShortCutsList shortcuts={SHORTCUTS}></ShortCutsList>
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
