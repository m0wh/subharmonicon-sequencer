import * as Tone from 'tone'

const tempo = 120

const vco1 = new Tone.Synth().toDestination()
const vco2 = new Tone.Synth().toDestination()
const kick = new Tone.MembraneSynth().toDestination()

const muted = [false, false, false]

const notes1 = ['C4', 'D4', 'D#4', 'G4']
const notes2 = ['G#3', 'F3', 'C3', 'G3']
const polys = [2, 16, 5, 9]
const seq1 = [true, false, true, true]
const seq2 = [false, true, false, false]
let time = 0
let time1 = 0
let time2 = 0
let isPlaying = false
let xor = false

const dom = {
  sequencers: document.querySelectorAll('.sequencer__notes'),
  leds: document.querySelectorAll('.sequencer__leds'),
  polyrythms: document.querySelectorAll('.rythms > input') as NodeListOf<HTMLInputElement>,
  selectors: document.querySelectorAll('.selector'),
  play: document.querySelector('#play'),
  reset: document.querySelector('#reset'),
  bpm: document.querySelector('#bpm') as HTMLInputElement,
  xor: document.querySelector('#xor'),
  vcos: document.querySelectorAll('.vcos > button')
}

// set bpm
dom.bpm.value = tempo.toString()

// set sequencer notes
notes1.forEach((note, i) => { dom.sequencers[0].querySelectorAll('input')[i].value = note.toString() })
notes2.forEach((note, i) => { dom.sequencers[1].querySelectorAll('input')[i].value = note.toString() })

dom.sequencers[0].querySelectorAll('input').forEach((input, i) => {
  input.addEventListener('change', () => { notes1[i] = input.value })
})
dom.sequencers[1].querySelectorAll('input').forEach((input, i) => {
  input.addEventListener('change', () => { notes2[i] = input.value })
})

// set lights
Array.from(dom.leds[0].children).forEach((child, i) => child.classList.toggle('active', time1 === i))
Array.from(dom.leds[1].children).forEach((child, i) => child.classList.toggle('active', time2 === i))

// set polyrytms values
polys.forEach((rythm, i) => { dom.polyrythms[i].value = rythm.toString() })
seq1.forEach((val, i) => { dom.selectors[0].querySelectorAll('button')[i].classList.toggle('active', val) })
seq2.forEach((val, i) => { dom.selectors[1].querySelectorAll('button')[i].classList.toggle('active', val) })

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

let interval
dom.play.addEventListener('click', () => {
  if (isPlaying) {
    isPlaying = false
    dom.play.classList.toggle('active', false)
    if (interval) clearInterval(interval)
  } else {
    isPlaying = true
    dom.play.classList.toggle('active', true)
    interval = setInterval(() => {
      if (time % 4 === 0) {
        if (!muted[2]) kick.triggerAttackRelease('C2', '8n')
      }

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
    }, 60000 / tempo / 4)
  }
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
