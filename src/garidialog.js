let openGariDialogs = false;
let currentBackdrop = null;

function GariDialog({
    title = "",
    text = "",
    html = "",
    color = "primary",
    icon = "",
    actions = {},
    actionsColor = "",
    backdrop = "blur",
    size = "lg",
    close = "Close",
    escape = true,
    autoSelect = true,
    promptInput = [],
    sound = false,
} = {}) {
    return new Promise((resolve) => {
        if (openGariDialogs && currentBackdrop) {
            closeDialog(currentBackdrop, () => showDialog());
        } else showDialog();

        function showDialog() {
            openGariDialogs = true;

            const colors = {
                primary: "#027be3",
                secondary: "#6c757d",
                success: "#21ba45",
                danger: "#c10015",
                warning: "#f2c037",
                info: "#0dcaf0",
                light: "#f8f9fa",
                dark: "#212529",
            };

            const colorHex = color.startsWith("#") ? color : colors[color] || colors.primary;
            if (!actionsColor) actionsColor = color;

            const backdropDiv = document.createElement("div");
            backdropDiv.className = "gari-backdrop";
            if (backdrop !== "blur") {
                backdropDiv.style.backdropFilter = "none";
                backdropDiv.style.background = backdrop;
            }
            currentBackdrop = backdropDiv;

            const card = document.createElement("div");
            card.className = `gari-card gari-size-${size}`;
            backdropDiv.appendChild(card);

            const contentHTML = document.createElement("div");
            contentHTML.className = size === "fullscreen" ? "gari-fullscreen-content" : "gari-card-section";
            card.appendChild(contentHTML);

            const headerRow = document.createElement("div");
            headerRow.className = "gari-header-row";
            contentHTML.appendChild(headerRow);

            if (icon) headerRow.appendChild(createIconElement(icon, colorHex));

            if (title) {
                const titleEl = document.createElement("h4");
                titleEl.textContent = title;
                headerRow.appendChild(titleEl);
            }

            const contentDiv = document.createElement("div");
            contentDiv.className = "gari-content";

            if (html) contentDiv.insertAdjacentHTML("beforeend", html);
            else if (text) contentDiv.insertAdjacentHTML("beforeend", `<p>${text}</p>`);

            promptInput.forEach(input => contentDiv.appendChild(
                createPromptInput(input.type, input.placeholder, input.defaultValue, input.label)
            ));

            contentHTML.appendChild(contentDiv);

            const actionsDiv = document.createElement("div");
            actionsDiv.className = size === "fullscreen" ? "gari-fullscreen-actions" : "gari-card-actions";
            card.appendChild(actionsDiv);

            if (close) {
                const closeBtn = document.createElement("button");
                closeBtn.className = "gari-btn";
                closeBtn.style.setProperty("--btn-color", colors[actionsColor] || actionsColor);
                closeBtn.textContent = close;
                closeBtn.addEventListener("click", () => closeDialog(backdropDiv, () => resolve({ closed: true })));
                actionsDiv.appendChild(closeBtn);
            }

            let actionCount = 0;
            for (const key in actions) {
                if (actionCount >= 4) break;
                const btn = document.createElement("button");
                btn.className = "gari-btn";
                btn.style.setProperty("--btn-color", colors[actionsColor] || actionsColor);
                btn.textContent = actions[key];
                btn.addEventListener("click", () => {
                    const inputs = {};
                    promptInput.forEach((input, i) => {
                        const el = contentDiv.querySelectorAll(".gari-prompt-input")[i];
                        inputs[input.name || i] = el?.value ?? null;
                    });
                    closeDialog(backdropDiv, () => resolve({ [key]: true, inputs }));
                });
                actionsDiv.appendChild(btn);
                actionCount++;
            }

            if (autoSelect) {
                setTimeout(() => {
                    const lastBtn = actionsDiv.querySelector(".gari-btn:last-child") || card.querySelector(".gari-close-btn");
                    if (lastBtn) lastBtn.focus();
                }, 80);
            }

            if (size === "fullscreen") {
                const closeHeaderBtn = card.querySelector(".gari-close-btn");
                if (closeHeaderBtn) closeHeaderBtn.addEventListener("click", () => closeDialog(backdropDiv, () => resolve({ closed: true })));
            }

            if (escape) {
                const escapeHandler = (e) => {
                    if (e.key === "Escape") {
                        closeDialog(backdropDiv, () => resolve({ closed: true }));
                        document.removeEventListener("keydown", escapeHandler);
                    }
                };
                document.addEventListener("keydown", escapeHandler);
            }

            if (sound) {

                const soundColor = typeof sound === "string" ? sound : color;

                switch (soundColor) {
                    case "success":
                        soundSuccess();
                        break;
                    case "danger":
                        soundError();
                        break;
                    case "warning":
                        soundWarning();
                        break;
                    case "info":
                        soundInfo();
                        break;
                    default:
                        soundDefault();
                }
            }

            document.body.appendChild(backdropDiv);
        }
    });
}

function closeDialog(backdropDiv, callback) {
    openGariDialogs = false;
    backdropDiv.classList.add("gari-fade-out");
    setTimeout(() => {
        backdropDiv.remove();
        if (callback) callback();
    }, 200);
}

function createIconElement(iconName, colorBg) {
    const iconWrapper = document.createElement("div");
    iconWrapper.className = "gari-avatar";
    iconWrapper.style.background = colorBg;
    let iconEl;
    if (!iconName) return iconWrapper;
    if (iconName.startsWith("fa-") || iconName.startsWith("fa ")) iconEl = Object.assign(document.createElement("i"), { className: `fa ${iconName}` });
    else if (iconName.startsWith("bi-")) iconEl = Object.assign(document.createElement("i"), { className: `bi ${iconName}` });
    else if (iconName.length === 1 || iconName.match(/\p{Emoji}/u)) Object.assign(iconEl = document.createElement("span"), { textContent: iconName, style: "font-size:24px" });
    else Object.assign(iconEl = document.createElement("i"), { className: "material-symbols-rounded", textContent: iconName });
    iconWrapper.appendChild(iconEl);
    return iconWrapper;
}

function createPromptInput(type, placeholder = "", defaultValue = "", label = "", name = "") {
    const wrapper = document.createElement("div");
    wrapper.className = "gari-prompt-wrapper";

    if (label) {
        const labelEl = document.createElement("label");
        labelEl.textContent = label;
        wrapper.appendChild(labelEl);
    }

    const inputEl = type === "textarea"
        ? Object.assign(document.createElement("textarea"), { rows: 4 })
        : Object.assign(document.createElement("input"), { type: ["number", "email", "password"].includes(type) ? type : "text" });

    inputEl.placeholder = placeholder;
    inputEl.value = defaultValue;
    inputEl.name = name;
    inputEl.className = "gari-prompt-input";
    wrapper.appendChild(inputEl);

    return wrapper;
}

const ctx = new AudioContext()

function soundWarning() {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 180
    g.gain.setValueAtTime(0.7, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.08)

    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.frequency.value = 220
    g2.gain.setValueAtTime(0.7, ctx.currentTime + 0.12)
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.20)
    o2.connect(g2).connect(ctx.destination)
    o2.start(ctx.currentTime + 0.12)
    o2.stop(ctx.currentTime + 0.20)
}

function soundError() {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 90
    g.gain.setValueAtTime(0.8, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.28)
}

function soundSuccess() {
    function note(freq, offset) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.1);

        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.12);
    }

    note(1400, 0);
    note(1700, 0.06);
}


function soundInfo() {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 260
    g.gain.setValueAtTime(0.5, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.12)
}

function soundDefault() {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 200
    g.gain.setValueAtTime(0.5, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.10)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.10)
}
