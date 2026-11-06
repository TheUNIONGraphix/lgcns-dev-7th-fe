function token() {
  return sessionStorage.getItem("accessToken") || "";
}

function headers() {
  var result = { "Content-Type": "application/json" };
  if (token()) result.Authorization = "Bearer " + token();
  return result;
}

async function api(path, options) {
  var response = await fetch(window.apiBaseUrl + path, options || { headers: headers() });
  var data = await response.json().catch(function () {
    return null;
  });
  if (!response.ok || !data || !data.success) {
    throw new Error((data && data.message) || "요청에 실패했습니다.");
  }
  return data.data;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTime(iso) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function excerpt(html) {
  var text = String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length <= 140 ? text : text.slice(0, 140) + "…";
}

function visibleText(html) {
  return excerpt(html).replace(/…$/, "");
}

function card(post, options) {
  var full = options.full;
  var html = String(post.body).trim().charAt(0) === "<";
  var body = full && html
    ? '<div class="post-body ql-editor">' + post.body + "</div>"
    : "<p>" + escapeHtml(full ? post.body : excerpt(post.body)) + "</p>";
  var manage = options.canManage
    ? '<a href="postwrite.html?postId=' + encodeURIComponent(post.id) + '">수정</a>' +
      '<button type="button" class="danger" data-delete="' + post.id + '">삭제</button>'
    : "";
  var view = full
    ? ""
    : '<a class="text-link" href="postdetail.html?postId=' + encodeURIComponent(post.id) + '">보기</a>';
  return (
    '<article class="post-card" data-post="' + post.id + '">' +
    '<header class="post-card-meta"><span>' + escapeHtml(post.authorName) + "</span><time>" +
    formatTime(post.createdAt) + "</time></header>" +
    body +
    '<div class="post-actions">' +
    '<button type="button" class="like-button' + (options.liked ? " is-liked" : "") +
    '" data-like="' + post.id + '">좋아요 ' + post.likeCount + "</button>" +
    "<span>댓글 " + post.commentCount + "</span>" +
    view +
    '<button type="button" class="text-link" data-more="' + post.id + '" aria-expanded="' + (full ? "true" : "false") + '">' +
    (full ? "접기" : "더보기") + "</button>" +
    manage +
    "</div>" +
    '<div class="comments" data-comments="' + post.id + '"' + (full ? "" : " hidden") + ">" +
    commentList(post) +
    '<form class="comment-form" data-comment-form="' + post.id + '">' +
    '<input required maxlength="300" placeholder="댓글" name="body" />' +
    '<button type="submit">등록</button></form></div></article>'
  );
}

function commentList(post) {
  if (!post.comments.length) return '<p class="muted">아직 댓글이 없습니다.</p>';
  return (
    "<ul class='comment-list'>" +
    post.comments
      .map(function (item) {
        return "<li><strong>" + escapeHtml(item.authorName) + "</strong> " + escapeHtml(item.body) + "</li>";
      })
      .join("") +
    "</ul>"
  );
}

function bindCards(root, reload) {
  root.addEventListener("click", async function (event) {
    try {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var more = target.closest("[data-more]");
    if (more) {
      var box = root.querySelector('[data-comments="' + more.getAttribute("data-more") + '"]');
      if (!box) return;
      var open = box.hasAttribute("hidden");
      if (open) box.removeAttribute("hidden");
      else box.setAttribute("hidden", "");
      more.setAttribute("aria-expanded", open ? "true" : "false");
      more.textContent = open ? "접기" : "더보기";
      return;
    }
    var like = target.closest("[data-like]");
    if (like) {
      await api("/api/posts/" + like.getAttribute("data-like") + "/like", {
        method: "POST",
        headers: headers(),
      });
      reload();
      return;
    }
    var remove = target.closest("[data-delete]");
    if (remove && window.confirm("이 글을 삭제할까요?")) {
      await api("/api/posts/" + remove.getAttribute("data-delete"), {
        method: "DELETE",
        headers: headers(),
      });
      if (root.getAttribute("data-posts") === "detail") window.location.href = "posts.html";
      else reload();
    }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "요청에 실패했습니다.");
    }
  });
  root.addEventListener("submit", async function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.hasAttribute("data-comment-form")) return;
    event.preventDefault();
    var input = form.querySelector("input");
    await api("/api/posts/" + form.getAttribute("data-comment-form") + "/comments", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ body: input ? input.value : "" }),
    });
    reload();
  });
}

async function renderList(root) {
  var params = new URLSearchParams(window.location.search);
  var page = Number(params.get("page"));
  if (!Number.isInteger(page) || page < 1) page = 1;
  var sort = params.get("sort") === "ASC" ? "ASC" : "DESC";
  var data = await api("/api/posts?page=" + page + "&sort=" + sort);
  var href = function (nextPage, nextSort) {
    return "posts.html?page=" + nextPage + "&sort=" + nextSort;
  };
  var pages = "";
  for (var item = 1; item <= data.totalPages; item += 1) {
    pages +=
      "<li>" +
      (item === data.currentPage
        ? '<span aria-current="page">' + item + "</span>"
        : '<a class="text-link" href="' + href(item, sort) + '">' + item + "</a>") +
      "</li>";
  }
  root.innerHTML =
    '<div class="post-head"><h1>글</h1><a class="write-button" href="postwrite.html">글쓰기</a></div>' +
    '<div class="sort-links"><a href="' + href(1, "DESC") + '">최신순</a><a href="' + href(1, "ASC") + '">오래된순</a></div>' +
    (data.posts.length
      ? '<section><h2 class="muted">현재 페이지: ' + data.currentPage + " | 정렬: " +
        (sort === "ASC" ? "오래된순" : "최신순") + " | 총 글 수: " + data.totalItems +
        "</h2><ul class='post-list'>" +
        data.posts
          .map(function (post) {
            return "<li>" + card(post, {
              full: false,
              liked: data.likedPostIds.indexOf(post.id) !== -1,
              canManage: post.authorId === data.viewerId,
            }) + "</li>";
          })
          .join("") +
        "</ul></section>"
      : '<p class="muted">아직 글이 없습니다.</p>') +
    (data.totalPages > 1
      ? '<nav class="pager" aria-label="글 목록 페이지">' +
        (data.hasPreviousPage
          ? '<a class="text-link" href="' + href(data.currentPage - 1, sort) + '">이전</a>'
          : '<span class="muted">이전</span>') +
        "<ul>" + pages + "</ul>" +
        (data.hasNextPage
          ? '<a class="text-link" href="' + href(data.currentPage + 1, sort) + '">다음</a>'
          : '<span class="muted">다음</span>') +
        "</nav>"
      : "");
}

async function renderDetail(root) {
  var postId = new URLSearchParams(window.location.search).get("postId") || "";
  var data = await api("/api/posts/" + encodeURIComponent(postId));
  root.innerHTML =
    '<div class="post-head"><h1>글</h1><a class="text-link" href="posts.html">목록</a></div>' +
    card(data.post, { full: true, liked: data.liked, canManage: data.canManage });
}

async function renderWrite(root) {
  var postId = new URLSearchParams(window.location.search).get("postId") || "";
  var initial = "";
  if (postId) {
    var data = await api("/api/posts/" + encodeURIComponent(postId));
    if (!data.canManage) {
      window.location.replace("postdetail.html?postId=" + encodeURIComponent(postId));
      return;
    }
    initial = data.post.body;
  }
  root.innerHTML =
    '<div class="post-head"><h1>' + (postId ? "글 수정" : "글 작성") + "</h1>" +
    '<a class="text-link" href="' +
    (postId ? "postdetail.html?postId=" + encodeURIComponent(postId) : "posts.html") +
    '">' + (postId ? "글로 돌아가기" : "목록") + "</a></div>" +
    '<form id="post-form"><div id="editor"></div>' +
    '<button class="editor-submit" type="submit" disabled>' + (postId ? "수정하기" : "올리기") + "</button></form>" +
    '<p class="muted" data-error hidden></p>';
  var Quill = (await import("https://cdn.jsdelivr.net/npm/quill@2.0.3/+esm")).default;
  var editor = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link"],
        ["clean"],
      ],
    },
  });
  if (initial) editor.clipboard.dangerouslyPasteHTML(initial);
  var submit = root.querySelector(".editor-submit");
  var sync = function () {
    submit.disabled = !visibleText(editor.getSemanticHTML());
  };
  editor.on("text-change", sync);
  sync();
  root.querySelector("#post-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    var html = editor.getSemanticHTML();
    submit.disabled = true;
    try {
      if (postId) {
        await api("/api/posts/" + encodeURIComponent(postId), {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({ body: html }),
        });
        window.location.href = "postdetail.html?postId=" + encodeURIComponent(postId);
        return;
      }
      var created = await api("/api/posts", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ body: html }),
      });
      window.location.href = "postdetail.html?postId=" + encodeURIComponent(created.id);
    } catch (error) {
      var message = root.querySelector("[data-error]");
      message.hidden = false;
      message.textContent = error instanceof Error ? error.message : "글을 저장하지 못했습니다.";
      submit.disabled = false;
    }
  });
}

var root = document.querySelector("[data-posts]");
if (root) {
  var view = root.getAttribute("data-posts");
  var reload = function () {
    var next = view === "detail" ? renderDetail(root) : renderList(root);
    next.catch(function (error) {
      root.innerHTML = '<p class="danger">' + escapeHtml(error.message) + "</p>";
    });
  };
  if (view !== "write") bindCards(root, reload);
  if (view === "write") {
    renderWrite(root).catch(function () {
      window.location.replace("posts.html");
    });
  } else {
    reload();
  }
}
