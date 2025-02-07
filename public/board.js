const path = window.location.pathname;
const match = path.match(/\/b\/([^\/]+)/);
const board = match[1];

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("h1-dynamic-child").innerText = board;
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
                            <span>
                                Created on 
                            </span>
                            <span class="thread-created-on">
                                ${thread.created_on}
                            </span>
                        </div>
                        <div class="bumped-on-container">
                            <span>
                                Bumped on 
                            </span>
                            <span class="thread-bumped-on">
                                ${thread.bumped_on}
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
                        ${data.thread.created_on}
                    </span>
                </div>
                <div class="bumped-on-container">
                    <span>
                        Bumped on 
                    </span>
                    <span class="thread-bumped-on">
                        ${data.thread.bumped_on}
                    </span>
                </div>
            </div>
        </div>`;
    thread_title = "";
    thread_password = "";
});