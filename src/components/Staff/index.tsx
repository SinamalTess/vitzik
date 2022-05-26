import './staff.css';
import treble_clef from '../../../src/note_symbols/notes_treble_clef.svg';
import bass_clef from '../../../src/note_symbols/notes_bass_clef.svg';
import { formatToPixelValue } from '../../utils';
import React from 'react';

interface StaffProps {
    trebleClef : boolean,
    bassClef: boolean,
    spaceHeight: string | number
}

export function Staff ({trebleClef, bassClef, spaceHeight} : StaffProps) {

    const nbSpaces = 4;
    const nbMeasures = 2;
    const formattedSpaceHeight = formatToPixelValue(spaceHeight ?? '20px');

    /*
        Converting to Arrays to be able to use() map with React
        Empty array can't be mapped over so we fill them with null values
    */
    const spacesIterator = Array.apply(null, new Array(nbSpaces));
    const measuresIterator = Array.apply(null, new Array(nbMeasures));

    // TODO: write ADR about barreling

    return (
        <table>
            <tbody>
                <tr>
                    <td><img alt='clef' src={trebleClef ? treble_clef : bass_clef}/></td> {/* TODO: make sure the clef aligns with the lines */}
                    {measuresIterator.map((e, i) => (
                        <td key={i}> {/* using index for key as a last resort, without state management this is ok */}
                            <table>
                                <tbody>
                                {spacesIterator.map((e, y) => (
                                    <tr key={y} style={{height: formattedSpaceHeight}}>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    )
}
