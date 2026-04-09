import { log } from "./features/logger.js";
import observe from "./helpers/dom-observer.js";
import { getSettings } from "./helpers/settings.js";

let registeredFeatures = [];

async function add(id, observer, selector, bodyClass, callback = null) {
  /* Registering the feature push all args */
  registeredFeatures.push({ id, observer, selector, bodyClass, callback });

  /* Feature filtering and running */
  const options = getSettings();

  let enabled = false;

  // check if feature id is enabled in the options object
  if (
    (options && options[id] === true) ||
    id === "settings-panel" ||
    id === "status-bar" ||
    id === "update-notice" ||
    id === "go-racing-export"
  ) {
    //log(`✅ Enabled feature: ${id}`);
    enabled = true;
  } else {
    //log(`❌ Disabled feature: ${id}`);
  }

  if (observer) {
    observe(id, selector, bodyClass, callback, enabled);
  } else {
    if (callback) {
      callback(enabled);
    }
  }

  return;
}

async function rerunAll() {
  registeredFeatures.forEach((feature) => {
    registeredFeatures = registeredFeatures.filter(
      (item) => item.id !== feature.id
    );
    add(
      feature.id,
      feature.observer,
      feature.selector,
      feature.bodyClass,
      feature.callback
    );
  });
}

const features = {
  add,
  rerunAll,
};

export default features;
