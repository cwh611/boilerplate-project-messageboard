const path = window.location.pathname;
const match = path.match(/\/b\/([^\/]+)\/([^\/]+)/);
const board = match[1];
const thread_id = match[2];

const load_threads = async () => {
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}?thread_id=${thread_id}`);
        const data = await response.json();
        document.getElementById("h2-dynamic-child").innerText = data.text;
        data.replies.forEach(reply => {
            document.getElementById("replies-container").innerHTML =
                `<div class="reply-container">
                    <div class="reply-date-container">
                        <strong>Posted on <span class="reply-date-span">${reply.created_on}</span></strong>
                    </div>
                    <div class="reply-text">
                        ${reply.text}
                    </div>
                    <button class="report-btn" id="report-btn-${reply._id}" onclick="report_reply_function(${reply._id})">
                        Report
                    </button>
                    <input id="delete-reply-${reply._id}-password" type="text" size="24" placeholder="password to delete reply">
                    <button class="delete-reply-btn" type="button" onclick="delete_reply_function(${reply._id})">
                        Delete
                    </button>
                </div>`
        });
    } catch (err) {
        console.log("Front end not properly handling server response");
        alert("Front end not properly handling server response")
    }
};

const report_reply_function = async (replyId) => {
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                thread_id,
                reply_id: replyId
            })
        });
        const data = await response.json();
        if (data === "reported") {
            document.getElementById(`report-btn-${replyId}`).disabled = true;
            document.getElementById(`report-btn-${replyId}`).innerText = "Reported";
        } else {
            console.log("Error: server response not 'reported'");
            alert("Error: server response not 'reported'");
        };
    } catch (err) {
        console.log("Server error:", err);
        alert("Server error:", err);        
    };
};

const delete_reply_function = async (replyId) => {
    const password = document.getElementById(`delete-reply-${replyId}-password`).value;
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                thread_id,
                reply_id: replyId,
                delete_password: password
            })
        });
        const data = await response.json();
        if (data === "success") {
            load_threads();
            console.log(`Reply ${replyId} successfully deleted from thread ${thread_id} (${board})`)
        } else {
            alert("Error: delete not successful");
            console.log("Error: delete not successful");
        }
    } catch (err) {
        alert("Server error:", err);
        console.log("Server error:", err);
    };
};

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("h1-dynamic-child").innerText = board;
    load_threads();
});

document.getElementById("post-reply-btn").addEventListener("click", async () => {
    const reply_text = document.getElementById("reply-text-input").value;
    const reply_password = document.getElementById("reply-password").value;
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                thread_id,
                text: reply_text,
                delete_password: reply_password
            })
        });
        const data = await response.json();
        document.getElementById("replies-container").innerHTML +=
            `<div class="reply-container">
                <div class="reply-date-container">
                    <strong>Posted on <span class="reply-date-span">${data.reply.created_on}</span></strong>
                </div>
                <div class="reply-text">
                    ${data.reply.text}
                </div>
                <button class="report-btn" id="report-btn-${data.reply._id}" onclick="report_reply_function(${data.reply._id})">
                    Report
                </button>
                <input id="delete-reply-${data.reply._id}-password" type="text" size="24" placeholder="password to delete reply">
                <button class="delete-reply-btn" type="button" onclick="delete_reply_function(${data.reply._id})">
                    Delete
                </button>
            </div>`
    } catch (err) {
        console.log(err);
        alert(err);
    };
});

document.getElementById("report-thread-btn").addEventListener("click", async () => {
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({thread_id})
            }
        );
        const data = await response.json();
        if (data === "reported") {
            document.getElementById("report-thread-btn").disabled = true;
            document.getElementById("report-thread-btn").innerText = "Reported";
        } else {
            alert("Error: server response not 'reported'");
            console.log("Error: server response not 'reported'");
        }
    } catch (err) {
        alert("Server error:", err);
        console.log("Server error:", err);
    }
});

document.getElementById("delete-thread-btn").addEventListener("click", async () => {
    const password = document.getElementById("thread-password").value;
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                thread_id,
                delete_password: password
            })
        });
        const data = await response.json();
        if (data === "success") {
            window.location.href = `https://chunk-messageboard-09594f5bef7e.herokuapp.com/b/${board}`;
            console.log(`Thread ${thread_id} successfully deleted from ${board}`);
        } else {
            alert("Error: delete not successful");
            console.log("Error: delete not successful");
        };
    } catch (err) {
        alert("Server error:", err);
        console.log("Server error:", err);
    };
});