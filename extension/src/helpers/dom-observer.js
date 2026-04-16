import { log } from "../features/logger.js";
import { elementExists } from "select-dom";

let watch_list = [];

setInterval(() => {
  if (!document.body) {
    return;
  }

  for (var i = 0; i < watch_list.length; i++) {
    let exists = elementExists(watch_list[i].selector);

    if (exists && watch_list[i].enabled) {
      if (document.body.classList.contains(watch_list[i].bodyClass)) {
        continue;
      }
      //log(`✨ Found ${watch_list[i].selector} for feature ${watch_list[i].id}`);

      document.body.classList.add(watch_list[i].bodyClass);

      if (watch_list[i].callback) {
        watch_list[i].callback();
      }
    } else {
      if (!document.body.classList.contains(watch_list[i].bodyClass)) {
        continue;
      }
      document.body.classList.remove(watch_list[i].bodyClass);
      //log(`🥷 Lost ${watch_list[i].selector} for feature ${watch_list[i].id}`);

      if (watch_list[i].callback) {
        watch_list[i].callback(false);
      }
    }
  }
}, 300);

export default function observe(id, selector, bodyClass, callback, enabled) {
  watch_list = watch_list.filter((item) => item.id !== id);
  watch_list.push({ id, selector, bodyClass, callback, enabled });
}
