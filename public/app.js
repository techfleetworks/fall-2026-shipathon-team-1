const CONFIG = window.APP_CONFIG ?? {};
const ALL_CATEGORIES = ["Clothes", "Shoes", "Toys", "Books", "Baby gear", "Towels & bedding", "Winter clothes", "Accessories"];
const CONDITIONS = ["New", "Used like new", "Used"];
const SIZES = {
  clothing: ["Newborn", "0-3 mo", "3-6 mo", "6-12 mo", "12-18 mo", "18-24 mo", "2T", "3T", "4T", "5", "6", "7", "8", "10", "12"],
  shoes: ["Infant 0-3", "Infant 4-5", "Toddler 5", "Toddler 6", "Toddler 7", "Toddler 8", "Toddler 9", "Toddler 10", "Kid 11", "Kid 12", "Kid 13", "Kid 1", "Kid 2", "Kid 3"],
  age: ["0-1 yr", "1-2 yr", "2-3 yr", "3-5 yr", "5-8 yr", "8+ yr"],
};
const MAX_PHOTO_PX = 1600;

const state = {
  step: "start", // start | instructions | build | preview | done
  tab: "categories", // categories | details
  code: "",
  sessionId: null,
  startedAt: 0,
  photos: [], // { id, blob, url }
  detecting: 0,
  detectError: false,
  detected: new Set(),
  photoCategories: {},
  categories: [],
  addingCategory: false,
  categorySearch: "",
  details: {},
  location: "",
  sheetOpen: false,
  posting: false,
  postError: "",
  ease: 0,
  comment: "",
  feedbackSent: false,
};


const $app = document.getElementById("app");
const $live = document.getElementById("live");

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const announce = (msg) => { $live.textContent = ""; setTimeout(() => ($live.textContent = msg), 50); };

/* ---------- Supabase + tracking ---------- */
let supabasePromise = null;
function getSupabase() {
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey) return Promise.resolve(null);
  supabasePromise ??= import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm")
    .then(({ createClient }) => createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey))
    .catch(() => null);
  return supabasePromise;
}

async function track(type, props = {}) {
  const row = {
    session_id: state.sessionId,
    participant_code: state.code,
    type,
    props: { ...props, t_ms: Date.now() - state.startedAt, step: state.step, tab: state.tab },
  };
  console.debug("[event]", type, row.props);
  const sb = await getSupabase();
  if (!sb) return;
  const { error } = await sb.from("events").insert(row);
  if (error) console.warn("event insert failed", error.message);
}

/* ---------- Icons (24px outline) ---------- */
const ICON = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  gift: '<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
};
const icon = (name, size = 20) =>
  `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;

/* ---------- Helpers ---------- */
function sizeKind(category) {
  if (category === "Shoes") return "shoes";
  if (category === "Clothes" || category === "Winter clothes") return "clothing";
  return "age";
}
const sizeLabel = (category) => (sizeKind(category) === "age" ? "Age range" : "Size/fit");
const isComplete = (category) => {
  const d = state.details[category];
  return Boolean(d?.condition && d?.size);
};
const allComplete = () => state.categories.length > 0 && state.categories.every(isComplete);

function resizeToJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_PHOTO_PX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode failed")); };
    img.src = url;
  });
}

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

async function detect(blob) {
  const res = await fetch("/api/detect", {
    method: "POST",
    headers: { "content-type": "application/json", "x-participant-code": state.code },
    body: JSON.stringify({ image: await blobToBase64(blob), mediaType: "image/jpeg" }),
  });
  if (!res.ok) throw new Error(`detect ${res.status}`);
  return (await res.json()).categories.map((c) => c.category).filter((c) => ALL_CATEGORIES.includes(c));
}

async function addPhoto(file) {
  let blob;
  try { blob = await resizeToJpeg(file); } catch { state.detectError = true; render(); return; }
  const photoId = crypto.randomUUID();
  state.photos.push({ id: photoId, blob, url: URL.createObjectURL(blob) });
  state.sheetOpen = false;
  state.step = "build";
  state.tab = "categories";
  state.detecting += 1;
  state.detectError = false;
  track("photo_added", { photo_count: state.photos.length });
  render();
  announce("Looking at your photo");
  const started = Date.now();
  try {
    const found = await detect(blob);
    state.photoCategories[photoId] = found;
    found.forEach((c) => { state.detected.add(c); if (!state.categories.includes(c)) state.categories.push(c); });
    track("detect_succeeded", { found: found.length, ms: Date.now() - started });
    announce(`Found ${found.length} categories`);
  } catch (e) {
    state.detectError = true;
    track("detect_failed", { ms: Date.now() - started, message: String(e.message) });
    announce("We could not read the photo. You can add categories yourself.");
  } finally {
    state.detecting -= 1;
    render();
  }
}

/* ---------- Views ---------- */
const header = (title, { back } = {}) => `
  <header class="px-4 pt-4">
    <div class="flex h-10 items-center text-label text-ink-muted">My Village</div>
    <div class="flex items-center gap-2 pb-2 pt-2">
      ${back ? `<button class="-ml-2 flex h-11 w-11 items-center justify-center rounded-full" data-action="${back}" aria-label="Go back">${icon("back", 24)}</button>` : ""}
      <h1 class="text-h1">${title}</h1>
    </div>
  </header>`;

function viewStart() {
  return `
  <main class="flex flex-1 flex-col px-4 pt-10">
    <p class="text-label text-ink-muted">My Village</p>
    <h1 class="mt-2 text-display">Welcome</h1>
    <p class="mt-1 text-h2 font-normal">What brings you here, today?</p>
    <div class="card mt-6 p-4">
      <h2 class="text-h2">Declutter children's items?</h2>
      <p class="mt-1 text-body text-ink-muted">Snap one photo of everything. We'll turn it into separate listings.</p>
      <label for="code" class="mt-4 block text-label">Participant code</label>
      <input id="code" class="field mt-1 uppercase" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" data-field="code" value="${esc(state.code)}" />
      <button class="btn-primary mt-4 w-full gap-2" data-action="begin" ${state.code.trim() ? "" : "disabled"}>${icon("gift")} Give away</button>
    </div>
  </main>`;
}

function viewInstructions() {
  return `
  ${header("Create a give-away post", { back: "cancel" })}
  <main class="flex-1 px-4 pb-32">
    <div class="card p-4">
      <h2 class="text-center text-h2">One photo, multiple listings</h2>
      <p class="mt-2 text-center text-body text-ink-muted">Snap everything in one shot. We'll split it into separate listings for you.</p>

      <!-- Illustration placeholder: bundled items example -->
      <div class="mt-4 flex items-center justify-center rounded-lg border-2 border-dashed border-line bg-surface-200 py-8">
        <div class="text-center text-body text-ink-subtle">
          <p class="text-h3">📸</p>
          <p class="mt-1">Example: one photo of all items</p>
        </div>
      </div>

      <!-- Example category chips -->
      <div class="mt-3 flex items-center justify-center gap-2">
        <span class="rounded-full bg-brand-subtle px-3 py-1 text-caption">Clothes</span>
        <span class="rounded-full bg-brand-subtle px-3 py-1 text-caption">Shoes</span>
        <span class="rounded-full bg-brand-subtle px-3 py-1 text-caption">Toys</span>
        <span class="text-caption text-ink-muted">= 3 listings</span>
      </div>

      <!-- Steps -->
      <ol class="mt-6 space-y-4">
        <li class="flex gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-label font-semibold">1</span>
          <div><p class="text-h3">Snap all items in one photo</p><p class="text-body text-ink-muted">We'll detect the item categories for you.</p></div>
        </li>
        <li class="flex gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-label font-semibold">2</span>
          <div><p class="text-h3">Review and add details</p><p class="text-body text-ink-muted">You can remove or add categories, then fill in size and condition.</p></div>
        </li>
        <li class="flex gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-label font-semibold">3</span>
          <div><p class="text-h3">Post all at once</p><p class="text-body text-ink-muted">Every category becomes its own listing, from one photo.</p></div>
        </li>
      </ol>
    </div>

  </main>
  <footer class="fixed inset-x-0 bottom-0 mx-auto flex max-w-[428px] gap-3 bg-surface-100 p-4">
    <button class="btn-tertiary" data-action="cancel">Cancel</button>
    <button class="btn-primary flex-1" data-action="open-sheet">Add photo to start</button>
  </footer>
  ${state.sheetOpen ? photoSheet() : ""}`;
}

function photoSheet() {
  return `
  <div class="fixed inset-0 z-10 mx-auto flex max-w-[428px] items-end bg-black/40" data-action="close-sheet">
    <div class="w-full rounded-t-xl bg-white p-4 shadow-lg" role="dialog" aria-modal="true" aria-label="Add a photo" data-stop>
      <div class="flex items-center justify-between">
        <p class="text-body text-ink-muted">Choose how to add your photo</p>
        <button class="-mr-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted" data-action="close-sheet" aria-label="Close">${icon("x", 20)}</button>
      </div>
      <div class="mt-3 flex gap-3">
        <label class="btn-secondary flex-1 cursor-pointer gap-2">${icon("camera")} Use camera
          <input type="file" accept="image/*" capture="environment" class="sr-only" data-photo-input />
        </label>
        <label class="btn-secondary flex-1 cursor-pointer gap-2">${icon("image")} From gallery
          <input type="file" accept="image/*" class="sr-only" data-photo-input />
        </label>
      </div>
      <div class="mt-4 flex items-center gap-3 rounded-lg border border-line bg-surface-200 p-3">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-ink-muted"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <p class="text-body text-ink-muted"><span class="font-semibold text-ink">Tip</span>  Lay items flat so each one is visible in the frame.</p>
      </div>
    </div>
  </div>`;
}

function photoStrip() {
  return `
  <section aria-label="Photos" class="px-4">
    <h2 class="text-h3">Photos</h2>
    <div class="mt-2 flex gap-3 overflow-x-auto pb-2">
      ${state.photos.map((p, i) => `
      <div class="relative h-32 w-32 shrink-0">
        <img src="${esc(p.url)}" alt="Photo ${i + 1} of your items" class="h-full w-full rounded-lg object-cover" />
        <button class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow-md" data-action="remove-photo" data-photo-id="${p.id}" aria-label="Remove photo ${i + 1}">${icon("x", 14)}</button>
      </div>`).join("")}
      <label class="flex h-32 w-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-line bg-white text-label">
        ${icon("plus")} Add more
        <input type="file" accept="image/*" class="sr-only" data-photo-input />
      </label>
    </div>
  </section>`;
}

const tabs = () => `
  <div role="tablist" class="mx-4 flex border-b border-line-subtle text-label">
    ${[["categories", "1. Category"], ["details", "2. Details"]].map(([id, label]) => `
    <button role="tab" aria-selected="${state.tab === id}" class="flex-1 border-b-2 py-3 ${state.tab === id ? "border-ink font-semibold" : "border-transparent text-ink-muted"}" data-action="tab" data-tab="${id}">${label}</button>`).join("")}
  </div>`;

function addCategoryPanel() {
  const q = state.categorySearch.toLowerCase();
  const all = ALL_CATEGORIES.map((c) => ({
    name: c,
    added: state.categories.includes(c),
    matches: !q || c.toLowerCase().includes(q),
  }));
  const visible = all.filter((c) => c.matches);
  return `
  <div class="px-4 pt-4">
    <div class="flex items-center gap-2">
      <button class="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full" data-action="done-adding" aria-label="Go back">${icon("back", 24)}</button>
      <h2 class="text-h3">Add new item category</h2>
    </div>
    <div class="relative mt-3">
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">${icon("search", 18)}</span>
      <input class="field w-full pl-10" type="search" placeholder="Search and select" data-field="category-search" value="${esc(state.categorySearch)}" />
    </div>
    ${state.categories.length ? `
    <div class="mt-3 flex flex-wrap gap-2">
      ${state.categories.map((c) => `
      <span class="chip chip-selected">${esc(c)}
        <button class="-mr-1 flex h-7 w-7 items-center justify-center rounded-full" data-action="remove-category" data-category="${esc(c)}" aria-label="Remove ${esc(c)}">${icon("x", 14)}</button>
      </span>`).join("")}
    </div>` : ""}
    <div class="mt-3 flex flex-wrap gap-2">
      ${visible.filter((c) => !c.added).map((c) =>
        `<button class="chip" data-action="add-category" data-category="${esc(c.name)}">${icon("plus", 16)} ${esc(c.name)}</button>`
      ).join("")}
      ${!visible.filter((c) => !c.added).length ? `<p class="text-body text-ink-muted">${state.categorySearch ? "No categories match your search." : "All categories added."}</p>` : ""}
    </div>
  </div>`;
}

function categoriesPanel() {
  const status = state.detecting
    ? `<p class="mt-3 flex items-center gap-2 text-body text-ink-muted"><span class="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden="true"></span> Looking at your photo...</p>`
    : state.detectError
      ? `<p class="mt-3 rounded-md bg-accent-subtle p-3 text-body" role="status">We couldn't read the photo. Add categories yourself, or try another photo.</p>`
      : !state.categories.length
        ? `<p class="mt-3 text-body text-ink-muted" role="status">We didn't spot any children's items. Add categories yourself, or try another photo.</p>`
        : "";
  return `
  <div class="px-4 pt-4 pb-4">
    <h2 class="text-h3">Identified categories (${state.categories.length})</h2>
    ${status}
    <ul class="mt-3 flex flex-wrap gap-2">
      ${state.categories.map((c) => `
      <li><span class="chip chip-selected">${esc(c)}
        <button class="-mr-1 flex h-8 w-8 items-center justify-center rounded-full" data-action="remove-category" data-category="${esc(c)}" aria-label="Remove ${esc(c)}">${icon("x", 16)}</button></span></li>`).join("")}
      <li><button class="chip border-ink bg-white" data-action="start-adding">${icon("plus", 16)} Add new</button></li>
    </ul>
  </div>`;
}

function detailsPanel() {
  return `
  <div class="space-y-4 px-4 pt-4 pb-4">
    ${state.categories.map((c, i) => {
      const d = state.details[c] ?? {};
      const key = esc(c);
      return `
      <fieldset class="card p-4">
        <legend class="sr-only">${key}</legend>
        <div class="flex items-baseline justify-between"><h2 class="text-h3">${key}</h2><span class="text-caption text-ink-muted">Category: ${i + 1}/${state.categories.length}</span></div>
        <p class="mt-4 text-label">Condition<span class="text-error" aria-hidden="true">*</span></p>
        <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="Condition for ${key}">
          ${CONDITIONS.map((o) => `<button class="chip" aria-pressed="${d.condition === o}" data-action="set" data-category="${key}" data-key="condition" data-value="${esc(o)}">${o}</button>`).join("")}
        </div>
        <label class="mt-4 block text-label" for="size-${i}">${sizeLabel(c)}<span class="text-error" aria-hidden="true">*</span></label>
        <select id="size-${i}" class="field mt-2" data-field="size" data-category="${key}">
          <option value="">Select</option>
          ${SIZES[sizeKind(c)].map((o) => `<option ${d.size === o ? "selected" : ""}>${o}</option>`).join("")}
        </select>
        <p class="mt-4 text-label">Boy/Girl <span class="text-ink-muted">(optional)</span></p>
        <div class="mt-2 flex gap-2" role="group" aria-label="Boy or girl for ${key}">
          ${["Boy", "Girl"].map((o) => `<button class="chip" aria-pressed="${d.gender === o}" data-action="set" data-category="${key}" data-key="gender" data-value="${o}">${o}</button>`).join("")}
        </div>
        <label class="mt-4 block text-label" for="notes-${i}">Notes <span class="text-ink-muted">(optional)</span></label>
        <input id="notes-${i}" class="field mt-2" maxlength="200" data-field="notes" data-category="${key}" value="${esc(d.notes ?? "")}" />
      </fieldset>`;
    }).join("")}
  </div>`;
}

function viewBuild() {
  const onCategories = state.tab === "categories";
  const canConfirm = state.categories.length > 0 && !state.detecting;
  return `
  ${header("Create a give-away listing", { back: "back-to-instructions" })}
  <main class="pb-4">
    ${photoStrip()}
  </main>
  <div class="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-[428px] flex-col rounded-t-2xl bg-white shadow-lg" style="top:33%">
    <div class="flex justify-center pt-3 pb-1"><div class="h-1 w-10 rounded-full bg-ink-subtle"></div></div>
    ${tabs()}
    <div role="tabpanel" class="flex-1 overflow-y-auto">${onCategories ? (state.addingCategory ? addCategoryPanel() : categoriesPanel()) : detailsPanel()}</div>
    <footer class="border-t border-line-subtle p-4">
      ${!onCategories && !allComplete() ? `<p id="hint" class="mb-2 text-caption text-ink-muted">Choose a condition and ${state.categories.some((c) => sizeKind(c) === "age") ? "size or age" : "size"} for every category.</p>` : ""}
      <div class="flex gap-3">
        <button class="btn-tertiary" data-action="${state.addingCategory ? "done-adding" : onCategories ? "cancel" : "tab"}" data-tab="categories">Back</button>
        ${state.addingCategory
          ? `<button class="btn-primary flex-1" data-action="done-adding">Confirm &amp; Add</button>`
          : onCategories
            ? `<button class="btn-primary flex-1" data-action="confirm-categories" ${canConfirm ? "" : "disabled"}>Confirm</button>`
            : `<button class="btn-primary flex-1" data-action="to-preview" ${allComplete() ? "" : "disabled"} aria-describedby="hint">Next</button>`}
      </div>
    </footer>
  </div>
  ${state.sheetOpen ? photoSheet() : ""}`;
}

function viewPreview() {
  return `
  ${header("Create a give-away listing", { back: "to-details" })}
  <main class="flex-1 pb-32">
    <div class="px-4">
      <label for="loc" class="text-h3">Pick-up location <span class="text-ink-muted">(not your address)</span></label>
      <p class="mt-1 text-caption text-ink-muted">This is public so people can search nearby. Please avoid your home address.</p>
      <input id="loc" class="field mt-2" maxlength="200" placeholder="Street name, landmark" data-field="location" value="${esc(state.location)}" />
    </div>
    <h2 class="mt-6 px-4 text-h3">Listing preview</h2>
    <ul class="mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
      ${state.categories.map((c, i) => {
        const d = state.details[c];
        return `
        <li class="card w-[85%] shrink-0 snap-center bg-white p-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-surface-200 text-ink-muted">${icon("user", 20)}</div>
              <div>
                <p class="text-label">${esc(state.code)}</p>
                <p class="text-caption text-ink-muted">Posted 1 min ago</p>
              </div>
            </div>
            <span class="text-caption text-ink-muted">x miles away</span>
          </div>
          <div class="mt-3 flex gap-2 overflow-x-auto">
            ${state.photos.map((p, pi) => `<img src="${esc(p.url)}" alt="Photo ${pi + 1}" class="h-32 w-auto rounded-md object-cover" />`).join("")}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <h3 class="text-h3">${esc(c)}</h3>
            <span class="rounded-full border border-warning px-2 text-caption-medium text-ink">First one to claim</span>
          </div>
          <dl class="mt-3 grid grid-cols-2 gap-2 text-body">
            <div><dt class="text-caption text-ink-muted">Condition</dt><dd>${esc(d.condition)}</dd></div>
            <div><dt class="text-caption text-ink-muted">${sizeLabel(c)}</dt><dd>${esc(d.size)}${d.gender ? `, ${esc(d.gender)}` : ""}</dd></div>
          </dl>
        </li>`;
      }).join("")}
    </ul>
    ${state.postError ? `<p class="mx-4 mt-3 rounded-md bg-accent-subtle p-3 text-body" role="alert">${esc(state.postError)}</p>` : ""}
  </main>
  <footer class="fixed inset-x-0 bottom-0 mx-auto flex max-w-[428px] gap-3 bg-surface-100 p-4">
    <button class="btn-tertiary" data-action="to-details">Back</button>
    <button class="btn-primary flex-1" data-action="post" ${state.location.trim() && !state.posting ? "" : "disabled"}>${state.posting ? "Posting..." : `Post listings (${state.categories.length})`}</button>
  </footer>`;
}

function viewDone() {
  return `
  <main class="flex flex-1 flex-col px-4 pt-12">
    <h1 class="text-display">Your listings are up</h1>
    <p class="mt-2 text-body text-ink-muted">${state.categories.length} listings were created from one photo.</p>
    ${state.feedbackSent ? `<p class="mt-8 text-h3" role="status">Thank you for your feedback.</p>` : `
    <form class="mt-8" data-form="feedback">
      <fieldset>
        <legend class="text-h3">How easy was it to list these items?</legend>
        <div class="mt-3 flex justify-between gap-1" role="radiogroup" aria-label="Ease from 1 very hard to 7 very easy">
          ${[1, 2, 3, 4, 5, 6, 7].map((n) => `<button type="button" role="radio" aria-checked="${state.ease === n}" class="chip min-w-[42px] justify-center ${state.ease === n ? "chip-selected" : ""}" data-action="ease" data-value="${n}">${n}</button>`).join("")}
        </div>
        <div class="mt-1 flex justify-between text-caption text-ink-muted"><span>Very hard</span><span>Very easy</span></div>
      </fieldset>
      <label for="comment" class="mt-6 block text-label">Anything else? <span class="text-ink-muted">(optional)</span></label>
      <textarea id="comment" class="field mt-2 py-3" rows="3" maxlength="1000" data-field="comment">${esc(state.comment)}</textarea>
      <button class="btn-primary mt-4 w-full" data-action="send-feedback" ${state.ease ? "" : "disabled"}>Send</button>
    </form>`}
  </main>`;
}

function render() {
  const y = window.scrollY;
  const views = { start: viewStart, instructions: viewInstructions, build: viewBuild, preview: viewPreview, done: viewDone };
  $app.innerHTML = views[state.step]();
  window.scrollTo(0, y);
}

/* ---------- Events ---------- */
function setStep(step, tab = state.tab) {
  state.step = step;
  state.tab = tab;
  window.scrollTo(0, 0);
  track("step_entered", { to: step, to_tab: tab });
  render();
}

async function post() {
  state.posting = true;
  state.postError = "";
  render();
  try {
    const sb = await getSupabase();
    if (sb) {
      const paths = [];
      for (const p of state.photos) {
        const path = `${state.sessionId}/${p.id}.jpg`;
        const { error } = await sb.storage.from("photos").upload(path, p.blob, { contentType: "image/jpeg" });
        if (error) throw error;
        paths.push(path);
      }
      const rows = state.categories.map((c) => ({
        id: crypto.randomUUID(),
        session_id: state.sessionId,
        participant_code: state.code,
        category: c,
        condition: state.details[c].condition,
        size: state.details[c].size,
        gender: state.details[c].gender ?? null,
        notes: state.details[c].notes?.trim() || null,
        pickup_location: state.location.trim(),
        photo_paths: paths,
      }));
      const { error } = await sb.from("listings").insert(rows);
      if (error) throw error;
    }
    await track("posted", {
      listing_count: state.categories.length,
      photo_count: state.photos.length,
      detected: [...state.detected].length,
      added_manually: state.categories.filter((c) => !state.detected.has(c)).length,
      removed: [...state.detected].filter((c) => !state.categories.includes(c)).length,
    });
    state.posting = false;
    setStep("done");
  } catch (e) {
    console.error(e);
    state.posting = false;
    state.postError = "We couldn't post your listings. Please try again.";
    track("post_failed", { message: String(e.message ?? e) });
    render();
  }
}

async function sendFeedback() {
  const sb = await getSupabase();
  if (sb) {
    const { error } = await sb.from("feedback").insert({
      session_id: state.sessionId,
      participant_code: state.code,
      ease: state.ease,
      comment: state.comment.trim() || null,
    });
    if (error) console.warn("feedback insert failed", error.message);
  }
  track("feedback_sent", { ease: state.ease });
  state.feedbackSent = true;
  render();
}

$app.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-action]");
  if (!el) return;
  const stop = ev.target.closest("[data-stop]");
  if (stop && !stop.contains(el)) return;
  const { action, category, tab, key, value } = el.dataset;
  switch (action) {
    case "begin":
      state.sessionId = crypto.randomUUID();
      state.startedAt = Date.now();
      track("flow_started");
      setStep("instructions");
      break;
    case "cancel":
      /* Reset all flow state so photos and categories don't persist */
      state.photos.forEach((p) => URL.revokeObjectURL(p.url));
      state.photos = [];
      state.detecting = 0;
      state.detectError = false;
      state.detected = new Set();
      state.photoCategories = {};
      state.categories = [];
      state.addingCategory = false;
      state.categorySearch = "";
      state.details = {};
      state.location = "";
      state.sheetOpen = false;
      state.posting = false;
      state.postError = "";
      state.ease = 0;
      state.comment = "";
      state.feedbackSent = false;
      setStep("start");
      break;
    case "back-to-instructions": setStep("instructions"); break;
    case "open-sheet": state.sheetOpen = true; render(); break;
    case "close-sheet": state.sheetOpen = false; render(); break;
    case "tab": state.tab = tab; render(); break;
    case "remove-photo": {
      const photoId = el.dataset.photoId;
      const idx = state.photos.findIndex((p) => p.id === photoId);
      if (idx >= 0) { URL.revokeObjectURL(state.photos[idx].url); state.photos.splice(idx, 1); }
      const removedCats = state.photoCategories[photoId] ?? [];
      delete state.photoCategories[photoId];
      const stillDetected = new Set(Object.values(state.photoCategories).flat());
      removedCats.forEach((c) => {
        if (!stillDetected.has(c)) {
          state.categories = state.categories.filter((cat) => cat !== c);
          state.detected.delete(c);
          delete state.details[c];
        }
      });
      if (!state.photos.length) { setStep("instructions"); } else { render(); }
      break;
    }
    case "start-adding": state.addingCategory = true; state.categorySearch = ""; render(); break;
    case "done-adding": state.addingCategory = false; state.categorySearch = ""; render(); break;
    case "add-category":
      if (!state.categories.includes(category)) state.categories.push(category);
      render();
      break;
    case "remove-category":
      state.categories = state.categories.filter((c) => c !== category);
      delete state.details[category];
      render();
      break;
    case "confirm-categories":
      track("categories_confirmed", {
        count: state.categories.length,
        detected: state.detected.size,
        added_manually: state.categories.filter((c) => !state.detected.has(c)).length,
        removed: [...state.detected].filter((c) => !state.categories.includes(c)).length,
      });
      setStep("build", "details");
      break;
    case "set": {
      const d = (state.details[category] ??= {});
      d[key] = d[key] === value && key === "gender" ? undefined : value;
      render();
      break;
    }
    case "to-preview":
      track("details_completed", { count: state.categories.length });
      setStep("preview");
      break;
    case "to-details": setStep("build", "details"); break;
    case "post": post(); break;
    case "ease": state.ease = Number(value); render(); break;
    case "send-feedback": ev.preventDefault(); sendFeedback(); break;
  }
});

$app.addEventListener("input", (ev) => {
  const el = ev.target;
  const field = el.dataset.field;
  if (!field) return;
  if (field === "code") {
    state.code = el.value.trim().toUpperCase();
    const btn = $app.querySelector('[data-action="begin"]');
    if (btn) btn.disabled = !state.code;
  } else if (field === "location") {
    state.location = el.value;
    const btn = $app.querySelector('[data-action="post"]');
    if (btn) btn.disabled = !state.location.trim() || state.posting;
  } else if (field === "category-search") {
    state.categorySearch = el.value;
    render();
    const searchInput = $app.querySelector('[data-field="category-search"]');
    if (searchInput) { searchInput.focus(); searchInput.selectionStart = searchInput.selectionEnd = searchInput.value.length; }
  } else if (field === "comment") {
    state.comment = el.value;
  } else if (field === "size" || field === "notes") {
    const d = (state.details[el.dataset.category] ??= {});
    d[field] = el.value;
    if (field === "size") render();
  }
});

$app.addEventListener("change", (ev) => {
  if (!ev.target.matches("[data-photo-input]")) return;
  const file = ev.target.files?.[0];
  if (file) addPhoto(file);
});

$app.addEventListener("submit", (ev) => ev.preventDefault());

render();
