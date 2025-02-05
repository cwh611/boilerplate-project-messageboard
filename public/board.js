document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;
    const match = path.match(/\/b\/([^\/]+)/);
    const board = match[1];
    try {
        const response = await fetch(`/api/threads/${board}`);
        const data = await response.json();
        data.forEach(thread => {
            document.getElementById("threads-container").innerHTML += 
                `<div class="thread-container">
                    <span class="thread-title">
                        <strong>
                            <a href="/b/${board}/${thread._id}">
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