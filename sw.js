const CACHE = "morse-v1";
const FILES = [
  "./",
  "index.html",
  "assets/fonts/poppins-600.woff2",
  "assets/fonts/poppins-700.woff2",
  "assets/fonts/poppins.css",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/images/badge.svg",
  "assets/images/close.svg",
  "assets/images/favicon.png",
  "assets/images/icons/letters/Archery.png",
  "assets/images/icons/letters/Banjo.png",
  "assets/images/icons/letters/Candy.png",
  "assets/images/icons/letters/Dog.png",
  "assets/images/icons/letters/Eye.png",
  "assets/images/icons/letters/Firetruck.png",
  "assets/images/icons/letters/Giraffe.png",
  "assets/images/icons/letters/Hippo.png",
  "assets/images/icons/letters/Insect.png",
  "assets/images/icons/letters/Jet.png",
  "assets/images/icons/letters/Kite.png",
  "assets/images/icons/letters/Laboratory.png",
  "assets/images/icons/letters/Mustache.png",
  "assets/images/icons/letters/Net.png",
  "assets/images/icons/letters/Orchestra.png",
  "assets/images/icons/letters/Paddle.png",
  "assets/images/icons/letters/Quarterback.png",
  "assets/images/icons/letters/Robot.png",
  "assets/images/icons/letters/Submarine.png",
  "assets/images/icons/letters/Tape.png",
  "assets/images/icons/letters/Unicorn.png",
  "assets/images/icons/letters/Vacuum.png",
  "assets/images/icons/letters/Wand.png",
  "assets/images/icons/letters/X-ray.png",
  "assets/images/icons/letters/Yard.png",
  "assets/images/icons/letters/Zebra.png",
  "assets/images/icons/numbers/Eight.png",
  "assets/images/icons/numbers/Five.png",
  "assets/images/icons/numbers/Four.png",
  "assets/images/icons/numbers/Nine.png",
  "assets/images/icons/numbers/One.png",
  "assets/images/icons/numbers/Seven.png",
  "assets/images/icons/numbers/Six.png",
  "assets/images/icons/numbers/Three.png",
  "assets/images/icons/numbers/Two.png",
  "assets/images/icons/numbers/Zero.png",
  "assets/images/icons/punctuation/AAA.png",
  "assets/images/icons/punctuation/AC.png",
  "assets/images/icons/punctuation/AR.png",
  "assets/images/icons/punctuation/AS.png",
  "assets/images/icons/punctuation/CM.png",
  "assets/images/icons/punctuation/DA.png",
  "assets/images/icons/punctuation/DN.png",
  "assets/images/icons/punctuation/DU.png",
  "assets/images/icons/punctuation/GW.png",
  "assets/images/icons/punctuation/JN.png",
  "assets/images/icons/punctuation/KK.png",
  "assets/images/icons/punctuation/KN.png",
  "assets/images/icons/punctuation/NNN.png",
  "assets/images/icons/punctuation/OS.png",
  "assets/images/icons/punctuation/RR.png",
  "assets/images/icons/punctuation/UD.png",
  "assets/images/icons/punctuation/UK.png",
  "assets/images/level-1-desktop.png",
  "assets/images/level-1.png",
  "assets/images/level-2-desktop.png",
  "assets/images/level-2.png",
  "assets/images/level-3-desktop.png",
  "assets/images/level-3.png",
  "assets/images/mute.png",
  "assets/sounds/dash.mp3",
  "assets/sounds/dot.mp3",
  "assets/videos/intro-desktop.mp4",
  "assets/videos/intro.mp4",
  "build/bundle.js",
  "build/style.css",
  "manifest.webmanifest",
  "third-party/phaser/phaser.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((res) => {
      if (!res) return fetch(e.request);
      const range = e.request.headers.get("range");
      if (!range) return res;
      // Safari needs 206 partial responses for video playback.
      return res.blob().then((blob) => {
        const [, s, end] = /bytes=(\d*)-(\d*)/.exec(range) || [];
        const start = Number(s) || 0;
        const stop = end ? Number(end) + 1 : blob.size;
        return new Response(blob.slice(start, stop), {
          status: 206,
          headers: {
            "Content-Type": res.headers.get("Content-Type") || "",
            "Content-Range": `bytes ${start}-${stop - 1}/${blob.size}`,
            "Content-Length": String(stop - start),
          },
        });
      });
    })
  );
});
