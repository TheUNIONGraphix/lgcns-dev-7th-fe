window.APP_ENV = "local";

window.API_BASE = {
  local: "http://localhost:3000",
  develop: "http://localhost:3000",
};

window.apiBaseUrl = window.API_BASE[window.APP_ENV] || window.API_BASE.local;
