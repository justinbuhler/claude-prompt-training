/* ---------------------------------------------------------------
   Local-environment shim.

   PromptLab.jsx is the file straight out of the artifact — don't edit it.
   Everything it expects from the artifact sandbox is recreated here, so you
   can re-download a newer PromptLab.jsx any time and just drop it in.

   Two gaps to fill:
     1. window.storage  -> backed by localStorage
     2. api.anthropic.com calls -> routed to the Vite proxy, which holds the key
   --------------------------------------------------------------- */

const PREFIX = "promptlab:";

window.storage = {
  async get(key) {
    const v = localStorage.getItem(PREFIX + key);
    // The artifact API throws on a missing key rather than returning null.
    if (v === null) throw new Error("Key not found: " + key);
    return { key, value: v, shared: false };
  },
  async set(key, value) {
    localStorage.setItem(PREFIX + key, value);
    return { key, value, shared: false };
  },
  async delete(key) {
    localStorage.removeItem(PREFIX + key);
    return { key, deleted: true, shared: false };
  },
  async list(prefix = "") {
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX + prefix))
      .map((k) => k.slice(PREFIX.length));
    return { keys, prefix, shared: false };
  },
};

const MODEL = import.meta.env.VITE_CLAUDE_MODEL || "claude-sonnet-4-5";
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  if (url && url.startsWith("https://api.anthropic.com")) {
    const local = url.replace("https://api.anthropic.com", "/anthropic");
    let opts = init;
    // Swap in whichever model you configured, without touching the course file.
    if (init && typeof init.body === "string") {
      try {
        const body = JSON.parse(init.body);
        body.model = MODEL;
        opts = { ...init, body: JSON.stringify(body) };
      } catch (e) {
        /* not JSON — forward unchanged */
      }
    }
    return nativeFetch(local, opts);
  }
  return nativeFetch(input, init);
};
