const screen = document.querySelector('.canvas')
const c = screen.getContext('2d')

//====================windows prorporsion=======================
screen.height = 600;
screen.width = 600;
// variables
const x = screen.width / 2
const y = screen.height / 2
const scoreEl = document.querySelector('#scoreEl')
let score = 0
const startGameBtn = document.querySelector('#startGameEl')
let modalEl = document.querySelector('#modalEl')
//==================create Player, projectiles and animations=====

//===================player Config==========================
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
    }
}
const player = new Player(x, y, 20, 'rgba(255,255,255,50%)')

//=======================Shooting config========================


class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}


//============================Create Animations==================
const projectiles = []
const enemies = []
const particles = []
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, screen.width, screen.height)
    player.draw();
    particles.forEach((particle, index )=> {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
            particle.update()
        }
    })
    projectiles.forEach((projectile, index )=> {
        projectile.update()
        //============remove from edges of screen===============
        if(projectile.x + projectile.radius < 0 || 
            projectile.x -projectile.radius > screen.width ||
            projectile.y - projectile.radius < 0 ||
            projectile.y - projectile.radius > screen.height){
            setTimeout(() =>{
                projectiles.splice(index,1)
            },0)
        }
    })
   
    enemies.forEach((enemy, index) => {
        enemy.update();
        const distP = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (distP - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)

        }
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // when projects touch enemy
            if (dist - enemy.radius - projectile.radius < 1) 
            {
                //increse our score
                score += 100
                scoreEl.innerHTML = score
                //==========create Explosions=============
                for(let i = 0; i < 8; i++){
                    particles.push(new Particle(projectile.x,projectile.y,Math.random() * 2, enemy.color,{
                        x: (Math.random() -0.5) * (Math.random() * 8),
                        y: (Math.random() -0.5) * (Math.random() * 8),
                    }))
                }
                if ( enemy.radius -5 > 10){
                    gsap.to(enemy,{
                        radius: enemy.radius - 10
                    })
                    
                    setTimeout(() => {
                            projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
                else{
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1),
                            projectiles.splice(projectileIndex, 1)
                    }, 0)
                }

            }

        })
    })
}
//================================shoot event=====================
addEventListener('click', (e) => {

    const angle = Math.atan2(e.clientY - screen.width / 2, e.clientX - screen.height / 2)
    const velocity = {
        x: Math.cos(angle) * 6 ,
        y: Math.sin(angle)* 6
    }
    projectiles.push(new Projectile(
        screen.width / 2, screen.height / 2, 5, 'white', velocity
    ))
})

//=======================Enemy Config===========================
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}
//=======================Particle effect Config===================
const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw();
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }

}
//=================================Random Enemies Spawns==========
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : screen.width + radius
            y = Math.random() * screen.height

        }
        else {
            x = Math.random() * screen.width
            y = Math.random() < 0.5 ? 0 - radius : screen.height + radius

        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(screen.width / 2 - y, screen.height / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))

    }, 1000)
}
startGameBtn.addEventListener('click', () =>{
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})
