import features from "../feature-manager.js";
import { findProps } from "../helpers/react-resolver.js";
import { $ } from "select-dom";
import "./better-join-button.css";

const selector = ".css-qlxuh7 .btn-success";
let persistInterval = 0;

const userRoles = {
  0: "Race",
  2: "Spectate",
  4: "Spot",
};

async function init(activate = true) {
  if (!activate) {
    clearInterval(persistInterval);
    return;
  }

  persistInterval = setInterval(() => {
    let joinBtnEl = $(selector);

    if (!joinBtnEl) {
      return;
    }

    if (joinBtnEl.classList.contains("iref-seen")) {
      return;
    }

    joinBtnEl.classList.add("iref-seen");

    const joinProps = findProps(joinBtnEl);

    let label1 = "";
    let label2 = "";

    if (joinProps.registrationStatus.user_role !== 0) {
      if (userRoles[joinProps.registrationStatus.user_role] !== undefined) {
        label1 = userRoles[joinProps.registrationStatus.user_role];
      }
    } else {
      if (joinProps.registrationStatus.event_type === 5) {
        label1 = "Race";
      } else {
        label1 = "Practice";
      }

      if (joinProps.registrationStatus.will_be_scored) {
        label2 = "";
      } else {
        label2 = " (Unscored)";
      }
    }

    joinBtnEl.textContent = label1;

    const joinSeriesLabel =
      window.irefIndex &&
      joinProps.registrationStatus.season_id in window.irefIndex
        ? window.irefIndex[joinProps.registrationStatus.season_id]
        : false;

    const seriesLabelEl = $(".chakra-text.css-1ap4k1m");

    if (joinSeriesLabel && seriesLabelEl) {
      seriesLabelEl.innerText = joinSeriesLabel;
    }
  }, 300);
}

const id = "better-join-button";
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
