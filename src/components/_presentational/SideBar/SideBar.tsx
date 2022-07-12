import React, { ReactNode, useEffect, useRef, useState } from 'react'
import './SideBar.scss'
import clsx from 'clsx'
import { CSSTransition } from 'react-transition-group'
import ReactDOM from 'react-dom'
import { useClickOutside } from '../../../_hooks/useClickOutside'

interface SideBarProps {
    open: boolean
    children: ReactNode
    onClose: () => void
}

const classNames = clsx('sidebar')

export function SideBar({ children, open, onClose }: SideBarProps) {
    const [isOpen, setIsOpen] = useState(open)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const animationDuration = 300
    const rootNode = document.getElementById('root') ?? document.body

    useEffect(() => setIsOpen(open), [open])

    function closeSideBar() {
        setIsOpen(false)
        onClose()
    }

    useClickOutside([sidebarRef], closeSideBar, isOpen)

    return ReactDOM.createPortal(
        <CSSTransition
            unmountOnExit
            appear={isOpen}
            in={isOpen}
            timeout={animationDuration}
            classNames={classNames}
        >
            <div className={classNames} ref={sidebarRef}>
                {children}
            </div>
        </CSSTransition>,
        rootNode
    )
}
