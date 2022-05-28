import React from "react"
import "./piano.scss"
import { keys_alphabetical } from "../../utils/keys"

interface PianoProps {
    playingKey: string | null
    startingKey?: string
    nbKey?: number
    onKeyPressed: (key: string | null) => void
}

export function Piano({
    playingKey,
    startingKey = "A0",
    nbKey = 88,
    onKeyPressed,
}: PianoProps) {
    const startingKeyIndex = keys_alphabetical.findIndex(
        (e) => e === startingKey
    )
    const keysIterator = keys_alphabetical.slice(startingKeyIndex, nbKey)
    const nbWhiteKeys = keysIterator.filter((key) => !key.includes("#")).length

    return (
        <>
            <ul className="set">
                {keysIterator.map((key, index) => {
                    const isBlackKey = key.includes("#")
                    const isSpecialKey = key.includes("C") || key.includes("F")

                    return (
                        <li
                            style={{
                                width: isBlackKey
                                    ? 100 / nbWhiteKeys / 2 + "%" // black keys are twice smaller in width
                                    : 100 / nbWhiteKeys + "%",
                                margin:
                                    isBlackKey || !isSpecialKey
                                        ? `0 0 0 -${
                                              100 / nbWhiteKeys / 4 + "%"
                                          }`
                                        : `0 0 0 0`,
                            }}
                            onMouseDown={() => onKeyPressed(key)}
                            onMouseUp={() => onKeyPressed(null)}
                            className={`
                                ${isBlackKey ? "black" : "white"} 
                                ${key} ${key === playingKey ? "active" : ""}`}
                        ></li>
                    )
                })}
            </ul>
        </>
    )
}
