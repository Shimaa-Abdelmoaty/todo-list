class Task {
  constructor({ id = null, title = "", completed = false } = {}) {
    this.id = id ?? "t_" + Math.random().toString(36).slice(2, 9);
    this.title = title;
    this.completed = completed;
  }
}

class TodoList {
  constructor(owner) {
    this.key = `tasks_${owner}`;
    this.tasks = this.load();
  }
  load() {
    return JSON.parse(localStorage.getItem(this.key) || "[]").map(
      (t) => new Task(t)
    );
  }
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.tasks));
  }
  add(title) {
    this.tasks.unshift(new Task({ title }));
    this.save();
  }
  toggle(id) {
    this.tasks = this.tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    this.save();
  }
  remove(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.save();
  }
  clearCompleted() {
    this.tasks = this.tasks.filter((t) => !t.completed);
    this.save();
  }
  clearAll() {
    this.tasks = [];
    this.save();
  }
}

const currentEmail = localStorage.getItem("currentUserEmail");
if (!currentEmail) window.location.href = "login.html";

const todoList = new TodoList(currentEmail);
const listEl = document.getElementById("todoList");
const totalEl = document.getElementById("totalCount");
const compEl = document.getElementById("completedCount");

function render() {
  listEl.innerHTML = "";
  if (todoList.tasks.length === 0) {
    listEl.innerHTML = `<li class="empty">No tasks yet</li>`;
  } else {
    todoList.tasks.forEach((t) => {
      const li = document.createElement("li");
      li.className = "todo" + (t.completed ? " completed" : "");
      li.innerHTML = `
        <input type="checkbox" ${t.completed ? "checked" : ""}>
        <span class="title">${t.title}</span>
        <div class="actions">
          <button class="icon del">🗑️</button>
        </div>`;
      li.querySelector("input").addEventListener("change", () => {
        todoList.toggle(t.id);
        render();
      });
      li.querySelector(".del").addEventListener("click", () => {
        todoList.remove(t.id);
        render();
      });
      listEl.appendChild(li);
    });
  }
  totalEl.textContent = todoList.tasks.length;
  compEl.textContent = todoList.tasks.filter((t) => t.completed).length;
}

document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const val = document.getElementById("taskInput").value.trim();
  if (!val) return;
  todoList.add(val);
  document.getElementById("taskInput").value = "";
  render();
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  todoList.clearCompleted();
  render();
});
document.getElementById("clearAll").addEventListener("click", () => {
  todoList.clearAll();
  render();
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUserEmail");
  window.location.href = "login.html";
});

render();
