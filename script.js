const API_BASE_URL = "https://www.crudify.dev/api/v1/todo-lists"
const ACCESS_TOKEN = "your-api-token-here"; // Replace with your actual access token

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");

// Fetch all todos
async function fetchTodos() {
    try {
        const response = await fetch(API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });
        const todos = await response.json();
        renderTodos(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        todoList.innerHTML = "<p>Failed to load todos.</p>";
    }
}

// Render todos
function renderTodos(todos) {
    todoList.innerHTML = "";
    todos.forEach((todo) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="${todo.isDone ? "completed" : ""}">${todo.task}</span>
            <div class="todo-actions">
                <button class="edit" data-id="${todo.id}">Edit</button>
                <button class="delete" data-id="${todo.id}">Delete</button>
                <button class="complete" data-id="${todo.id}" data-done="${todo.isDone}">
                    ${todo.isDone ? "Undo" : "Complete"}
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

// Add new todo
todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const task = todoInput.value.trim();
    if (!task) return;

    const submitButton = todoForm.querySelector("button");
    submitButton.textContent = "Adding...";
    submitButton.disabled = true;

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ task }),
        });
        const newTodo = await response.json();
        todoInput.value = "";
        fetchTodos();
    } catch (error) {
        console.error("Error adding todo:", error);
    } finally {
        submitButton.textContent = "Add Task";
        submitButton.disabled = false;
    }
});

// Edit todo
async function editTodo(id, newTask, button) {
    button.textContent = "Updating...";
    button.disabled = true;

    try {
        await fetch(`${API_BASE_URL}/${id}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ task: newTask }),
        });
        fetchTodos();
    } catch (error) {
        console.error("Error editing todo:", error);
    } finally {
        button.textContent = "Edit";
        button.disabled = false;
    }
}

// Delete todo
async function deleteTodo(id, button) {
    button.textContent = "Deleting...";
    button.disabled = true;

    try {
        await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });
        fetchTodos();
    } catch (error) {
        console.error("Error deleting todo:", error);
    } finally {
        button.textContent = "Delete";
        button.disabled = false;
    }
}

// Toggle todo completion
async function toggleTodoCompletion(id, isDone, button) {
    button.textContent = "Updating...";
    button.disabled = true;

    try {
        await fetch(`${API_BASE_URL}/${id}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ isDone: !isDone }),
        });
        fetchTodos();
    } catch (error) {
        console.error("Error toggling todo completion:", error);
    } finally {
        button.textContent = isDone ? "Complete" : "Undo";
        button.disabled = false;
    }
}

// Event delegation for edit, delete, and complete actions
todoList.addEventListener("click", async (e) => {
    const button = e.target;
    if (button.classList.contains("edit")) {
        const id = button.getAttribute("data-id");
        const newTask = prompt("Enter new task:");
        if (newTask) {
            await editTodo(id, newTask, button);
        }
    } else if (button.classList.contains("delete")) {
        const id = button.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteTodo(id, button);
        }
    } else if (button.classList.contains("complete")) {
        const id = button.getAttribute("data-id");
        const isDone = button.getAttribute("data-done") === "true";
        await toggleTodoCompletion(id, isDone, button);
    }
});

// Initial fetch of todos
fetchTodos();
