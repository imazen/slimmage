export { SlimmageImgElement } from './slimmage-img.js';
import { SlimmageImgElement } from './slimmage-img.js';

// Auto-register the custom element
if (typeof customElements !== 'undefined' && !customElements.get('slimmage-img')) {
  customElements.define('slimmage-img', SlimmageImgElement);
}
