import * as Tone from 'tone';

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
  vcos: document.querySelectorAll('.vcos > button'),
  shareButton: document.querySelector('#share'),
  shareUrl: document.querySelector('#shareUrl'),
}

const lim = new Tone.Limiter(-1).toDestination()
const vol = new Tone.Volume(-10).connect(lim)
const rev = new Tone.Reverb({ decay: 5, wet: 0.3, preDelay: 0.1 }).connect(vol)
const vco1 = new Tone.Synth().connect(rev)
const vco2 = new Tone.Synth().connect(rev)
const kick = new Tone.MembraneSynth({ pitchDecay: 0.02 }).connect(vol)

let config = {
  muted: [false, false, false],
  tempo: 120,
  notes1: ['C4', 'D4', 'D#4', 'G4'],
  notes2: ['G#3', 'F3', 'C3', 'C3'],
  polys: [16, 2, 5, 9],
  seq1: [false, true, true, true],
  seq2: [true, false, false, false],
}

function randomize () {
  config.notes1 = config.notes1.map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
  config.notes2 = config.notes2.map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  config.polys = [Math.ceil(Math.random() * 16), Math.ceil(Math.random() * 16), Math.ceil(Math.random() * 16), Math.ceil(Math.random() * 16)]
  config.seq1 = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
  config.seq2 = [Math.random() > 0.8, Math.random() > 0.8, Math.random() > 0.8, Math.random() > 0.8]

  updateUI()
}

function updateUI () {
  // set sequencer notes
  config.notes1.forEach((note, i) => { dom.sequencers[0].querySelectorAll('input')[i].value = note.toString() })
  config.notes2.forEach((note, i) => { dom.sequencers[1].querySelectorAll('input')[i].value = note.toString() })

  // set polyrytms values
  config.polys.forEach((rythm, i) => { dom.polyrythms[i].value = rythm.toString() })
  config.seq1.forEach((val, i) => { dom.selectors[0].querySelectorAll('button')[i].classList.toggle('active', val) })
  config.seq2.forEach((val, i) => { dom.selectors[1].querySelectorAll('button')[i].classList.toggle('active', val) })
}

// set sequencer notes
config.notes1.forEach((note, i) => { dom.sequencers[0].querySelectorAll('input')[i].value = note.toString() })
config.notes2.forEach((note, i) => { dom.sequencers[1].querySelectorAll('input')[i].value = note.toString() })

// set polyrytms values
config.polys.forEach((rythm, i) => { dom.polyrythms[i].value = rythm.toString() })
config.seq1.forEach((val, i) => { dom.selectors[0].querySelectorAll('button')[i].classList.toggle('active', val) })
config.seq2.forEach((val, i) => { dom.selectors[1].querySelectorAll('button')[i].classList.toggle('active', val) })

let xor = false
let time = 0
let time1 = 0
let time2 = 0
let isPlaying = false

// set bpm
dom.bpm.value = config.tempo.toString()
dom.bpm.addEventListener('change', () => {
  config.tempo = parseInt(dom.bpm.value)
})

dom.sequencers[0].querySelectorAll('input').forEach((input, i) => {
  input.addEventListener('change', () => { config.notes1[i] = input.value })
})
dom.sequencers[1].querySelectorAll('input').forEach((input, i) => {
  input.addEventListener('change', () => { config.notes2[i] = input.value })
})

// set lights
Array.from(dom.leds[0].children).forEach((child, i) => child.classList.toggle('active', time1 === i))
Array.from(dom.leds[1].children).forEach((child, i) => child.classList.toggle('active', time2 === i))

dom.polyrythms.forEach((input, i) => {
  input.addEventListener('change', () => { config.polys[i] = parseInt(input.value) })
})
dom.selectors[0].querySelectorAll('button').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    config.seq1[i] = !config.seq1[i]
    btn.classList.toggle('active', config.seq1[i])
  })
})
dom.selectors[1].querySelectorAll('button').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    config.seq2[i] = !config.seq2[i]
    btn.classList.toggle('active', config.seq2[i])
  })
})

dom.shareButton.addEventListener('click', () => {
  dom.shareUrl.hidden = false
  window.location.hash = sequenceToString()
  dom.shareUrl.value = window.location
})

function doPlay (r, i) {
  if (xor) return r.filter(n => i % n === 0).length === 1
  return r.some(n => i % n === 0)
}

function forward () {
  if (time % 4 === 0 && !config.muted[2]) kick.triggerAttackRelease('C2', '8n')

  if (doPlay(config.polys.filter((_p, i) => config.seq1[i]), time)) {
    time1 = (time1 + 1) % 4
    Array.from(dom.leds[0].children).forEach((child, i) => child.classList.toggle('active', time1 === i))
  }

  if (doPlay(config.polys.filter((_p, i) => config.seq2[i]), time)) {
    time2 = (time2 + 1) % 4
    Array.from(dom.leds[1].children).forEach((child, i) => child.classList.toggle('active', time2 === i))
  }

  if (doPlay(config.polys.filter((_p, i) => config.seq2[i] || config.seq1[i]), time)) {
    if (!config.muted[0]) vco1.triggerAttackRelease(config.notes1[time1], '8n')
    if (!config.muted[1]) vco2.triggerAttackRelease(config.notes2[time2], '8n')
  }

  time++

  if (isPlaying) setTimeout(forward, 60000 / config.tempo / 4)
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
    config.muted[i] = !config.muted[i]
    btn.classList.toggle('active', !config.muted[i])
  })
})

dom.xor.addEventListener('click', () => {
  xor = !xor
  dom.xor.classList.toggle('active', xor)
})

function sequenceToString() {
  return btoa(JSON.stringify(config))
}

function sequenceFromString(input) {
  return JSON.parse(atob(input))
}

window.addEventListener('load', () => {
  if (window.location.hash.length > 0) {
    try {
        config = sequenceFromString(window.location.hash.substr(1));
        updateUI()
    } catch (e) {
        console.log(`failed to parse sequence in url: ${e}`);
    }
  }
})

dom.randomize.addEventListener('click', randomize)