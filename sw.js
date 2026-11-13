// ConnectChat service worker: PWA shell cache + Firebase Cloud Messaging.
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDgafD-CDcaiam_Efh9kJZuEBSZ0kUM9Jw",
  authDomain: "connectchat-6309c.firebaseapp.com",
  projectId: "connectchat-6309c",
  storageBucket: "connectchat-6309c.firebasestorage.app",
  messagingSenderId: "983109078249",
  appId: "1:983109078249:web:aff21aa205b8a4c8b6b478"
};
if (!Object.values(firebaseConfig).some(value => String(value).includes("YOUR_"))) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
    const data = payload.data || {};
    const isCall = data.type === "incoming_call";
    const mode = data.mode === "video" ? "video" : "audio";
    const title = data.title || payload.notification?.title || (isCall ? "Incoming call" : "ConnectChat");
    const options = {
      body: data.body || payload.notification?.body || (isCall ? `Incoming ${mode === "video" ? "video" : "voice"} call` : "You have a new message."),
      icon: data.icon || "./icon-192.png",
      badge: "./icon-192.png",
      tag: isCall ? `connectchat-call-${data.callId || Date.now()}` : `connectchat-${data.messageId || Date.now()}`,
      renotify: true,
      requireInteraction: isCall,
      data: { url: data.url || "./", type: data.type || "message", mode, callId: data.callId || "" },
      actions: isCall ? [
        { action: "answer", title: "Answer" },
        { action: "decline", title: "Decline" }
      ] : [ { action: "open", title: "Open chat" } ]
    };
    return self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", event => {
  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action || "open";
  notification.close();
  const targetUrl = new URL(data.url || "./", self.location.origin);
  if (data.type === "incoming_call") {
    targetUrl.searchParams.set("incomingCall", action === "decline" ? "decline" : "answer");
    if (data.callId) targetUrl.searchParams.set("callId", data.callId);
    targetUrl.searchParams.set("callMode", data.mode || "audio");
  }
  const target = targetUrl.href;
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clientsList) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(target);
  })());
});

self.addEventListener("notificationclose", event => {
  // Closing the notification does not itself decline a live call.
});

const CACHE = "connectchat-shell-v3-call-push";
const FILES = ["./", "./index.html", "./styles.css", "./manifest.webmanifest"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
