export const themeLoader = (themeType, fontType, colorValue, customColorValue) => {
    const root = document.documentElement;

    const validThemeTypes = ['classique', 'moderne'];
    const safeThemeType = validThemeTypes.includes(themeType) ? themeType : 'classique';

    const linkId = 'theme-layout-stylesheet';
    let themeLink = document.getElementById(linkId);

    if (safeThemeType === 'moderne') {
        if (!themeLink) {
            themeLink = document.createElement('link');
            themeLink.id = linkId;
            themeLink.rel = 'stylesheet';
            themeLink.href = './assets/styles/modern.css';
            document.head.appendChild(themeLink);
        }
    } else {
        if (themeLink) {
            themeLink.remove();
        }
    }

    const allowedColors = ['green', 'amber', 'blue', 'white', 'red', 'yunara', 'zeri', 'gwen', 'seraphine', 'radgreen'];
    
    let finalAccentColor;

    if (customColorValue && customColorValue.trim() !== "") {
        const hexRegex = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
        
        if (hexRegex.test(customColorValue)) {
            finalAccentColor = customColorValue;
        } else {
            console.warn(`themeLoader: Invalid custom hex color "${customColorValue}". Falling back.`);
        }
    }

    if (!finalAccentColor) {
        if (allowedColors.includes(colorValue)) {
            finalAccentColor = `var(--${colorValue})`;
        } else {
            console.warn(`themeLoader: Unknown color value "${colorValue}". Falling back to radgreen.`);
            finalAccentColor = 'var(--radgreen)';
        }
    }

    root.style.setProperty('--fgDefault', finalAccentColor);

    const validFonts = ['classique', 'moderne', 'neo-classique'];
    const safeFontType = validFonts.includes(fontType) ? fontType : 'classique';

    root.style.setProperty('--main-font-family', `var(--${safeFontType})`);
};
