// FIX BOTTOM TOOLBAR - Copy and paste this into browser console
console.log('🚀 FIXING BOTTOM TOOLBAR BACKGROUND...');

// Get current theme
const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
console.log('Current theme:', currentTheme);

// Define exact colors for each theme - same as menu page background with effect
const themeColors = {
  'clean-light': {
    background: '#FAFAFA',  // paydine-soft-white (menu page background)
    effect: 'rgba(250, 250, 250, 0.95)'  // slight transparency for effect
  },
  'modern-dark': {
    background: '#0A0E12',  // dark background (menu page background)
    effect: 'rgba(10, 14, 18, 0.95)'  // slight transparency for effect
  },
  'gold-luxury': {
    background: '#0F0B05',  // dark background (menu page background)
    effect: 'rgba(15, 11, 5, 0.95)'  // slight transparency for effect
  },
  'vibrant-colors': {
    background: '#e2ceb1',  // warm beige (menu page background)
    effect: 'rgba(226, 206, 177, 0.95)'  // slight transparency for effect
  },
  'minimal': {
    background: '#CFEBF7',  // light blue (menu page background)
    effect: 'rgba(207, 235, 247, 0.95)'  // slight transparency for effect
  }
};

const colors = themeColors[currentTheme] || themeColors['clean-light'];
console.log('Using toolbar colors:', colors);

// Add CSS with hardcoded colors for bottom toolbar
const style = document.createElement('style');
style.id = 'bottom-toolbar-fix-style';
style.textContent = `
  /* FIX BOTTOM TOOLBAR BACKGROUND - MATCH MENU PAGE WITH EFFECT */
  
  /* Target the bottom toolbar container */
  .fixed.bottom-0.left-0.right-0,
  .fixed.bottom-0.inset-x-0,
  [class*="fixed"][class*="bottom-0"],
  .bottom-toolbar,
  .toolbar-bottom {
    background: ${colors.effect} !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
  }
  
  /* Target any toolbar with icons inside */
  .fixed[class*="bottom"] [class*="flex"][class*="justify"],
  .fixed[class*="bottom"] .flex.items-center,
  .bottom-toolbar .flex,
  .toolbar-bottom .flex {
    background: transparent !important;
  }
  
  /* Ensure icons remain visible */
  .fixed[class*="bottom"] svg,
  .fixed[class*="bottom"] path,
  .bottom-toolbar svg,
  .toolbar-bottom svg {
    color: var(--theme-text-primary) !important;
    fill: currentColor !important;
  }
  
  /* Fix any cart badges in toolbar */
  .fixed[class*="bottom"] .cart-badge,
  .fixed[class*="bottom"] [class*="absolute"][class*="-top"],
  .bottom-toolbar .cart-badge,
  .toolbar-bottom .cart-badge {
    background-color: var(--theme-secondary) !important;
    color: var(--theme-background) !important;
  }
`;
document.head.appendChild(style);

// Also force style the toolbar elements individually
function fixBottomToolbar() {
  // Find all possible bottom toolbar selectors
  const selectors = [
    '.fixed.bottom-0.left-0.right-0',
    '.fixed.bottom-0.inset-x-0',
    '[class*="fixed"][class*="bottom-0"]',
    '.bottom-toolbar',
    '.toolbar-bottom',
    '.fixed[class*="bottom"]'
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
    console.log(`🔧 Fixing toolbar ${index + 1}:`, toolbar);
    console.log('Toolbar classes:', toolbar.className);
    
    // Apply the background with effect
    toolbar.style.cssText += `
      background: ${colors.effect} !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
    `;
    
    fixed++;
  });
  
  console.log(`✅ Fixed ${fixed} bottom toolbars!`);
  return fixed;
}

// Run immediately
let fixed = fixBottomToolbar();

// Keep trying every second for 10 seconds
let toolbarAttempts = 0;
const toolbarInterval = setInterval(() => {
  toolbarAttempts++;
  const newFixed = fixBottomToolbar();
  if (newFixed > 0) {
    console.log(`🔄 Attempt ${toolbarAttempts}: Fixed ${newFixed} more toolbars`);
  }
  
  if (toolbarAttempts >= 10) {
    clearInterval(toolbarInterval);
    console.log('🏁 Bottom toolbar fix complete!');
  }
}, 1000);

console.log('🎯 BOTTOM TOOLBAR FIX COMPLETE - Toolbar should now match menu page background with effect!');