const SHEET_PUBLIC_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLYiPL1o-OkYjroAoab-CJ_V6hzlb-WQCXDNJpSHoQlRefI-MeUJZkckTkZFaS-AaaDCR03hawt6yW/pubhtml?gid=1870458129&single=true";

const SHEET_CSV_URLS = [
  SHEET_PUBLIC_URL.replace("/pubhtml", "/pub").replace("single=true", "single=true&output=csv"),
  SHEET_PUBLIC_URL.replace("/pubhtml", "/pub").replace(
    "?gid=",
    "?output=csv&single=true&gid="
  ),
];

const WHATSAPP_PHONE = "5542988859972";

const USERS = {
  VENDEDOR: { password: "0022", role: "VENDEDOR" },
  MASTER: { password: "MASTER", role: "MASTER" },
};

const STORAGE = {
  cache: "limpmix-products-cache-v3",
  quote: "limpmix-quote-v1",
  view: "limpmix-view-v3",
  featured: "limpmix-featured-skus",
  session: "limpmix-session-v3",
};

const FALLBACK_PRODUCTS = [
  {
    code: "819",
    description: "ABRIDOR DE LATA",
    categoryLabel: "UTENSILHOS PARA COZINHA",
    barcode: "7899653780956",
    imageUrl: "assets/images/produto-limpador-casa-perfume.png",
    price: 3.99,
    stock: 2,
  },
  {
    code: "645",
    description: "ABSORVENTE COM ABAS PACOTE 32UN MILI",
    categoryLabel: "DIVERSOS",
    barcode: "7896104992494",
    imageUrl: "assets/images/produto-veja-multiuso.png",
    price: 19.99,
    stock: 12,
  },
  {
    code: "1393",
    description: "ACENDEDOR FLAMA - MODENUTI",
    categoryLabel: "UTEIS PARA CASA",
    barcode: "7898409910562",
    imageUrl: "assets/images/produto-ypi-rende-mais.png",
    price: 12.99,
    stock: 7,
  },
  {
    code: "1426",
    description: "ACENDEDOR LUME - MODENUTI",
    categoryLabel: "UTEIS PARA CASA",
    barcode: "7898409910517",
    imageUrl: "assets/images/produto-uau-perfumes.png",
    price: 11.99,
    stock: 12,
  },
  {
    code: "890",
    description: "AGUA DE PASSAR MASTER FRESH COM GATILHO 1L MUNDUS",
    categoryLabel: "AMACIANTES DE ROUPAS",
    barcode: "609963029907",
    imageUrl: "assets/images/produto-sbp-inseticida.png",
    price: 39.99,
    stock: 28,
  },
];

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const number = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

const state = {
  products: [],
  filtered: [],
  categories: [],
  role: null,
  category: "all",
  categoryQuery: "",
  query: "",
  view: localStorage.getItem(STORAGE.view) || "medium",
  cart: new Map(),
  featuredSkus: [],
  lastSource: "",
};

const els = {
  sessionLabel: document.querySelector("#sessionLabel"),
  openLogin: document.querySelector("#openLogin"),
  logoutButton: document.querySelector("#logoutButton"),
  loginDialog: document.querySelector("#loginDialog"),
  loginForm: document.querySelector("#loginForm"),
  closeLogin: document.querySelector("#closeLogin"),
  cancelLogin: document.querySelector("#cancelLogin"),
  loginUser: document.querySelector("#loginUser"),
  loginPass: document.querySelector("#loginPass"),
  loginFeedback: document.querySelector("#loginFeedback"),
  searchInput: document.querySelector("#searchInput"),
  toggleCategories: document.querySelector("#toggleCategories"),
  categoryPanel: document.querySelector("#categoryPanel"),
  closeCategories: document.querySelector("#closeCategories"),
  categorySearchInput: document.querySelector("#categorySearchInput"),
  categoryEmpty: document.querySelector("#categoryEmpty"),
  activeCategoryButton: document.querySelector("#activeCategoryButton"),
  categoryList: document.querySelector("#categoryList"),
  statusLine: document.querySelector("#statusLine"),
  featuredAdmin: document.querySelector("#featuredAdmin"),
  featuredInput: document.querySelector("#featuredInput"),
  saveFeatured: document.querySelector("#saveFeatured"),
  clearFeatured: document.querySelector("#clearFeatured"),
  featuredFeedback: document.querySelector("#featuredFeedback"),
  productsTitle: document.querySelector("#productsTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  refreshProducts: document.querySelector("#refreshProducts"),
  masterStats: document.querySelector("#masterStats"),
  visibleProducts: document.querySelector("#visibleProducts"),
  visibleStock: document.querySelector("#visibleStock"),
  productGrid: document.querySelector("#productGrid"),
  emptyState: document.querySelector("#emptyState"),
  viewButtons: document.querySelectorAll("[data-view]"),
  quotePanel: document.querySelector("#quotePanel"),
  quoteToggle: document.querySelector("#quoteToggle"),
  minimizeQuote: document.querySelector("#minimizeQuote"),
  quoteCount: document.querySelector("#quoteCount"),
  quoteTotalPreview: document.querySelector("#quoteTotalPreview"),
  quoteHint: document.querySelector("#quoteHint"),
  quoteItems: document.querySelector("#quoteItems"),
  quoteTotalRow: document.querySelector("#quoteTotalRow"),
  quoteTotal: document.querySelector("#quoteTotal"),
  sendWhatsApp: document.querySelector("#sendWhatsApp"),
  clearQuote: document.querySelector("#clearQuote"),
  toast: document.querySelector("#toast"),
};

init();

function init() {
  bindEvents();
  restoreSession();
  restoreCart();
  state.featuredSkus = readFeaturedSkus();
  applyView(state.view);
  renderAuth();
  loadProducts();
}

function bindEvents() {
  els.openLogin.addEventListener("click", openLoginDialog);
  els.closeLogin.addEventListener("click", closeLoginDialog);
  els.cancelLogin.addEventListener("click", closeLoginDialog);
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutButton.addEventListener("click", logout);

  els.searchInput.addEventListener("input", () => {
    state.query = els.searchInput.value;
    applyFilters();
  });

  els.toggleCategories.addEventListener("click", () => {
    setCategoriesOpen(!document.body.classList.contains("categories-open"));
  });
  els.closeCategories.addEventListener("click", () => {
    setCategoriesOpen(false);
  });
  els.categorySearchInput.addEventListener("input", () => {
    state.categoryQuery = els.categorySearchInput.value;
    renderCategories();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setCategoriesOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("categories-open")) return;
    if (els.toggleCategories.contains(event.target) || els.categoryPanel.contains(event.target)) return;
    setCategoriesOpen(false);
  });

  els.refreshProducts.addEventListener("click", () => loadProducts({ force: true }));
  els.saveFeatured.addEventListener("click", saveFeatured);
  els.clearFeatured.addEventListener("click", clearFeatured);

  els.viewButtons.forEach((button) => {
    button.addEventListener("click", () => applyView(button.dataset.view));
  });

  els.quoteToggle.addEventListener("click", () => setQuoteOpen(true));
  els.minimizeQuote.addEventListener("click", () => setQuoteOpen(false));
  els.clearQuote.addEventListener("click", clearQuote);
  els.sendWhatsApp.addEventListener("click", sendWhatsApp);
}

async function loadProducts({ force = false } = {}) {
  setStatus("Carregando catalogo...", "");

  if (!force) {
    const cached = readCache();
    if (cached.length) {
      setProducts(cached, "cache local");
      setStatus(`Catalogo carregado do cache local com ${cached.length} produtos. Atualizando planilha...`, "");
    }
  }

  try {
    const csv = await fetchProductsCsv();
    const products = parseProducts(csv);
    if (!products.length) throw new Error("A planilha nao retornou produtos validos.");
    localStorage.setItem(STORAGE.cache, JSON.stringify(products));
    setProducts(products, "Google Sheets");
    setStatus(`Catalogo atualizado: ${products.length} produtos com estoque disponivel.`, "ok");
  } catch (error) {
    const cached = readCache();
    if (cached.length) {
      setProducts(cached, "cache local");
      setStatus(`Nao foi possivel atualizar a planilha. Usando cache local. Detalhe: ${error.message}`, "error");
      return;
    }

    const fallback = prepareProducts(FALLBACK_PRODUCTS);
    setProducts(fallback, "amostra offline");
    setStatus(`Planilha indisponivel. Exibindo amostra offline. Detalhe: ${error.message}`, "error");
  }
}

async function fetchProductsCsv() {
  const errors = [];

  for (const url of [...new Set(SHEET_CSV_URLS)]) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      let response;

      try {
        const requestUrl = new URL(url);
        requestUrl.searchParams.set("t", Date.now());
        response = await fetch(requestUrl, {
          cache: "no-store",
          headers: { Accept: "text/csv,text/plain;q=0.9,*/*;q=0.1" },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csv = await response.text();
      if (!/^\ufeff?\s*"?CODIGO"?\s*,/i.test(csv)) {
        throw new Error("resposta recebida nao e um CSV de produtos");
      }
      return csv;
    } catch (error) {
      const detail = error.name === "AbortError" ? "tempo limite excedido" : error.message;
      errors.push(detail);
    }
  }

  throw new Error(errors.join("; ") || "nenhuma rota CSV disponivel");
}

function setProducts(products, source) {
  state.products = prepareProducts(products);
  state.lastSource = source;
  applyFeaturedFlags();
  buildCategories();
  pruneCart();
  applyFilters();
  renderQuote();
  renderAuth();
}

function parseProducts(csv) {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const headers = rows[0].map(headerKey);
  const products = [];

  for (const row of rows.slice(1)) {
    const record = {};
    headers.forEach((key, index) => {
      record[key] = row[index] || "";
    });

    const product = normalizeProduct(record);
    if (product) products.push(product);
  }

  return products;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => String(value).trim() !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => String(value).trim() !== "")) rows.push(row);
  return rows;
}

function normalizeProduct(record) {
  const code = clean(record.CODIGO);
  const description = clean(record.DESCRICAO || record.DESCRICAO_ || record["DESCRICAO"]);
  const rawCategory = clean(record.CATEGORIAS || record.CATEGORIA);
  const barcode = clean(record.CODIGO_DE_BARRAS || record.BARRAS || record.EAN);
  const imageUrl = clean(record.LINK_FOTO || record.FOTO || "");
  const price = parseBrazilNumber(record.VALOR || record.PRECO);
  const stock = parseStock(record.ESTOQUE || record.SALDO);

  if (!code || !description) return null;
  if (/^900\d*$/.test(code) || normalizeText(rawCategory) === "administrativo") return null;
  if (stock !== null && stock <= 0) return null;

  const categoryLabel = firstCategory(rawCategory) || inferCategory(description);
  const categorySlug = slugify(categoryLabel);

  return {
    code,
    id: code,
    description,
    categoryLabel,
    categorySlug,
    barcode,
    imageUrl,
    price,
    stock,
  };
}

function prepareProducts(products) {
  return products
    .map((product) => {
      const categoryLabel = product.categoryLabel || inferCategory(product.description);
      const categorySlug = product.categorySlug || slugify(categoryLabel);
      return {
        ...product,
        code: clean(product.code),
        id: clean(product.id || product.code),
        description: clean(product.description),
        categoryLabel,
        categorySlug,
        barcode: clean(product.barcode),
        imageUrl: clean(product.imageUrl),
        price: Number.isFinite(Number(product.price)) ? Number(product.price) : 0,
        stock:
          product.stock === null || product.stock === undefined || product.stock === ""
            ? null
            : Number(product.stock),
      };
    })
    .filter((product) => product.code && product.description)
    .map((product) => ({
      ...product,
      searchText: normalizeText(
        [product.code, product.description, product.categoryLabel, product.barcode].join(" ")
      ),
    }));
}

function applyFeaturedFlags() {
  const order = new Map(state.featuredSkus.map((sku, index) => [normalizeSku(sku), index]));
  state.products = state.products.map((product) => {
    const key = normalizeSku(product.code);
    const featuredOrder = order.has(key) ? order.get(key) : null;
    return {
      ...product,
      featured: featuredOrder !== null,
      featuredOrder,
    };
  });
}

function buildCategories() {
  const map = new Map();
  for (const product of state.products) {
    const current = map.get(product.categorySlug) || {
      slug: product.categorySlug,
      label: product.categoryLabel,
      count: 0,
    };
    current.count += 1;
    map.set(product.categorySlug, current);
  }

  state.categories = [...map.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
  );

  renderCategories();
}

function renderCategories() {
  const categoryTerm = normalizeText(state.categoryQuery);
  const items = [{ slug: "all", label: "Todos", count: state.products.length }, ...state.categories].filter(
    (category) => !categoryTerm || normalizeText(category.label).includes(categoryTerm)
  );

  els.categoryList.replaceChildren();
  for (const category of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = state.category === category.slug ? "active" : "";
    button.dataset.category = category.slug;
    button.innerHTML = `<span>${escapeHtml(category.label)}</span><small>${number.format(
      category.count
    )}</small>`;
    button.addEventListener("click", () => {
      state.category = category.slug;
      setCategoriesOpen(false);
      applyFilters();
    });
    els.categoryList.appendChild(button);
  }
  els.categoryEmpty.hidden = items.length > 0;
}

function applyFilters() {
  const terms = normalizeText(state.query).split(/\s+/).filter(Boolean);
  let list = [...state.products];

  if (state.category === "featured") {
    list = list.filter((product) => product.featured);
  } else if (state.category !== "all") {
    list = list.filter((product) => product.categorySlug === state.category);
  }

  if (terms.length) {
    list = list.filter((product) => terms.every((term) => product.searchText.includes(term)));
  }

  list.sort(sortProducts);
  state.filtered = list;
  renderProducts();
  renderStats();
  renderCategories();
  renderHeading();
}

function sortProducts(a, b) {
  if (state.category === "featured") {
    return (a.featuredOrder ?? 99999) - (b.featuredOrder ?? 99999);
  }

  if (state.category === "all") {
    if (a.featured && b.featured) return (a.featuredOrder ?? 99999) - (b.featuredOrder ?? 99999);
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
  }

  return a.description.localeCompare(b.description, "pt-BR", { sensitivity: "base" });
}

function renderHeading() {
  const category = currentCategoryLabel();
  els.productsTitle.textContent = category;
  els.activeCategoryButton.textContent =
    state.category === "all" ? "Todas as categorias" : category;
  els.resultSummary.textContent = `${state.filtered.length} produto(s) exibido(s) de ${state.products.length} carregado(s). Fonte: ${state.lastSource}.`;
  els.emptyState.hidden = state.filtered.length > 0;
  if (state.category === "featured" && state.filtered.length === 0 && state.role === "MASTER") {
    els.emptyState.textContent = "Nenhum SKU valido salvo em Destaques. Cadastre os codigos acima.";
  } else {
    els.emptyState.textContent = "Nenhum produto encontrado para este filtro.";
  }
}

function renderProducts() {
  els.productGrid.replaceChildren();
  for (const product of state.filtered) {
    const card = document.createElement("article");
    card.className = `product-card${product.featured ? " featured" : ""}`;
    card.innerHTML = `
      <img src="${escapeAttr(product.imageUrl || "assets/images/footer-logo.png")}" alt="${escapeAttr(
      product.description
    )}" loading="lazy" />
      <div class="product-info">
        <h3>${escapeHtml(product.description)}</h3>
        <div class="product-meta">
          <span>Cod. ${escapeHtml(product.code)}</span>
          <span>GTIN: ${escapeHtml(product.barcode || "nao informado")}</span>
          <span>${escapeHtml(stockLabel(product.stock))}</span>
        </div>
      </div>
      <div class="price-line ${canSeePrices() ? "" : "restricted"}">
        ${canSeePrices() ? money.format(product.price) : "Valor restrito"}
      </div>
      <button type="button" data-add="${escapeAttr(product.code)}">Adicionar</button>
    `;

    card.querySelector("img").addEventListener("error", (event) => {
      event.currentTarget.src = "assets/images/footer-logo.png";
    });
    card.querySelector("[data-add]").addEventListener("click", () => addToCart(product.code));
    els.productGrid.appendChild(card);
  }
}

function setCategoriesOpen(open) {
  document.body.classList.toggle("categories-open", open);
  els.toggleCategories.setAttribute("aria-expanded", String(open));
  if (open) {
    requestAnimationFrame(() => els.categorySearchInput.focus());
    return;
  }

  if (state.categoryQuery) {
    state.categoryQuery = "";
    els.categorySearchInput.value = "";
    renderCategories();
  }
}

function renderStats() {
  const totalStock = state.filtered.reduce((sum, product) => {
    return sum + (Number.isFinite(product.stock) ? product.stock : 0);
  }, 0);
  els.visibleProducts.textContent = number.format(state.filtered.length);
  els.visibleStock.textContent = number.format(totalStock);
}

function openLoginDialog() {
  els.loginFeedback.textContent = "";
  if (typeof els.loginDialog.showModal === "function") {
    els.loginDialog.showModal();
  } else {
    els.loginDialog.setAttribute("open", "");
  }
  els.loginUser.focus();
}

function closeLoginDialog() {
  els.loginDialog.close();
}

function handleLogin(event) {
  event.preventDefault();
  const user = normalizeText(els.loginUser.value).toUpperCase();
  const password = els.loginPass.value.trim();
  const match = USERS[user];

  if (!match || match.password !== password) {
    els.loginFeedback.textContent = "Usuario ou senha invalidos.";
    return;
  }

  state.role = match.role;
  sessionStorage.setItem(STORAGE.session, state.role);
  els.loginPass.value = "";
  closeLoginDialog();
  renderAuth();
  applyFilters();
  renderQuote();
  showToast(`Acesso ${state.role} liberado.`);
}

function logout() {
  state.role = null;
  sessionStorage.removeItem(STORAGE.session);
  renderAuth();
  applyFilters();
  renderQuote();
  showToast("Sessao encerrada.");
}

function renderAuth() {
  const logged = Boolean(state.role);
  els.sessionLabel.textContent = logged ? state.role : "PUBLICO";
  els.openLogin.hidden = logged;
  els.logoutButton.hidden = !logged;
  els.masterStats.hidden = state.role !== "MASTER";
  els.featuredAdmin.hidden = state.role !== "MASTER";
  if (document.activeElement !== els.featuredInput) {
    els.featuredInput.value = state.featuredSkus.join(", ");
  }
  if (state.role === "MASTER") renderCategories();
}

function restoreSession() {
  const role = sessionStorage.getItem(STORAGE.session);
  if (role === "MASTER" || role === "VENDEDOR") state.role = role;
}

function canSeePrices() {
  return state.role === "MASTER" || state.role === "VENDEDOR";
}

function saveFeatured() {
  const requested = parseSkuList(els.featuredInput.value);
  const availableSkus = new Set(state.products.map((product) => normalizeSku(product.code)));

  state.featuredSkus = requested.map(normalizeSku).filter(Boolean);
  persistFeaturedSkus();
  applyFeaturedFlags();
  buildCategories();
  applyFilters();

  const saved = state.featuredSkus.length;
  const pending = state.featuredSkus.filter((sku) => !availableSkus.has(sku));
  els.featuredFeedback.textContent = pending.length
    ? `${saved} SKU(s) salvo(s). ${pending.length} ainda nao esta(ao) disponivel(is) no catalogo atual.`
    : `${saved} SKU(s) salvo(s) em Destaques.`;
  showToast("Destaques atualizados.");
}

function clearFeatured() {
  state.featuredSkus = [];
  persistFeaturedSkus();
  els.featuredInput.value = "";
  els.featuredFeedback.textContent = "Destaques limpos.";
  applyFeaturedFlags();
  buildCategories();
  applyFilters();
}

function persistFeaturedSkus() {
  localStorage.setItem(STORAGE.featured, JSON.stringify(state.featuredSkus));
}

function readFeaturedSkus() {
  try {
    const stored = localStorage.getItem(STORAGE.featured);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed.map(normalizeSku).filter(Boolean);
    return parseSkuList(String(parsed));
  } catch {
    return parseSkuList(localStorage.getItem(STORAGE.featured) || "");
  }
}

function parseSkuList(value) {
  const seen = new Set();
  const skus = [];
  String(value || "")
    .split(/[\s,;|]+/)
    .map(clean)
    .filter(Boolean)
    .forEach((sku) => {
      const key = normalizeSku(sku);
      if (!seen.has(key)) {
        seen.add(key);
        skus.push(sku);
      }
    });
  return skus;
}

function addToCart(code) {
  const product = state.products.find((item) => item.code === code);
  if (!product) return;

  const current = state.cart.get(code) || 0;
  const next = capQuantity(product, current + 1);
  state.cart.set(code, next);
  persistCart();
  renderQuote();
  showToast(`${product.description} adicionado ao carrinho.`);
}

function setQty(code, qty) {
  const product = state.products.find((item) => item.code === code);
  if (!product || qty <= 0) {
    state.cart.delete(code);
  } else {
    state.cart.set(code, capQuantity(product, qty));
  }
  persistCart();
  renderQuote();
}

function capQuantity(product, qty) {
  if (!Number.isFinite(product.stock) || product.stock <= 0) return Math.max(1, qty);
  return Math.max(1, Math.min(qty, Math.floor(product.stock)));
}

function renderQuote() {
  const entries = cartEntries();
  const totalQty = entries.reduce((sum, entry) => sum + entry.qty, 0);
  const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);

  els.quoteCount.textContent = number.format(totalQty);
  els.quoteTotalPreview.textContent = canSeePrices() ? money.format(total) : `${number.format(totalQty)} item(s)`;
  els.quoteHint.textContent = entries.length
    ? "Confira os itens antes de enviar para o WhatsApp."
    : "Adicione produtos para montar seu pedido.";
  els.quoteTotalRow.hidden = !canSeePrices() || !entries.length;
  els.quoteTotal.textContent = money.format(total);
  els.sendWhatsApp.disabled = entries.length === 0;
  els.clearQuote.disabled = entries.length === 0;

  els.quoteItems.replaceChildren();
  for (const { product, qty } of entries) {
    const row = document.createElement("article");
    row.className = "quote-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(product.description)}</strong>
        <small>Cod. ${escapeHtml(product.code)}${
      canSeePrices() ? ` | ${money.format(product.price)} cada` : ""
    }</small>
      </div>
      <div class="qty-control" aria-label="Quantidade">
        <button type="button" data-dec="${escapeAttr(product.code)}">-</button>
        <strong>${qty}</strong>
        <button type="button" data-inc="${escapeAttr(product.code)}">+</button>
        <button type="button" data-remove="${escapeAttr(product.code)}">x</button>
      </div>
    `;
    row.querySelector("[data-dec]").addEventListener("click", () => setQty(product.code, qty - 1));
    row.querySelector("[data-inc]").addEventListener("click", () => setQty(product.code, qty + 1));
    row.querySelector("[data-remove]").addEventListener("click", () => setQty(product.code, 0));
    els.quoteItems.appendChild(row);
  }
}

function cartEntries() {
  return [...state.cart.entries()]
    .map(([code, qty]) => ({
      product: state.products.find((item) => item.code === code),
      qty: Number(qty),
    }))
    .filter((entry) => entry.product && entry.qty > 0);
}

function clearQuote() {
  state.cart.clear();
  persistCart();
  renderQuote();
  showToast("Carrinho limpo.");
}

function pruneCart() {
  const codes = new Set(state.products.map((product) => product.code));
  for (const code of state.cart.keys()) {
    if (!codes.has(code)) state.cart.delete(code);
  }
  persistCart();
}

function sendWhatsApp() {
  const entries = cartEntries();
  if (!entries.length) {
    showToast("Adicione ao menos um produto.");
    return;
  }

  const lines = entries.map(({ product, qty }) => {
    const parts = [`${qty}x ${product.description}`, `Cod. ${product.code}`];
    if (product.barcode) parts.push(`EAN ${product.barcode}`);
    if (canSeePrices()) parts.push(money.format(product.price));
    return `- ${parts.join(" | ")}`;
  });

  const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);
  const message = [
    "Ola! Gostaria de fazer este orcamento:",
    "",
    ...lines,
    canSeePrices() ? "" : null,
    canSeePrices() ? `Total estimado: ${money.format(total)}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

function setQuoteOpen(open) {
  els.quotePanel.classList.toggle("minimized", !open);
  els.quoteToggle.setAttribute("aria-expanded", String(open));
}

function applyView(view) {
  state.view = view || "medium";
  localStorage.setItem(STORAGE.view, state.view);
  els.productGrid.className = `product-grid view-${state.view}`;
  els.viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
}

function persistCart() {
  localStorage.setItem(STORAGE.quote, JSON.stringify([...state.cart.entries()]));
}

function restoreCart() {
  try {
    state.cart = new Map(JSON.parse(localStorage.getItem(STORAGE.quote)) || []);
  } catch {
    state.cart = new Map();
  }
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE.cache) || "[]");
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function setStatus(message, stateName) {
  els.statusLine.textContent = message;
  if (stateName) els.statusLine.dataset.state = stateName;
  else delete els.statusLine.dataset.state;
}

function currentCategoryLabel() {
  if (state.category === "all") return "Todos os produtos";
  if (state.category === "featured") return "Destaques";
  return state.categories.find((category) => category.slug === state.category)?.label || "Produtos";
}

function stockLabel(stock) {
  if (!Number.isFinite(stock)) return "Estoque nao informado";
  return `${number.format(stock)} em estoque`;
}

function firstCategory(value) {
  return clean(String(value || "").split(/[;,|]/)[0]);
}

function inferCategory(description) {
  const text = normalizeText(description);
  const rules = [
    ["INSETICIDAS", ["inseticida", "repelente", "mosquito", "barata", "formiga"]],
    ["LAVANDERIA", ["amaciante", "sabao", "lava roupas", "roupa", "passar"]],
    ["LIMPEZA GERAL", ["limpador", "desinfetante", "detergente", "multiuso", "sanitaria"]],
    ["DESCARTAVEIS", ["copo", "prato", "garfo", "colher", "guardanapo"]],
    ["AUTOMOTIVO", ["auto", "carro", "pneu", "pretinho"]],
    ["PET", ["pet", "cao", "gato"]],
  ];
  const match = rules.find(([, words]) => words.some((word) => text.includes(word)));
  return match ? match[0] : "OUTROS";
}

function parseBrazilNumber(value) {
  const raw = clean(value);
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const numberValue = Number.parseFloat(normalized.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function parseStock(value) {
  const raw = clean(value);
  if (!raw) return null;
  const parsed = parseBrazilNumber(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeSku(value) {
  return clean(value).toUpperCase();
}

function slugify(value) {
  return (
    normalizeText(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "outros"
  );
}

function headerKey(value) {
  return normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

let toastTimer = null;

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2400);
}
