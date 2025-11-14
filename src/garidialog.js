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
