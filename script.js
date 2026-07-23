const REELS = [
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    user: "riya.dance", tag: "Trending",
    caption: "Sunday morning vibes 🌻 #dance #bharatplay",
    sound: "Riya ki Original Awaaz",
    avatar: "https://i.pravatar.cc/100?img=47",
    likes: "128K", comments: "842", shares: "310"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    user: "foodie_raj", tag: "Foodie",
    caption: "Street style pani puri 😋 #streetfood",
    sound: "Original audio - foodie_raj",
    avatar: "https://i.pravatar.cc/100?img=12",
    likes: "64.2K", comments: "1.2K", shares: "980"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    user: "traveltak.india", tag: "Travel",
    caption: "Ladakh ki subah ❄️ #travel #india",
    sound: "Pahadi beats - remix",
    avatar: "https://i.pravatar.cc/100?img=33",
    likes: "302K", comments: "5.4K", shares: "2.1K"
  }
];

const feed = document.getElementById('feed');
let muted = true;

function heartIcon(filled){
  return `<svg viewBox="0 0 24 24" ${filled? 'fill="var(--heart)" stroke="var(--heart)"':'fill="none" stroke="white"'} stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
}
const commentIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const shareIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

// Render Reels
REELS.forEach((r) => {
  const el = document.createElement('div');
  el.className = 'reel';
  el.innerHTML = `
    <video src="${r.src}" loop playsinline muted preload="metadata"></video>
    <div class="reel-shade"></div>
    <div class="rail">
      <div class="rail-item"><div class="rail-avatar"><img src="${r.avatar}"></div></div>
      <div class="rail-item like-item"><div class="rail-btn">${heartIcon(false)}</div><div class="rail-count">${r.likes}</div></div>
      <div class="rail-item comment-item"><div class="rail-btn">${commentIcon}</div><div class="rail-count">${r.comments}</div></div>
      <div class="rail-item share-item"><div class="rail-btn">${shareIcon}</div><div class="rail-count">${r.shares}</div></div>
    </div>
    <div class="info">
      <div class="username"><span>@${r.user}</span><span class="tag">${r.tag}</span><button class="follow-btn">Follow</button></div>
      <div class="caption">${r.caption}</div>
    </div>
  `;
  feed.appendChild(el);

  const video = el.querySelector('video');
  const likeItem = el.querySelector('.like-item');
  const commentItem = el.querySelector('.comment-item');
  const shareItem = el.querySelector('.share-item');
  const followBtn = el.querySelector('.follow-btn');
  let liked = false;

  el.addEventListener('click', (e) => {
    if (e.target.closest('.rail-item') || e.target.closest('.info')) return;
    if (video.paused) video.play(); else video.pause();
  });

  likeItem.addEventListener('click', () => {
    liked = !liked;
    likeItem.classList.toggle('liked', liked);
    likeItem.querySelector('.rail-btn').innerHTML = heartIcon(liked);
  });

  commentItem.addEventListener('click', () => {
    document.getElementById('comment-overlay').classList.add('active');
  });

  shareItem.addEventListener('click', () => {
    document.getElementById('share-overlay').classList.add('active');
  });

  followBtn.addEventListener('click', function() {
    this.innerText = (this.innerText === "Follow") ? "Following" : "Follow";
    this.style.background = (this.innerText === "Following") ? "white" : "transparent";
    this.style.color = (this.innerText === "Following") ? "black" : "white";
  });
});

// Autoplay videos
const videos = [...document.querySelectorAll('.reel video')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const v = entry.target;
    if (entry.isIntersecting && entry.intersectionRatio > 0.6){
      v.muted = muted;
      v.play().catch(()=>{});
    } else { v.pause(); }
  });
}, { threshold: [0.6] });
videos.forEach(v => observer.observe(v));

// Mute Toggle
const muteBtn = document.getElementById('muteBtn');
muteBtn.addEventListener('click', () => {
  muted = !muted;
  videos.forEach(v => v.muted = muted);
});

// Bottom Navigation Screen Switching
const navItems = document.querySelectorAll('.nav-item');
const pageViews = document.querySelectorAll('.page-view');

navItems.forEach(item => {
  item.addEventListener('click', function() {
    navItems.forEach(n => n.classList.remove('active'));
    pageViews.forEach(p => p.classList.remove('active'));

    this.classList.add('active');
    const viewId = 'view-' + this.id.replace('nav-', '');
    document.getElementById(viewId).classList.add('active');

    // Pause videos when not on Home Feed
    if(viewId !== 'view-home') {
      videos.forEach(v => v.pause());
    } else {
      videos[0].play().catch(()=>{});
    }
  });
});

// Close Drawers
document.getElementById('close-comments').addEventListener('click', () => {
  document.getElementById('comment-overlay').classList.remove('active');
});
document.getElementById('close-share').addEventListener('click', () => {
  document.getElementById('share-overlay').classList.remove('active');
});

// Post Comment Logic
document.getElementById('send-comment-btn').addEventListener('click', () => {
  const input = document.getElementById('comment-input');
  if(input.value.trim() !== '') {
    const list = document.getElementById('comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `<strong>@aap</strong>: ${input.value}`;
    list.appendChild(newComment);
    input.value = '';
    list.scrollTop = list.scrollHeight;
  }
});

// Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
