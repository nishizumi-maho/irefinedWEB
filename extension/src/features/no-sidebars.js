import features from '../feature-manager.js';
import './no-sidebars.css';

const id = "no-sidebars";

const selector = '#rightbar';

const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass);
