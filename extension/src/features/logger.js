import features from '../feature-manager.js';
import { $ } from 'select-dom';
import './logger.css'

const selector = 'body';

const logContainer = document.createElement('div');
logContainer.id = 'iref-log';
logContainer.style.display = 'none';

export function log(message) {

    let logLine = document.createElement('div');
    let timeLabel = document.createElement('span');
    let date = new Date();
    let time = date.toTimeString().split(' ')[0];
    logLine.style.cssText = 'margin-bottom: 5px;';
    timeLabel.textContent = time;
    logLine.append(timeLabel, document.createTextNode(' - ' + String(message)));
    logContainer.appendChild(logLine);
    logContainer.scrollTop = logContainer.scrollHeight;
    console.info('[iRefined]', String(message));

}

let appended = false;

async function init(activate = true) {

    if (!activate) {
        const existingLog = $('#iref-log');
        if (existingLog) {
            existingLog.style.display = 'none';
        }
        return;
    }

    if (!appended) {
        if (!document.body) {
            return;
        }
        document.body.appendChild(logContainer);
        appended = true;
    }

    const existingLog = $('#iref-log');
    if (existingLog) {
        existingLog.style.display = 'block';
    }

}

const id = "logger";
const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass, init);
