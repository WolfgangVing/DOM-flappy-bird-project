function novoElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    this.element = novoElement('div', 'pipe')

    const borda = novoElement('div', 'top')
    const corpo = novoElement('div', 'structure')

    this.element.appendChild(reversa ? corpo : borda)
    this.element.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`

}

// const b = new Barreira(true);
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function ParDePipes(altura, abertura, x) {
    this.element = novoElement('div', 'par-de-pipes')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.element.appendChild(this.superior.element)
    this.element.appendChild(this.inferior.element)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDePipes(700, 300, 600)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barreiras(height, width, gap, space, notifyPoint) {
    this.pares = [
        new ParDePipes(height, gap, width),
        new ParDePipes(height, gap, width + space),
        new ParDePipes(height, gap, width + space * 2),
        new ParDePipes(height, gap, width + space * 3)
    ]

    const delta = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - delta)

            if(par.getX() < -par.getWidth()) {
                par.setX(par.getX() + space * this.pares.length)
                par.sortearAbertura()
            }

            const meio = width / 2
            const cruzouOMeio = par.getX() + delta >= meio
                && par.getX() < meio

            cruzouOMeio && notifyPoint(point = 0)
        })
    }
}

function Bird(gameHeight) {
    let voando = false
    
    this.element = novoElement('img', 'bird')
    this.element.src = 'imgs/passaro.png'
    
    this.getY = () => parseInt(this.element.style.bottom.split("px")[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if(novoY <= 0){
            this.setY(0)
        } else if (novoY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(gameHeight / 2)
}

function Progress() {
    this.element = novoElement('span', 'progresso')
    this.element.style.left = "1100px"
    this.atualizarPontos = pontos => {
        this.element.innerHTML = pontos
    }

    this.atualizarPontos(0)
}

// const barreiras = new Barreiras(700, 1100, 300, 400, function (point) {
//     ++point
//     console.log(point)
// })

// const bird = new Bird(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(bird.element)
// areaDoJogo.appendChild(new Progress().element)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.element))

// setInterval(()=> {
//     barreiras.animar()
//     bird.animar()
// }, 20)

function collision(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = (a.left + a.width >= b.left) && (b.left + b.width >= a.left)
    const vertical =  (a.top + a.height >= b.top) && (b.top + b.height >= a.top)

    return horizontal && vertical
}

function collided(bird, wall) {
    let collided = false
    wall.pares.forEach(parDeBarreiras => {
        if(!collided) {
            const superior = parDeBarreiras.superior.element
            const inferior = parDeBarreiras.inferior.element
            collided = collision(bird.element, superior) || collision(bird.element, inferior)
        }
    })
    return collided
}

function FlappyBird() {
    let points = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const height = areaDoJogo.clientHeight
    const width = areaDoJogo.clientWidth

    const progress = new Progress()
    const barreiras = new Barreiras(height, width, 200, 400, 
        () => progress.atualizarPontos(++points))
    const passaro = new Bird(height)

    areaDoJogo.appendChild(progress.element)
    areaDoJogo.appendChild(passaro.element)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.element))

    this.start = () => {
        //loop do jogo

        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(collided(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()