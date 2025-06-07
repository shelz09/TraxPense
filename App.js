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

LoginBtn.addEventListener("click", HandleLogin);
SignUpBtn.addEventListener("click", HandleSignUp);
passBtn.addEventListener("click", HideSee);
submitincomeBtn.addEventListener("click", Submitincome);
addExpenseBtn.addEventListener("click", AddExpense);
addexpbtn.addEventListener("click", showPopUp);

// ========== USER AUTH FUNCTIONS ==========

function HandleSignUp() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("useremail").value.trim();
  const password = document.getElementById("userpass").value;

  if (!username || !email || !password) {
    alert("All fields are required!");
    return;
  }

  if (localStorage.getItem(email)) {
    alert("User already exists. Try to log in.");
    return;
  }

  const newuserdata = { username, email, password };
  localStorage.setItem(email, JSON.stringify(newuserdata));
  alert("Sign-up successful!");

  document.getElementById("nav-user").innerText = username;
  document.querySelector(".UserName").innerText = username;

  userpage.classList.add("hide");
  main.classList.remove("hide");

  currentUserEmail = email;
  localStorage.setItem("currentUser", email);

  document.querySelector(".user").classList.remove("hide");
  document.querySelector(".menu").classList.remove("hide");
  document.querySelector(".add-expense").classList.remove("hide");
}

function HandleLogin() {
  const email = document.getElementById("useremail").value.trim();
  const password = document.getElementById("userpass").value;

  if (!email || !password) {
    alert("All fields are required!");
    return;
  }

  const storeduser = localStorage.getItem(email);
  if (!storeduser) {
    alert("User does not exist.");
    return;
  }

  const userdata = JSON.parse(storeduser);
  if (userdata.password !== password) {
    alert("Incorrect password.");
    return;
  }

  alert(`Welcome back ${userdata.username}`);
  document.getElementById("nav-user").innerText = userdata.username;

  userpage.classList.add("hide");
  main.classList.remove("hide");

  currentUserEmail = email;
  localStorage.setItem("currentUser", email);

  // Load income
  const savedIncome = localStorage.getItem(`${email}_income`) || "0";
  document.getElementById("showIncome").innerText = savedIncome;
  document.getElementById("incomeinput").value = savedIncome;

  // Load expenses
  expenseList = JSON.parse(localStorage.getItem(`${email}_expenses`)) || [];
  totalExpenses = expenseList.reduce((sum, exp) => sum + exp.amount, 0);
  document.getElementById("showExpense").innerText = totalExpenses;

  // Show balance
  const income = parseFloat(savedIncome) || 0;
  document.getElementById("showBalance").innerText = income - totalExpenses;

  renderTable();

  document.querySelector(".user").classList.remove("hide");
  document.querySelector(".menu").classList.remove("hide");
  document.querySelector(".add-expense").classList.remove("hide");
  document.querySelector(".UserName").innerText = `${userdata.username}`;
}

function HideSee(e) {
  e.preventDefault();
  const password = document.getElementById("userpass");
  const type = password.getAttribute("type");
  password.setAttribute("type", type === "password" ? "text" : "password");
}

// ========== INCOME FUNCTIONS ==========

function HandleIncome() {
  const incomepage = document.querySelector(".incomeform");

  if (!incomepage.classList.contains("visible")) {
    incomepage.style.display = "flex";
    requestAnimationFrame(() => incomepage.classList.add("visible"));
  } else {
    incomepage.classList.remove("visible");
    incomepage.addEventListener(
      "transitionend",
      () => (incomepage.style.display = "none"),
      { once: true }
    );
  }
}

function Submitincome(e) {
  e.preventDefault();
  const incomeinput = document.getElementById("incomeinput").value.trim();

  if (!incomeinput) {
    alert("You have to enter something");
    return;
  }
  if (isNaN(incomeinput)) {
    alert("Enter only numbers");
    return;
  }

  document.getElementById("showIncome").innerText = incomeinput;
  localStorage.setItem(`${currentUserEmail}_income`, incomeinput);

  const income = parseFloat(incomeinput);
  const balance = document.getElementById("showBalance");
  balance.innerText = income - totalExpenses;

  const incomepage = document.querySelector(".incomeform");
  incomepage.classList.remove("visible");
  incomepage.addEventListener(
    "transitionend",
    () => (incomepage.style.display = "none"),
    { once: true }
  );
}

// ========== EXPENSE FUNCTIONS ==========

function AddExpense(e) {
  e.preventDefault();

  const category = document.getElementById("category").value;
  const amount = document.getElementById("expense-amnt").value.trim();
  const description = document.getElementById("description-input").value;
  const date = document.getElementById("date-input").value;

  if (!category || !amount || !date) {
    alert("All input fields are required!");
    return;
  }

  const amountNum = parseFloat(amount);
  const expense = { category, amount: amountNum, description, date };

  expenseList.push(expense);
  localStorage.setItem(`${currentUserEmail}_expenses`, JSON.stringify(expenseList));

  totalExpenses += amountNum;
  document.getElementById("showExpense").innerText = totalExpenses;

  const income = parseFloat(document.getElementById("incomeinput").value.trim()) || 0;
  document.getElementById("showBalance").innerText = income - totalExpenses;

  renderTable();

  // Reset form
  document.getElementById("category").value = "Transportation";
  document.getElementById("expense-amnt").value = "";
  document.getElementById("description-input").value = "";
  document.getElementById("date-input").value = "";

  // Hide input popup
  document.querySelector(".input-page").style.display = "none";
}

function deleteRow(button) {
  const row = button.closest("tr");
  const index = row.rowIndex - 1; // header is row 0

  const amountNum = expenseList[index]?.amount || 0;
  totalExpenses -= amountNum;
  document.getElementById("showExpense").innerText = totalExpenses;

  expenseList.splice(index, 1);
  localStorage.setItem(`${currentUserEmail}_expenses`, JSON.stringify(expenseList));

  renderTable();
  updateBalance();
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

// ========== POP-UP TOGGLE ==========

function showPopUp(e) {
  e.preventDefault();

  const inputPage = document.querySelector(".input-page");
  inputPage.style.display = getComputedStyle(inputPage).display === "none" ? "flex" : "none";

  document.querySelector(".main-table").classList.remove("hide");
}

function showLogout() {
  document.querySelector(".logout-popup").classList.toggle("slide");
}

function logOut() {
  userpage.classList.remove("hide");
  main.classList.add("hide");
  document.querySelector(".logout-popup").classList.toggle("slide");
  document.querySelector(".user").classList.add("hide");
  document.querySelector(".menu").classList.add("hide");
  document.querySelector(".add-expense").classList.add("hide");
}
