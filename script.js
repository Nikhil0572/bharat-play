const REELS = [
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    user: "riya.dance", tag: "Trending",
    caption: "Sunday morning vibes 🌻 nayi choreography try ki maine, kaisi lagi batao! #dance #bharatplay",
    sound: "Riya ki Original Awaaz",
    avatar: "https://i.pravatar.cc/100?img=47",
    likes: "128K", comments: "842", shares: "310"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    user: "foodie_raj", tag: "Foodie",
    caption: "Ghar ka banaya street style pani puri 😋 recipe comment me maango! #khana #streetfood",
    sound: "Original audio - foodie_raj",
    avatar: "https://i.pravatar.cc/100?img=12",
    likes: "64.2K", comments: "1.2K", shares: "980"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    user: "traveltak.india", tag: "Travel",
    caption: "Ladakh ki subah ❄️ ye view kabhi purana nahi hota. Kahan ghumne jaana hai next? #india #travel",
    sound: "Pahadi beats - remix",
    avatar: "https://i.pravatar.cc/100?img=33",
    likes: "302K", comments: "5.4K", shares: "2.1K"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    user: "comedy.wala.arjun", tag: "Comedy",
    caption: "Jab ghar walo ko pata chale ki result aa gaya 😂😂 tag karo apne dost ko!",
    sound: "Funny trending sound",
    avatar: "https://i.pravatar.cc/100?img=15",
    likes: "89.7K", comments: "3.3K", shares: "1.5K"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    user: "studio.beats.official", tag: "Music",
    caption: "Naye album ka pehla jhalak 🎶 full song link bio me. #newmusic #bharatplay",
    sound: "Studio Beats - Teaser",
    avatar: "https://i.pravatar.cc/100?img=60",
    likes: "210K", comments: "7.8K", shares: "4.4K"
  }
];

const feed = document.getElementById('feed');
let muted = true;

function heartIcon(filled){
  return `<svg viewBox="0 0 24 24" ${filled? 'fill="var(--heart)" stroke="var(--heart)"':'fill="none" stroke="white"'} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
}
const commentIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const shareIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const moreIcon = `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>`;
const noteIcon = `<svg viewBox="0 0 24 24" fill="white"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="none" stroke="white" stroke-width="2"/><circle cx="18" cy="16" r="3" fill="none" stroke="white" stroke-width="2"/></svg>`;

REELS.forEach((r, i) => {
  const el = document.createElement('div');
  el.className = 'reel';
  el.innerHTML = `
    <video src="${r.src}" loop playsinline muted preload="metadata"></video>
    <div class="reel-shade"></div>
    <div class="rail">
      <div class="rail-item">
        <div class="rail-avatar"><img src="${r.avatar}" alt=""></div>
      </div>
      <div class="rail-item like-item">
        <div class="rail-btn">${heartIcon(false)}</div>
        <div class="rail-count">${r.likes}</div>
      </div>
      <div class="rail-item comment-item">
        <div class="rail-btn">${commentIcon}</div>
        <div class="rail-count">${r.comments}</div>
      </div>
      <div class="rail-item share-item">
        <div class="rail-btn">${shareIcon}</div>
        <div class="rail-count">${r.shares}</div>
      </div>
      <div class="rail-item more-item">
        <div class="rail-btn">${moreIcon}</div>
      </div>
    </div>
    <div class="info">
      <div class="username">
        <span>@${r.user}</span>
        <span class="tag">${r.tag}</span>
        <span class="follow-btn">Follow</span>
      </div>
      <div class="caption">${r.caption}</div>
      <div class="sound">
        <div class="sound-icon">${noteIcon}</div>
        <div class="marquee-wrap"><div class="marquee">${r.sound} &nbsp;&nbsp;•&nbsp;&nbsp; ${r.sound} &nbsp;&nbsp;•&nbsp;&nbsp;</div></div>
      </div>
    </div>
  `;
  feed.appendChild(el);

  const video = el.querySelector('video');
  const likeItem = el.querySelector('.like-item');
  const commentItem = el.querySelector('.comment-item');
  const shareItem = el.querySelector('.share-item');
  const moreItem = el.querySelector('.more-item');
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

  commentItem.addEventListener('click', () => alert('Comments section jaldi hi aayega!'));
  shareItem.addEventListener('click', () => alert('Video share karne ka option yahan khulega!'));
  moreItem.addEventListener('click', () => alert('More options...'));

  followBtn.addEventListener('click', function() {
    if(this.innerText === "Follow") {
        this.innerText = "Following";
        this.style.background = "white";
        this.style.color = "black";
    } else {
        this.innerText = "Follow";
        this.style.background = "transparent";
        this.style.color = "white";
    }
  });

  el._video = video;
});

const videos = [...document.querySelectorAll('.reel video')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const v = entry.target;
    if (entry.isIntersecting && entry.intersectionRatio > 0.6){
      v.muted = muted;
      v.play().catch(()=>{});
    } else {
      v.pause();
    }
  });
}, { threshold: [0.6] });
videos.forEach(v => observer.observe(v));

window.addEventListener('load', () => {
  videos[0].muted = muted;
  videos[0].play().catch(()=>{});
});

const muteBtn = document.getElementById('muteBtn');
muteBtn.addEventListener('click', () => {
  muted = !muted;
  videos.forEach(v => v.muted = muted);
  muteBtn.innerHTML = muted
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a9 9 0 0 1 0 12"/></svg>`;
});

const topTabs = document.querySelectorAll('.tab');
topTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        topTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        if(this.id === 'nav-create') {
            alert('Camera open karne ka feature yahan aayega!');
        }
    });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
