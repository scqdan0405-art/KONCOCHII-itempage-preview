(function () {
  "use strict";

  const data = window.KONCOCHII_CONTENT;
  const state = {
    lang: localStorage.getItem("koncochii-lang") || data.defaultLang || "ja"
  };

  const marketLinks = {
    ja: "ja/japan-market/",
    en: "en/japan-market/",
    vi: "vi/japan-market/"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function locale() {
    return data.locales[state.lang] || data.locales[data.defaultLang];
  }

  function read(path) {
    return path.split(".").reduce((value, key) => (value ? value[key] : ""), locale()) || "";
  }

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function padNumber(index) {
    return String(index + 1).padStart(2, "0");
  }

  function lineBreaks(text) {
    return String(text).replace(/\n/g, "<br>");
  }

  function setStaticText() {
    document.documentElement.lang = state.lang;
    document.title = read("metaTitle");

    $$("[data-nav]").forEach((node) => {
      node.textContent = locale().nav[node.dataset.nav] || "";
    });

    $$("[data-field]").forEach((node) => {
      node.textContent = read(node.dataset.field);
    });

    $$("[data-html]").forEach((node) => {
      node.innerHTML = read(node.dataset.html);
    });

    $("#formLang").value = state.lang;
    $("#heroImage").alt = read("hero.imageAlt");
    $("#year").textContent = new Date().getFullYear();
  }

  function setMarketLinks() {
    const href = marketLinks[state.lang] || marketLinks.ja;
    $$('[data-market-link]').forEach((node) => {
      node.href = href;
    });
  }

  function renderLanguageButtons() {
    const wrap = $("#langButtons");
    wrap.replaceChildren();

    data.langs.forEach((lang) => {
      const button = create("button", "", lang.label);
      button.type = "button";
      button.dataset.lang = lang.code;
      button.setAttribute("aria-pressed", String(lang.code === state.lang));
      button.addEventListener("click", () => {
        state.lang = lang.code;
        localStorage.setItem("koncochii-lang", state.lang);
        render();
      });
      wrap.append(button);
    });
  }

  function renderFacts() {
    const wrap = $("#heroFacts");
    wrap.replaceChildren();

    read("hero.facts").forEach((item) => {
      const fact = create("div", "fact");
      fact.append(create("b", "", item.label));
      fact.append(create("span", "", item.value));
      wrap.append(fact);
    });
  }

  function renderAbout() {
    const text = $("#aboutText");
    const values = $("#valueList");
    text.replaceChildren();
    values.replaceChildren();

    read("about.paragraphs").forEach((paragraph) => {
      text.append(create("p", "", paragraph));
    });

    read("about.values").forEach((item) => {
      const card = create("article", "value-item");
      card.append(create("small", "", item.label));
      card.append(create("h3", "", item.title));
      card.append(create("p", "", item.text));
      values.append(card);
    });
  }

  function renderMessages() {
    const wrap = $("#messageList");
    wrap.replaceChildren();

    read("message.people").forEach((person) => {
      const card = create("article", "message-card");
      const side = create("div", "message-side");
      const imagePath = data.images[person.imageKey];

      if (imagePath) {
        const portrait = create("div", "portrait");
        const img = create("img");
        img.src = imagePath;
        img.alt = person.name;
        portrait.append(img);
        side.append(portrait);
      } else {
        card.classList.add("message-card-no-image");
      }

      side.append(create("h3", "", person.name));
      side.append(create("p", "message-role", person.role));
      side.append(create("p", "message-company", person.company));

      const body = create("div", "message-body");
      body.append(create("p", "quote", person.quote));
      person.paragraphs.forEach((paragraph) => body.append(create("p", "", paragraph)));
      body.append(create("div", "signature", "- " + person.signature));

      card.append(side, body);
      wrap.append(card);
    });
  }

  function renderServices() {
    const wrap = $("#serviceGrid");
    wrap.replaceChildren();

    read("services.items").forEach((item, index) => {
      const card = create("article", "service-card");
      card.append(create("small", "", padNumber(index)));
      card.append(create("h3", "", item.title));
      card.append(create("p", "", item.text));
      wrap.append(card);
    });
  }

  function renderCases() {
    const wrap = $("#caseList");
    wrap.replaceChildren();

    read("cases.items").forEach((item, index) => {
      const row = create("article", "case-item");
      row.append(create("span", "case-number", item.number || padNumber(index)));

      const body = create("div");
      body.append(create("h3", "", item.title));

      if (item.text) {
        body.append(create("p", "", item.text));
      }

      if (item.client) {
        body.append(renderCaseBlock(item.clientLabel, [item.client], "case-client"));
      }

      if (item.background) {
        body.append(renderCaseBlock(item.backgroundLabel, item.background));
      }

      if (item.support) {
        const block = create("div", "case-block");
        block.append(create("b", "", item.supportLabel));
        const list = create("ul", "case-support-list");
        item.support.forEach((text) => list.append(create("li", "", text)));
        block.append(list);
        body.append(block);
      }

      if (item.point) {
        const block = create("div", "case-block case-point");
        block.append(create("h4", "", item.pointTitle));
        item.point.forEach((text) => block.append(create("p", "", text)));
        body.append(block);
      }

      row.append(body);
      wrap.append(row);
    });
  }

  function renderCaseBlock(label, paragraphs, className = "") {
    const block = create("div", ["case-block", className].filter(Boolean).join(" "));
    if (label) {
      block.append(create("b", "", label));
    }
    paragraphs.forEach((text) => block.append(create("p", "", text)));
    return block;
  }

  function renderCompany() {
    const rows = $("#companyRows");
    const contacts = $("#companyContacts");
    rows.replaceChildren();
    contacts.replaceChildren();

    read("company.rows").forEach(([term, detail]) => rows.append(renderInfoRow(term, detail)));
    read("company.contacts").forEach(([term, detail]) => contacts.append(renderInfoRow(term, detail)));
  }

  function renderInfoRow(term, detail) {
    const row = create("div", "info-row");
    row.append(create("dt", "", term));
    const dd = create("dd");
    if (String(detail).includes("@")) {
      const link = create("a", "", detail);
      link.href = "mailto:" + detail;
      dd.append(link);
    } else {
      dd.innerHTML = lineBreaks(detail);
    }
    row.append(dd);
    return row;
  }

  function renderContactLines() {
    const wrap = $("#contactLines");
    wrap.replaceChildren();

    const contact = locale().contact;
    const items = [
      [contact.addressLabel, "L17-11, 17th Floor, Vincom Center Building, 72 Le Thanh Ton Street, Saigon Ward, Ho Chi Minh City, Vietnam"],
      [contact.phoneLabel, data.phone],
      [contact.emailLabel, data.email]
    ];

    items.forEach(([term, detail]) => {
      const row = create("dl", "contact-line");
      row.append(create("dt", "", term));
      const dd = create("dd");
      if (String(detail).includes("@")) {
        const link = create("a", "", detail);
        link.href = "mailto:" + detail;
        dd.append(link);
      } else {
        dd.innerHTML = lineBreaks(detail);
      }
      row.append(dd);
      wrap.append(row);
    });
  }

  function bindMenu() {
    const toggle = $("#menuToggle");
    const nav = $("#siteNav");
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    $$("#siteNav a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");

    if (window.KONCOCHII_PREVIEW) return;

    form.addEventListener("submit", async (event) => {
      if (!window.fetch) return;
      event.preventDefault();

      status.className = "form-status";
      status.textContent = "";

      const button = $(".form-btn", form);
      button.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || "send failed");

        form.reset();
        $("#formLang").value = state.lang;
        status.textContent = read("contact.form.success");
        status.classList.add("ok");
      } catch (error) {
        status.textContent = read("contact.form.error");
        status.classList.add("error");
      } finally {
        button.disabled = false;
      }
    });
  }

  function render() {
    setStaticText();
    renderLanguageButtons();
    setMarketLinks();
    renderFacts();
    renderAbout();
    renderMessages();
    renderServices();
    renderCases();
    renderCompany();
    renderContactLines();
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#brandLogo").src = data.images.logo;
    $("#heroImage").src = data.images.hero;
    render();
    bindMenu();
    bindForm();
  });
})();
