var button = document.querySelector("[data-feed-next]");

if (button) {
  button.addEventListener("click", function () {
    var params = new URLSearchParams(window.location.search);
    var page = params.get("page");
    var limit = params.get("limit") || "";
    var sort = params.get("sort") || "";
    var search = params.get("search") || "";
    window.location.href =
      "feed.html?page=" +
      (parseInt(page) + 1) +
      "&limit=" +
      encodeURIComponent(limit) +
      "&sort=" +
      encodeURIComponent(sort) +
      "&search=" +
      encodeURIComponent(search);
  });
}
