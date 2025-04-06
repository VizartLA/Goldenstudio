const parallaxFunc = ()=> {

  {
    const seoAdvantages = document.querySelector('.seo-advantages');
    if (!seoAdvantages) return;

    const parallaxContainer = document.querySelector('.seo-advantages__parallax');
    const leftGroup = document.querySelector('.parallax-layer--left');
    const rightGroup = document.querySelector('.parallax-layer--right');

    if (!parallaxContainer || !leftGroup || !rightGroup) return;

    const leftImage = leftGroup.querySelector('.parallax-image');
    const rightTopImage = rightGroup.querySelector('.parallax-image:first-child');
    const rightBottomImage = rightGroup.querySelector('.parallax-image:last-child');

    // Индивидуальные настройки для каждого изображения
    const parallaxSettings = {
      left: {
        speedX: 0.01,  // Очень медленно по X
        speedY: 0.01,  // Умеренно по Y
        invert: false
      },
      rightTop: {
        speedX: 0.01,  // Быстрее по X
        speedY: 0.01,  // Быстрее по Y
        invert: true
      },
      rightBottom: {
        speedX: 0.01,  // Минимально по X
        speedY: 0.01,  // Минимально по Y
        invert: true
      }
    };

    function handleMouseMove(e) {
      const mouseX = e.clientX - window.innerWidth / 2;
      const mouseY = e.clientY - window.innerHeight / 2;

      // Левое изображение
      if (leftImage) {
        const offsetX = mouseX * parallaxSettings.left.speedX;
        const offsetY = mouseY * parallaxSettings.left.speedY;
        leftImage.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }

      // Правое верхнее изображение
      if (rightTopImage) {
        const multiplier = parallaxSettings.rightTop.invert ? -1 : 1;
        const offsetX = mouseX * parallaxSettings.rightTop.speedX * multiplier;
        const offsetY = mouseY * parallaxSettings.rightTop.speedY * multiplier;
        rightTopImage.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }

      // Правое нижнее изображение (очень слабый эффект)
      if (rightBottomImage) {
        const multiplier = parallaxSettings.rightBottom.invert ? -1 : 1;
        const offsetX = mouseX * parallaxSettings.rightBottom.speedX * multiplier * 0.5;
        const offsetY = mouseY * parallaxSettings.rightBottom.speedY * multiplier * 0.5;
        rightBottomImage.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    }

    // Оптимизация с requestAnimationFrame
    let animationFrame;
    function optimizedMouseMove(e) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => handleMouseMove(e));
    }

    document.addEventListener('mousemove', optimizedMouseMove);

    // Инициализация позиций
    handleMouseMove({clientX: window.innerWidth/2, clientY: window.innerHeight/2});
  }
}
const playerFunc = ()=> {
  // Инициализация всех аудиоплееров
  const players = document.querySelectorAll('.custom-audio-player');

  players.forEach(player => {
    const audio = new Audio();
    const playBtn = player.querySelector('.play-btn');
    const progressFill = player.querySelector('.progress-fill');
    const timeDisplay = player.querySelector('.time');
    const volumeBtn = player.querySelector('.volume-btn');
    const volumeIcon = player.querySelector('.volume-icon');
    const settingsBtn = player.querySelector('.settings-btn');
    const speedMenu = player.querySelector('.speed-menu');
    const progressContainer = player.querySelector('.progress-container');

    // Установка источника аудио
    audio.src = player.dataset.audioSrc;
    audio.preload = 'metadata';

    // Обработчик воспроизведения/паузы
    playBtn.addEventListener('click', () => {
      // Пауза всех других аудио
      players.forEach(otherPlayer => {
        if (otherPlayer !== player) {
          const otherAudio = otherPlayer._audio;
          if (otherAudio && !otherAudio.paused) {
            otherAudio.pause();
            otherPlayer.querySelector('.play-btn').textContent = '▶';
          }
        }
      });

      if (audio.paused) {
        audio.play().then(() => {
          playBtn.textContent = '❚❚';
        }).catch(error => {
          console.error('Ошибка воспроизведения:', error);
        });
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });

    // Обновление прогресса
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progress}%`;
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
      }
    });

    // Перемотка по клику на прогресс-бар
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pos * audio.duration;
    });

    // Управление громкостью
    volumeBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      volumeIcon.style.opacity = audio.muted ? '0.5' : '1';
    });

    // Меню скорости
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      player.classList.toggle('show-menu');
    });

    // Выбор скорости
    speedMenu.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.playbackRate = parseFloat(btn.dataset.speed);

        // Обновление активной кнопки
        speedMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        player.classList.remove('show-menu');
      });
    });

    // Автопауза при окончании трека
    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶';
    });

    // Сохраняем ссылку на audio для внешнего доступа
    player._audio = audio;
  });

  // Закрытие меню при клике вне
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.settings-btn') && !e.target.closest('.speed-menu')) {
      document.querySelectorAll('.custom-audio-player').forEach(player => {
        player.classList.remove('show-menu');
      });
    }
  });

  // Форматирование времени
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
const burgerMenu = ()=>{
  // Элементы бургер-меню
  const burgerButton = document.getElementById('burgerButton');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  // ===== Обработчики бургер-меню =====
  if (burgerButton && mobileMenu && menuOverlay) {
    burgerButton.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      document.body.style.overflow = this.classList.contains('active') ? 'hidden' : '';
      this.setAttribute('aria-expanded', this.classList.contains('active'));
    });

    menuOverlay.addEventListener('click', function() {
      burgerButton.classList.remove('active');
      mobileMenu.classList.remove('active');
      this.classList.remove('active');
      document.body.style.overflow = '';
      burgerButton.setAttribute('aria-expanded', 'false');
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.header__link').forEach(link => {
      link.addEventListener('click', function() {
        burgerButton.classList.remove('active');
        mobileMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        burgerButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('.accordeon__triger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const item = trigger.closest('.accordeon__item');
      const isActive = item.classList.contains('accordeon__item--active');
  
      // Закрываем все
      document.querySelectorAll('.accordeon__item').forEach(otherItem => {
        otherItem.classList.remove('accordeon__item--active');
        const icon = otherItem.querySelector('.accordeon__icon');
        if (icon) icon.textContent = '+';
      });
  
      // Если не был активен — открываем и меняем знак
      if (!isActive) {
        item.classList.add('accordeon__item--active');
        const icon = item.querySelector('.accordeon__icon');
        if (icon) icon.textContent = '×';
      }
    });
  });
  
}
const phoneModal = ()=> {
  // Элементы модального окна обратного звонка
  const callbackModal = document.getElementById('callbackModal');
  const callbackModalButtons = document.querySelectorAll('.header__button-link'); // Все кнопки "Перезвоните мне"
  const modalClose = document.querySelector('.modal__close');



  // ===== Обработчики модального окна =====
  callbackModalButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      callbackModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  modalClose.addEventListener('click', function() {
    callbackModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  callbackModal.addEventListener('click', function(e) {
    if (e.target === callbackModal) {
      callbackModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });


  // Маска для телефона в форме
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
      e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
  }

  // Обработка формы
  const form = document.querySelector('.modal__form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Заявка отправлена! Мы вам перезвоним.');
      callbackModal.classList.remove('active');
      document.body.style.overflow = '';
      form.reset();
    });
  }
}

const slidersBreakpoints = {
  375: { // xs
    slidesPerView: 1,
    spaceBetween: 20
  },
  576: { // sm
    slidesPerView: 2,
    spaceBetween: 20
  },
  768: { // md
    slidesPerView: 3,
    spaceBetween: 20
  },
  992: { // lg
    slidesPerView: 4,
    spaceBetween: 20
  },
}

const sliderConfig = {
  // slidesPerView: 4,
  animating: true,
  spaceBetween: 20,
  slideToClickedSlide: true,
  loop: true,
  breakpoints: slidersBreakpoints
}

document.addEventListener('DOMContentLoaded', function() {

  const swiperReviews = new Swiper(".reviews__slider", {
   ...sliderConfig,
    navigation: {
      nextEl: '.swiper2-next',
      prevEl: '.swiper2-prev',
    },
  });

  const swiperAbout = new Swiper(".our-succes__slider", {
    ...sliderConfig,
    navigation: {
      nextEl: '.swiper1-next',
      prevEl: '.swiper1-prev',
    },
    
  });

  AOS.init();

  parallaxFunc()
  playerFunc()
  burgerMenu()
  phoneModal()
});









