// app.js
// Minimal Node.js server that serves a polished single-file frontend.
// No frameworks, single-file architecture so the DevOps pipeline stays simple.

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// In-memory contact submissions (ephemeral, for demo only)
const submissions = [];

// HTML/CSS/JS - bundled here for single-file simplicity
const frontend = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>NodeJS CI Demo — Corporate App</title>
<style>
  :root{--bg:#f5f7fb;--card:#ffffff;--muted:#6b7280;--accent:#0f62fe;--success:#0f9d58}
  body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial;background:var(--bg);color:#111}
  header{background:linear-gradient(90deg,#08357b 0%, #d38ac2ff 100%);color:white;padding:28px 24px}
  .container{max-width:980px;margin:20px auto;padding:0 20px}
  .brand{display:flex;align-items:center;gap:12px}
  .logo{width:48px;height:48px;border-radius:8px;background:rgba(105, 27, 59, 0.99);display:flex;align-items:center;justify-content:center;font-weight:700}
  h1{margin:0;font-size:20px}
  p.lead{color:var(--muted);margin:8px 0 0;fontpx}

  .grid{display:grid;grid-template-columns:1fr 360px;gap:20px;margin-top:20px}
  .card{background:var(--card);border-radius:10px;padding:18px;box-shadow:0 6px 18px rgba(41, 30, 40, 0.06)}
  .hero{display:flex;flex-direction:column;gap:12px}
  .cta{display:flex;gap:10px;margin-top:8px}
  button{background:var(--accent);color:white;border:0;padding:10px 14px;border-radius:8px;font-weight:600;cursor:pointer}
  button.ghost{background:transparent;border:1px solid #3f4653ff;color:var(--accent)}
  .status{display:flex;gap:12px;align-items:center}
  .dot{width:12px;height:12px;border-radius:50%;background:#f59e0b}
  .stat-list{display:flex;gap:12px;margin-top:8px}
  .stat{padding:10px;border-radius:8px;background:#f8fafc;flex:1;text-align:center}
  label{display:block;margin:8px 0 6px;font-size:13px;color:var(--muted)}
  input,textarea{width:100%;padding:10px;border:1px solid #e6eefc;border-radius:8px;font-size:14px}
  .muted{color:var(--muted);font-size:13px}
  footer{margin-top:28px;text-align:center;color:var(--muted);font-size:13px}
  @media(max-width:820px){.grid{grid-template-columns:1fr;}.container{padding:16px}}
</style>
</head>
<body>
  <header>
    <div class="container">
      <div class="brand">
        <div class="logo">CI</div>
        <div>
          <h1>NodeJS CI Demo</h1>
          <p class="lead">Hey, have a nice day!</p>
        </div>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="grid">
      <section class="card hero">
        <div>
          <h2>Welcome</h2>
          <p class="muted">This demo shows a simple Node.js app with a clean UI. Use the health check to validate the backend (useful in pipelines).</p>
          <div class="cta">
            <button id="healthBtn">Run Health Check</button>
            <button id="reloadBtn" class="ghost">Reload</button>
          </div>
        </div>

        <div style="margin-top:12px">
          <div class="status">
            <div class="dot" id="healthDot" title="status"></div>
            <div>
              <div style="font-weight:700" id="healthMsg">Status: unknown</div>
              <div class="muted">Last checked: <span id="lastChecked">never</span></div>
            </div>
          </div>

          <div class="stat-list" style="margin-top:14px">
            <div class="stat">
              <div class="muted">Uptime</div>
              <div id="uptime">—</div>
            </div>
            <div class="stat">
              <div class="muted">Submissions</div>
              <div id="subCount">0</div>
            </div>
          </div>
        </div>

        <div style="margin-top:14px">
          <h3 style="margin:0 0 8px">Contact (demo)</h3>
          <form id="contactForm">
            <label for="name">Name</label>
            <input id="name" required />
            <label for="message">Message</label>
            <textarea id="message" rows="3" required></textarea>
            <div style="display:flex;gap:8px;margin-top:10px">
              <button type="submit">Send</button>
              <button type="button" id="clearBtn" class="ghost">Clear</button>
            </div>
            <div id="formResp" class="muted" style="margin-top:8px"></div>
          </form>
        </div>
      </section>

      <aside>
        <div class="card">
          <h4 style="margin:0 0 8px">Quick actions</h4>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button id="openHealth">Open /health</button>
            <button id="showJSON" class="ghost">Show submissions (JSON)</button>
            <button id="downloadLog" class="ghost">Download log</button>
          </div>
        </div>

        <div class="card" style="margin-top:12px">
          <h4 style="margin:0 0 8px">About</h4>
          <p class="muted" style="margin:0">Single-file Node demo for building CI pipelines. No database. Submissions are stored in memory (ephemeral).</p>
        </div>
      </aside>
    </div>

    <footer>
      Built for DevOps demo • Local only • Not production
    </footer>
  </main>

<script>
  const healthBtn = document.getElementById('healthBtn');
  const healthDot = document.getElementById('healthDot');
  const healthMsg = document.getElementById('healthMsg');
  const lastChecked = document.getElementById('lastChecked');
  const uptimeEl = document.getElementById('uptime');
  const subCountEl = document.getElementById('subCount');
  const contactForm = document.getElementById('contactForm');
  const formResp = document.getElementById('formResp');
  const showJSON = document.getElementById('showJSON');
  const openHealth = document.getElementById('openHealth');
  const downloadLog = document.getElementById('downloadLog');
  const clearBtn = document.getElementById('clearBtn');
  const reloadBtn = document.getElementById('reloadBtn');

  async function fetchHealth() {
    try {
      const res = await fetch('/health');
      if (!res.ok) throw new Error('Non-OK response: ' + res.status);
      const data = await res.json();
      healthDot.style.background = data.status === 'ok' ? '#0f309dff' : '#dbe8b8ff';
      healthMsg.textContent = 'Status: ' + data.status;
      lastChecked.textContent = new Date().toLocaleString();
      uptimeEl.textContent = data.uptime || '—';
    } catch (err) {
      healthDot.style.background = '#00edbeff';
      healthMsg.textContent = 'Status: offline';
      lastChecked.textContent = new Date().toLocaleString();
      uptimeEl.textContent = '—';
    }
  }

  healthBtn.addEventListener('click', fetchHealth);
  openHealth.addEventListener('click', () => window.open('/health', '_blank'));
  reloadBtn.addEventListener('click', () => location.reload());

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formResp.textContent = 'Sending...';
    const payload = {
      name: document.getElementById('name').value,
      message: document.getElementById('message').value
    };
    try {
      const res = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.ok) {
        formResp.style.color = '#0f9d58';
        formResp.textContent = 'Submitted — thank you.';
        subCountEl.textContent = json.count;
        contactForm.reset();
      } else {
        formResp.style.color = '#ef4444';
        formResp.textContent = 'Submission failed';
      }
    } catch (err) {
      formResp.style.color = '#ef4444';
      formResp.textContent = 'Network error';
    }
  });

  clearBtn.addEventListener('click', () => contactForm.reset());

  showJSON.addEventListener('click', async () => {
    const res = await fetch('/submissions');
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  });

  downloadLog.addEventListener('click', async () => {
    const res = await fetch('/log');
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nodejs-ci-demo.log';
    a.click();
    URL.revokeObjectURL(url);
  });

  fetchHealth();
</script>
</body>
</html>
`;

// Server endpoints
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (req.method === 'GET' && (parsed.pathname === '/' || parsed.pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(frontend);
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/health') {
    const uptime = process.uptime(); // seconds
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: Math.floor(uptime) }));
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/submissions') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(submissions));
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/log') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    const text = submissions.map((s,i) => `#${i+1} [${new Date(s.ts).toISOString()}] ${s.name}: ${s.message}`).join('\n');
    res.end(text || 'No submissions');
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/submit') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const name = String(payload.name || 'anonymous').slice(0,100);
        const message = String(payload.message || '').slice(0,1000);
        const entry = { name, message, ts: Date.now() };
        submissions.push(entry);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, count: submissions.length }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'invalid payload' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});