const API_LOGIN = "http://127.0.0.1:8000/login/";

document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("http://127.0.0.1:8000/api/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: usuario, password }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } else {
    alert("Credenciales incorrectas ❌");
  }
});
