import features from "../feature-manager.js";
import { getSettings, saveSettings } from "../helpers/settings.js";
import { initSoundSupport, playQueueRegisteredSound } from "../helpers/sound.js";
import {
  checkForUpdates,
  CURRENT_DISPLAY_VERSION,
  getCachedUpdateInfo,
  openLatestRelease,
} from "../helpers/updates.js";
import "./settings-panel.css";
import React from "dom-chef";
import { $ } from "select-dom";

async function initSettingsPanel(activate = true) {
  if (!activate) {
    return;
  }

  const ensureOverlay = () => {
    let overlay = $("#iref-settings-overlay");

    if (overlay) {
      return overlay;
    }

    overlay = (
      <div id="iref-settings-overlay" class="iref-settings-overlay">
        <div class="iref-settings-backdrop"></div>
        <div id="iref-settings-dialog" class="iref-settings-dialog"></div>
      </div>
    );

    overlay.querySelector(".iref-settings-backdrop").addEventListener("click", () => {
      handleClose();
    });

    document.body.appendChild(overlay);
    return overlay;
  };

  const handleClose = (e) => {
    const overlay = $("#iref-settings-overlay");
    const body = $("body");
    const logEl = $("#iref-log");

    if (overlay) {
      overlay.classList.remove("open");
    }

    if (body) {
      body.classList.remove("iref-settings-panel-open");
    }

    if (logEl) {
      logEl.scrollTop = logEl.scrollHeight;
    }
  };

  const handleReload = (e) => {
    location.reload();
  };

  const handleOpenLatestRelease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openLatestRelease();
  };

  const handleTestSound = (e) => {
    e.preventDefault();
    e.stopPropagation();
    initSoundSupport();
    playQueueRegisteredSound({ ignoreEnabled: true });
  };

  let settings = getSettings();
  let updateInfo = getCachedUpdateInfo();

  const renderUpdateNote = (info = getCachedUpdateInfo()) => {
    const note = $("#iref-update-note");

    if (!note) {
      return;
    }

    note.innerHTML = "";

    if (!info.available) {
      note.classList.add("hidden");
      return;
    }

    note.classList.remove("hidden");
    const title = document.createElement("strong");
    title.textContent = `Update available: ${info.latestTag}`;

    const description = document.createElement("p");
    description.textContent = `You are on ${CURRENT_DISPLAY_VERSION}. A newer GitHub Release is available for download.`;

    const actions = document.createElement("div");
    actions.className = "iref-update-note-actions";

    const helpText = document.createElement("span");
    helpText.textContent =
      "Download the latest release zip, extract it, then reload the unpacked extension.";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "iref-secondary-btn";
    button.textContent = "Open latest release";
    button.addEventListener("click", handleOpenLatestRelease);

    actions.append(helpText, button);
    note.append(title, description, actions);
  };

  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      settings[e.target.name] = e.target.checked;
    }

    if (e.target.type === "number") {
      settings[e.target.name] = parseInt(e.target.value);
    }

    if (e.target.type === "select-one") {
      settings[e.target.name] = e.target.value;
    }
  };

  const handleSave = (e) => {
    settings = saveSettings(settings);
    features.rerunAll();
    handleClose();
  };

  const settingsPanelEl = (
    <div id="iref-settings-panel-content" class="modal-content">
      <div class="modal-header">
        <a class="close" onClick={handleClose}>
          <i class="icon-cancel"></i>
        </a>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          style={{ float: "left", marginRight: 7 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-rocket"
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
        <h6 class="modal-title" data-testid="modal-title">
          iRefined
        </h6>
      </div>
      <div
        id="alert-banner-alert-1739463611065"
        class="alert alert-banner m-b-0 alert-warning alert-dismissible text-overflow"
        role="alert"
      >
        <div class="">
          <a class="close">
            <i class="icon-cancel"></i>
          </a>
          <span>
            <i class="icon-caution m-r-1"></i>
            <strong></strong>
          </span>
        </div>
      </div>
      <div class="modal-body has-dynamic-height">
        <div
          id="modal-children"
          class="height-limiter"
          style={{ maxHeight: 1244 }}
        >
          <div id="modal-children-container" style={{ position: "relative" }}>
            <div>
              <div class="row">
                <div class="col-xs-12">
                  <h1 class="m-b-1">
                    <strong>Settings</strong>
                  </h1>
                  <p class="m-b-1">
                    This browser build focuses on members-ng UI helpers. Launching
                    and joining sessions still hand off to the local iRacing app.
                  </p>
                  <div id="iref-update-note" class="iref-update-note hidden"></div>
                  <h4 class="m-b-1">
                    <strong>Experimental Web Tools</strong>
                  </h4>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Adds download and upload buttons to the session settings window so that conditions can be shared using .json"
                    ></i>
                    Test Drive session sharing buttons
                    <input
                      type="checkbox"
                      name="share-test-session"
                      checked={settings["share-test-session"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Adds import and export buttons to the Hosted and League create-race wizard so session setup can be shared using .json. Weather tools are temporarily hidden."
                    ></i>
                    Hosted/League session tools
                    <input
                      type="checkbox"
                      name="share-hosted-session"
                      checked={settings["share-hosted-session"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Adds queue buttons to the next race card and session list to automatically register when the matching race session appears. You must select a car to queue with. Clicking an active queue button again removes it."
                    ></i>
                    Queue system for future sessions
                    <input
                      type="checkbox"
                      name="auto-register"
                      checked={settings["auto-register"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="When enabled, queueing a multiclass series without a saved car will ask which car to use. When disabled, queueing without a car selection shows 'Choose a car!' instead."
                    ></i>
                    Prompt for car when queueing
                    <input
                      type="checkbox"
                      name="queue-car-prompt"
                      checked={settings["queue-car-prompt"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Advanced: when a queued session replaces an existing registration, add the displaced later session back to the queue. Leave this off unless you want iRefined to re-register sessions it withdrew from."
                    ></i>
                    Re-queue displaced registration
                    <input
                      type="checkbox"
                      name="queue-requeue-displaced-registration"
                      checked={settings["queue-requeue-displaced-registration"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Play a short sound when a queued race finally sends its register request."
                    ></i>
                    Queue register sound
                    <input
                      type="checkbox"
                      name="queue-register-sound"
                      checked={settings["queue-register-sound"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Adjust the queue register sound volume from 0 to 100."
                    ></i>
                    Queue sound volume
                    <input
                      type="number"
                      name="queue-register-sound-volume"
                      min="0"
                      max="100"
                      value={settings["queue-register-sound-volume"] ?? 65}
                      onChange={handleChange}
                    />
                    %
                  </label>
                  <div class="iref-setting iref-setting-actions">
                    <i
                      class="icon-information text-info"
                      title="Play the current queue register sound using the configured volume."
                    ></i>
                    Test queue sound
                    <button
                      type="button"
                      class="iref-secondary-btn"
                      onClick={handleTestSound}
                    >
                      Test sound
                    </button>
                  </div>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Green join button will display session type. Doesn't work well with official sessions that don't go official (low attendance)."
                    ></i>
                    Join button displays session type
                    <input
                      type="checkbox"
                      name="better-join-button"
                      checked={settings["better-join-button"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Show or hide the financial snapshot widget on the main dashboard page. When left on, the values still stay hidden until you reveal them."
                    ></i>
                    Dashboard financial widget
                    <input
                      type="checkbox"
                      name="dashboard-purchase-summary"
                      checked={settings["dashboard-purchase-summary"]}
                      onChange={handleChange}
                    />
                  </label>
                  <p class="m-b-1">
                    Desktop-only features such as auto join and auto forfeit are
                    disabled in the browser build.
                  </p>
                  <h4 class="m-b-1">
                    <strong>Browser UI Tweaks</strong>
                  </h4>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Don't show any notifications at the top of the screen."
                    ></i>
                    No notifications
                    <input
                      type="checkbox"
                      name="no-toasts"
                      checked={settings["no-toasts"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Close notifications at the top of the screen after a delay. Does not work with the previous option."
                    ></i>
                    Auto close notifications after
                    <input
                      type="number"
                      name="toast-timeout-s"
                      value={settings["toast-timeout-s"] || 5}
                      onChange={handleChange}
                    />
                    seconds
                    <input
                      type="checkbox"
                      name="auto-close-toasts"
                      checked={settings["auto-close-toasts"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Hide the left and right sidebars for a cleaner UI with more space."
                    ></i>
                    Hide sidebars
                    <input
                      type="checkbox"
                      name="no-sidebars"
                      checked={settings["no-sidebars"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Folds in the left hand menu so that it only uses icons, to free up even more space for more important stuff."
                    ></i>
                    Collapse menu
                    <input
                      type="checkbox"
                      name="collapse-menu"
                      checked={settings["collapse-menu"]}
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="" class="iref-setting">
                    <i
                      class="icon-information text-info"
                      title="Helpful to figure out why something happened."
                    ></i>
                    Show log messages
                    <input
                      type="checkbox"
                      name="logger"
                      checked={settings["logger"]}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div>
          <div class="pull-xs-left">
            <a
              id="default-close-modal-btn-71327f90-c5eb-2239-da82-fd2d60e5ea02"
              class="btn btn-md btn-secondary"
              data-testid="button-close-modal"
              onClick={handleClose}
            >
              <i class="icon-cancel"></i> Close
            </a>
            <a
              id="reload-ui"
              class="btn btn-md btn-secondary"
              onClick={handleReload}
            >
              Reload page
            </a>
          </div>
          <div class="pull-xs-right">
            <span class="m-l-h">
              <button
                type="button"
                class="btn btn-success"
                aria-label="button"
                tabindex="0"
                onClick={handleSave}
              >
                Save
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const handleClick = (e) => {
    const overlay = ensureOverlay();
    const dialog = $("#iref-settings-dialog");
    const body = $("body");

    if (!overlay || !dialog) {
      return;
    }

    dialog.innerHTML = "";
    dialog.appendChild(settingsPanelEl);
    overlay.classList.add("open");
    renderUpdateNote(updateInfo);
    checkForUpdates({ force: true }).then((info) => {
      updateInfo = info;
      renderUpdateNote(info);
    });

    if (body) {
      body.classList.add("iref-settings-panel-open");
    }
  };

  const menuButtonEl = (
    <button
      type="button"
      className="iref-toolbar-btn iref-settings-trigger"
      aria-label="iRefined"
      tabindex="0"
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20px"
        height="20px"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-rocket"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
      <span>iRefined</span>
    </button>
  );

  if (!$(".iref-settings-trigger")) {
    const toolbar = $(".iref-bar-right");

    if (toolbar) {
      toolbar.appendChild(menuButtonEl);
    }
  }
}

const id = "settings-panel";
const bodyClass = "iref-" + id;
const selector = "body";

features.add(id, true, selector, bodyClass, initSettingsPanel);
