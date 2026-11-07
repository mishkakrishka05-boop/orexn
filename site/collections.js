/* NERU collection gallery. Product names follow the archived catalogue. */
(() => {
  const root = document.getElementById("collections");
  if (!root) return;

  const assetRoot = new URL("assets/collection/", document.currentScript?.src || location.href);
  const collections = [
    { id: "gifts", title: "Подарочные наборы", detail: "Орехи и сухофрукты собраны в отдельные секции. У каждого набора своё название и свой рисунок наполнения.", items: ["Неру (Энергия)", "Согдиана", "Здоровье", "Эсхата"], alt: "Открытая бордовая шкатулка с фисташками и сухофруктами" },
    { id: "sweets", title: "Сладости", detail: "Под сахарной оболочкой «Камушков» скрывается миндаль. Рядом с ним в коллекции — арахис в сахаре и обжаренные орехи в кунжуте.", items: ["Камушки (миндаль в сахаре)", "Арахис в сахаре «Ёжик»", "Жареный арахис в кунжуте", "Кешью жареный"], alt: "Миндаль в сахарной оболочке рядом с орехами в кунжуте" },
    { id: "nuts", title: "Орехи", detail: "От светлого бланшированного арахиса до солёной абрикосовой косточки «Шур-донак».", items: ["Арахис бланшированный", "Абрикосовая косточка очищенная", "Абрикосовая косточка соленая «Шур - донак»", "Кешью жареный"], alt: "Грецкие орехи, миндаль, кешью и раскрытые фисташки" },
    { id: "fruit", title: "Сухофрукты", detail: "Солнечная кайса, тёмный изюм и чернослив. Тропические ноты в коллекцию добавляют ломтики киви и кусочки ананаса.", items: ["Кайса абрикос", "Изюм (гигант)", "Сахарный ананас", "Чернослив", "Сахарный Киви"], alt: "Янтарная курага с тёмным изюмом и черносливом" },
    { id: "kurut", title: "Экопродукты", detail: "Курут — высушенный кисломолочный продукт. В коллекции есть курт с паприкой и курут с базиликом.", items: ["Курт с паприкой", "Курт ромвик", "Курут с базиликом"], alt: "Белые шарики курута с базиликом и паприкой" }
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function picture(item, lazy = true) {
    const image = element("img", "nc-photo");
    image.src = new URL(item.id + ".jpg", assetRoot).href;
    image.alt = item.alt;
    image.width = image.height = 512;
    image.loading = lazy ? "lazy" : "eager";
    return image;
  }

  function button(label, text, cls) {
    const button = element("button", cls, text);
    button.type = "button";
    button.setAttribute("aria-label", label);
    return button;
  }

  root.classList.add("neru-collections");
  root.setAttribute("aria-labelledby", "nc-heading");
  const layout = element("div", "nc-wrap");
  const top = element("div", "nc-top");
  const heading = element("h2", "nc-heading", "Коллекции");
  heading.id = "nc-heading";
  const controls = element("div", "nc-controls");
  const previous = button("Предыдущая коллекция", "←", "nc-arrow");
  const next = button("Следующая коллекция", "→", "nc-arrow");
  controls.append(previous, next);
  top.append(heading, controls);
  const strip = element("ul", "nc-strip");
  strip.setAttribute("aria-label", "Пять коллекций NERU");
  const dialog = element("dialog", "nc-dialog");
  dialog.setAttribute("aria-labelledby", "nc-dialog-heading");
  const dismiss = button("Закрыть коллекцию", "×", "nc-dismiss");
  const panel = element("div", "nc-panel");
  dialog.append(dismiss, panel);
  dismiss.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });

  function openCollection(item) {
    const copy = element("div", "nc-copy");
    const title = element("h3", "nc-title", item.title);
    title.id = "nc-dialog-heading";
    const products = element("ul", "nc-products");
    for (const name of item.items) products.append(element("li", null, name));
    copy.append(title, element("p", "nc-detail", item.detail), products);
    panel.replaceChildren(picture(item, false), copy);
    dialog.showModal();
  }

  for (const item of collections) {
    const row = element("li", "nc-card");
    const trigger = button("Посмотреть коллекцию «" + item.title + "»", "", "nc-trigger");
    const label = element("span", "nc-caption");
    const arrow = element("span", "nc-out", "↗");
    arrow.setAttribute("aria-hidden", "true");
    label.append(element("span", "", item.title), arrow);
    trigger.append(picture(item), label);
    trigger.addEventListener("click", () => openCollection(item));
    row.append(trigger);
    strip.append(row);
  }

  layout.append(top, strip, dialog);
  root.append(layout);

  function syncArrows() {
    const maxOffset = strip.scrollWidth - strip.clientWidth;
    previous.disabled = strip.scrollLeft < 2;
    next.disabled = strip.scrollLeft >= maxOffset - 2;
    controls.hidden = maxOffset <= 2;
  }
  function scrollCards(direction) {
    const distance = strip.children[1].offsetLeft - strip.children[0].offsetLeft;
    strip.scrollBy({
      left: distance * direction,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  }

  previous.addEventListener("click", () => scrollCards(-1));
  next.addEventListener("click", () => scrollCards(1));
  strip.addEventListener("scroll", syncArrows, { passive: true });
  new ResizeObserver(syncArrows).observe(strip);
  syncArrows();
})();
