// Global entry point
// Registers shared custom elements and initialises site-wide behaviours.
import CarouselSwiper from 'JsComponents/carousel-swiper';
import migrateSection, { appendSection } from 'JsComponents/migrate-section';
import { initUIComponents } from 'JsComponents/ui-components';

document.addEventListener('DOMContentLoaded', () => {
  customElements.define('carousel-swiper', CarouselSwiper);
  appendSection();
  migrateSection();
  initUIComponents();
});
