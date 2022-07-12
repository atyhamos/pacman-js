import { layout } from './layout.js'

const gridEl = document.querySelector('.grid')
const scoreEl = document.getElementById('score')
let squares = []
let score = 0

// 0 - pac-dots
// 1 - wall
// 2 - ghost-lair
// 3 - power-pellet
// 4 - empty
function setupGrid() {
  for (let i = 0; i < layout.length; i++) {
    const square = document.createElement('div')
    square.classList.add('square')
    gridEl.appendChild(square)
    squares.push(square)
    switch (layout[i]) {
      case 0:
        squares[i].classList.add('pac-dot')
        break
      case 1:
        squares[i].classList.add('wall')
        break
      case 2:
        squares[i].classList.add('ghost-lair')
        break
      case 3:
        squares[i].classList.add('power-pellet')
        break
      case 4:
        squares[i].classList.add('empty')
        break
      default:
        break
    }
  }
}

setupGrid()
let pacmanIndex = 490
squares[pacmanIndex].classList.add('pacman')

const width = 28
function control(e) {
  squares[pacmanIndex].classList.remove('pacman')
  switch (e.key) {
    case 'ArrowLeft':
      if (pacmanIndex === 364) {
        pacmanIndex = 391
        break
      }
      if (
        pacmanIndex % width !== 0 &&
        !squares[pacmanIndex - 1].classList.contains('wall') &&
        !squares[pacmanIndex - 1].classList.contains('ghost-lair')
      )
        pacmanIndex--

      break
    case 'ArrowUp':
      if (
        pacmanIndex - width >= 0 &&
        !squares[pacmanIndex - width].classList.contains('wall') &&
        !squares[pacmanIndex - width].classList.contains('ghost-lair')
      )
        pacmanIndex -= width
      break
    case 'ArrowRight':
      if (pacmanIndex === 391) {
        pacmanIndex = 364
        break
      }
      if (
        pacmanIndex % width !== width - 1 &&
        !squares[pacmanIndex + 1].classList.contains('wall') &&
        !squares[pacmanIndex + 1].classList.contains('ghost-lair')
      )
        pacmanIndex++
      break
    case 'ArrowDown':
      if (
        pacmanIndex + width < width * width &&
        !squares[pacmanIndex + width].classList.contains('wall') &&
        !squares[pacmanIndex + width].classList.contains('ghost-lair')
      )
        pacmanIndex += width
      break
    default:
      break
  }
  squares[pacmanIndex].classList.add('pacman')
  eatDot()
  eatPower()
  eatGhost()
  checkWin()
  checkGameOver()
}

document.addEventListener('keyup', control)

function eatDot() {
  if (squares[pacmanIndex].classList.contains('pac-dot')) {
    score++
    squares[pacmanIndex].classList.remove('pac-dot')
    scoreEl.innerHTML = score
  }
}

function eatPower() {
  if (squares[pacmanIndex].classList.contains('power-pellet')) {
    score += 10
    squares[pacmanIndex].classList.remove('power-pellet')
    scoreEl.innerHTML = score
    ghosts.forEach((ghost) => {
      ghost.isScared = true
    })
    // Unscare after 10 seconds
    setTimeout(() => {
      ghosts.forEach((ghost) => {
        ghost.isScared = false
      })
    }, 10000)
  }
}

function eatGhost() {
  if (squares[pacmanIndex].classList.contains('ghost-scared')) {
    // Pacman moves into ghost
    const ghost = ghosts.filter((ghost) =>
      squares[pacmanIndex].classList.contains(ghost.name)
    )[0]
    squares[pacmanIndex].classList.remove(ghost.name, 'ghost', 'ghost-scared')
    ghost.currentIndex = ghost.startIndex
    squares[ghost.currentIndex].classList.add(ghost.name, 'ghost')
    score += 100
    scoreEl.innerHTML = score
  }
}

class Ghost {
  constructor(name, startIndex, speed) {
    this.name = name
    this.startIndex = startIndex
    this.speed = speed
    this.currentIndex = startIndex
    this.isScared = false
    this.timerId = NaN
    squares[startIndex].classList.add(name)
    squares[startIndex].classList.add('ghost')
  }
}

const ghosts = [
  new Ghost('blinky', 348, 250),
  new Ghost('pinky', 376, 400),
  new Ghost('inky', 351, 300),
  new Ghost('clyde', 379, 500),
]
const ghostNames = []
ghosts.forEach((ghost) => ghostNames.push(ghost.name))

ghosts.forEach((ghost) => moveGhost(ghost))

function moveGhost(ghost) {
  const directions = [-1, -width, 1, width] // left, up, right, down
  let direction = directions[Math.floor(Math.random() * directions.length)]

  ghost.timerId = setInterval(() => {
    if (
      !squares[ghost.currentIndex + direction].classList.contains('wall') &&
      !squares[ghost.currentIndex + direction].classList.contains('ghost')
    ) {
      squares[ghost.currentIndex].classList.remove(
        'ghost',
        'ghost-scared',
        ghost.name
      )
      ghost.currentIndex += direction
      squares[ghost.currentIndex].classList.add('ghost', ghost.name)
    } else direction = directions[Math.floor(Math.random() * directions.length)]

    if (ghost.isScared) {
      squares[ghost.currentIndex].classList.add('ghost-scared')
      if (ghost.currentIndex == pacmanIndex) {
        // Ghost moves into Pacman
        squares[ghost.currentIndex].classList.remove(
          ghost.name,
          'ghost',
          'ghost-scared'
        )
        ghost.currentIndex = ghost.startIndex
        score += 100
        scoreEl.innerHTML = score
        squares[ghost.currentIndex].classList.add(ghost.name, 'ghost')
      }
    }
    checkGameOver()
  }, ghost.speed)
}

function checkGameOver() {
  if (
    squares[pacmanIndex].classList.contains('ghost') &&
    !squares[pacmanIndex].classList.contains('ghost-scared')
  ) {
    ghosts.forEach((ghost) => clearInterval(ghost.timerId))
    document.removeEventListener('keyup', control)
    scoreEl.innerHTML = ` Game Over. Your score is ${score}`
  }
}

function checkWin() {
  if (score === 274) {
    ghosts.forEach((ghost) => clearInterval(ghost.timerId))
    document.removeEventListener('keyup', control)
    scoreEl.innerHTML = ` Congratulations, you've cleared this stage! Score: ${score}`
  }
}
