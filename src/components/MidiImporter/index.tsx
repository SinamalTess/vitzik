import { parseArrayBuffer } from 'midi-json-parser'
import React from 'react'

// Let's assume there is an ArrayBuffer called arrayBuffer which contains the binary content of a
// MIDI file.

export function MidiImporter() {
    function onUpload(e: any) {
        const files = e.target.files
        const filesArr = Array.prototype.slice.call(files)
        const reader = new FileReader()

        reader.onload = function () {
            const arrayBuffer = this.result

            parseArrayBuffer(arrayBuffer as ArrayBuffer).then((json: any) => {
                console.log(json)
                // json is the JSON representation of the MIDI file.
            })
        }

        reader.readAsArrayBuffer(filesArr[0])
    }

    return <input type="file" onChange={onUpload} id="myFile" name="filename" />
}
