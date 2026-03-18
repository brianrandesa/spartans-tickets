(function () {
  function init() {
    var root = document.getElementById("ghl-full-bleed");
    if (!root) return;

    var gaRedirectUrl = root.getAttribute("data-ga-url") || "https://buy.getspartanstickets.com/ga";
    var countdownTarget = root.getAttribute("data-countdown-target") || "2026-04-11T19:00:00-07:00";
    var ghlFormId = root.getAttribute("data-ghl-form-id") || "VaNfiwVgltYzOfuVxRKt";

    var hamburger = document.getElementById("hamburger");
    var mobilePanel = document.getElementById("mobilePanel");
    if (hamburger && mobilePanel) {
      hamburger.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var overlay = document.getElementById("overlay");
    var closePopup = document.getElementById("closePopup");
    var openButtons = document.querySelectorAll(".js-open");
    var hasRedirected = false;

    function openLeadPopup() {
      if (!overlay) return;
      overlay.classList.add("open");
    }

    function closeLeadPopup() {
      if (!overlay) return;
      overlay.classList.remove("open");
    }

    for (var i = 0; i < openButtons.length; i++) {
      openButtons[i].addEventListener("click", openLeadPopup);
    }

    if (closePopup) {
      closePopup.addEventListener("click", closeLeadPopup);
    }

    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeLeadPopup();
      });
    }

    function maybeRedirectToBuyingPage(reason) {
      if (hasRedirected) return;
      hasRedirected = true;
      if (reason) {
        // Helpful for debugging in GHL preview console.
        console.log("Redirecting to buying page:", reason);
      }
      window.location.href = gaRedirectUrl;
    }

    // Listen for submit events from embedded GHL form iframe.
    window.addEventListener("message", function (event) {
      var data = event.data;
      var text = "";

      try {
        if (typeof data === "string") {
          text = data.toLowerCase();
        } else if (data && typeof data === "object") {
          text = JSON.stringify(data).toLowerCase();
        }
      } catch (_err) {
        // Ignore non-serializable message payloads.
      }

      if (!text) return;

      var mentionsForm = text.indexOf(ghlFormId.toLowerCase()) !== -1 || text.indexOf("form") !== -1;
      var looksSubmitted =
        text.indexOf("submitted") !== -1 ||
        text.indexOf("submission") !== -1 ||
        text.indexOf("success") !== -1 ||
        text.indexOf("thank") !== -1;

      if (mentionsForm && looksSubmitted) {
        maybeRedirectToBuyingPage("GHL form submission message");
      }
    });

    var countdownEl = document.getElementById("countdownTime");
    if (countdownEl) {
      function pad(n) {
        return String(n).padStart(2, "0");
      }

      function tickCountdown() {
        var now = Date.now();
        var target = new Date(countdownTarget).getTime();
        var s = Math.max(0, Math.floor((target - now) / 1000));
        var d = Math.floor(s / 86400);
        var h = Math.floor((s % 86400) / 3600);
        var m = Math.floor((s % 3600) / 60);
        var sec = s % 60;
        countdownEl.textContent = pad(d) + "d : " + pad(h) + "h : " + pad(m) + "m : " + pad(sec) + "s";
      }

      tickCountdown();
      window.setInterval(tickCountdown, 1000);
    }

    // Backup: if user clicks inside the form and then waits, keep them moving.
    var formIframe = document.getElementById("inline-VaNfiwVgltYzOfuVxRKt");
    if (formIframe) {
      formIframe.addEventListener("load", function () {
        // No-op; useful checkpoint for debugging.
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
