import Swiper from './swiper.js';

export default function decorate(block) {
  // Add core Swiper class
  block.classList.add('swiper');

  const swiperWrapper = document.createElement('div');
  swiperWrapper.classList.add('swiper-wrapper');

  // Move each child to swiper-slide
  Array.from(block.children).forEach((child) => {
    child.classList.add('swiper-slide');
    swiperWrapper.appendChild(child);
  });

  // Reset and append new structure
  block.innerHTML = '';
  block.appendChild(swiperWrapper);

  // Add navigation/pagination elements
  const btnWrapper = document.createElement('div');
  btnWrapper.classList.add('btn-wrapper');

  const divPagination = document.createElement('div');
  divPagination.classList.add('swiper-pagination');
  btnWrapper.appendChild(divPagination);

  const leftArrow = document.createElement('div');
  leftArrow.classList.add('swiper-button-prev');
  btnWrapper.appendChild(leftArrow);

  const rightArrow = document.createElement('div');
  rightArrow.classList.add('swiper-button-next');
  btnWrapper.appendChild(rightArrow);

  block.appendChild(btnWrapper);

  // Determine Swiper settings based on class or parent
  let swiperOptions = {
    loop: false,
    initialSlide: 0,
    spaceBetween: 20,
    pagination: {
      el: divPagination,
      clickable: true,
    },
    navigation: {
      nextEl: rightArrow,
      prevEl: leftArrow,
    },
    breakpoints: {
      0: {
        slidesPerView: 1.8,
        slidesOffsetAfter: 40,
      },
      768: {
        slidesPerView: 3,
      },
    },
  };

  // CUSTOMIZATION BASED ON BLOCK CLASS OR PARENT
  const parent = block.closest('.section'); // or any wrapper class
  if (parent?.classList.contains('carousel-cards')) {
    // Custom config for cards carousel
    swiperOptions = {
      ...swiperOptions,
      loop: true,
      spaceBetween: 20,
      initialSlide: 1,
      centeredSlides: true,
      breakpoints: {
        0: {
          slidesPerView: 1.2,
        },
        768: {
          slidesPerView: 'auto',
        },
      },
    };
  } else if (parent?.classList.contains('accessories')) {
    // Custom config for hero carousel
    swiperOptions = {
      ...swiperOptions,
      spaceBetween: 20,
      grabCursor: true,
      breakpoints: {
        0: {
          slidesPerView: 1.7,
        },
        768: {
          slidesPerView: 3.2,
        },
      },
    };
  }

  // Initialize Swiper with selected config
  Swiper(block, swiperOptions);
}
