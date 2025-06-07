// ========== GLOBAL VARIABLES ==========
const LoginBtn = document.getElementById("loginBtn");
const SignUpBtn = document.getElementById("SignUpBtn");
const passBtn = document.getElementById("passBtn");
const userpage = document.querySelector(".SignUp-section");
const main = document.querySelector(".main");
const submitincomeBtn = document.getElementById("submitincome");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const addexpbtn = document.getElementById("add-expense-btn");

let currentUserEmail = localStorage.getItem("currentUser") || "";
let totalExpenses = 0;
let expenseList = [];

// ========== EVENT LISTENERS ==========
LoginBtn.addEventListener("click", handleLogin);
SignUpBtn.addEventListener("click", handleSignUp);
passBtn.addEventListener("click", togglePasswordVisibility);
submitincomeBtn.addEventListener("click", submitIncome);
addExpenseBtn.addEventListener("click", addExpense);
addexpbtn.addEventListener("click", toggleExpensePopup);

// ========== AUTHENTICATION ==========
function handleSignUp() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("useremail").value.trim();
    const password = document.getElementById("userpass").value;

    if (!username || !email || !password) return alert("All fields are required!");
    if (localStorage.getItem(email)) return alert("User already exists. Try to log in.");

    const newUserData = { username, email, password };
    localStorage.setItem(email, JSON.stringify(newUserData));
    localStorage.setItem("currentUser", email);
    currentUserEmail = email;

    document.getElementById("nav-user").innerText = username;
    document.querySelector(".UserName").innerText = username;
    togglePageVisibility();
}

function handleLogin() {
    const email = document.getElementById("useremail").value.trim();
    const password = document.getElementById("userpass").value;

    if (!email || !password) return alert("All fields are required!");

    const storedUser = localStorage.getItem(email);
    if (!storedUser) return alert("User does not exist.");

    const userData = JSON.parse(storedUser);
    if (userData.password !== password) return alert("Incorrect password.");

    alert(`Welcome back ${userData.username}`);
    currentUserEmail = email;
    localStorage.setItem("currentUser", email);

    document.getElementById("nav-user").innerText = userData.username;
    document.querySelector(".UserName").innerText = userData.username;
    togglePageVisibility();

    loadUserData();
}

function togglePasswordVisibility(e) {
    e.preventDefault();
    const passwordField = document.getElementById("userpass");
    const currentType = passwordField.getAttribute("type");
    passwordField.setAttribute("type", currentType === "password" ? "text" : "password");
}

function togglePageVisibility() {
    userpage.classList.add("hide");
    main.classList.remove("hide");
    document.querySelector(".user").classList.remove("hide");
    document.querySelector(".menu").classList.remove("hide");
    document.querySelector(".add-expense").classList.remove("hide");
}

// ========== USER DATA HANDLING ==========
function loadUserData() {
    const savedIncome = localStorage.getItem(`${currentUserEmail}_income`) || 0;
    document.getElementById("showIncome").innerText = savedIncome;
    document.getElementById("incomeinput").value = savedIncome;

    expenseList = JSON.parse(localStorage.getItem(`${currentUserEmail}_expenses`)) || [];
    totalExpenses = expenseList.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById("showExpense").innerText = totalExpenses;

    updateBalance();
    renderTable();
}

// ========== INCOME ==========
function handleIncomeToggle() {
    const incomeForm = document.querySelector(".incomeform");

    if (!incomeForm.classList.contains("visible")) {
        incomeForm.style.display = "flex";
        requestAnimationFrame(() => incomeForm.classList.add("visible"));
    } else {
        incomeForm.classList.remove("visible");
        incomeForm.addEventListener("transitionend", () => {
            incomeForm.style.display = "none";
        }, { once: true });
    }
}

function submitIncome(e) {
    e.preventDefault();
    const income = parseFloat(document.getElementById("incomeinput").value.trim());
    if (isNaN(income)) return alert("Enter only numbers");

    localStorage.setItem(`${currentUserEmail}_income`, income);
    document.getElementById("showIncome").innerText = income;
    updateBalance();
    handleIncomeToggle();
}

// ========== EXPENSE ==========
function addExpense(e) {
    e.preventDefault();

    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("expense-amnt").value.trim());
    const description = document.getElementById("description-input").value;
    const date = document.getElementById("date-input").value;

    if (!category || isNaN(amount) || !date) return alert("All input fields are required!");

    const expense = { category, amount, description, date };
    expenseList.push(expense);
    localStorage.setItem(`${currentUserEmail}_expenses`, JSON.stringify(expenseList));

    totalExpenses += amount;
    document.getElementById("showExpense").innerText = totalExpenses;

    updateBalance();
    renderTable();
    resetExpenseForm();
    toggleExpensePopup();
}

function resetExpenseForm() {
    document.getElementById("category").value = "Transportation";
    document.getElementById("expense-amnt").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("date-input").value = "";
}

function deleteRow(button) {
    const rowIndex = button.closest("tr").rowIndex - 1;
    totalExpenses -= expenseList[rowIndex].amount;
    expenseList.splice(rowIndex, 1);

    localStorage.setItem(`${currentUserEmail}_expenses`, JSON.stringify(expenseList));
    document.getElementById("showExpense").innerText = totalExpenses;
    updateBalance();
    renderTable();
}

function updateBalance() {
    const income = parseFloat(document.getElementById("incomeinput").value.trim()) || 0;
    document.getElementById("showBalance").innerText = income - totalExpenses;
}

function renderTable() {
    const tableBody = document.getElementById("expensebody");
    tableBody.innerHTML = "";

    expenseList.forEach((exp, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${exp.category}</td>
            <td>${exp.amount}</td>
            <td>${exp.description}</td>
            <td>${exp.date}</td>
            <td><button type="button" class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// ========== UI TOGGLES ==========
function toggleExpensePopup(e) {
    if (e) e.preventDefault();
    const inputPage = document.querySelector(".input-page");
    inputPage.style.display = inputPage.style.display === "none" ? "flex" : "none";
    document.querySelector(".main-table").classList.remove("hide");
}

function showLogout() {
    document.querySelector(".logout-popup").classList.toggle("slide");
}

function logOut() {
    userpage.classList.remove("hide");
    main.classList.add("hide");
    document.querySelector(".logout-popup").classList.remove("slide");
    document.querySelector(".user").classList.add("hide");
    document.querySelector(".menu").classList.add("hide");
    document.querySelector(".add-expense").classList.add("hide");
}
