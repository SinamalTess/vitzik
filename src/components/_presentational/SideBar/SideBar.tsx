import React, { ReactNode, useEffect, useRef, useState } from 'react'
import './SideBar.scss'
import clsx from 'clsx'
import { CSSTransition } from 'react-transition-group'
import ReactDOM from 'react-dom'
import { useClickOutside } from '../../../_hooks'
import { PresentationalComponentBasicProps } from '../types'

interface SideBarProps extends PresentationalComponentBasicProps {
    open: boolean
    children: ReactNode
    onClose: () => void
}

export function SideBar({ style, className, children, open, onClose }: SideBarProps) {
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

    const classNames = clsx('sidebar', className)

    return ReactDOM.createPortal(
        <CSSTransition
            unmountOnExit
            appear={isOpen}
            in={isOpen}
            timeout={animationDuration}
            classNames={classNames}
        >
            <div className={classNames} ref={sidebarRef} style={style}>
                {children}
            </div>
        </CSSTransition>,
        rootNode
    )
}
