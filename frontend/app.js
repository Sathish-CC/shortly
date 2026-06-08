/* ═══════════════════════════════════════════════════════════════════════════
   Shortly v2 — app.js
   Clean, modular vanilla JS. Each feature is an IIFE for encapsulation.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';


/* ─────────────────────────────────────────────────────────────────────────
   § 1  NAVBAR  — scroll shadow + mobile drawer
   ───────────────────────────────────────────────────────────────────────── */
(function NavBar() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');

  if (!nav) return;

  // Scroll class
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    drawer.classList.toggle('is-open', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close on link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (drawer.classList.contains('is-open') &&
        !nav.contains(e.target)) {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 2  TOAST  — notification system
   ───────────────────────────────────────────────────────────────────────── */
const Toast = (() => {
  const stack = document.getElementById('toastStack');

  /**
   * @param {string} title
   * @param {string} [msg]
   * @param {'success'|'error'|'info'} [type]
   * @param {number} [duration]
   */
  function show(title, msg = '', type = 'info', duration = 4000) {
    if (!stack) return;

    const icons = {
      success: '✓',
      error:   '✕',
      info:    'i',
    };

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <div class="toast__icon" aria-hidden="true">${icons[type] ?? 'i'}</div>
      <div class="toast__body">
        <div class="toast__title">${title}</div>
        ${msg ? `<div class="toast__msg">${msg}</div>` : ''}
      </div>
    `;

    stack.appendChild(el);

    const dismiss = () => {
      el.classList.add('is-exiting');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };

    const timer = setTimeout(dismiss, duration);
    el.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
  }

  return { show };
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 3  URL SHORTENER  — core feature
   ───────────────────────────────────────────────────────────────────────── */
(function Shortener() {

  const API_URL =
    "https://rl7gcxcvu7.execute-api.ap-southeast-2.amazonaws.com/prod/shorten";

  const input = document.getElementById('urlInput');
  const btn = document.getElementById('shortenBtn');

  const resultEl = document.getElementById('result');
  const shortLink = document.getElementById('resultShort');
  const origEl = document.getElementById('resultOriginal');
  const metaEl = document.getElementById('resultMeta');
  const copyBtn = document.getElementById('copyBtn');

  if (!input || !btn || !resultEl) return;

  let currentUrl = '';

  function normalizeURL(raw) {
    const s = raw.trim();
    return /^https?:\/\//i.test(s)
      ? s
      : `https://${s}`;
  }

  function isValidURL(str) {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' ||
             u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function truncate(text) {

  if (!text) {
    return "";
  }

  return text.length > 50
    ? text.substring(0, 50) + "..."
    : text;

}

  function setLoading(on) {
    btn.disabled = on;
    btn.classList.toggle('is-loading', on);
  }

function showResult(data) {

  const result =
    document.getElementById("result");

  const resultShort =
    document.getElementById("resultShort");

  const resultOriginal =
    document.getElementById("resultOriginal");

  const resultMeta =
    document.getElementById("resultMeta");

  const copyButton =
    document.getElementById("copyBtn");

  // show result section
  result.hidden = false;

  // original URL
  resultOriginal.textContent =
    truncate(
      document.getElementById("urlInput").value
    );

  // short URL
  resultShort.textContent =
    data.shortUrl;

  resultShort.href =
    data.shortUrl;

  // meta text
  resultMeta.textContent =
    "Just created";

  // save current URL
  currentUrl =
    data.shortUrl;

  // copy button
copyButton.onclick = async () => {

    try {

        if (navigator.clipboard) {

            await navigator.clipboard.writeText(currentUrl);

        } else {

            const textarea = document.createElement("textarea");

            textarea.value = currentUrl;

            document.body.appendChild(textarea);

            textarea.select();

            document.execCommand("copy");

            document.body.removeChild(textarea);
        }

        Toast.show(
            "Copied!",
            currentUrl,
            "success"
        );

    } catch (err) {

        console.error(err);

        Toast.show(
            "Copy failed",
            "",
            "error"
        );
    }
};

}

  async function handleShorten() {

    const raw = input.value.trim();

    if (!raw) {
      Toast.show(
        'URL required',
        'Paste a URL first',
        'error'
      );
      return;
    }

    const url = normalizeURL(raw);

    if (!isValidURL(url)) {
      Toast.show(
        'Invalid URL',
        'Enter valid URL',
        'error'
      );
      return;
    }

    const token =
      localStorage.getItem("idToken");

    if (!token) {
      Toast.show(
        'Login required',
        'Please login first',
        'error'
      );
      return;
    }

    setLoading(true);

    try {

      const response =
        await fetch(API_URL, {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              localStorage.getItem("idToken")
          },

          body: JSON.stringify({
            url: url
          })
        });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed'
        );
      }
         
      console.log(data);
      showResult(data);

      Toast.show(
        'Link created',
        data.shortUrl,
        'success'
      );

    } catch (err) {

      console.error(err);

      Toast.show(
        'Error',
        err.message,
        'error'
      );

    } finally {

      setLoading(false);
    }
  }

  btn.addEventListener(
    'click',
    handleShorten
  );

  input.addEventListener(
    'keydown',
    e => {
      if (e.key === 'Enter') {
        handleShorten();
      }
    }
  );

})();



/* ─────────────────────────────────────────────────────────────────────────
   ANALYTICS API
───────────────────────────────────────────────────────────────────────── */

(function AnalyticsDashboard() {

  const API_URL =
    "https://rl7gcxcvu7.execute-api.ap-southeast-2.amazonaws.com/prod/analytics";

  async function loadAnalytics() {

    try {

      const token =
        localStorage.getItem("idToken");

      if (!token) {
        return;
      }

      const response =
        await fetch(API_URL, {

          headers: {
            Authorization: token
          }

        });

      const data =
        await response.json();

      console.log(
        "Analytics:",
        data
      );

      // TOTAL CLICKS

      const totalClicks =
        document.getElementById(
          "totalClicks"
        );

      if (totalClicks) {

        totalClicks.textContent =
          data.totalClicks || 0;

      }

      // TABLE

      const table =
        document.getElementById(
          "analyticsTable"
        );

      if (
        !table ||
        !data.recentLinks
      ) {
        return;
      }

      table.innerHTML = "";

      data.recentLinks.forEach(
        link => {

          const ctr =
            Math.min(
              link.clicks * 10,
              100
            );

          const row =
            document.createElement(
              "div"
            );

          row.className =
            "dash-table__row";

          row.innerHTML = `

            <span class="dash-table__link">

              ${link.shortCode}

            </span>

            <span class="dash-table__num">

              ${link.clicks || 0}

            </span>

            <span class="dash-table__hide-sm dash-table__ctr">

              <span
                class="ctr-bar"
                style="--w:${ctr}%"
              ></span>

              ${ctr}%

            </span>

          `;

          table.appendChild(row);

        }
      );

    } catch (error) {

      console.error(
        "Analytics Error:",
        error
      );

    }

  }

  loadAnalytics();

})();



/* ─────────────────────────────────────────────────────────────────────────
   § 4  SCROLL REVEAL  — IntersectionObserver-powered
   ───────────────────────────────────────────────────────────────────────── */
(function ScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -32px 0px',
  });

  elements.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 5  COUNTER ANIMATION  — runs when metric enters viewport
   ───────────────────────────────────────────────────────────────────────── */
(function CounterAnimation() {
  const counters = document.querySelectorAll('.metric__num[data-target]');
  if (!counters.length) return;

  // Ease-out quartic for satisfying deceleration
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function formatNumber(n, target) {
    if (target >= 1_000_000) {
      return (n / 1_000_000).toFixed(n >= 1_000_000 ? 1 : 2).replace(/\.0$/, '') + 'M';
    }
    if (target >= 1_000) {
      return n.toLocaleString();
    }
    return String(n);
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const t        = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuart(t) * target);

      el.textContent = formatNumber(value, target);

      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatNumber(target, target);
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 6  SMOOTH ANCHOR SCROLL  — offset for fixed nav
   ───────────────────────────────────────────────────────────────────────── */
(function SmoothScroll() {
  const navH = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '64'
  );

  document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener('click', e => {

      const id =
        link.getAttribute('href');

      // ignore external URLs
      if (
        !id ||
        id.startsWith('http')
      ) {
        return;
      }

      if (id === '#') {
        return;
      }

      let target = null;

      try {

        target =
          document.querySelector(id);

      } catch {

        return;
      }

      if (!target) {
        return;
      }

      e.preventDefault();

      const y =
        target.getBoundingClientRect().top +
        window.scrollY -
        navH() -
        20;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });

    });

  });
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 7  BAR CHART ANIMATION  — animate mini bars on dashboard scroll-in
   ───────────────────────────────────────────────────────────────────────── */
(function ChartAnimation() {
  const chart = document.querySelector('.mini-chart__bars');
  if (!chart) return;

  const bars = chart.querySelectorAll('.mini-chart__bar');

  // Initially collapse all bars
  bars.forEach(bar => {
    bar.style.height = '0';
    bar.style.transition = 'none';
  });

  let animated = false;

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !animated) {
      animated = true;
      bars.forEach((bar, i) => {
        const targetH = bar.style.getPropertyValue('--h') || '50%';
        setTimeout(() => {
          bar.style.transition = `height 0.6s cubic-bezier(0.22,1,0.36,1)`;
          bar.style.height = targetH;
        }, i * 60);
      });
      observer.disconnect();
    }
  }, { threshold: 0.4 });

  observer.observe(chart);
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 8  BUTTON RIPPLE  — material-style press feedback
   ───────────────────────────────────────────────────────────────────────── */
(function ButtonRipple() {
  // Only apply to primary buttons
  document.querySelectorAll('.btn--primary').forEach(btn => {
    btn.addEventListener('pointerdown', function (e) {
      if (this.disabled) return;

      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      Object.assign(ripple.style, {
        position:     'absolute',
        width:        `${size}px`,
        height:       `${size}px`,
        left:         `${x}px`,
        top:          `${y}px`,
        borderRadius: '50%',
        background:   'rgba(255,255,255,0.18)',
        transform:    'scale(0)',
        animation:    'ripple-out 0.55s ease-out forwards',
        pointerEvents:'none',
      });

      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });

  // Inject keyframe once
  if (!document.getElementById('__ripple_kf')) {
    const s = document.createElement('style');
    s.id = '__ripple_kf';
    s.textContent = `@keyframes ripple-out { to { transform: scale(1); opacity: 0; } }`;
    document.head.appendChild(s);
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 9  PLACEHOLDER CYCLE  — subtle UX delight on the URL input
   ───────────────────────────────────────────────────────────────────────── */
(function PlaceholderCycle() {
  const input = document.getElementById('urlInput');
  if (!input) return;

  const hints = [
    'https://your-very-long-url.com/goes/here',
    'https://notion.so/my-team/project-roadmap-2025',
    'https://docs.google.com/spreadsheets/d/1BxiM…',
    'https://github.com/your-org/your-repository/pull/482',
    'https://www.figma.com/file/abc123/design-system-v3',
  ];

  let idx = 0;
  let active = true;

  const interval = setInterval(() => {
    if (!active || document.activeElement === input || input.value) return;
    idx = (idx + 1) % hints.length;
    input.placeholder = hints[idx];
  }, 3500);

  input.addEventListener('focus', () => { active = false; });
  input.addEventListener('blur',  () => { active = !input.value; });
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 10  PAGE REVEAL  — graceful fade-in on load
   ───────────────────────────────────────────────────────────────────────── */
(function PageReveal() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';

  function reveal() {
    document.body.style.opacity = '1';
  }

  if (document.readyState === 'complete') {
    setTimeout(reveal, 30);
  } else {
    window.addEventListener('load', () => setTimeout(reveal, 30));
    // Fallback in case load fires late
    setTimeout(reveal, 800);
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   § 11  DASHBOARD CTR BARS  — animate width on scroll
   ───────────────────────────────────────────────────────────────────────── */
(function CtrBars() {
  const bars = document.querySelectorAll('.ctr-bar');
  if (!bars.length) return;

  // Start at 0 width
  bars.forEach(bar => {
    bar.style.setProperty('--w', '0%');
  });

  let done = false;

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !done) {
      done = true;

      // Store original widths from HTML and animate to them
      const targets = Array.from(bars).map(bar => {
        const match = bar.getAttribute('style').match(/--w:\s*([\d.]+%)/);
        return match ? match[1] : '50%';
      });

      bars.forEach((bar, i) => {
        setTimeout(() => {
          bar.style.transition = 'none'; // reset
          bar.style.setProperty('--w', '0%');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bar.style.transition = 'width 0.8s cubic-bezier(0.22,1,0.36,1)';
              bar.style.setProperty('--w', targets[i]);
            });
          });
        }, i * 80);
      });

      observer.disconnect();
    }
  }, { threshold: 0.4 });

  const table = document.querySelector('.dash-table');
  if (table) observer.observe(table);
})();




/* ═══════════════════════════════════════════════
AUTH SYSTEM — AWS COGNITO
═══════════════════════════════════════════════ */

const poolData = {
UserPoolId: "ap-southeast-2_QNAcjIJC7",
ClientId: "78pb2qlep64mv821ahn1fprcqk"
};

const userPool =
new AmazonCognitoIdentity.CognitoUserPool(
poolData
);

(function AuthSystem() {

const modal =
document.getElementById("authModal");

const loginBtn =
document.getElementById("loginBtn");

const signupBtn =
document.getElementById("signupBtn");

const closeBtn =
document.getElementById("authClose");

const loginForm =
document.getElementById("loginForm");

const signupForm =
document.getElementById("signupForm");

const verifyForm =
document.getElementById("verifyForm");

const switchBtn =
document.getElementById("authSwitchBtn");

const switchText =
document.getElementById("authSwitchText");

const title =
document.getElementById("authTitle");

const subtitle =
document.getElementById("authSubtitle");

let currentMode = "login";

let verificationEmail = "";

/* ─────────────────────────────
OPEN MODAL
───────────────────────────── */

function openModal(mode) {

currentMode = mode;

modal.classList.add("is-open");

document.body.style.overflow =
  "hidden";

updateMode();

}

function closeModal() {

modal.classList.remove("is-open");

document.body.style.overflow =
  "";

}

loginBtn.addEventListener(
"click",
() => openModal("login")
);

signupBtn.addEventListener(
"click",
() => openModal("signup")
);

closeBtn.addEventListener(
"click",
closeModal
);

modal.addEventListener(
"click",
e => {


  if (
    e.target.classList.contains(
      "auth-modal__backdrop"
    )
  ) {
    closeModal();
  }
}


);

/* ─────────────────────────────
SWITCH LOGIN / SIGNUP
───────────────────────────── */

function updateMode() {


loginForm.classList.add("hidden");
signupForm.classList.add("hidden");
verifyForm.classList.add("hidden");

if (currentMode === "login") {

  title.textContent =
    "Welcome back";

  subtitle.textContent =
    "Access your analytics dashboard securely.";

  loginForm.classList.remove(
    "hidden"
  );

  switchText.textContent =
    "Don’t have an account?";

  switchBtn.textContent =
    "Create account";
}

if (currentMode === "signup") {

  title.textContent =
    "Create account";

  subtitle.textContent =
    "Start shortening smarter links today.";

  signupForm.classList.remove(
    "hidden"
  );

  switchText.textContent =
    "Already have an account?";

  switchBtn.textContent =
    "Log in";
}

if (currentMode === "verify") {

  title.textContent =
    "Verify email";

  subtitle.textContent =
    `Enter verification code sent to ${verificationEmail}`;

  verifyForm.classList.remove(
    "hidden"
  );

  switchText.textContent = "";
  switchBtn.textContent = "";
}

}

switchBtn.addEventListener(
"click",
() => {

  currentMode =
    currentMode === "login"
      ? "signup"
      : "login";

  updateMode();
}

);

/* ─────────────────────────────
PASSWORD TOGGLE
───────────────────────────── */

document
.querySelectorAll(
"[data-password-toggle]"
)
.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const input =
        document.getElementById(
          button.dataset.passwordToggle
        );

      input.type =
        input.type === "password"
          ? "text"
          : "password";
    }
  );
});

/* ─────────────────────────────
SIGNUP
───────────────────────────── */

signupForm.addEventListener(
"submit",
e => {

  e.preventDefault();

  const name =
    document.getElementById(
      "signupName"
    ).value;

  const email =
    document.getElementById(
      "signupEmail"
    ).value;

  const password =
    document.getElementById(
      "signupPassword"
    ).value;

  const confirm =
    document.getElementById(
      "signupConfirm"
    ).value;

  if (password !== confirm) {

    Toast.show(
      "Password mismatch",
      "Passwords do not match",
      "error"
    );

    return;
  }

  const attributes = [];

  attributes.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "email",
      Value: email
    })
  );

  attributes.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "name",
      Value: name
    })
  );

  const button =
    signupForm.querySelector(
      "button"
    );

  button.classList.add(
    "is-loading"
  );

  userPool.signUp(
    email,
    password,
    attributes,
    null,
    (err) => {

      button.classList.remove(
        "is-loading"
      );

      if (err) {

        Toast.show(
          "Signup failed",
          err.message,
          "error"
        );

        return;
      }

      verificationEmail =
        email;

      currentMode =
        "verify";

      updateMode();

      Toast.show(
        "Account created",
        "Check your email for verification code",
        "success"
      );
    }
  );
}


);

/* ─────────────────────────────
VERIFY EMAIL
───────────────────────────── */

verifyForm.addEventListener(
"submit",
e => {


  e.preventDefault();

  const code =
    document.getElementById(
      "verifyCode"
    ).value;

  const userData = {
    Username: verificationEmail,
    Pool: userPool
  };

  const cognitoUser =
    new AmazonCognitoIdentity.CognitoUser(
      userData
    );

  cognitoUser.confirmRegistration(
    code,
    true,
    err => {

      if (err) {

        Toast.show(
          "Verification failed",
          err.message,
          "error"
        );

        return;
      }

      Toast.show(
        "Email verified",
        "You can now login",
        "success"
      );

      currentMode = "login";

      updateMode();
    }
  );
}


);

/* ─────────────────────────────
LOGIN
───────────────────────────── */

loginForm.addEventListener(
"submit",
e => {


  e.preventDefault();

  const email =
    document.getElementById(
      "loginEmail"
    ).value;

  const password =
    document.getElementById(
      "loginPassword"
    ).value;

  const authData = {
    Username: email,
    Password: password
  };

  const authDetails =
    new AmazonCognitoIdentity.AuthenticationDetails(
      authData
    );

  const userData = {
    Username: email,
    Pool: userPool
  };

  const cognitoUser =
    new AmazonCognitoIdentity.CognitoUser(
      userData
    );

  const button =
    loginForm.querySelector(
      "button"
    );

  button.classList.add(
    "is-loading"
  );

  cognitoUser.authenticateUser(
    authDetails,
    {

      onSuccess: result => {

        button.classList.remove(
          "is-loading"
        );

        localStorage.setItem(
          "accessToken",
          result
            .getAccessToken()
            .getJwtToken()
        );

        localStorage.setItem(
          "idToken",
          result
            .getIdToken()
            .getJwtToken()
        );

        localStorage.setItem(
          "refreshToken",
          result
            .getRefreshToken()
            .getToken()
        );

        Toast.show(
          "Login successful",
          "Welcome back",
          "success"
        );

        closeModal();
      },

      onFailure: err => {

        button.classList.remove(
          "is-loading"
        );

        Toast.show(
          "Login failed",
          err.message,
          "error"
        );
      }
    }
  );
}


);

})();


/* ─────────────────────────────────────────
   SESSION RESTORE
───────────────────────────────────────── */

(function SessionRestore() {

  const token =
    localStorage.getItem("idToken");

  const loginBtn =
    document.getElementById("loginBtn");

  const signupBtn =
    document.getElementById("signupBtn");

  if (token) {

    if (loginBtn) {
      loginBtn.textContent =
        "Dashboard";
    }

    if (signupBtn) {

      signupBtn.textContent =
        "Logout";

      signupBtn.onclick = () => {

        localStorage.removeItem(
          "accessToken"
        );

        localStorage.removeItem(
          "idToken"
        );

        localStorage.removeItem(
          "refreshToken"
        );

        location.reload();

      };

    }

  }

})();
