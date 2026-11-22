import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function recordWalkthrough() {
  const outputDir = path.resolve(process.cwd(), 'docs/video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Chromium for video recording...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // Helper for human-like typing
  async function typeHuman(selector: string, text: string, delayMs = 60) {
    await page.click(selector);
    await page.fill(selector, '');
    for (const char of text) {
      await page.type(selector, char, { delay: delayMs });
    }
    await page.waitForTimeout(400);
  }

  // Helper for visible cursor pause
  async function pause(ms: number) {
    await page.waitForTimeout(ms);
  }

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await pause(1500);

  // SECTION 1: HEADER, LOCAL PRIVACY & PERSONA SWITCHING (0:00 - 0:30)
  console.log('Section 1: Persona switching...');
  // Click persona dropdown
  const personaBtn = page.locator('button[aria-label*="Household persona"]');
  if (await personaBtn.count() > 0) {
    await personaBtn.click();
    await pause(1000);
    // Switch to Rahul (Daily Commuter)
    const rahulBtn = page.locator('button:has-text("Rahul")').first();
    if (await rahulBtn.count() > 0) {
      await rahulBtn.click();
      await pause(1200);
    }
  }

  // SECTION 2: LIVE CITY SEARCH & AIR SNAPSHOT (0:30 - 1:00)
  console.log('Section 2: City search & Air snapshot...');
  const locationBtn = page.locator('button[aria-label*="Change city"]');
  if (await locationBtn.count() > 0) {
    await locationBtn.click();
    await pause(600);
    const searchInput = page.locator('input[placeholder*="Search city"]');
    if (await searchInput.count() > 0) {
      await typeHuman('input[placeholder*="Search city"]', 'Delhi', 70);
      await pause(1200);
      const firstCity = page.locator('ul button').first();
      if (await firstCity.count() > 0) {
        await firstCity.click();
        await pause(1500);
      }
    }
  }

  // Adjust What-If Smog Multiplier live
  console.log('Adjusting smog multiplier slider...');
  const smogSlider = page.locator('#smog-multiplier');
  if (await smogSlider.count() > 0) {
    await smogSlider.evaluate((el: HTMLInputElement) => {
      el.value = '1.5';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await pause(1500);
  }

  // Scroll down to observe Verdict Card & Best Windows
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await pause(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(800);

  // SECTION 3: ROUTINE PLANNER & DIURNAL INVERSION (1:00 - 1:25)
  console.log('Section 3: Routine Planner tab...');
  await page.click('#tab-routine');
  await pause(1800);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await pause(1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(600);

  // SECTION 4: INDOOR HACKS & CADR CALCULATOR (1:25 - 1:55)
  console.log('Section 4: Indoor Hacks tab & CADR physics...');
  await page.click('#tab-indoor');
  await pause(1200);

  // Live input testing: change room dimensions
  console.log('Live editing room dimensions in CADR calculator...');
  await typeHuman('#dim-length', '6.5', 80);
  await pause(800);
  await typeHuman('#dim-width', '5.0', 80);
  await pause(1500);

  // Scroll to DIY Corsi-Rosenthal Box Fan details
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await pause(1800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(600);

  // SECTION 5: COMMUTE & TRAVEL ALTERNATIVES (1:55 - 2:25)
  console.log('Section 5: Commute alternatives...');
  await page.click('#tab-alternatives');
  await pause(1500);

  // Scroll to multimodal comparison matrix
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await pause(2000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(600);

  // SECTION 6: BREATHEWISE AI STREAMING & LIVE GUARDRAILS (2:25 - 3:20)
  console.log('Section 6: Chat & GenAI testing...');
  await page.click('#tab-chat');
  await pause(1200);

  // 1. Success Case: Domain Advice
  console.log('Live prompt 1 (Success): child outdoor advice...');
  const chatInput = page.locator('input[placeholder*="Ask anything"]');
  if (await chatInput.count() > 0) {
    await typeHuman('input[placeholder*="Ask anything"]', 'What is the safest hour for outdoor travel today?', 40);
    await pause(800);
    await page.click('button[type="submit"]');
    // Wait for streaming AI response
    await pause(4500);
  }

  // 2. Edge / Guardrail Case 1: Medical Emergency Trigger
  console.log('Live prompt 2 (Emergency Guardrail): severe chest pain...');
  if (await chatInput.count() > 0) {
    await typeHuman('input[placeholder*="Ask anything"]', 'My child has severe chest pain and cannot breathe', 40);
    await pause(800);
    await page.click('button[type="submit"]');
    // Wait for immediate emergency response
    await pause(3500);
  }

  // 3. Edge / Guardrail Case 2: Off-topic Rejection Trigger
  console.log('Live prompt 3 (Off-topic Guardrail): python code...');
  if (await chatInput.count() > 0) {
    await typeHuman('input[placeholder*="Ask anything"]', 'Write python code for bubble sort', 40);
    await pause(800);
    await page.click('button[type="submit"]');
    // Wait for off-topic redirect
    await pause(3500);
  }

  // SECTION 7: IMPACT METER, PLEDGES & DATA SOVEREIGNTY (3:20 - 3:45)
  console.log('Section 7: Impact meter & community pledges...');
  await page.click('#tab-impact');
  await pause(1500);

  await page.click('#tab-community');
  await pause(1200);

  // Click pledge button
  const pledgeBtn = page.locator('button:has-text("Take Public Transit"), button:has-text("Pledge")').first();
  if (await pledgeBtn.count() > 0) {
    await pledgeBtn.click();
    await pause(1200);
  }

  // Theme switch test (Dark / Light)
  console.log('Theme toggle test...');
  const themeBtn = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"]').first();
  if (await themeBtn.count() > 0) {
    await themeBtn.click();
    await pause(1000);
    await themeBtn.click();
    await pause(1000);
  }

  // Final pause on today dashboard
  await page.click('#tab-today');
  await pause(2000);

  console.log('Closing page and finalizing video...');
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const finalPath = path.resolve(outputDir, 'breathewise_walkthrough.webm');
    fs.copyFileSync(videoPath, finalPath);
    console.log(`\n========================================`);
    console.log(`Walkthrough Video Successfully Generated!`);
    console.log(`Path: ${finalPath}`);
    const stats = fs.statSync(finalPath);
    console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`========================================\n`);
  }
}

void recordWalkthrough();
