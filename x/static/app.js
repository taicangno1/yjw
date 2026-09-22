const PLATFORM = {
  xiaohongshu: "小红书",
  douyin: "抖音",
  boss: "BOSS",
  wecom: "微信",
  other: "其他",
};

const STATUS = {
  watching: "观察",
  queued: "待发送",
  awaiting_reply: "等回复",
  qualifying: "自动跟进",
  handoff: "待接手",
  closed: "已结束",
};

const tabButtons = [
  ["queue", "待发送"],
  ["live", "对话"],
  ["handoff", "待接手"],
  ["leads", "线索"],
  ["scan", "巡检"],
];

let tab = "queue";
let cache = "";

const nav = document.getElementById("nav");
const appNode = document.getElementById("app");
const errorNode = document.getElementById("error");

document.getElementById("refresh").addEventListener("click", () => {
  if (document.activeElement) document.activeElement.blur();
  refresh(true);
});

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value != null) node.setAttribute(key, value);
  });
  (children || []).forEach((child) => {
    node.append(child instanceof Node ? child : document.createTextNode(child == null ? "" : String(child)));
  });
  return node;
}

function showError(message) {
  errorNode.hidden = !message;
  errorNode.textContent = message || "";
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  const token = sessionStorage.getItem("x-token") || "";
  if (token) headers.set("Authorization", "Bearer " + token);
  const response = await fetch(path, { ...options, headers });
  if (response.status === 401 && path !== "/api/inbound") {
    sessionStorage.removeItem("x-token");
    const entered = prompt("请输入访问口令");
    if (!entered) throw new Error("未授权");
    sessionStorage.setItem("x-token", entered);
    return api(path, options);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let detail = data.detail || response.statusText;
    if (Array.isArray(detail)) detail = detail.map((item) => item.msg).join("；");
    throw new Error(typeof detail === "string" ? detail : "请求失败");
  }
  return data;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

function platformLabel(value) {
  return PLATFORM[value] || value || "其他";
}

function volumeLabel(value) {
  return value == null || value === "" ? "日需求未知" : `每天约 ${value} 条`;
}

async function refresh(force) {
  const active = document.activeElement;
  if (!force && active && appNode.contains(active)) return;
  try {
    const data = await api("/api/board");
    const key = JSON.stringify(data) + ":" + tab;
    if (!force && key === cache) return;
    cache = key;
    render(data);
    showError("");
  } catch (error) {
    showError(error.message);
  }
}

function render(data) {
  const leads = data.leads || [];
  const counts = {
    queue: leads.filter((lead) => lead.status === "queued").length,
    live: leads.filter((lead) => lead.status === "awaiting_reply" || lead.status === "qualifying").length,
    handoff: (data.handoffs || []).length,
    leads: leads.length,
    scan: "",
  };
  nav.replaceChildren(
    ...tabButtons.map(([id, label]) => {
      const suffix = counts[id] === "" ? "" : ` ${counts[id]}`;
      return el("button", {
        type: "button",
        class: id === tab ? "active" : "",
        onclick: () => {
          tab = id;
          cache = "";
          refresh(true);
        },
      }, [label + suffix]);
    }),
  );
  if (tab === "queue") renderQueue(leads.filter((lead) => lead.status === "queued"));
  else if (tab === "live") renderLive(leads.filter((lead) => lead.status === "awaiting_reply" || lead.status === "qualifying"));
  else if (tab === "handoff") renderHandoff(data.handoffs || []);
  else if (tab === "leads") renderLeads(leads);
  else renderScan(data);
}

function leadMeta(lead) {
  return el("p", { class: "meta" }, [
    `${platformLabel(lead.platform)} · ${lead.author || "未署名"} · ${lead.score}分 · ${volumeLabel(lead.daily_volume)} · ${lead.category || "品类未知"}`,
  ]);
}

function renderQueue(leads) {
  if (!leads.length) {
    appNode.replaceChildren(el("p", { class: "empty" }, ["巡检或收录一条公开求购后，达到分数的会出现在这里。"]));
    return;
  }
  appNode.replaceChildren(...leads.map((lead) => el("article", { class: "card" }, [
    el("header", {}, [
      el("strong", {}, [lead.author || lead.url]),
      el("span", { class: "badge" }, ["待你点发送"]),
    ]),
    leadMeta(lead),
    el("p", { class: "post" }, [lead.first_message]),
    el("p", { class: "meta" }, [lead.text]),
    el("div", { class: "actions" }, [
      el("button", { type: "button", class: "primary", onclick: () => copyText(lead.first_message) }, ["复制首句"]),
      el("button", {
        type: "button",
        onclick: async () => {
          await api(`/api/leads/${lead.id}/sent`, { method: "POST" });
          await refresh(true);
        },
      }, ["我已发送"]),
      lead.url.startsWith("http") ? el("a", { href: lead.url, target: "_blank", rel: "noreferrer" }, ["打开原帖"]) : "",
    ]),
  ])));
}

function renderLive(leads) {
  if (!leads.length) {
    appNode.replaceChildren(el("p", { class: "empty" }, ["你点过「我已发送」，并且把对方的回复贴回来之后，对话会出现在这里。"]));
    return;
  }
  appNode.replaceChildren(...leads.map((lead) => {
    const last = lead.messages[lead.messages.length - 1];
    const waiting = last && last.role === "bot" && last.delivery !== "sent";
    const box = el("textarea", { placeholder: "把对方的原话贴在这里" });
    return el("article", { class: "card" }, [
      el("header", {}, [
        el("strong", {}, [lead.author || platformLabel(lead.platform)]),
        el("span", { class: waiting ? "badge warn" : "badge" }, [waiting ? "下一句待你转发" : STATUS[lead.status]]),
      ]),
      leadMeta(lead),
      el("div", { class: "transcript" }, lead.messages.map((message) => el("div", {
        class: `bubble ${message.role}`,
      }, [`${message.role === "customer" ? "对方" : "我方"}：${message.text}`]))),
      waiting ? el("div", { class: "actions" }, [
        el("button", { type: "button", class: "primary", onclick: () => copyText(last.text) }, ["复制下一句"]),
      ]) : "",
      el("form", {
        onsubmit: async (event) => {
          event.preventDefault();
          try {
            await api(`/api/leads/${lead.id}/reply`, {
              method: "POST",
              body: JSON.stringify({ text: box.value }),
            });
            showError("");
            await refresh(true);
          } catch (error) {
            showError(error.message);
          }
        },
      }, [
        box,
        el("button", { type: "submit", class: "primary" }, ["录入回复"]),
      ]),
    ]);
  }));
}

function handoffPlain(item) {
  const lines = [
    item.reason_label || "待接手",
    `平台：${platformLabel(item.platform)}`,
    `作者：${item.author || "未填"}`,
    `日需求：${item.daily_volume == null ? "未知" : item.daily_volume + "条"}`,
    `品类：${item.category || "未知"}`,
    `商品：${item.product_url || "未给"}`,
    `来源：${item.profile_url || ""}`,
    "",
  ];
  (item.recent || []).forEach((message) => {
    lines.push(`${message.role === "customer" ? "对方" : "我方"}：${message.text}`);
  });
  return lines.join("\n");
}

function renderHandoff(items) {
  if (!items.length) {
    appNode.replaceChildren(el("p", { class: "empty" }, ["还没有人要报价或样片。"]));
    return;
  }
  appNode.replaceChildren(...items.map((item) => el("article", { class: "card" }, [
    el("header", {}, [
      el("strong", {}, [item.reason_label || "待接手"]),
      el("span", { class: item.notified ? "badge" : "badge watch" }, [item.notified ? "已推送" : "只在这里"]),
    ]),
    el("p", { class: "meta" }, [
      `${platformLabel(item.platform)} · ${item.author || "未署名"} · ${volumeLabel(item.daily_volume)} · ${item.category || "品类未知"}`,
    ]),
    el("p", { class: "post" }, [item.product_url ? `商品：${item.product_url}` : "还没有商品链接"]),
    el("div", { class: "transcript" }, (item.recent || []).map((message) => el("div", {
      class: `bubble ${message.role}`,
    }, [`${message.role === "customer" ? "对方" : "我方"}：${message.text}`]))),
    el("div", { class: "actions" }, [
      el("button", { type: "button", class: "primary", onclick: () => copyText(handoffPlain(item)) }, ["复制工单"]),
      item.profile_url && item.profile_url.startsWith("http")
        ? el("a", { href: item.profile_url, target: "_blank", rel: "noreferrer" }, ["打开来源"])
        : "",
    ]),
  ])));
}

function renderLeads(leads) {
  if (!leads.length) {
    appNode.replaceChildren(el("p", { class: "empty" }, ["还没有线索。去巡检，或在下面收录一条公开帖。"]));
    return;
  }
  appNode.replaceChildren(...leads.map((lead) => el("article", { class: "card" }, [
    el("header", {}, [
      el("strong", {}, [lead.author || platformLabel(lead.platform)]),
      el("span", { class: lead.status === "watching" ? "badge watch" : "badge" }, [STATUS[lead.status] || lead.status]),
    ]),
    leadMeta(lead),
    el("p", { class: "meta" }, [lead.score_reason]),
    el("p", { class: "post" }, [lead.text]),
    el("div", { class: "actions" }, [
      lead.status === "watching" ? el("button", {
        type: "button",
        onclick: async () => {
          await api(`/api/leads/${lead.id}/queue`, { method: "POST" });
          await refresh(true);
        },
      }, ["加入待发送"]) : "",
      lead.url.startsWith("http") ? el("a", { href: lead.url, target: "_blank", rel: "noreferrer" }, ["打开原帖"]) : "",
    ]),
  ])));
}

function renderScan(data) {
  const settings = data.settings || {};
  const scan = data.scan;
  const selected = new Set((settings.platforms || "").split(",").filter(Boolean));
  const status = el("p", { class: "meta", id: "scan-status" }, [scanText(scan)]);
  appNode.replaceChildren(
    el("form", {
      class: "card",
      id: "scan-form",
      onsubmit: async (event) => {
        event.preventDefault();
        const form = event.target;
        const keywords = form.keywords.value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
        const platforms = [...form.querySelectorAll("input[name=platform]:checked")].map((node) => node.value);
        try {
          await api("/api/settings", { method: "PUT", body: JSON.stringify({ keywords: form.keywords.value, platforms }) });
          await api("/api/scans", { method: "POST", body: JSON.stringify({ keywords, platforms }) });
          showError("");
          if (document.activeElement) document.activeElement.blur();
          await refresh(true);
        } catch (error) {
          showError(error.message);
        }
      },
    }, [
      el("strong", {}, ["巡检公开求购"]),
      status,
      el("label", {}, ["关键词，一行一个", el("textarea", { name: "keywords", id: "keywords" }, [])]),
      el("div", { class: "checks" }, [
        check("xiaohongshu", "小红书", selected),
        check("douyin", "抖音", selected),
        check("boss", "BOSS", selected),
      ]),
      el("button", { type: "submit", class: "primary", id: "scan-button" }, ["开始巡检"]),
    ]),
    importCard(),
    settingsCard(settings),
  );
  const keywords = appNode.querySelector("#keywords");
  if (keywords) keywords.value = settings.keywords || "";
}

function check(value, label, selected) {
  const input = el("input", { type: "checkbox", name: "platform", value });
  input.checked = selected.has(value);
  return el("label", {}, [input, label]);
}

function scanText(scan) {
  if (!scan) return "还没有巡检过。";
  if (scan.status === "running") return "正在搜公开结果…";
  const head = scan.status === "failed" ? "这一轮没有拿到结果。" : `新增 ${scan.added} 条，跳过 ${scan.skipped} 条。`;
  return scan.detail ? `${head} ${scan.detail}` : head;
}

function importCard() {
  return el("form", {
    class: "card",
    id: "import-form",
    onsubmit: async (event) => {
      event.preventDefault();
      const form = event.target;
      try {
        await api("/api/leads/import", {
          method: "POST",
          body: JSON.stringify({
            platform: form.platform.value,
            author: form.author.value,
            url: form.url.value,
            text: form.text.value,
          }),
        });
        showError("");
        tab = "leads";
        await refresh(true);
      } catch (error) {
        showError(error.message);
      }
    },
  }, [
    el("strong", {}, ["收录一条公开帖"]),
    el("div", { class: "actions" }, [
      el("label", {}, ["平台", selectPlatform()]),
      el("label", {}, ["作者", el("input", { name: "author", placeholder: "可以留空" })]),
      el("label", { class: "wide" }, ["原帖链接", el("input", { name: "url", class: "wide", placeholder: "https://" })]),
    ]),
    el("label", {}, ["帖子正文", el("textarea", { name: "text", id: "import-text" })]),
    el("div", { class: "actions" }, [
      el("button", { type: "submit", class: "primary" }, ["收录"]),
      el("button", {
        type: "button",
        onclick: (event) => {
          const form = event.target.form;
          form.platform.value = "xiaohongshu";
          form.author.value = "广州女装代运营";
          form.url.value = "https://www.xiaohongshu.com/explore/example";
          form.text.value = "广州女装代运营，找长期主图视频剪辑，每天20条左右，稳定日更。";
        },
      }, ["填入示例"]),
    ]),
  ]);
}

function selectPlatform() {
  const select = el("select", { name: "platform" });
  [["xiaohongshu", "小红书"], ["douyin", "抖音"], ["boss", "BOSS"], ["other", "其他"]].forEach(([value, label]) => {
    select.append(el("option", { value }, [label]));
  });
  return select;
}

function settingsCard(settings) {
  return el("form", {
    class: "card",
    id: "settings-form",
    onsubmit: async (event) => {
      event.preventDefault();
      const form = event.target;
      try {
        await api("/api/settings", {
          method: "PUT",
          body: JSON.stringify({
            threshold: Number(form.threshold.value),
            handoff_webhook: form.handoff_webhook.value,
            inbox_token: form.inbox_token.value,
            wecom_corpid: form.wecom_corpid.value,
            wecom_secret: form.wecom_secret.value,
            wecom_open_kfid: form.wecom_open_kfid.value,
          }),
        });
        showError("");
        await refresh(true);
      } catch (error) {
        showError(error.message);
      }
    },
  }, [
    el("strong", {}, ["交接和企业微信"]),
    el("div", { class: "actions" }, [
      field("收录分数", "threshold", settings.threshold || "60"),
      field("交接 Webhook", "handoff_webhook", settings.handoff_webhook || ""),
      field("进线口令", "inbox_token", settings.inbox_token || ""),
      field("企业微信 CorpID", "wecom_corpid", settings.wecom_corpid || ""),
      field("企业微信 Secret", "wecom_secret", settings.wecom_secret || ""),
      field("客服账号 ID", "wecom_open_kfid", settings.wecom_open_kfid || ""),
    ]),
    el("p", { class: "meta" }, [
      "对方加了企业微信客服并开口后，把解密后的文本 POST 到 /api/inbound。配齐上面三项后，X 会直接把回复发回微信。",
    ]),
    el("button", { type: "submit" }, ["保存设置"]),
  ]);
}

function field(label, name, value) {
  const input = el("input", { name, class: "wide" });
  input.value = value;
  return el("label", {}, [label, input]);
}

refresh(true);
setInterval(() => refresh(false), 4000);
