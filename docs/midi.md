## About MIDI format

I will document here my learnings around parsing and usage of MIDI files.
This is more of a personal note that I intend to use as reference in the future when working on this project, therefore, if you are reading this note, please be aware that the information compiled here might not be accurate.

### midi-json-parser output

In this project we use the [midi-json-parser](https://www.npmjs.com/package/midi-json-parser) package to parse MIDI file imported by the user to JSON.

This is the format it outputs with notes on each of the keys and their meaning. Most of the information comes from [here](http://www.ccarh.org/courses/253/handout/smf/), [here](https://sites.uci.edu/camp2014/2014/05/19/timing-in-midi-files/) :

```ts
interface IMidiFile {
  division: number;
  format: number;
  tracks: TMidiEvent[][];
}
```

#### division

Unit of time for delta timing (length quantities).

- If the value is positive, then it represents the units per beat (1 beat = 1 [quarter note](https://en.wikipedia.org/wiki/Quarter_note)) . For example, +96 would mean 96 ticks per beat.
- If the value is negative, delta times are in SMPTE compatible units.

#### format

A number between `0` to `2`.

- `0` = single track file format
- `1` = multiple track file format
- `2` = multiple song file format (i.e., a series of type 0 files)

#### tracks

### Vocabulary

#### Beat

One mistake that most beginners make is thinking that a beat is as long as one second. Don’t compare the tempo (how fast or slow) of beats in music, with seconds on a clock or watch. They aren’t the same. Beats can and often are longer than a second…it all depends on how fast your tempo is.

#### Tempo

All MIDI Files should specify tempo and time signature. If they don't, the time signature is assumed to be `4/4`, and the tempo `120` beats per minute. Unlike music, tempo in MIDI is not given as beats per minute, but rather in microseconds per beat. That can be changed, however, by a “meta event” that specifies a different tempo.

- In format `0`, these meta-events should occur at least at the beginning of
  the single multi-channel track.
- In format `1`, these meta-events should be contained in the first track.
- In format `2`, each of the temporally independent patterns should contain at least initial time signature and tempo
  information.

#### Time signature

Time signatures consist of two elements:

- a top number (`numerator`) = number of beats in each measure.
- a bottom number (`denominator`) = what note values those beats are.
  - If the bottom number is a `4`, it means the beats are quarter notes (four quarter notes in a measure).
  - If the bottom number is `2`, it means the note value is half notes(half notes per measure).
  - If the bottom number is an `8`, it means the beats are 8th notes...

### Delta

Tells how many ticks have passed since the last message.
