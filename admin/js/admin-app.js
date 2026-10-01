async function checkSession(){
  try{
    const { admin } = await Api.me();
    CURRENT_ADMIN = admin;
    showAdminShell();
  }catch(e){
    showLoginScreen();
  }
}

function showLoginScreen(){
  $("#loginScreen").style.display = "flex";
  $("#adminShell").style.display = "none";
}

function showAdminShell(){
  $("#loginScreen").style.display = "none";
  $("#adminShell").style.display = "grid";
  $("#adminUserLabel").textContent = CURRENT_ADMIN ? `${CURRENT_ADMIN.nombre} · ${CURRENT_ADMIN.email}` : "";
  adminRouter();
}

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const errBox = $("#loginError");
  errBox.style.display = "none";
  try{
    const res = await Api.login(data.email, data.password);
    CURRENT_ADMIN = res.admin;
    showAdminShell();
  }catch(err){
    errBox.textContent = err.message || "No pudimos iniciar sesión.";
    errBox.style.display = "block";
  }
});

$("#logoutBtn").addEventListener("click", async () => {
  await Api.logout();
  CURRENT_ADMIN = null;
  location.hash = "";
  showLoginScreen();
});

window.addEventListener("hashchange", adminRouter);
window.addEventListener("DOMContentLoaded", checkSession);
