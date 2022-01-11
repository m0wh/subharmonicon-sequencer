import * as Tone from 'tone'

const dom = {
  sequencers: document.querySelectorAll('.sequencer__notes'),
  leds: document.querySelectorAll('.sequencer__leds'),
  polyrythms: document.querySelectorAll('.rythms > input') as NodeListOf<HTMLInputElement>,
  selectors: document.querySelectorAll('.selector'),
  play: document.querySelector('#play'),
  reset: document.querySelector('#reset'),
  bpm: document.querySelector('#bpm') as HTMLInputElement,
  xor: document.querySelector('#xor'),
  randomize: document.querySelector('#random'),
  vcos: document.querySelectorAll('.vcos > button')
}

let tempo = 120

const lim = new Tone.Limiter(-1).toDestination()
const vol = new Tone.Volume(-10).connect(lim)
const rev = new Tone.Reverb({ decay: 5, wet: 0.3, preDelay: 0.1 }).connect(vol)
const vco1 = new Tone.Synth().connect(rev)
const vco2 = new Tone.Synth().connect(rev)
const kick = new Tone.MembraneSynth({ pitchDecay: 0.02 }).connect(vol)

const muted = [false, false, false]

let notes1 = ['C4', 'D4', 'D#4', 'G4']
let notes2 = ['G#3', 'F3', 'C3', 'C3']
let polys = [16, 2, 5, 9]
let seq1 = [false, true, true, true]
let seq2 = [true, false, false, false]

function randomize () {
  notes1 = notes1.map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
  notes2 = notes2.map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  polys = [Math.ceil(Math.random() * 16), Math.ceil(Math.random() * 16), Math.ceil(Math.random() * 16), Math.ceil(Math.random() * 16)]
  seq1 = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
  seq2 = [Math.random() > 0.8, Math.random() > 0.8, Math.random() > 0.8, Math.random() > 0.8]

  // set sequencer notes
  notes1.forEach((note, i) => { dom.sequencers[0].querySelectorAll('input')[i].value = note.toString() })
  notes2.forEach((note, i) => { dom.sequencers[1].querySelectorAll('input')[i].value = note.toString() })

  // set polyrytms values
  polys.forEach((rythm, i) => { dom.polyrythms[i].value = rythm.toString() })
  seq1.forEach((val, i) => { dom.selectors[0].querySelectorAll('button')[i].classList.toggle('active', val) })
  seq2.forEach((val, i) => { dom.selectors[1].querySelectorAll('button')[i].classList.toggle('active', val) })
}

// set sequencer notes
notes1.forEach((note, i) => { dom.sequencers[0].querySelectorAll('input')[i].value = note.toString() })
notes2.forEach((note, i) => { dom.sequencers[1].querySelectorAll('input')[i].value = note.toString() })

// set polyrytms values
polys.forEach((rythm, i) => { dom.polyrythms[i].value = rythm.toString() })
seq1.forEach((val, i) => { dom.selectors[0].querySelectorAll('button')[i].classList.toggle('active', val) })
seq2.forEach((val, i) => { dom.selectors[1].querySelectorAll('button')[i].classList.toggle('active', val) })

let xor = false
let time = 0
let time1 = 0
let time2 = 0
let isPlaying = false

// set bpm
dom.bpm.value = tempo.toString()
dom.bpm.addEventListener('change', () => {
  tempo = parseInt(dom.bpm.value)
})

dom.sequencers[0].querySelectorAll('input').forEach((input, i) => {
  input.addEventListener('change', () => { notes1[i] = input.value })
})
dom.sequencers[1].querySelectorAll('input').forEach((input, i) => {
  input.addEventListener('change', () => { notes2[i] = input.value })
})

// set lights
Array.from(dom.leds[0].children).forEach((child, i) => child.classList.toggle('active', time1 === i))
Array.from(dom.leds[1].children).forEach((child, i) => child.classList.toggle('active', time2 === i))

dom.polyrythms.forEach((input, i) => {
  input.addEventListener('change', () => { polys[i] = parseInt(input.value) })
})
dom.selectors[0].querySelectorAll('button').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    seq1[i] = !seq1[i]
    btn.classList.toggle('active', seq1[i])
  })
})
dom.selectors[1].querySelectorAll('button').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    seq2[i] = !seq2[i]
    btn.classList.toggle('active', seq2[i])
  })
})

function doPlay (r, i) {
  if (xor) return r.filter(n => i % n === 0).length === 1
  return r.some(n => i % n === 0)
}

function forward () {
  if (time % 4 === 0 && !muted[2]) kick.triggerAttackRelease('C2', '8n')

  if (doPlay(polys.filter((_p, i) => seq1[i]), time)) {
    time1 = (time1 + 1) % 4
    Array.from(dom.leds[0].children).forEach((child, i) => child.classList.toggle('active', time1 === i))
  }

  if (doPlay(polys.filter((_p, i) => seq2[i]), time)) {
    time2 = (time2 + 1) % 4
    Array.from(dom.leds[1].children).forEach((child, i) => child.classList.toggle('active', time2 === i))
  }

  if (doPlay(polys.filter((_p, i) => seq2[i] || seq1[i]), time)) {
    if (!muted[0]) vco1.triggerAttackRelease(notes1[time1], '8n')
    if (!muted[1]) vco2.triggerAttackRelease(notes2[time2], '8n')
  }

  time++

  if (isPlaying) setTimeout(forward, 60000 / tempo / 4)
}

dom.play.addEventListener('click', () => {
  isPlaying = !isPlaying
  dom.play.classList.toggle('active', isPlaying)
  if (isPlaying) forward()
})

dom.reset.addEventListener('click', () => {
  time = 0
  time1 = 0
  time2 = 0
  Array.from(dom.leds[0].children).forEach((child, i) => child.classList.toggle('active', time1 === i))
  Array.from(dom.leds[1].children).forEach((child, i) => child.classList.toggle('active', time2 === i))
})

dom.vcos.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    muted[i] = !muted[i]
    btn.classList.toggle('active', !muted[i])
  })
})

dom.xor.addEventListener('click', () => {
  xor = !xor
  dom.xor.classList.toggle('active', xor)
})

dom.randomize.addEventListener('click', randomize)
