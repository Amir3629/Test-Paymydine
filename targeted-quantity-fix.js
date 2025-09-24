// TARGETED QUANTITY FIX - Copy and paste this into browser console
console.log('🚀 TARGETED QUANTITY FIX - Only fixing quantity selector buttons...');

// Clear any existing intervals
if (window.targetedFixInterval) {
  clearInterval(window.targetedFixInterval);
}

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

// Remove any existing nuclear fix styles
const existingStyle = document.getElementById('nuclear-fix-style');
if (existingStyle) {
  existingStyle.remove();
}

// Add CSS with hardcoded colors - TARGETED SELECTORS ONLY
const style = document.createElement('style');
style.id = 'targeted-quantity-fix-style';
style.textContent = `
  /* TARGETED FIX FOR QUANTITY SELECTOR BUTTONS ONLY */
  /* Only target buttons that are specifically quantity selectors */
  button.quantity-btn.w-12.h-12,
  .quantity-btn.w-12.h-12 {
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
  
  /* Fix any child elements in quantity buttons only */
  button.quantity-btn.w-12.h-12 *,
  .quantity-btn.w-12.h-12 * {
    color: ${colors.background} !important;
  }
`;
document.head.appendChild(style);

// TARGETED function - only fix quantity selector buttons
function targetedQuantityFix() {
  // Only target buttons that have BOTH quantity-btn AND w-12 h-12 classes
  const quantityButtons = document.querySelectorAll('button.quantity-btn.w-12.h-12');
  console.log(`Found ${quantityButtons.length} quantity selector buttons`);
  
  let fixed = 0;
  
  quantityButtons.forEach((button, index) => {
    console.log(`🔧 Targeted fixing quantity button ${index + 1}:`, button);
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
  
  console.log(`✅ Targeted fixed ${fixed} quantity selector buttons!`);
  return fixed;
}

// Also fix cart badges
function targetedFixCartBadges() {
  const badges = document.querySelectorAll('.cart-badge, .absolute.-top-2.-right-2');
  console.log(`Found ${badges.length} cart badges`);
  
  badges.forEach((badge, index) => {
    if (badge.textContent && !isNaN(badge.textContent.trim())) {
      console.log(`🔧 Targeted fixing cart badge ${index + 1}:`, badge);
      badge.style.cssText = `
        background-color: ${colors.secondary} !important;
        color: ${colors.background} !important;
        border-radius: 50% !important;
      `;
    }
  });
}

// Run immediately
let fixed = targetedQuantityFix();
targetedFixCartBadges();

// Keep trying every second for 10 seconds
let targetedAttempts = 0;
window.targetedFixInterval = setInterval(() => {
  targetedAttempts++;
  const newFixed = targetedQuantityFix();
  targetedFixCartBadges();
  if (newFixed > 0) {
    console.log(`🔄 Attempt ${targetedAttempts}: Targeted fixed ${newFixed} more quantity buttons`);
  }
  
  if (targetedAttempts >= 10) {
    clearInterval(window.targetedFixInterval);
    console.log('🏁 Targeted quantity fix complete!');
  }
}, 1000);

console.log('🎯 TARGETED QUANTITY FIX COMPLETE - Only quantity selector buttons should be fixed!');