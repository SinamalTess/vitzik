import React, { ChangeEvent, useContext, useState } from 'react'
import { Button, SideBar, TextField, Divider } from 'vitzik-ui'
import { AppContext } from '@/components/_contexts'

export const WebSocketButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [roomToJoin, setRoomToJoin] = useState('')
    const [randomRoom, setRandomRoom] = useState('')
    const { webSocket } = useContext(AppContext)

    const handleOnClickConnectToMultiplayers = async () => {
        await webSocket.joinGroup('hello there')
        setIsOpen(true)
    }

    const handleOnClose = () => {
        setIsOpen(false)
    }

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        setRoomToJoin(event.target.value)
    }

    const handleOnClickNewRoom = () => {
        const randomNumber = Math.floor(Math.random() * 20)
        setRandomRoom(randomNumber.toString())
    }

    return (
        <>
            <Button onClick={handleOnClickConnectToMultiplayers}>Connect To Multiplayer</Button>
            <SideBar open={isOpen} onClose={handleOnClose}>
                <h1>Connect to multiplayer</h1>
                <p>Join existing room</p>
                <TextField value={roomToJoin} placeholder={'room code'} onChange={handleOnChange} />
                <Divider />
                <Button onClick={handleOnClickNewRoom}>Create new room</Button>
                {randomRoom}
            </SideBar>
        </>
    )
}
