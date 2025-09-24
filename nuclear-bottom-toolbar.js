// NUCLEAR BOTTOM TOOLBAR FIX - Copy and paste this into browser console
console.log('💥 NUCLEAR BOTTOM TOOLBAR FIX...');

// Clear any existing intervals
if (window.nuclearToolbarInterval) {
  clearInterval(window.nuclearToolbarInterval);
}

// Remove any existing styles
const existingStyle = document.getElementById('nuclear-toolbar-fix-style');
if (existingStyle) {
  existingStyle.remove();
}

// Function to get current theme colors
function getCurrentThemeColors() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
  console.log('Current theme:', currentTheme);
  
  const themeColors = {
    'clean-light': {
      background: '#FAFAFA',  // paydine-soft-white
      effect: 'rgba(250, 250, 250, 0.95)'
    },
    'modern-dark': {
      background: '#0A0E12',  // dark background
      effect: 'rgba(10, 14, 18, 0.95)'
    },
    'gold-luxury': {
      background: '#0F0B05',  // dark background
      effect: 'rgba(15, 11, 5, 0.95)'
    },
    'vibrant-colors': {
      background: '#e2ceb1',  // warm beige
      effect: 'rgba(226, 206, 177, 0.95)'
    },
    'minimal': {
      background: '#CFEBF7',  // light blue
      effect: 'rgba(207, 235, 247, 0.95)'
    }
  };
  
  return themeColors[currentTheme] || themeColors['clean-light'];
}

// Function to apply nuclear toolbar fix
function applyNuclearToolbarFix() {
  const colors = getCurrentThemeColors();
  console.log('Using NUCLEAR toolbar colors:', colors);
  
  // Add CSS with MAXIMUM specificity
  const style = document.createElement('style');
  style.id = 'nuclear-toolbar-fix-style';
  style.textContent = `
    /* NUCLEAR BOTTOM TOOLBAR FIX - MAXIMUM SPECIFICITY */
    
    /* Target EVERYTHING that could be the toolbar */
    div.fixed.bottom-\\[1\\.35rem\\],
    div[class*="fixed"][class*="bottom-"][class*="left-1/2"],
    div[class*="fixed"][class*="bottom-"][class*="translate"],
    div[class*="z-40"][class*="fixed"],
    div[class*="max-w-\\[23\\.04rem\\]"],
    .fixed.bottom-\\[1\\.35rem\\].left-1\\/2.-translate-x-1\\/2.w-full.max-w-\\[23\\.04rem\\].z-40.px-2 {
      background: ${colors.effect} !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
      opacity: 0.95 !important;
      z-index: 999999 !important;
    }
    
    /* Force all icons to be visible */
    div.fixed.bottom-\\[1\\.35rem\\] svg,
    div.fixed.bottom-\\[1\\.35rem\\] path,
    div[class*="fixed"][class*="bottom-"] svg,
    div[class*="fixed"][class*="bottom-"] path,
    div[class*="z-40"] svg,
    div[class*="z-40"] path {
      color: var(--theme-text-primary) !important;
      fill: currentColor !important;
      opacity: 1 !important;
    }
    
    /* Force cart badges to be visible */
    div.fixed.bottom-\\[1\\.35rem\\] .cart-badge,
    div.fixed.bottom-\\[1\\.35rem\\] [class*="absolute"][class*="-top"],
    div[class*="fixed"][class*="bottom-"] .cart-badge,
    div[class*="z-40"] .cart-badge {
      background-color: var(--theme-secondary) !important;
      color: var(--theme-background) !important;
      opacity: 1 !important;
      z-index: 9999999 !important;
    }
  `;
  
  // Remove old style and add new one
  const oldStyle = document.getElementById('nuclear-toolbar-fix-style');
  if (oldStyle) {
    oldStyle.remove();
  }
  document.head.appendChild(style);
  
  // Find and force style ALL possible toolbar elements
  const selectors = [
    'div.fixed.bottom-[1.35rem]',
    'div[class*="fixed"][class*="bottom-"][class*="left-1/2"]',
    'div[class*="fixed"][class*="bottom-"][class*="translate"]',
    'div[class*="z-40"][class*="fixed"]',
    'div[class*="max-w-[23.04rem]"]'
  ];
  
  let allToolbars = [];
  selectors.forEach(selector => {
    const toolbars = document.querySelectorAll(selector);
    console.log(`Found ${toolbars.length} toolbars with selector: ${selector}`);
    allToolbars = [...allToolbars, ...toolbars];
  });
  
  // Remove duplicates
  const uniqueToolbars = [...new Set(allToolbars)];
  console.log(`Total unique toolbars found: ${uniqueToolbars.length}`);
  
  let fixed = 0;
  
  uniqueToolbars.forEach((toolbar, index) => {
    console.log(`💥 NUCLEAR FIXING toolbar ${index + 1}:`, toolbar);
    console.log('Toolbar classes:', toolbar.className);
    
    // Apply NUCLEAR styles
    toolbar.style.cssText = `
      background: ${colors.effect} !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
      opacity: 0.95 !important;
      z-index: 999999 !important;
      pointer-events: auto !important;
      height: 76px !important;
    `;
    
    // Force all child elements to be visible
    const icons = toolbar.querySelectorAll('svg, path');
    icons.forEach(icon => {
      icon.style.cssText = `
        color: var(--theme-text-primary) !important;
        fill: currentColor !important;
        opacity: 1 !important;
      `;
    });
    
    const badges = toolbar.querySelectorAll('.cart-badge, [class*="absolute"][class*="-top"]');
    badges.forEach(badge => {
      badge.style.cssText = `
        background-color: var(--theme-secondary) !important;
        color: var(--theme-background) !important;
        opacity: 1 !important;
        z-index: 9999999 !important;
      `;
    });
    
    fixed++;
  });
  
  console.log(`💥 NUCLEAR FIXED ${fixed} bottom toolbars!`);
  return fixed;
}

// Run immediately
let fixed = applyNuclearToolbarFix();

// Keep trying every second for 10 seconds
let nuclearAttempts = 0;
window.nuclearToolbarInterval = setInterval(() => {
  nuclearAttempts++;
  const newFixed = applyNuclearToolbarFix();
  if (newFixed > 0) {
    console.log(`💥 NUCLEAR Attempt ${nuclearAttempts}: Fixed ${newFixed} more toolbars`);
  }
  
  if (nuclearAttempts >= 10) {
    clearInterval(window.nuclearToolbarInterval);
    console.log('💥 NUCLEAR BOTTOM TOOLBAR FIX COMPLETE!');
  }
}, 1000);

console.log('💥 NUCLEAR BOTTOM TOOLBAR FIX COMPLETE - Should now be VISIBLE!');