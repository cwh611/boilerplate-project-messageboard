const path = window.location.pathname;
const match = path.match(/\/b\/([^\/]+)/);
const board = match[1];

const iso_to_readable = (date) => {
    const date_object = new Date(date);
    const readable_date = date_object.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZoneName: "short"
    });
    return readable_date;
}

window.addEventListener("pageshow", async () => {
    document.getElementById("h1-dynamic-child").innerText = decodeURIComponent(board);
    document.getElementById("threads-container").innerHTML = "";
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/threads/${board}`);
        const data = await response.json();
        data.forEach(thread => {
            document.getElementById("threads-container").innerHTML += 
                `<div class="thread-container">
                    <span class="thread-title">
                        <strong>
                            <a href="https://chunk-messageboard-09594f5bef7e.herokuapp.com/b/${board}/${thread._id}">
                                ${thread.text}
                            </a>
                        </strong>
                    </span>
                    <div class="thread-subcontainer">
                        <div class="created-on-container">
                            <span class="created-on-static">
                                Created on 
                            </span>
                            <span class="thread-created-on">
                                ${iso_to_readable(thread.created_on)}
                            </span>
                        </div>
                        <div class="bumped-on-container">
                            <span class="bumped-on-static">
                                Bumped on 
                            </span>
                            <span class="thread-bumped-on">
                                ${iso_to_readable(thread.bumped_on)}
                            </span>
                        </div>
                    </div>
                </div>`
        })
    } catch (err) {
        alert("Server error loading threads:", err)
    }
});

document.getElementById("create-thread-btn").addEventListener("click", async () => {
    let thread_title = document.getElementById("thread-title-input").value;
    let thread_password = document.getElementById("thread-password-input").value;
    if (!thread_title || !thread_password) {
        alert("Thread title and password to delete are required");
        return;
    };
    const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/threads/${board}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text: thread_title,
            delete_password: thread_password
        })
    });
    const data = await response.json();
    document.getElementById("threads-container").innerHTML += 
        `<div class="thread-container">
            <span class="thread-title">
                <strong>
                    <a href="https://chunk-messageboard-09594f5bef7e.herokuapp.com/b/${board}/${data.thread._id}">
                        ${data.thread.text}
                    </a>
                </strong>
            </span>
            <div class="thread-subcontainer">
                <div class="created-on-container">
                    <span>
                        Created on 
                    </span>
                    <span class="thread-created-on">
                        ${iso_to_readable(data.thread.created_on)}
                    </span>
                </div>
                <div class="bumped-on-container">
                    <span>
                        Bumped on 
                    </span>
                    <span class="thread-bumped-on">
                        ${iso_to_readable(data.thread.bumped_on)}
                    </span>
                </div>
            </div>
        </div>`;
        document.getElementById("thread-title-input").value = "";
        document.getElementById("thread-password-input").value = "";
});