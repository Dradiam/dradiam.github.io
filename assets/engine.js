import { dom } from './dom.js';
import { config } from './config.js';
import { state } from './state.js';
import { updateStatus, toggleView } from './ui.js';
import { fetchFileContent } from './api.js';
import { handleBack } from './events.js';

export function renderMenu(items, isBack = false) {
    dom.terminalMenu.innerHTML = '';

    items.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("terminal-item");
        div.id = item.menuItemID;
        div.textContent = `${item.menuItemLabel}`;

        div.addEventListener('click', () => {
            const isViewerType = config.VIEWER_TYPES.includes(item.menuItemType);

            if (isViewerType || item.menuItemType === 'menu') {
                if (item.menuItemType !== 'menu' && !item.menuItemContent) {
                    updateStatus("Missing file path. Please reload terminal drives.", config.STATUS_DURATION);
                    return;
                }
                state.push(items);
            }

            if (isViewerType) {
                renderContent(item.menuItemContent, item.menuItemType);
                return; 
            }

            switch (item.menuItemType) {
                case 'menu': 
                    renderMenu(item.menuItemContent); 
                    break;
                case 'pdf': 
                    updateStatus("Data downloaded to local device.", config.STATUS_DURATION); 
                    break;
                default:
                    updateStatus("File format is unreadable.", config.STATUS_DURATION);    
                    break;              
            }
        });

        dom.terminalMenu.appendChild(div);  
    });
}

export async function renderContent(path, type) {
    if (!path) return;

    toggleView(type);

    if (type === 'img') {
        renderImage(path);
        return;
    }

    try {
        const textData = await fetchFileContent(path);
        updateStatus(`Loading ${type === 'html' ? 'file' : 'text file'}, please stand by...`, config.STATUS_DURATION);

        if (type === 'html') {
            const jsonData = typeof textData === 'string' ? JSON.parse(textData) : textData;
            renderHTML(jsonData);
        } else {
            renderText(textData, type);
        }
        
    } catch (err) {
        console.error("Terminal Error:", err);
        updateStatus("Critical error, please contact system administrator.", config.STATUS_DURATION);

        if (state.hasHistory) state.pop();
        toggleView('menu');
    }
}

function renderImage(path) {
    updateStatus("Loading image file, please stand by...", config.STATUS_DURATION);
    
    const container = document.createElement("div");
    container.classList.add('image-container');
    container.addEventListener('click', handleBack);

    const image = document.createElement("img");
    image.src = path;
    
    container.appendChild(image);
    dom.contentViewer.appendChild(container);
}

function renderHTML(htmlData) {
    dom.contentViewer.innerHTML = '';
    
    function createDocElement(item, depth = 1) {
        if (depth > 5) {
            console.warn("Maximum nesting depth of 5 exceeded. Skipping deeper elements.");
            return null;
        }

        if (!item || !item.tag) return null;

        const element = document.createElement(item.tag);

        if (item.id) element.id = item.id;
        if (item.className) element.className = item.className;

        if (item.content !== null && item.content !== undefined) {
            if (Array.isArray(item.content)) {
                const childrenToProcess = item.content.slice(0, 5);
                
                childrenToProcess.forEach(childItem => {
                    const childElement = createDocElement(childItem, depth + 1);
                    if (childElement) {
                        element.appendChild(childElement);
                    }
                });
            } else if (typeof item.content === 'object') {
                const childElement = createDocElement(item.content, depth + 1);
                if (childElement) {
                    element.appendChild(childElement);
                }
            } else if (item.tag === 'a') {
                element.innerHTML = item.content;
            } else {
                element.textContent = item.content;
            }
        }

        if (Array.isArray(item.customStyle)) {
            item.customStyle.forEach(style => {
                if (style && style.key && style.value !== null && style.value !== undefined) {
                    element.style[style.key] = style.value;
                }
            });
        }

        if (Array.isArray(item.customAttributes)) {
            item.customAttributes.forEach(attr => {
                if (attr && attr.name && attr.value !== null && attr.value !== undefined) {
                    if (item.tag === 'a' && attr.name.toLowerCase() === 'target') {
                        element.setAttribute('target', '_self');
                    } else {
                        element.setAttribute(attr.name, attr.value);
                    }
                }
            });
        }

        if (item.tag === 'a') {
            if (!element.hasAttribute('target') || element.getAttribute('target') !== '_self') {
                element.setAttribute('target', '_self');
            }
            element.removeAttribute('rel'); 
        }

        return element;
    }

    try {
        const parsedData = typeof htmlData === 'string' ? JSON.parse(htmlData) : htmlData;

        if (!parsedData || !Array.isArray(parsedData.docContent)) {
            throw new Error("Invalid document structure");
        }

        parsedData.docContent.forEach(item => {
            const element = createDocElement(item);
            if (element) {
                dom.contentViewer.appendChild(element);
            }
        });

    } catch (parseError) {
        console.error("Failed to render HTML from JSON:", parseError);
        updateStatus("Critical error in content rendering.", config.STATUS_DURATION);
    }
}

function renderText(textData, type) {
    dom.contentViewer.textContent = textData;
    dom.contentViewer.style.whiteSpace = type === 'txt' ? 'pre-wrap' : 'normal';
}
