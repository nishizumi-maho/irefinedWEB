import { io } from "socket.io-client";
import { log } from "../features/logger.js";

function getSentryRelease() {
  return typeof SENTRY_RELEASE !== "undefined" ? SENTRY_RELEASE : null;
}

let wsInitCheck = setInterval(() => {
  if (getSentryRelease()) {
    clearInterval(wsInitCheck);
    initWS();
  }
}, 1000);

let clientSocket;
let authSocket;
let initialized = false;
let callbacks = [];

function id() {
  var t = function () {
    return Math.floor((1 + Math.random()) * 65536)
      .toString(16)
      .substring(1);
  };
  return t() + t() + "-" + t() + "-" + t() + "-" + t() + "-" + t() + t() + t();
}

function formatSeasonName(seasonName) {
  seasonName = seasonName
    .replace(/(?:\s*-\s*)?\d{4}\sSeason(?:\s\d+)?/, "")
    .replace(/Fixed\s(?:-\s)?Fixed/, "Fixed")
    .replace("Series Series", "Series");
  return seasonName;
}

function initWS() {
  const release = getSentryRelease();

  if (!release?.id) {
    log("🚫 Could not detect the iRacing client version for websocket auth");
    return;
  }

  const irVersion = release.id.substring(
    0,
    release.id.indexOf("-")
  );

  authSocket = io("https://members-ng.iracing.com", {
    reconnectionAttempts: 100,
    auth: {
      clientVersion: irVersion,
    },
    transports: ["websocket"],
  });

  clientSocket = io("https://members-ng.iracing.com/client.io", {
    reconnectionAttempts: 100,
    auth: {
      clientVersion: irVersion,
    },
    transports: ["websocket"],
  });

  authSocket.on("connect", () => {
    initialized = false;
    log("⚡ Connected to iRacing");
  });

  authSocket.on("disconnect", () => {
    log("⛓️‍💥 Disconnected from iRacing");
  });

  authSocket.on("connect_error", (error) => {
    log(`🚫 iRacing auth socket error: ${error.message}`);
  });

  clientSocket.on("connect", () => {
    log("🔌 Connected to client.io");
  });

  clientSocket.on("disconnect", () => {
    initialized = false;
    log("🔌 Disconnected from client.io");
  });

  clientSocket.on("connect_error", (error) => {
    initialized = false;
    log(`🚫 client.io socket error: ${error.message}`);
  });

  clientSocket.on("initialized", (data) => {
    initialized = true;
    authSocket.emit("now");
    log("✅ iRacing websocket ready");

    clientSocket.emit("data_services", {
      refid: id(),
      service: "season",
      method: "popular_sessions",
      args: {
        include_empty_practice: false,
        subscribe: true,
      },
    });
  });

  authSocket.on("heartbeat", (data) => {
    return data();
  });

  clientSocket.on("data_services_push", (data) => {
    callbacks.forEach((callback) => {
      callback(data);
    });

    if (!window.irefIndex) {
      window.irefIndex = {};
      try {
        data.data.sessions.forEach((session) => {
          window.irefIndex[session.season_id] = formatSeasonName(
            session.season_name
          );
        });
      } catch {}
    }
  });
}

function send(event, data) {
  if (!clientSocket || !clientSocket.connected || !initialized) {
    log("🚫 iRacing websocket is not ready yet");
    return false;
  }

  data.refid = id();
  clientSocket.emit(event, data);
  return true;
}

function withdraw() {
  log("🚫 Withdrawing from current session");
  return send("data_services", {
    service: "registration",
    method: "withdraw",
    args: {},
  });
}

function register(
  session_name,
  car_id,
  car_class_id,
  session_id,
  subsession_id = null
) {
  log(`📝 Registering for ${session_name}`);

  const data = {
    service: "registration",
    method: "register",
    args: {
      register_as: "driver",
      car_id: car_id,
      car_class_id: car_class_id,
      session_id: session_id,
    },
  };

  if (subsession_id) {
    data.args.subsession_id = subsession_id;
  }

  return send("data_services", data);
}

function isReady() {
  return !!clientSocket && clientSocket.connected && initialized;
}

const ws = {
  send,
  register,
  withdraw,
  isReady,
  callbacks,
};

export default ws;
