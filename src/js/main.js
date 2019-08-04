import { WOW } from 'wowjs'

// MOBILE MENU
const menuBtns = document.querySelectorAll('.main-header__menu-toggle')
const menuItems = document.querySelector('.main-header__nav-items')

menuBtns.forEach((btn) => {
  btn.addEventListener('click', () => menuItems.classList.toggle('active'))
})

menuItems.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    menuItems.classList.remove('active')
  }
})

// WOWJS
new WOW().init();

// OUR CLIENTS SHOW INFO
const aboutUsTeam = document.querySelector('.about-us__team')

function init() {
  document.onscroll = null

  const clients = [...document.querySelectorAll('.about-us__team-person')]

  let currentClient = 0

  setInterval(() => {
    if (currentClient === clients.length) {
      clients[currentClient - 1].classList.remove('active')
      currentClient = 0
    }
    if (currentClient !== 0) clients[currentClient - 1].classList.remove('active')
    clients[currentClient].classList.add('active')
    currentClient += 1
  }, 2000)
}

document.onscroll = () => {
  if (aboutUsTeam.getBoundingClientRect().top - window.outerHeight <= 0) {
    init() // init function when section in viewport
  }
}
