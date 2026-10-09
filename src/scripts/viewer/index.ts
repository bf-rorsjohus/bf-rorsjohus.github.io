// Lightbox for the gallery images and PDF documents, using GLightbox (MIT, self-hosted).
// Progressive enhancement: every a[data-viewer] keeps its normal href, so without this script
// (or if it fails) the file simply opens in the browser.
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import './viewer.css';

GLightbox({
  selector: 'a[data-viewer]',
  loop: true,
  touchNavigation: true,
  keyboardNavigation: true,
  closeOnOutsideClick: true,
  openEffect: 'fade',
  closeEffect: 'fade',
  slideEffect: 'none', // paging is frequent and keyboard-driven
  lightboxHTML: `<div id="glightbox-body" class="glightbox-container" tabindex="-1" role="dialog" aria-modal="true" aria-label="Förhandsvisning" aria-hidden="false">
    <div class="gloader visible"></div>
    <div class="goverlay"></div>
    <div class="gcontainer">
      <div id="glightbox-slider" class="gslider"></div>
      <button type="button" class="gclose gbtn" aria-label="Stäng" data-taborder="3">{closeSVG}</button>
      <button type="button" class="gprev gbtn" aria-label="Föregående" data-taborder="2">{prevSVG}</button>
      <button type="button" class="gnext gbtn" aria-label="Nästa" data-taborder="1">{nextSVG}</button>
    </div>
  </div>`,
});
