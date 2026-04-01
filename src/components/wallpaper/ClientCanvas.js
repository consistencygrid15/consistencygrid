'use client';
// Main entry point for Client-Side Canvas Renderers
// This file aggregates all the individual renderers 

export { drawBackground, loadBackgroundImage } from './renderers/background';
export { drawDashboardHeader, drawStreakWidget, drawLifeHeader } from './renderers/header';
export { drawGrid } from './renderers/grid';
export { drawBottomSection } from './renderers/bottom-section';
export { drawQuote } from './renderers/quote';
export { drawFrostedCard } from './renderers/utils';
