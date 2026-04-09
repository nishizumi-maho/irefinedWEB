import features from "../feature-manager.js";
import { getSettings } from "../helpers/settings.js";
import { $ } from "select-dom";
import { log } from "./logger.js";

const selector = '.chakra-toast button[aria-label="Close"]:not(.iref-seen)';

async function init(activate = true) {
  if (!activate) {
    return;
  }

  const timeout = getSettings()["toast-timeout-s"] || 5;

  let toastEl = $(selector);

  toastEl.classList.add("iref-seen");

  log("✖️ Closing toast after " + timeout + " seconds");

  setTimeout(() => {
    let reactHandler = Object.keys(toastEl).find((key) =>
      key.startsWith("__reactProps")
    );
    toastEl[reactHandler].onClick();
  }, timeout * 1000);
}

const id = "auto-close-toasts";
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
