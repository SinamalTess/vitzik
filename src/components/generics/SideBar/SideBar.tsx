import React, { ReactNode, useEffect, useRef, useState } from 'react'
import './SideBar.scss'
import clsx from 'clsx'
import { CSSTransition } from 'react-transition-group'
import ReactDOM from 'react-dom'

interface SideBarProps {
    open: boolean
    children: ReactNode
    onClose: () => void
}

export function SideBar({ children, open, onClose }: SideBarProps) {
    const [isOpen, setIsOpen] = useState(open)
    const [listening, setListening] = useState(false)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const animationDuration = 300
    const rootNode = document.getElementById('root') ?? document.body
    const classNames = clsx('sidebar')

    useEffect(() => setIsOpen(open), [open])

    useEffect(() => {
        const events = ['click', 'touchstart']

        function closeSideBar(event: Event) {
            // @ts-ignore
            if (sidebarRef.current?.contains(event.target)) return
            setIsOpen(false)
            onClose()
        }

        function listenForOutsideClicks(
            listening: boolean,
            setListening: React.Dispatch<React.SetStateAction<boolean>>,
            sidebarRef: React.RefObject<HTMLDivElement>
        ) {
            events.forEach((type) => {
                if (listening) return
                if (!sidebarRef) return
                setListening(true)
                document.addEventListener(type, closeSideBar)
            })
        }

        if (isOpen) {
            listenForOutsideClicks(listening, setListening, sidebarRef)
        }

        return function cleanup() {
            events.forEach((type) => {
                document.removeEventListener(type, closeSideBar)
            })
            setListening(false)
        }
    }, [isOpen])

    return ReactDOM.createPortal(
        <CSSTransition
            unmountOnExit
            appear={isOpen}
            in={isOpen}
            timeout={animationDuration}
            classNames="sidebar"
        >
            <div className={classNames} ref={sidebarRef}>
                {children}
            </div>
        </CSSTransition>,
        rootNode
    )
}
