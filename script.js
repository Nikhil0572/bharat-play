/* ---------------------------------- */

/* ---------- Auth (real OTP via Fast2SMS, through our own /api backend) ---------- */
function getAccount(){
  try {
    const raw = localStorage.getItem('bp_account');
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}

const authOverlay = document.getElementById('authOverlay');
const appEl = document.getElementById('app');
const stepPhone = document.getElementById('authStepPhone');
const stepOtp = document.getElementById('authStepOtp');
const phoneInput = document.getElementById('phoneInput');
const phoneError = document.getElementById('phoneError');
const otpInput = document.getElementById('otpInput');
const otpError = document.getElementById('otpError');
const otpLabel = document.getElementById('otpLabel');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const authDemoNote = document.getElementById('authDemoNote');

authDemoNote.textContent = "We'll text you a verification code. Standard message rates may apply.";

function showApp(){
  authOverlay.style.display = 'none';
  appEl.classList.add('ready');
}

let otpToken = null; // signed token returned by /api/send-otp, needed to verify

const existingAccount = getAccount();
if (existingAccount){
  showApp();
} else {
  sendOtpBtn.addEventListener('click', () => {
    const val = phoneInput.value.trim();
    if (!/^[6-9]\d{9}$/.test(val)){
      phoneError.style.display = 'block';
      return;
    }
    phoneError.style.display = 'none';
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending OTP...';

    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: val })
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.token) throw new Error(data.error || 'Failed to send OTP');
        otpToken = data.token;
        otpLabel.textContent = `Enter the OTP sent to +91 ${val}`;
        stepPhone.style.display = 'none';
        stepOtp.style.display = 'block';
        otpInput.focus();
      })
      .catch((error) => {
        console.error(error);
        phoneError.textContent = 'Could not send OTP. Please check the number and try again.';
        phoneError.style.display = 'block';
      })
      .finally(() => {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send OTP';
      });
  });

  document.getElementById('changeNumberBtn').addEventListener('click', () => {
    stepOtp.style.display = 'none';
    stepPhone.style.display = 'block';
    otpInput.value = '';
    otpError.style.display = 'none';
  });

  verifyOtpBtn.addEventListener('click', () => {
    const otp = otpInput.value.trim();
    if (otp.length !== 6 || !otpToken){
      otpError.textContent = 'Enter the 6-digit OTP';
      otpError.style.display = 'block';
      return;
    }
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = 'Verifying...';

    fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: otpToken, otp })
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Verification failed');
        const account = { phone: data.phone, createdAt: Date.now() };
        localStorage.setItem('bp_account', JSON.stringify(account));
        showApp();
      })
      .catch((error) => {
        console.error(error);
        otpError.textContent = error.message === 'OTP expired, please request a new one'
          ? error.message
          : 'Wrong OTP, please try again.';
        otpError.style.display = 'block';
      })
      .finally(() => {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify & Continue';
      });
  });
}

/* ---------------------------------- */

const REELS = [
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    user: "nitinsharma", tag: "Founder", verified: true,
    caption: "Welcome to Bharat Play 🇮🇳 Made this app from scratch — hope you enjoy scrolling as much as I enjoyed building it! #bharatplay #founder",
    sound: "Nitin Sharma - Original audio",
    avatar: "https://i.pravatar.cc/100?img=68",
    likes: "540K", comments: "12.3K", shares: "8.9K"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    user: "riya.dance", tag: "Trending",
    caption: "Sunday morning vibes 🌻 tried this new choreography, let me know what you think! #dance #bharatplay",
    sound: "Riya - Original audio",
    avatar: "https://i.pravatar.cc/100?img=47",
    likes: "128K", comments: "842", shares: "310"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    user: "foodie_raj", tag: "Food",
    caption: "Homemade street-style pani puri 😋 drop a comment if you want the recipe! #food #streetfood",
    sound: "Original audio - foodie_raj",
    avatar: "https://i.pravatar.cc/100?img=12",
    likes: "64.2K", comments: "1.2K", shares: "980"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    user: "traveltak.india", tag: "Travel",
    caption: "Sunrise in Ladakh ❄️ this view never gets old. Where should I go next? #india #travel",
    sound: "Mountain beats - remix",
    avatar: "https://i.pravatar.cc/100?img=33",
    likes: "302K", comments: "5.4K", shares: "2.1K"
  },
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    user: "studio.beats.official", tag: "Music",
    caption: "First look at the new album 🎶 full song link in bio. #newmusic #bharatplay",
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
const verifiedBadge = `<svg viewBox="0 0 24 24" width="15" height="15" style="flex-shrink:0;"><path fill="#3897F0" d="M12 2 14.5 4.2 17.8 3.6 18.8 6.8 21.8 8.4 20.6 11.6 21.8 14.8 18.8 16.4 17.8 19.6 14.5 19 12 21.2 9.5 19 6.2 19.6 5.2 16.4 2.2 14.8 3.4 11.6 2.2 8.4 5.2 6.8 6.2 3.6 9.5 4.2z"/><path fill="white" d="M10.6 14.9 8.4 12.7l1.1-1.1 1.1 1.1 3.1-3.1 1.1 1.1z"/></svg>`;

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
        ${r.verified ? verifiedBadge : ''}
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
  let following = false;

  el.addEventListener('click', (e) => {
    if (e.target.closest('.rail-item') || e.target.closest('.info')) return;
    if (video.paused) video.play(); else video.pause();
  });

  likeItem.addEventListener('click', () => {
    liked = !liked;
    likeItem.classList.toggle('liked', liked);
    likeItem.querySelector('.rail-btn').innerHTML = heartIcon(liked);
  });

  followBtn.addEventListener('click', () => {
    following = !following;
    followBtn.textContent = following ? 'Following' : 'Follow';
    followBtn.style.background = following ? 'rgba(255,255,255,0.2)' : 'transparent';
    showToast(following ? `You are now following @${r.user}` : `Unfollowed @${r.user}`);
  });

  commentItem.addEventListener('click', () => openComments(r));
  shareItem.addEventListener('click', () => openShare(r));
  moreItem.addEventListener('click', () => openMore(r));

  el._video = video;
});

// Autoplay only the visible reel
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

// start first video on load (needs a user gesture on some browsers, so also bind to first click)
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

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg){
  let toast = document.getElementById('toastBox');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'toastBox';
    toast.className = 'toast';
    document.getElementById('app').appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

/* ---------- Bottom sheet ---------- */
const sheetOverlay = document.getElementById('sheetOverlay');
const sheetContent = document.getElementById('sheetContent');
function openSheet(html){
  sheetContent.innerHTML = html;
  sheetOverlay.classList.add('open');
}
function closeSheet(){ sheetOverlay.classList.remove('open'); }
sheetOverlay.addEventListener('click', (e) => { if(e.target === sheetOverlay) closeSheet(); });

const SAMPLE_COMMENTS = [
  { user: "aisha.k", text: "This is amazing! 🔥", avatar: "https://i.pravatar.cc/60?img=5" },
  { user: "rohit_singh", text: "How did you do this, so good 😍", avatar: "https://i.pravatar.cc/60?img=8" },
  { user: "priya.here", text: "When is the next part coming?", avatar: "https://i.pravatar.cc/60?img=9" },
  { user: "dev.codes", text: "Bharat Play is the best app 🇮🇳", avatar: "https://i.pravatar.cc/60?img=14" },
];
function openComments(r){
  const rows = SAMPLE_COMMENTS.map(c => `
    <div class="comment-row">
      <img src="${c.avatar}" alt="">
      <div>
        <div class="comment-user">@${c.user}</div>
        <div class="comment-text">${c.text}</div>
      </div>
    </div>
  `).join('');
  openSheet(`<div class="sheet-title">${r.comments} Comments</div>${rows}
    <div style="font-size:12px;color:var(--text-faint);text-align:center;margin-top:10px;">
      Posting comments will work once a backend is connected
    </div>`);
}
function openShare(r){
  const opts = [
    ["💬","WhatsApp"], ["📋","Copy link"], ["📩","Message"], ["📸","Instagram"], ["👥","Friends"], ["⋯","More"]
  ];
  const grid = opts.map(([icon,label]) => `
    <div class="share-opt" data-label="${label}">
      <div class="share-circle">${icon}</div>
      <span>${label}</span>
    </div>
  `).join('');
  openSheet(`<div class="sheet-title">Share @${r.user}'s reel</div><div class="share-grid">${grid}</div>`);
  sheetContent.querySelectorAll('.share-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      closeSheet();
      showToast(`Shared via ${opt.dataset.label} (demo)`);
    });
  });
}
function openMore(r){
  openSheet(`
    <div class="sheet-title">Options</div>
    <div class="more-opt">🔖 Save</div>
    <div class="more-opt">🔇 Mute @${r.user}</div>
    <div class="more-opt">🚫 Not interested</div>
    <div class="more-opt" style="color:#ff5c5c;">⚠️ Report</div>
  `);
  sheetContent.querySelectorAll('.more-opt').forEach(opt => {
    opt.addEventListener('click', () => { closeSheet(); showToast('Done ✓'); });
  });
}

/* ---------- Full screen panels ---------- */
const screenOverlay = document.getElementById('screenOverlay');
const screenTitle = document.getElementById('screenTitle');
const screenBody = document.getElementById('screenBody');
document.getElementById('screenBack').addEventListener('click', () => {
  screenOverlay.classList.remove('open');
});

function openScreen(title, html){
  screenTitle.textContent = title;
  screenBody.innerHTML = html;
  screenOverlay.classList.add('open');
}

function emptyState(icon, title, sub){
  return `<div class="empty-state"><div class="big">${icon}</div><div class="title">${title}</div><div class="sub">${sub}</div></div>`;
}

document.getElementById('navSearch').addEventListener('click', () => {
  openScreen('Search', `
    <input class="search-input" placeholder="Search reels, people, hashtags...">
    ${emptyState('🔍','Search something','Type a name, hashtag, or sound to find reels')}
  `);
});

document.getElementById('navCreate').addEventListener('click', () => {
  openScreen('Create New Reel', `
    <div class="create-opt"><div class="ic">🎥</div><div><b>Record</b><span>Shoot directly with your camera</span></div></div>
    <div class="create-opt"><div class="ic">🖼️</div><div><b>Choose from gallery</b><span>Upload a video you already have</span></div></div>
    <div class="create-opt"><div class="ic">🎵</div><div><b>Trending sounds</b><span>Browse popular music</span></div></div>
    ${emptyState('🎬','Upload is a demo feature right now','Connecting a real backend (like Firebase Storage) will make this work')}
  `);
});

document.getElementById('navLikes').addEventListener('click', () => {
  openScreen('Liked Reels', emptyState('❤️','No liked reels yet','Reels you like will show up here'));
});

document.getElementById('navProfile').addEventListener('click', () => {
  const acc = getAccount();
  openScreen('Profile', `
    <div class="profile-top">
      <img src="https://i.pravatar.cc/150?img=47" alt="">
      <div class="pname">${acc ? '+91 ' + acc.phone : '@your.account'}</div>
      <div class="profile-stats">
        <div><b>0</b><span>Reels</span></div>
        <div><b>0</b><span>Followers</span></div>
        <div><b>0</b><span>Following</span></div>
      </div>
    </div>
    ${emptyState('🎞️','No reels posted yet','Post your first reel from the Create tab')}
    <div style="text-align:center;margin-top:24px;">
      <button id="logoutBtn" style="background:none;border:1px solid rgba(255,255,255,0.25);color:var(--white);padding:9px 20px;border-radius:8px;font-size:13px;font-weight:600;">Log out</button>
    </div>
    <div style="text-align:center;margin-top:26px;font-size:11px;color:var(--text-faint);line-height:1.6;">
      Bharat Play<br>Founded &amp; owned by Nitin Sharma ✔
    </div>
  `);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('bp_account');
    location.reload();
  });
});

document.getElementById('tabFollowing').addEventListener('click', () => {
  document.getElementById('tabFollowing').classList.add('active');
  document.getElementById('tabReels').classList.remove('active');
  openScreen('Following', emptyState('👥','Not following anyone yet','Reels from people you follow will show up here'));
  setTimeout(() => {
    document.getElementById('tabFollowing').classList.remove('active');
    document.getElementById('tabReels').classList.add('active');
  }, 300);
});


// Remove any previously installed service worker so old cached
// broken versions stop being served to returning visitors.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
}
if (window.caches) {
  caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
}
