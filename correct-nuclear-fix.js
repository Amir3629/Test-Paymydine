// CORRECT NUCLEAR FIX - Copy and paste this into browser console
console.log('🚀 CORRECT NUCLEAR FIXING QUANTITY BUTTONS...');

// Get current theme
const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
console.log('Current theme:', currentTheme);

// Define exact colors for each theme
const themeColors = {
  'clean-light': {
    secondary: '#EFC7B1',  // paydine-rose-beige
    background: '#FAFAFA'  // paydine-soft-white
  },
  'modern-dark': {
    secondary: '#E8B4A0',  // rose gold
    background: '#0A0E12'  // dark background
  },
  'gold-luxury': {
    secondary: '#FFF8DC',  // cornsilk
    background: '#0F0B05'  // dark background
  },
  'vibrant-colors': {
    secondary: '#FF6B6B',  // coral
    background: '#e2ceb1'  // warm beige
  },
  'minimal': {
    secondary: '#4A90E2',  // blue
    background: '#CFEBF7'  // light blue
  }
};

const colors = themeColors[currentTheme] || themeColors['clean-light'];
console.log('Using colors:', colors);

// Add CSS with hardcoded colors - FIXED SELECTORS
const style = document.createElement('style');
style.textContent = `
  /* CORRECT NUCLEAR FIX FOR QUANTITY BUTTONS - HARDCODED COLORS */
  button.quantity-btn,
  .quantity-btn,
  button[class*="w-12"][class*="h-12"] {
    background-color: ${colors.secondary} !important;
    color: ${colors.background} !important;
    border: 1px solid ${colors.secondary} !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    width: 48px !important;
    height: 48px !important;
    font-size: 18px !important;
    font-weight: bold !important;
  }
  
  /* Fix cart badges */
  .cart-badge,
  .absolute.-top-2.-right-2 {
    background-color: ${colors.secondary} !important;
    color: ${colors.background} !important;
    border-radius: 50% !important;
  }
  
  /* Fix any child elements */
  button.quantity-btn *,
  .quantity-btn * {
    color: ${colors.background} !important;
  }
`;
document.head.appendChild(style);

// Also force style each button individually with hardcoded colors - FIXED SELECTOR
function correctNuclearFixButtons() {
  // Try multiple selectors to catch all buttons
  const selectors = [
    'button.quantity-btn',
    '.quantity-btn',
    'button[class*="w-12"][class*="h-12"]',
    'button[class*="quantity"]'
  ];
  
  let allButtons = [];
  selectors.forEach(selector => {
    const buttons = document.querySelectorAll(selector);
    console.log(`Found ${buttons.length} buttons with selector: ${selector}`);
    allButtons = [...allButtons, ...buttons];
  });
  
  // Remove duplicates
  const uniqueButtons = [...new Set(allButtons)];
  console.log(`Total unique buttons found: ${uniqueButtons.length}`);
  
  let fixed = 0;
  
  uniqueButtons.forEach((button, index) => {
    console.log(`🔧 Nuclear fixing button ${index + 1}:`, button);
    console.log('Button classes:', button.className);
    
    button.style.cssText = `
      background-color: ${colors.secondary} !important;
      color: ${colors.background} !important;
      border: 1px solid ${colors.secondary} !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      width: 48px !important;
      height: 48px !important;
      font-size: 18px !important;
      font-weight: bold !important;
    `;
    
    // Fix child elements with hardcoded colors
    const children = button.querySelectorAll('*');
    children.forEach(child => {
      child.style.color = `${colors.background} !important`;
    });
    
    fixed++;
  });
  
  console.log(`✅ Nuclear fixed ${fixed} buttons!`);
  return fixed;
}

// Also fix cart badges
function fixCartBadges() {
  const badges = document.querySelectorAll('.cart-badge, .absolute.-top-2.-right-2');
  console.log(`Found ${badges.length} cart badges`);
  
  badges.forEach((badge, index) => {
    if (badge.textContent && !isNaN(badge.textContent.trim())) {
      console.log(`🔧 Fixing cart badge ${index + 1}:`, badge);
      badge.style.cssText = `
        background-color: ${colors.secondary} !important;
        color: ${colors.background} !important;
        border-radius: 50% !important;
      `;
    }
  });
}

// Run immediately
let fixed = correctNuclearFixButtons();
fixCartBadges();

// Keep trying every second for 10 seconds
let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  const newFixed = correctNuclearFixButtons();
  fixCartBadges();
  if (newFixed > 0) {
    console.log(`🔄 Attempt ${attempts}: Nuclear fixed ${newFixed} more buttons`);
  }
  
  if (attempts >= 10) {
    clearInterval(interval);
    console.log('🏁 Nuclear fix complete!');
  }
}, 1000);

console.log('🎯 CORRECT NUCLEAR FIX COMPLETE - Buttons should now be visible with hardcoded colors!');