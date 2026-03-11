// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Active nav link
  const links = document.querySelectorAll('nav a');
  links.forEach(link => {
    if (link.href === window.location.href || 
        (link.href !== window.location.origin + '/' && window.location.pathname.startsWith(new URL(link.href).pathname))) {
      link.classList.add('active');
    }
  });
});
