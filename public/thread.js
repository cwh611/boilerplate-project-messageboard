const path = window.location.pathname;
const match = path.match(/\/b\/([^\/]+)\/([^\/]+)/);
const board = match[1];
const thread_id = match[2];

const report_function = async (replyId) => {
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

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("h1-dynamic-child").innerText = board;
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}?thread_id=${thread_id}`);
        const data = await response.json();
        document.getElementById("h2-dynamic-child").innerText = data.text;
        data.replies.forEach(reply => {
            document.getElementById("replies-container").innerHTML +=
                `<div class="reply-container">
                    <div class="reply-date-container">
                        <strong>Posted on <span class="reply-date-span">${reply.created_on}</span></strong>
                    </div>
                    <div class="reply-text">
                        ${reply.text}
                    </div>
                    <button class="report-btn" id="report-btn-${reply._id}" onclick="report_function(${reply._id})">
                        Report
                    </button>
                </div>`
        });
    } catch (err) {
        console.log("Server error:", err);
        alert("Server error:", err)
    }
});

document.getElementById("post-reply-btn").addEventListener("click", async () => {
    const reply_text = document.getElementById("reply-text-input").value;
    try {
        const response = await fetch(`https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/replies/${board}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                thread_id,
                text: reply_text,
            })
        });
        const data = response.json();
        document.getElementById("replies-container").innerHTML +=
            `<div class="reply-container">
                <div class="reply-date-container">
                    <strong>Posted on <span class="reply-date-span">${data.reply.created_on}</span></strong>
                </div>
                <div class="reply-text">
                    ${data.reply.text}
                </div>
                <button class="report-btn" id="report-btn-${data.reply._id}" onclick="report_function(${data.reply._id})">
                    Report
                </button>
            </div>`
    } catch (err) {
        console.log("Server error:", err);
        alert("Server error:", err);
    };
});