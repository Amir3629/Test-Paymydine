/**
 * Theme Debug Helper
 * Utility for logging theme background consistency across pages
 */

export function logBgDebug(tag: string, wrapperSelector?: string) {
  if (typeof window === 'undefined') return;
  
  const root = getComputedStyle(document.documentElement).getPropertyValue("--theme-background");
  const body = getComputedStyle(document.body).background;
  const wrapEl = wrapperSelector ? document.querySelector(wrapperSelector) as HTMLElement : null;
  const wrap = wrapEl ? getComputedStyle(wrapEl).background : "(no wrapper)";
  
  // eslint-disable-next-line no-console
  console.table({ 
    tag, 
    rootVar: root.trim(), 
    bodyBg: body, 
    wrapperBg: wrap 
  });
}

export function logThemeConsistency(pageName: string) {
  if (typeof window === 'undefined') return;
  
  console.info(`=== ${pageName.toUpperCase()} THEME DEBUG ===`);
  console.log("data-theme:", document.documentElement.getAttribute("data-theme"));
  console.log("--theme-background:", getComputedStyle(document.documentElement).getPropertyValue("--theme-background"));
  console.log("body bg:", getComputedStyle(document.body).background);
  
  const homeWrapper = document.querySelector(".page--home");
  const menuWrapper = document.querySelector(".page--menu");
  
  if (homeWrapper) {
    console.log("homepage wrapper bg:", getComputedStyle(homeWrapper).background);
  }
  if (menuWrapper) {
    console.log("menu wrapper bg:", getComputedStyle(menuWrapper).background);
  }
  
  console.info("=== END DEBUG ===");
}