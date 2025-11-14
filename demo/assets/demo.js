function demoAlert() {
    GariDialog({
        title: "Hello!",
        text: "This is a simple alert dialog.",
        color: "primary",
        icon: "fa-solid fa-bell",
        close: "Got it"
    });
}

function demoConfirm() {
    GariDialog({
        title: "Are you sure?",
        text: "Do you really want to continue?",
        color: "warning",
        icon: "fa-solid fa-triangle-exclamation",
        close: "Cancel",
        actions: {
            confirm: "Yes, continue"
        }
    }).then(r => console.log(r));
}

function demoPrompt() {
    GariDialog({
        title: "Enter Your Name",
        color: "success",
        icon: "fa-solid fa-user",
        actions: { ok: "Submit" },
        close: "Cancel",
        promptInput: [
            {
                type: "text",
                placeholder: "Your name...",
                label: "Name",
                name: "name"
            }
        ]
    }).then(r => console.log(r));
}

function demoFullscreen() {
    GariDialog({
        title: "Fullscreen Mode",
        text: "This dialog covers the full screen.",
        icon: "fa-solid fa-expand",
        size: "fullscreen",
        color: "dark",
        close: "Close"
    });
}

function demoCustomIcon() {
    GariDialog({
        title: "Emoji Icon",
        text: "You can even use emoji!",
        icon: "🔥",
        color: "danger",
        close: "Nice!"
    });
}
