import React from "react";
import './piano.scss'
import {keys_alphabetical} from "../../utils/keys";

interface PianoProps {
    playingKey: string | null;
    startingKey?: string;
    nbKey?: number;
    onClickKey: (key: string) => void;
}

export function Piano ({playingKey, startingKey = 'A0', nbKey = 88, onClickKey}: PianoProps) {
    const startingKeyIndex = keys_alphabetical.findIndex(e => e === startingKey)
    const keysIterator = keys_alphabetical.slice(startingKeyIndex, nbKey)

    return (
        <>
            <ul className="set">
                {
                    keysIterator.map((key, index) => (
                        <li
                            onClick={() => onClickKey(key)}
                            className={`
                            ${key.includes('#') ? 'black' : 'white'} 
                            ${key} ${key === playingKey ? 'playing' : ''}
                        `}>
                        </li>
                    ))
                }
            </ul>
        </>
    )
}