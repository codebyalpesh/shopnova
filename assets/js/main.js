document.querySelector('.sn-navbar__toggle')
  .addEventListener('click', function () {

    const menu = document.querySelector('.sn-navbar__menu');
    const expanded = this.getAttribute('aria-expanded') === 'true';

    menu.classList.toggle('active');
    this.setAttribute('aria-expanded', !expanded);
});