const board_list = document.getElementById("existing-board-list");
const create_board_btn = document.getElementById("create-board-btn");
const new_board_input = document.getElementById("board-input");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/load-boards');
        const data = await response.json();
        data.forEach(board => {
            board_list.innerHTML += 
                `<li><a href="https://chunk-messageboard-09594f5bef7e.herokuapp.com/b/${board.name}">${board.name}</a></li>`;
            console.log("board name:", board.name);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

create_board_btn.addEventListener("click", async () => {
    
    const new_board_name = new_board_input.value.trim();
    if (!new_board_name) {
        alert("Board name cannot be empty!");
        return;
    }
    try {
        const response = await fetch("https://chunk-messageboard-09594f5bef7e.herokuapp.com/api/create-board", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_board_name })
        });

        const data = await response.json();
        console.log(data.message);

        if (data.message) {
            board_list.innerHTML += `<li><a href="https://chunk-messageboard-09594f5bef7e.herokuapp.com/b/${new_board_name}">${new_board_name}</a></li>`;
            new_board_input.value = ""; 
        }

    } catch (err) {
        console.error("Server error:", err);
        alert("Server error. Check console for details.");
    }
});
