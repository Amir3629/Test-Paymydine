// FIXED BOTTOM TOOLBAR - Copy and paste this into browser console
console.log('🚀 FIXED BOTTOM TOOLBAR BACKGROUND...');

// Clear any existing intervals
if (window.fixedToolbarInterval) {
  clearInterval(window.fixedToolbarInterval);
}

// Remove any existing styles
const existingStyle = document.getElementById('bottom-toolbar-fix-style');
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

// Function to apply toolbar fix
function applyToolbarFix() {
  const colors = getCurrentThemeColors();
  console.log('Using toolbar colors:', colors);
  
  // Add CSS with current theme colors
  const style = document.createElement('style');
  style.id = 'bottom-toolbar-fix-style';
  style.textContent = `
    /* FIXED BOTTOM TOOLBAR BACKGROUND - CURRENT THEME */
    
    /* Target ONLY the main bottom toolbar (not notifications) */
    .fixed.bottom-\\[1\\.35rem\\],
    div[class*="fixed"][class*="bottom-"][class*="left-1/2"] {
      background: ${colors.effect} !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
    }
    
    /* Ensure icons remain visible */
    .fixed.bottom-\\[1\\.35rem\\] svg,
    .fixed.bottom-\\[1\\.35rem\\] path,
    div[class*="fixed"][class*="bottom-"] svg,
    div[class*="fixed"][class*="bottom-"] path {
      color: var(--theme-text-primary) !important;
      fill: currentColor !important;
    }
    
    /* Fix cart badges in toolbar */
    .fixed.bottom-\\[1\\.35rem\\] .cart-badge,
    .fixed.bottom-\\[1\\.35rem\\] [class*="absolute"][class*="-top"],
    div[class*="fixed"][class*="bottom-"] .cart-badge {
      background-color: var(--theme-secondary) !important;
      color: var(--theme-background) !important;
    }
  `;
  
  // Remove old style and add new one
  const oldStyle = document.getElementById('bottom-toolbar-fix-style');
  if (oldStyle) {
    oldStyle.remove();
  }
  document.head.appendChild(style);
  
  // Also force style the specific bottom toolbar element
  const bottomToolbar = document.querySelector('.fixed.bottom-\\[1\\.35rem\\], div[class*="fixed"][class*="bottom-"][class*="left-1/2"]');
  
  if (bottomToolbar) {
    console.log('🔧 Fixing bottom toolbar:', bottomToolbar);
    console.log('Toolbar classes:', bottomToolbar.className);
    
    bottomToolbar.style.cssText += `
      background: ${colors.effect} !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
    `;
    
    console.log('✅ Fixed bottom toolbar!');
    return true;
  } else {
    console.log('❌ Bottom toolbar not found');
    return false;
  }
}

// Run immediately
let fixed = applyToolbarFix();

// Keep trying every second for 10 seconds
let fixedAttempts = 0;
window.fixedToolbarInterval = setInterval(() => {
  fixedAttempts++;
  const newFixed = applyToolbarFix();
  if (newFixed) {
    console.log(`🔄 Attempt ${fixedAttempts}: Fixed bottom toolbar`);
  }
  
  if (fixedAttempts >= 10) {
    clearInterval(window.fixedToolbarInterval);
    console.log('🏁 Fixed bottom toolbar complete!');
  }
}, 1000);

console.log('🎯 FIXED BOTTOM TOOLBAR COMPLETE - Should now match menu page background with effect!');