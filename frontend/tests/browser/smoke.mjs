import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE);
const origin = process.env.BROWSER_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.BROWSER_OUTPUT || "browser-results";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("dialog", (dialog) => void dialog.accept());

await page.addInitScript(() => {
  window.__streamlyVitals = { lcp: null, cls: 0 };
  try {
    new PerformanceObserver((entries) => {
      const entry = entries.getEntries().at(-1);
      if (entry) window.__streamlyVitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        if (!entry.hadRecentInput) window.__streamlyVitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {
    // Unsupported performance entries are reported as unavailable.
  }
});

async function capture(name) {
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
}
async function assertNoOverflow() {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.scrollWidth <= dimensions.width + 2,
    `Horizontal overflow: ${JSON.stringify(dimensions)}`
  );
}
async function heading(name) {
  await page.getByRole("heading", { name, exact: true }).waitFor();
}

try {
  await page.goto(`${origin}/login`);
  await heading("Welcome back");
  await capture("login-desktop-dark");
  await page
    .getByLabel("Email", { exact: true })
    .fill("browser-test@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("StreamlyBrowserTest123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/home");
  await heading("Latest videos");
  await page
    .getByRole("link", { name: "Watch Browser fixture video" })
    .waitFor();
  await capture("home-desktop-dark");

  await page.goto(`${origin}/playlists`);
  await heading("Your playlists");
  await page
    .getByRole("button", { name: "Create playlist", exact: true })
    .click();
  await page.getByLabel("Playlist name").fill("Browser verification");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Created by real API");
  await page
    .getByRole("button", { name: "Create playlist", exact: true })
    .click();
  await page.getByRole("link", { name: /Browser verification/ }).click();
  await heading("Browser verification");
  await page
    .getByRole("button", { name: "Edit playlist", exact: true })
    .click();
  await page.getByLabel("Playlist name").fill("Updated playlist");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await heading("Updated playlist");
  await capture("playlist-desktop-dark");

  await page.goto(`${origin}/home`);
  await page.getByRole("link", { name: "Watch Browser fixture video" }).click();
  await heading("Browser fixture video");
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video && video.readyState >= 1 && video.duration > 0;
  });
  await page.locator("video").evaluate(async (video) => {
    video.muted = true;
    await video.play();
  });
  await page.waitForFunction(
    () => document.querySelector("video")?.currentTime > 0.1
  );
  await page.locator("video").evaluate((video) => {
    video.pause();
    video.currentTime = 1.2;
  });
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video && !video.seeking && Math.abs(video.currentTime - 1.2) < 0.15;
  });
  await page.getByRole("button", { name: "Watch later", exact: true }).click();
  await page
    .getByRole("button", { name: "Saved for later", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Like", exact: true }).click();
  await page.getByRole("button", { name: "Liked", exact: true }).waitFor();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByLabel("Playlist", { exact: true })
    .selectOption({ label: "Updated playlist" });
  await page.getByRole("button", { name: "Save video", exact: true }).click();
  await page.getByText("Video saved to playlist.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByLabel("Add a comment", { exact: true })
    .fill("Browser verification comment");
  await page.getByRole("button", { name: "Post comment", exact: true }).click();
  await page
    .getByText("Browser verification comment", { exact: true })
    .waitFor();
  await capture("watch-desktop-dark");

  await page.goto(`${origin}/watch-later`);
  await heading("Watch Later");
  await page
    .getByRole("link", { name: "Watch Browser fixture video" })
    .waitFor();
  await page.getByRole("button", { name: "Remove from Watch Later" }).click();
  await heading("Nothing saved here yet.");

  await page.goto(`${origin}/playlists`);
  await page.getByRole("link", { name: /Updated playlist/ }).click();
  await heading("Updated playlist");
  await page
    .getByRole("link", { name: "Watch Browser fixture video" })
    .waitFor();
  await page
    .getByRole("button", { name: "Delete playlist", exact: true })
    .click();
  await page.waitForURL("**/playlists");
  await heading("Your playlists");

  await page.goto(`${origin}/settings`);
  await heading("Settings");
  await page.getByText("Current session", { exact: true }).waitFor();
  await capture("settings-desktop-dark");

  // Same browser context shares cookies; two documents share Web Locks.
  const secondTab = await context.newPage();
  await secondTab.goto(`${origin}/settings`);
  await secondTab.getByText("Current session", { exact: true }).waitFor();
  let refreshRequests = 0;
  const observeRefresh = (request) => {
    if (
      request.url().endsWith("/api/v1/users/refresh-token") &&
      request.method() === "POST"
    ) {
      refreshRequests += 1;
    }
  };
  context.on("request", observeRefresh);
  try {
    await context.clearCookies({ name: "accessToken" });
    await Promise.all([page.reload(), secondTab.reload()]);
    await Promise.all([
      page.getByText("Current session", { exact: true }).waitFor(),
      secondTab.getByText("Current session", { exact: true }).waitFor(),
    ]);
    assert.equal(refreshRequests, 1, "Concurrent tabs must rotate once");
    assert.ok(
      (await context.cookies()).some((cookie) => cookie.name === "accessToken")
    );
    console.log(
      "Concurrent two-tab refresh: exactly one rotation, both tabs authenticated."
    );
  } finally {
    context.off("request", observeRefresh);
    await secondTab.close();
  }
  await page.getByRole("radio", { name: "Light" }).check();
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "light"
  );
  await capture("settings-desktop-light");
  await assertNoOverflow();

  for (const [name, size] of [
    ["tablet", { width: 768, height: 1024 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(size);
    await assertNoOverflow();
    await capture(`settings-${name}-light`);
    await page.getByRole("radio", { name: "Dark" }).check();
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark"
    );
    await assertNoOverflow();
    await capture(`settings-${name}-dark`);
    await page.getByRole("radio", { name: "Light" }).check();
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}/studio`);
  await heading("Channel overview");
  await capture("studio-desktop-light");
  const labVitals = await page.evaluate(() => window.__streamlyVitals);
  await writeFile(
    `${output}/lab-vitals.json`,
    JSON.stringify(labVitals, null, 2)
  );
  await page.goto(`${origin}/studio/upload`);
  await heading("Publish a video");
  await capture("upload-desktop-light");
  await assertNoOverflow();
  assert.deepEqual(pageErrors, [], "Browser page errors");
  console.log(
    "Browser smoke: sign-in, playlists, video playback/seek, concurrent refresh, likes, comments, Watch Later, sessions, theme and creator routes passed."
  );
  console.log(
    "Observed lab values (not production Core Web Vitals):",
    JSON.stringify(labVitals)
  );
} catch (error) {
  await capture("failure");
  throw error;
} finally {
  await browser.close();
}
