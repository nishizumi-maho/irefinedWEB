import features from '../feature-manager.js';
import './collapse-menu.css';

const id = "collapse-menu";

const selector = '#racing-sidebar';

const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass);
