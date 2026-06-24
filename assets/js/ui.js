
import { dom } from './dom.js';

    let statusTimeout = null;

    export function toggleView(viewMode) {
        dom.statusMessage.innerHTML = "";

        if (viewMode === 'menu') {
            dom.contentViewer.style.display = 'none';
            dom.contentViewer.innerHTML = '';
            dom.terminalMenu.style.display = 'flex';
        } else {
            dom.terminalMenu.style.display = 'none';
            dom.contentViewer.style.display = 'flex';

            const isCentered = viewMode === 'img';
            dom.contentViewer.style.justifyContent = isCentered ? 'center' : 'flex-start';
            dom.contentViewer.style.alignItems = isCentered ? 'center' : 'stretch';
        }
    }

    export function updateStatus(message, time) {
        if (statusTimeout) clearTimeout(statusTimeout);

        dom.statusMessage.innerHTML = message;
        statusTimeout = setTimeout(() => { 
            dom.statusMessage.innerHTML = ""; 
        }, time);
    }

    export function setTerminalError(message) {
        dom.statusMessage.innerHTML = message;
    }
