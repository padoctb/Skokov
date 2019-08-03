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
