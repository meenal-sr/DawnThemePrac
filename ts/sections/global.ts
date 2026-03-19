// Global entry point
// Registers shared custom elements and initialises site-wide behaviours.
import CarouselSwiper from 'TsComponents/carousel-swiper';

document.addEventListener('DOMContentLoaded', () => {
  customElements.define('carousel-swiper', CarouselSwiper);
});
