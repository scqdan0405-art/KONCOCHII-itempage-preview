(function () {
  "use strict";

  window.KONCOCHII_PREVIEW = true;

  function disableForms() {
    document.querySelectorAll("form").forEach(function (form) {
      form.setAttribute("data-preview-disabled", "true");
      form.setAttribute("action", "#");
      form.setAttribute("method", "get");

      form.querySelectorAll("button[type='submit'], input[type='submit']").forEach(function (button) {
        button.disabled = true;
        button.classList.add("test-preview-disabled");
      });

      var note = document.createElement("p");
      note.className = "test-preview-form-note";
      note.textContent = "テスト環境のため、このフォームから送信できません";
      form.insertBefore(note, form.firstChild);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        return false;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", disableForms);
  } else {
    disableForms();
  }
}());
