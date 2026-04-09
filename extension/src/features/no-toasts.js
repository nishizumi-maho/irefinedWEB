import features from '../feature-manager.js';
import './no-toasts.css';

const id = "no-toasts";

const selector = '#chakra-toast-manager-top';

const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass);
