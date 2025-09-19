// ===== Language Switch =====
let currentLang = localStorage.getItem("lang") || "en";
setLanguage(currentLang);

async function setLanguage(lang) {
  const response = await fetch(`lang-${lang}.json`);
  const translations = await response.json();

  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.getAttribute("data-key");
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });

  // Save for later
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
  localStorage.setItem("lang", lang);

  // Update task count translation if on home page
  if (document.getElementById("taskCount")) {
    renderTodos();
  }
}

// ===== User Helpers =====
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// ===== Register =====
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", e => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!firstName || !lastName || !email || !password) {
      alert("All fields are required!");
      return;
    }

    let users = getUsers();
    if (users.find(u => u.email === email)) {
      alert("Email already exists!");
      return;
    }

    const newUser = { firstName, lastName, email, password, todos: [] };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem("currentUser", email);
    window.location.href = "home.html";
  });
}

// ===== Login =====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    let users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("User not found! Please register.");
      return;
    }

    localStorage.setItem("currentUser", email);
    window.location.href = "home.html";
  });
}

// ===== Home / Todo =====
const todoForm = document.getElementById("todoForm");
if (todoForm) {
  const currentUserEmail = localStorage.getItem("currentUser");
  if (!currentUserEmail) window.location.href = "login.html";

  let users = getUsers();
  let currentUser = users.find(u => u.email === currentUserEmail);

  const todoInput = document.getElementById("todoInput");
  const todoList = document.getElementById("todoList");
  const taskCount = document.getElementById("taskCount");

  function renderTodos() {
    todoList.innerHTML = "";
    let completedCount = 0;

    currentUser.todos.forEach((todo, index) => {
      if (todo.completed) completedCount++;

      const li = document.createElement("li");
      if (todo.completed) li.classList.add("completed");

      const textSpan = document.createElement("span");
      textSpan.textContent = todo.text;
      li.appendChild(textSpan);

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      // Complete
      const completeBtn = document.createElement("button");
      completeBtn.textContent = "✔";
      completeBtn.className = "btn";
      completeBtn.onclick = () => {
        currentUser.todos[index].completed = !todo.completed;
        saveUsers(users);
        renderTodos();
      };

      // Edit
      const editBtn = document.createElement("button");
      editBtn.textContent = "✎";
      editBtn.className = "btn";
      editBtn.onclick = () => {
        const newText = prompt("Edit task:", todo.text);
        if (newText !== null && newText.trim() !== "") {
          currentUser.todos[index].text = newText.trim();
          saveUsers(users);
          renderTodos();
        }
      };

      // Delete
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✖";
      deleteBtn.className = "btn";
      deleteBtn.onclick = () => {
        currentUser.todos.splice(index, 1);
        saveUsers(users);
        renderTodos();
      };

      actions.appendChild(completeBtn);
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(actions);
      todoList.appendChild(li);
    });

    // Update count with translation
    const lang = localStorage.getItem("lang") || "en";
    fetch(`lang-${lang}.json`)
      .then(res => res.json())
      .then(tr => {
        taskCount.textContent = tr["task_count"]
          .replace("{completed}", completedCount)
          .replace("{total}", currentUser.todos.length);
      });
  }

  renderTodos();

  todoForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    currentUser.todos.push({ text, completed: false });
    saveUsers(users);
    todoInput.value = "";
    renderTodos();
  });
}

// ===== Logout =====
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
