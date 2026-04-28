// Pequeña utilidad para mostrar/ocultar la contraseña del campo de login demo
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("togglePassword");
  const field = document.getElementById("passwordField");

  if (toggle && field) {
    toggle.addEventListener("click", () => {
      const isPassword = field.getAttribute("type") === "password";
      field.setAttribute("type", isPassword ? "text" : "password");
      toggle.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
    });
  }
});
