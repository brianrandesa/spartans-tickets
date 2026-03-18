(function () {
  function init() {
    var root = document.getElementById("ghl-full-bleed");
    if (!root) return;

    var leadEndpoint = root.getAttribute("data-lead-endpoint") || "https://buy.getspartanstickets.com/api/lead-capture";
    var gaRedirectUrl = root.getAttribute("data-ga-url") || "https://buy.getspartanstickets.com/ga";
    var countdownTarget = root.getAttribute("data-countdown-target") || "2026-04-11T19:00:00-07:00";

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
    var leadForm = document.getElementById("leadForm");
    var submitBtn = document.getElementById("submitBtn");
    var errorText = document.getElementById("errorText");

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

    if (leadForm) {
      leadForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!submitBtn || !errorText) return;
        errorText.textContent = "";

        var ticketNameEl = document.getElementById("ticketName");
        var emailEl = document.getElementById("email");
        var phoneEl = document.getElementById("phone");

        var ticketName = ticketNameEl && "value" in ticketNameEl ? ticketNameEl.value.trim() : "";
        var email = emailEl && "value" in emailEl ? emailEl.value.trim() : "";
        var phone = phoneEl && "value" in phoneEl ? phoneEl.value.trim() : "";

        if (!ticketName || !email || !phone) {
          errorText.textContent = "Please fill out name, email, and phone to continue.";
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";

        fetch(leadEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ticketName,
            email: email,
            phone: phone,
            source: "Homepage Popup"
          })
        })
          .catch(function () {
            // Keep funnel moving even if lead capture fails.
          })
          .finally(function () {
            try {
              sessionStorage.setItem("spartans-ga-lead", JSON.stringify({
                ticketName: ticketName,
                email: email,
                phone: phone
              }));
            } catch (_err) {
              // Ignore storage issues (private mode / sandbox).
            }
            window.location.href = gaRedirectUrl;
          });
      });
    }

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
