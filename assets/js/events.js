
import { dom } from './dom.js';
import { config } from './config.js';
import { state } from './state.js';
import { toggleView, updateStatus, setTerminalError } from './ui.js';
import { fetchAccount, checkAccountExists } from './api.js';
import { themeLoader } from './picasso.js';
import { renderMenu } from './engine.js';
import * as widgetLoader from './widgets.js';

    export function handleBack() {
        if (dom.contentViewer.style.display === 'flex') {
            toggleView('menu');
        }
        if (state.hasHistory) {
            const previousState = state.pop();
            renderMenu(previousState, true);
        }
    }

    async function promptForAccount() {
        let fileName = prompt("Please enter the account name you want to access:", config.DEFAULT_FILE);
        if (fileName === null) return;
        if (fileName.trim() === "") fileName = config.DEFAULT_FILE;
        
        const fullPath = `${config.DIRECTORY_PATH}${fileName}.json`;

        try {
            await checkAccountExists(fullPath);
            await init(fullPath);
        } catch (error) {
            console.error("Directory/File Error:", error.message);
            updateStatus("Account not found under given credentials.", config.STATUS_DURATION);
        }
    }

    function onKeyPress(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === '/') {
            e.preventDefault();
            promptForAccount();
        } else if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            handleBack();
        }
    }

    export async function init(accPath) {
        try {
            const accdata = await fetchAccount(accPath);

            const { 
                themeType, 
                fontType, 
                colorValue, 
                customValue
            } = accdata.themeSettings || {};

            themeLoader(themeType, fontType, colorValue, customValue);

            state.clear();
            toggleView('menu');
            
            const fsurl = accdata.fs.menuItemContent;
            const widgets = accdata.widgetSettings.widgetList;
            
            widgetLoader.loadWidgets(widgets, accdata.main, accdata.widgetSettings);
            renderMenu(fsurl);
            updateStatus("File system found. Please stand by...", config.STATUS_DURATION);
        } catch (error) {
            console.error(error);
            setTerminalError("File system not found. Please contact system administrator.");
        }
    }

    export function setupEventListeners() {
        dom.contentViewer.addEventListener('click', (e) => {
            if (e.target.classList.contains("content-viewer")) handleBack();
        });

        dom.terminalMenu.addEventListener('click', (e) => {
            if (e.target === dom.terminalMenu) handleBack();
        });

        window.addEventListener('keydown', onKeyPress);
    }
    
