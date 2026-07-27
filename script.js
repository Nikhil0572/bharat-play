/* ---------------------------------- */

/* ---------- Auth (email + password via Firebase) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyAl-LuxyjTr-veAiftzJxyZA7lK4y9UA6s",
  authDomain: "pioneering-flag-453005-g5.firebaseapp.com",
  projectId: "pioneering-flag-453005-g5",
  storageBucket: "pioneering-flag-453005-g5.firebasestorage.app",
  messagingSenderId: "1009940089106",
  appId: "1:1009940089106:web:ff4cd307470aad29854bcb",
  measurementId: "G-DSCH8MPTGY"
};
firebase.initializeApp(firebaseConfig);

function getAccount(){
  try {
    const raw = localStorage.getItem('bp_account');
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}

const authOverlay = document.getElementById('authOverlay');
const appEl = document.getElementById('app');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authError = document.getElementById('authError');
const loginBtn = document.getElementById('loginBtn');

function showApp(){
  authOverlay.style.display = 'none';
  appEl.classList.add('ready');
}

function saveAccountAndEnter(user){
  const account = {
    email: user.email,
    uid: user.uid,
    createdAt: Date.now()
  };
  localStorage.setItem('bp_account', JSON.stringify(account));
  showApp();
}

const existingAccount = getAccount();
if (existingAccount){
  showApp();
} else {
  loginBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    authError.style.display = 'none';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      authError.textContent = 'Please enter a valid email address.';
      authError.style.display = 'block';
      return;
    }
    if (password.length < 6){
      authError.textContent = 'Password must be at least 6 characters.';
      authError.style.display = 'block';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Please wait...';

    function resetButton(){
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log In / Sign Up';
    }

    // Try logging in first. If the account doesn't exist yet (Firebase may
    // report this as 'auth/user-not-found' or, on newer SDK versions,
    // the more generic 'auth/invalid-credential'), fall back to creating
    // a new account automatically — this gives a single-step login-or-signup
    // experience without us needing to know in advance which case it is.
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((result) => saveAccountAndEnter(result.user))
      .catch((error) => {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((result) => saveAccountAndEnter(result.user))
          .catch((err) => {
            if (err.code === 'auth/email-already-in-use'){
              // Account exists after all — the original sign-in failure
              // really was a wrong password.
              authError.textContent = 'Incorrect password. Please try again.';
            } else {
              authError.textContent = err.message.replace('Firebase: ', '');
            }
            authError.style.display = 'block';
          });
      })
      .finally(resetButton);
  });
}

/* ---------------------------------- */

const YOUTUBE_API_KEY = "AIzaSyAl-LuxyjTr-veAiftzJxyZA7lK4y9UA6s";

const FOUNDER_REEL = {
  type: "local",
  src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  user: "nitinsharma", tag: "Founder", verified: true,
  caption: "Welcome to Bharat Play 🇮🇳 India ka apna short video app! #bharatplay #founder",
  sound: "Nitin Sharma - Original audio",
  avatar: "https://i.pravatar.cc/100?img=68",
  likes: "540K", comments: "12.3K", shares: "8.9K"
};

const feed = document.getElementById('feed');
let muted = true;
let observer;

function heartIcon(filled){
  return `<svg viewBox="0 0 24 24" ${filled?'fill="var(--heart)" stroke="var(--heart)"':'fill="none" stroke="white"'} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
}
const commentIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const shareIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const moreIcon = `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>`;
const noteIcon = `<svg viewBox="0 0 24 24" fill="white"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="none" stroke="white" stroke-width="2"/><circle cx="18" cy="16" r="3" fill="none" stroke="white" stroke-width="2"/></svg>`;
const verifiedBadge = `<svg viewBox="0 0 24 24" width="15" height="15" style="flex-shrink:0;"><path fill="#3897F0" d="M12 2 14.5 4.2 17.8 3.6 18.8 6.8 21.8 8.4 20.6 11.6 21.8 14.8 18.8 16.4 17.8 19.6 14.5 19 12 21.2 9.5 19 6.2 19.6 5.2 16.4 2.2 14.8 3.4 11.6 2.2 8.4 5.2 6.8 6.2 3.6 9.5 4.2z"/><path fill="white" d="M10.6 14.9 8.4 12.7l1.1-1.1 1.1 1.1 3.1-3.1 1.1 1.1z"/></svg>`;

function formatCount(n){
  if(!n) return '0';
  n = parseInt(n);
  if(n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if(n >= 1000) return (n/1000).toFixed(1)+'K';
  return String(n);
}

function setupObserver(){
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if(entry.isIntersecting && entry.intersectionRatio > 0.6){
        // Play local video
        const v = el.querySelector('video');
        if(v){ v.muted = muted; v.play().catch(()=>{}); }
        // Load YouTube iframe only when visible
        const iframe = el.querySelector('iframe');
        if(iframe && iframe.dataset.vid){
          const muteVal = muted ? 'mute=1' : 'mute=0';
          iframe.src = `https://www.youtube.com/embed/${iframe.dataset.vid}?autoplay=1&${muteVal}&loop=1&playlist=${iframe.dataset.vid}&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1`;
        }
      } else {
        // Pause local video
        const v = el.querySelector('video');
        if(v) v.pause();
        // Fully unload YouTube iframe to stop audio/video
        const iframe = el.querySelector('iframe');
        if(iframe && iframe.dataset.vid && iframe.src && iframe.src !== 'about:blank'){
          iframe.src = 'about:blank';
        }
      }
    });
  }, { threshold: [0.6] });
}

function buildReelEl(r){
  const el = document.createElement('div');
  el.className = 'reel';
  if(r.type === 'youtube'){
    const vsrc = `https://www.youtube.com/embed/${r.videoId}?autoplay=1&mute=${muted?1:0}&loop=1&playlist=${r.videoId}&playsinline=1&rel=0&modestbranding=1&controls=1`;
    el.innerHTML = `
      <iframe data-src="${vsrc}" data-vid="${r.videoId}" src="about:blank" frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen
        style="width:100%;height:100%;position:absolute;top:0;left:0;background:#000;"></iframe>
      <div class="reel-shade"></div>
      <div class="yt-badge" style="position:absolute;top:72px;right:12px;background:rgba(0,0,0,0.6);padding:4px 8px;border-radius:6px;font-size:11px;color:white;font-weight:700;display:flex;align-items:center;gap:4px;z-index:15;">
        <svg width="12" height="12" viewBox="0 0 24 24"><path fill="red" d="M19.6 3.2S18.4 2 16.9 2H7.1C5.6 2 4.4 3.2 4.4 3.2S3 4.4 3 8v8c0 3.6 1.4 4.8 1.4 4.8S5.6 22 7.1 22h9.8c1.5 0 2.7-1.2 2.7-1.2S21 19.6 21 16V8c0-3.6-1.4-4.8-1.4-4.8zm-7.6 9.6L9.5 14V10l2.5 1.4 2.5 1.4-2.5 1.4z"/></svg>YouTube
      </div>
      <div class="rail">
        <div class="rail-item"><div class="rail-avatar"><img src="${r.avatar}" alt=""></div></div>
        <div class="rail-item like-item"><div class="rail-btn">${heartIcon(false)}</div><div class="rail-count">${r.likes}</div></div>
        <div class="rail-item comment-item"><div class="rail-btn">${commentIcon}</div><div class="rail-count">${r.comments}</div></div>
        <div class="rail-item share-item"><div class="rail-btn">${shareIcon}</div><div class="rail-count">${r.shares}</div></div>
        <div class="rail-item more-item"><div class="rail-btn">${moreIcon}</div></div>
      </div>
      <div class="info">
        <div class="username"><span>@${r.user}</span><span class="tag">${r.tag}</span></div>
        <div class="caption">${r.caption}</div>
        <div class="sound"><div class="sound-icon">${noteIcon}</div><div class="marquee-wrap"><div class="marquee">${r.sound}&nbsp;&nbsp;•&nbsp;&nbsp;${r.sound}&nbsp;&nbsp;•&nbsp;&nbsp;</div></div></div>
      </div>`;
  } else {
    el.innerHTML = `
      <video src="${r.src}" loop playsinline muted preload="metadata"></video>
      <div class="reel-shade"></div>
      <div class="rail">
        <div class="rail-item"><div class="rail-avatar"><img src="${r.avatar}" alt=""></div></div>
        <div class="rail-item like-item"><div class="rail-btn">${heartIcon(false)}</div><div class="rail-count">${r.likes}</div></div>
        <div class="rail-item comment-item"><div class="rail-btn">${commentIcon}</div><div class="rail-count">${r.comments}</div></div>
        <div class="rail-item share-item"><div class="rail-btn">${shareIcon}</div><div class="rail-count">${r.shares}</div></div>
        <div class="rail-item more-item"><div class="rail-btn">${moreIcon}</div></div>
      </div>
      <div class="info">
        <div class="username"><span>@${r.user}</span>${r.verified?verifiedBadge:''}<span class="tag">${r.tag}</span><span class="follow-btn">Follow</span></div>
        <div class="caption">${r.caption}</div>
        <div class="sound"><div class="sound-icon">${noteIcon}</div><div class="marquee-wrap"><div class="marquee">${r.sound}&nbsp;&nbsp;•&nbsp;&nbsp;${r.sound}&nbsp;&nbsp;•&nbsp;&nbsp;</div></div></div>
      </div>`;
  }
  const likeItem = el.querySelector('.like-item');
  const commentItem = el.querySelector('.comment-item');
  const shareItem = el.querySelector('.share-item');
  const moreItem = el.querySelector('.more-item');
  const followBtn = el.querySelector('.follow-btn');
  let liked = false; let following = false;
  likeItem.addEventListener('click', () => {
    liked = !liked;
    likeItem.classList.toggle('liked', liked);
    likeItem.querySelector('.rail-btn').innerHTML = heartIcon(liked);
  });
  if(followBtn){
    followBtn.addEventListener('click', () => {
      following = !following;
      followBtn.textContent = following ? 'Following' : 'Follow';
      followBtn.style.background = following ? 'rgba(255,255,255,0.2)' : 'transparent';
      showToast(following ? `Now following @${r.user}` : `Unfollowed @${r.user}`);
    });
  }
  commentItem.addEventListener('click', () => openComments(r));
  shareItem.addEventListener('click', () => openShare(r));
  moreItem.addEventListener('click', () => openMore(r));
  observer.observe(el);
  return el;
}

async function fetchYoutubeTrending(category = ''){
  try {
    const catParam = category ? `&videoCategoryId=${category}` : '';
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=20${catParam}&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    if(!data.items) return [];
    return data.items.map(item => ({
      type:'youtube', videoId:item.id,
      user: item.snippet.channelTitle.toLowerCase().replace(/[^a-z0-9]/g,'_').substring(0,20),
      tag: (item.snippet.tags&&item.snippet.tags[0])?item.snippet.tags[0].substring(0,12):'Trending',
      caption: item.snippet.title.substring(0,80),
      sound: item.snippet.channelTitle,
      avatar: item.snippet.thumbnails.default.url,
      likes: formatCount(item.statistics.likeCount),
      comments: formatCount(item.statistics.commentCount),
      shares: formatCount(Math.floor(parseInt(item.statistics.viewCount||0)*0.02))
    }));
  } catch(e){ console.error('YT fetch failed',e); return []; }
}

// YouTube category IDs for India trending variety
const YT_CATEGORIES = ['', '10', '24', '23', '20', '22', '17', '28'];
let categoryIndex = 0;
let loadingMore = false;
let allVideos = [];

function addLoadMoreTrigger(){
  const trigger = document.createElement('div');
  trigger.id = 'load-more-trigger';
  trigger.style.cssText = 'height:2px;width:100%;';
  feed.appendChild(trigger);

  const triggerObserver = new IntersectionObserver(async (entries) => {
    if(entries[0].isIntersecting && !loadingMore){
      loadingMore = true;
      const cat = YT_CATEGORIES[categoryIndex % YT_CATEGORIES.length];
      categoryIndex++;
      const more = await fetchYoutubeTrending(cat);
      // Filter out duplicates
      const newVideos = more.filter(v => !allVideos.includes(v.videoId));
      newVideos.forEach(v => allVideos.push(v.videoId));
      feed.removeChild(trigger);
      newVideos.forEach(r => feed.appendChild(buildReelEl(r)));
      addLoadMoreTrigger(); // Add trigger again at new end
      loadingMore = false;
    }
  }, { threshold: 0.1 });
  triggerObserver.observe(trigger);
}

setupObserver();
(async()=>{
  feed.appendChild(buildReelEl(FOUNDER_REEL));
  const fv = feed.querySelector('video');
  if(fv){ fv.muted = muted; fv.play().catch(()=>{}); }

  const loadEl = document.createElement('div');
  loadEl.className = 'reel';
  loadEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.5);gap:14px;background:#07070a;"><div style="width:38px;height:38px;border:3px solid rgba(255,153,51,0.3);border-top-color:#FF9933;border-radius:50%;animation:spin 0.9s linear infinite;"></div><span style="font-size:13px;">Loading India trending...</span></div>`;
  feed.appendChild(loadEl);

  // Fetch first batch (general trending)
  const trending = await fetchYoutubeTrending('');
  feed.removeChild(loadEl);
  if(trending.length===0){
    const e2=document.createElement('div'); e2.className='reel';
    e2.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.4);background:#07070a;font-size:14px;text-align:center;padding:40px;">Could not load trending videos. Check your connection.</div>`;
    feed.appendChild(e2); return;
  }
  trending.forEach(v => allVideos.push(v.videoId));
  trending.forEach(r=>feed.appendChild(buildReelEl(r)));
  categoryIndex = 1; // Start from music category next
  addLoadMoreTrigger(); // Infinite scroll trigger
})();

let userInteracted = false;

function loadIframeWithSound(iframe){
  if(!iframe || !iframe.dataset.src) return;
  const src = iframe.dataset.src
    .replace('mute=1', muted ? 'mute=1' : 'mute=0')
    .replace('mute=0', muted ? 'mute=1' : 'mute=0');
  // Only set src if not already loaded (avoid reload)
  if(!iframe.src || iframe.src === '' || iframe.src === 'about:blank'){
    iframe.src = src;
  }
}

// On first user interaction anywhere on page, reload all visible iframes with sound
document.addEventListener('click', () => {
  if(userInteracted) return;
  userInteracted = true;
  muted = false;
  const muteBtn = document.getElementById('muteBtn');
  if(muteBtn) muteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a9 9 0 0 1 0 12"/></svg>`;
  // Only reload the ONE currently visible iframe with sound
  const visibleIframe = [...document.querySelectorAll('.reel iframe')].find(iframe =>
    iframe.src && iframe.src.includes('youtube') && iframe.src !== 'about:blank'
  );
  if(visibleIframe && visibleIframe.dataset.vid){
    visibleIframe.src = `https://www.youtube.com/embed/${visibleIframe.dataset.vid}?autoplay=1&mute=0&loop=1&playlist=${visibleIframe.dataset.vid}&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1`;
  }
  document.querySelectorAll('.reel video').forEach(v => { v.muted = false; v.play().catch(()=>{}); });
}, { once: true });

const muteBtn = document.getElementById('muteBtn');
muteBtn.addEventListener('click', () => {
  muted = !muted;
  document.querySelectorAll('.reel video').forEach(v => v.muted = muted);
  // Only affect the visible iframe
  const visibleIframe = [...document.querySelectorAll('.reel iframe')].find(iframe =>
    iframe.src && iframe.src.includes('youtube') && iframe.src !== 'about:blank'
  );
  if(visibleIframe && visibleIframe.dataset.vid){
    visibleIframe.src = `https://www.youtube.com/embed/${visibleIframe.dataset.vid}?autoplay=1&mute=${muted?1:0}&loop=1&playlist=${visibleIframe.dataset.vid}&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1`;
  }
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
  const avatarUrl = 'https://i.pravatar.cc/150?img=47';
  const displayName = (acc && acc.email) ? acc.email.split('@')[0] : '@your.account';
  const email = (acc && acc.email) ? acc.email : '';
  openScreen('Profile', `
    <div class="profile-top">
      <img src="${avatarUrl}" alt="">
      <div class="pname">${displayName}</div>
      ${email ? `<div style="color:var(--text-faint);font-size:12px;margin-top:2px;">${email}</div>` : ''}
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
