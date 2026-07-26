/* ---------------------------------- */
/* ---------- Firebase Setup ---------- */
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
const db = firebase.firestore();
const storage = firebase.storage();

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
    displayName: user.displayName || user.email.split('@')[0],
    photoURL: user.photoURL || 'https://i.pravatar.cc/150?img=47',
    createdAt: Date.now()
  };
  localStorage.setItem('bp_account', JSON.stringify(account));
  showApp();
}

const existingAccount = getAccount();
if (existingAccount){
  showApp();
} else if (loginBtn) {
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

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((result) => saveAccountAndEnter(result.user))
      .catch((error) => {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((result) => saveAccountAndEnter(result.user))
          .catch((err) => {
            authError.textContent = err.message.replace('Firebase: ', '');
            authError.style.display = 'block';
          });
      })
      .finally(() => {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In / Sign Up';
      });
  });
}

/* ---------------------------------- */
// Initial Featured Feed Data
const REELS = [
  {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    user: "nitinsharma", tag: "Founder 🇮🇳", verified: true,
    caption: "Welcome to Bharat Play! Ultimate place for Trending Shorts & Reels 🔥 #bharatplay",
    sound: "Nitin Sharma - Original Sound",
    avatar: "https://i.pravatar.cc/100?img=68",
    likes: "540K", comments: "12.3K", shares: "8.9K", type: "video"
  }
];

const feed = document.getElementById('feed');
let muted = true;
let isLoadingMore = false;

function heartIcon(filled){
  return `<svg viewBox="0 0 24 24" ${filled? 'fill="var(--heart)" stroke="var(--heart)"':'fill="none" stroke="white"'} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
}
const commentIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const shareIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const moreIcon = `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>`;
const noteIcon = `<svg viewBox="0 0 24 24" fill="white"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="none" stroke="white" stroke-width="2"/><circle cx="18" cy="16" r="3" fill="none" stroke="white" stroke-width="2"/></svg>`;
const verifiedBadge = `<svg viewBox="0 0 24 24" width="15" height="15" style="flex-shrink:0;"><path fill="#3897F0" d="M12 2 14.5 4.2 17.8 3.6 18.8 6.8 21.8 8.4 20.6 11.6 21.8 14.8 18.8 16.4 17.8 19.6 14.5 19 12 21.2 9.5 19 6.2 19.6 5.2 16.4 2.2 14.8 3.4 11.6 2.2 8.4 5.2 6.8 6.2 3.6 9.5 4.2z"/><path fill="white" d="M10.6 14.9 8.4 12.7l1.1-1.1 1.1 1.1 3.1-3.1 1.1 1.1z"/></svg>`;

// Create Reel Element
function createReelElement(r, prepend = false) {
  const el = document.createElement('div');
  el.className = 'reel';
  el.dataset.isYt = r.isYoutube ? "true" : "false";
  if(r.ytId) el.dataset.ytid = r.ytId;

  let initialMedia = '';
  if (r.isYoutube) {
    initialMedia = `<div class="media-box" style="width:100%;height:100%;overflow:hidden;position:relative;"><img src="https://i.ytimg.com/vi/${r.ytId}/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover;"></div>`;
  } else if (r.type === 'photo') {
    initialMedia = `<img src="${r.src}" class="feed-media-img" alt="User Post">`;
  } else {
    initialMedia = `<video src="${r.src}" loop playsinline muted preload="metadata" style="width:100%;height:100%;object-fit:cover;"></video>`;
  }

  el.innerHTML = `
    ${initialMedia}
    <div class="reel-shade"></div>
    <div class="rail">
      <div class="rail-item">
        <div class="rail-avatar"><img src="${r.avatar || 'https://i.pravatar.cc/100?img=47'}" alt=""></div>
      </div>
      <div class="rail-item like-item">
        <div class="rail-btn">${heartIcon(false)}</div>
        <div class="rail-count">${r.likes || '0'}</div>
      </div>
      <div class="rail-item comment-item">
        <div class="rail-btn">${commentIcon}</div>
        <div class="rail-count">${r.comments || '0'}</div>
      </div>
      <div class="rail-item share-item">
        <div class="rail-btn">${shareIcon}</div>
        <div class="rail-count">${r.shares || '0'}</div>
      </div>
      <div class="rail-item more-item">
        <div class="rail-btn">${moreIcon}</div>
      </div>
    </div>
    <div class="info">
      <div class="username">
        <span>@${r.user}</span>
        ${r.verified ? verifiedBadge : ''}
        <span class="tag">${r.tag || 'User Post'}</span>
        <span class="follow-btn">Follow</span>
      </div>
      <div class="caption">${r.caption}</div>
      <div class="sound">
        <div class="sound-icon">${noteIcon}</div>
        <div class="marquee-wrap"><div class="marquee">${r.sound || 'Original Sound'} &nbsp;&nbsp;•&nbsp;&nbsp; ${r.sound || 'Original Sound'} &nbsp;&nbsp;•&nbsp;&nbsp;</div></div>
      </div>
    </div>
  `;

  const video = el.querySelector('video');
  const likeItem = el.querySelector('.like-item');
  const commentItem = el.querySelector('.comment-item');
  const shareItem = el.querySelector('.share-item');
  const moreItem = el.querySelector('.more-item');

  el.addEventListener('click', (e) => {
    if (e.target.closest('.rail-item') || e.target.closest('.info')) return;
    if(muted) {
      muted = false;
      updateMuteState();
      showToast('🔊 Sound ON');
    }
    if (video) {
      if (video.paused) video.play(); else video.pause();
    }
  });

  likeItem.addEventListener('click', () => {
    let liked = likeItem.classList.toggle('liked');
    likeItem.querySelector('.rail-btn').innerHTML = heartIcon(liked);
  });

  commentItem.addEventListener('click', () => openComments(r));
  shareItem.addEventListener('click', () => openShare(r));
  moreItem.addEventListener('click', () => openMore(r));

  if (prepend) {
    feed.insertBefore(el, feed.firstChild);
  } else {
    feed.appendChild(el);
  }
  
  observeVideos();
  return el;
}

REELS.forEach(r => createReelElement(r));

// Fetch Live User Posts from Firestore Database
function loadUserPostsFromFirestore() {
  db.collection('posts').orderBy('timestamp', 'desc').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      const post = doc.data();
      createReelElement({
        src: post.mediaUrl,
        user: post.userName || 'user',
        tag: 'User Upload',
        caption: post.caption || '',
        sound: post.sound || `${post.userName} - Original Sound`,
        avatar: post.userPhoto || 'https://i.pravatar.cc/100?img=47',
        likes: '0', comments: '0', shares: '0',
        type: post.type || 'video'
      }, true); // Prepend to top of feed
    });
  }).catch(err => console.log('Firestore fetch error:', err));
}

// Fetch YouTube Trending Shorts
async function loadYouTubeTrendingShorts() {
  if (isLoadingMore) return;
  isLoadingMore = true;

  try {
    const res = await fetch('https://pipedapi.kavin.rocks/trending?region=IN');
    const data = await res.json();
    const items = data.sort(() => 0.5 - Math.random()).slice(0, 10);

    items.forEach((v) => {
      const ytId = v.url ? v.url.split('=')[1] : null;
      if(!ytId) return;

      createReelElement({
        isYoutube: true,
        ytId: ytId,
        user: (v.uploaderName || "shorts_creator").toLowerCase().replace(/\s+/g, '_'),
        tag: "YouTube Shorts 🔥",
        verified: v.uploaderVerified || false,
        caption: v.title || "Trending Short Video #shorts",
        sound: `${v.uploaderName || "Trending"} - Original Sound`,
        avatar: v.uploaderAvatar || `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 50) + 1}`,
        likes: `${(Math.floor(Math.random() * 90) + 10)}K`,
        comments: `${(Math.floor(Math.random() * 8) + 1)}K`,
        shares: `${(Math.floor(Math.random() * 5) + 1)}K`
      });
    });

  } catch(e) {
    console.log("Error loading trending:", e);
  } finally {
    isLoadingMore = false;
  }
}

// Lazy Load Observer
let observer;
function observeVideos() {
  const reelEls = [...document.querySelectorAll('.reel')];
  if(observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const isYt = el.dataset.isYt === "true";
      const ytId = el.dataset.ytid;
      const video = el.querySelector('video');

      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        if(isYt && ytId) {
          const mediaBox = el.querySelector('.media-box');
          if(mediaBox && !mediaBox.querySelector('iframe')) {
            const muteParam = muted ? 1 : 0;
            mediaBox.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muteParam}&controls=0&loop=1&playlist=${ytId}&rel=0&enablejsapi=1&playsinline=1" style="width:100%;height:100%;border:none;transform:scale(1.35);" allow="autoplay; encrypted-media"></iframe>`;
          }
        } else if(video) {
          video.muted = muted;
          video.play().catch(()=>{});
        }
      } else {
        if(isYt && ytId) {
          const mediaBox = el.querySelector('.media-box');
          if(mediaBox && mediaBox.querySelector('iframe')) {
            mediaBox.innerHTML = `<img src="https://i.ytimg.com/vi/${ytId}/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover;">`;
          }
        } else if(video) {
          video.pause();
        }
      }
    });
  }, { threshold: [0.5] });

  reelEls.forEach(el => observer.observe(el));
}

function updateMuteState() {
  document.querySelectorAll('video').forEach(v => v.muted = muted);
  const activeYtBox = document.querySelector('.reel .media-box iframe');
  if(activeYtBox) {
    let src = activeYtBox.src;
    activeYtBox.src = muted ? src.replace('mute=0', 'mute=1') : src.replace('mute=1', 'mute=0');
  }
}

const muteBtn = document.getElementById('muteBtn');
if(muteBtn) {
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    updateMuteState();
    showToast(muted ? "🔇 Muted" : "🔊 Sound ON");
  });
}

// Init
loadUserPostsFromFirestore();
loadYouTubeTrendingShorts();

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
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
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

function openComments(r){
  openSheet(`<div class="sheet-title">Comments</div>
    <div style="font-size:13px;color:var(--text-dim);text-align:center;padding:20px 0;">No comments yet. Be the first to comment!</div>`);
}
function openShare(r){
  openSheet(`<div class="sheet-title">Share</div>
    <div style="text-align:center;padding:15px;font-size:14px;color:var(--text-dim);">Post link copied to clipboard!</div>`);
  showToast('Link copied!');
}
function openMore(r){
  openSheet(`<div class="sheet-title">Options</div>
    <div class="more-opt" onclick="closeSheet(); showToast('Saved!')">🔖 Save Post</div>
    <div class="more-opt" style="color:#ff5c5c;" onclick="closeSheet(); showToast('Reported')">⚠️ Report</div>`);
}

/* ---------- Navigation Panels ---------- */
const screenOverlay = document.getElementById('screenOverlay');
const screenTitle = document.getElementById('screenTitle');
const screenBody = document.getElementById('screenBody');
document.getElementById('screenBack').addEventListener('click', () => screenOverlay.classList.remove('open'));

function openScreen(title, html){
  screenTitle.textContent = title;
  screenBody.innerHTML = html;
  screenOverlay.classList.add('open');
}

// --- CREATE / UPLOAD POST SCREEN ---
document.getElementById('navCreate').addEventListener('click', () => {
  openScreen('Create New Post', `
    <div class="form-group">
      <label>Select Photo or Video</label>
      <div class="file-picker-box" onclick="document.getElementById('postFileInput').click()">
        <div class="icon">📁</div>
        <div class="text" id="filePickLabel">Click to choose video/photo from gallery</div>
      </div>
      <input type="file" id="postFileInput" accept="video/*,image/*" style="display:none;">
    </div>

    <div class="form-group">
      <label>Caption</label>
      <textarea id="postCaptionInput" rows="3" placeholder="Write a caption or add hashtags..."></textarea>
    </div>

    <button class="btn-primary" id="uploadPostBtn">Publish Post</button>

    <div class="progress-wrap" id="uploadProgressWrap">
      <div class="progress-bar-bg"><div class="progress-bar-fill" id="uploadProgressBar"></div></div>
      <div class="progress-text" id="uploadProgressText">Uploading... 0%</div>
    </div>
  `);

  const fileInput = document.getElementById('postFileInput');
  const fileLabel = document.getElementById('filePickLabel');
  let selectedFile = null;

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      selectedFile = e.target.files[0];
      fileLabel.textContent = `Selected: ${selectedFile.name}`;
    }
  });

  document.getElementById('uploadPostBtn').addEventListener('click', () => {
    if (!selectedFile) {
      showToast('Please select a photo or video first!');
      return;
    }

    const caption = document.getElementById('postCaptionInput').value.trim();
    const acc = getAccount() || { displayName: 'User', photoURL: 'https://i.pravatar.cc/150?img=47' };
    const isVideo = selectedFile.type.startsWith('video');

    const progressWrap = document.getElementById('uploadProgressWrap');
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');
    
    progressWrap.style.display = 'block';

    const storageRef = storage.ref(`user_posts/${Date.now()}_${selectedFile.name}`);
    const uploadTask = storageRef.put(selectedFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        progressBar.style.width = pct + '%';
        progressText.textContent = `Uploading... ${pct}%`;
      }, 
      (error) => {
        showToast('Upload failed: ' + error.message);
      }, 
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          // Save Post Entry in Firestore
          const postData = {
            mediaUrl: downloadURL,
            caption: caption,
            userName: acc.displayName,
            userPhoto: acc.photoURL,
            type: isVideo ? 'video' : 'photo',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };

          db.collection('posts').add(postData).then(() => {
            showToast('🎉 Post published successfully!');
            screenOverlay.classList.remove('open');
            // Show new post directly in feed
            createReelElement({
              src: downloadURL,
              user: acc.displayName,
              tag: 'Your Post',
              caption: caption,
              sound: `${acc.displayName} - Original Sound`,
              avatar: acc.photoURL,
              likes: '0', comments: '0', shares: '0',
              type: isVideo ? 'video' : 'photo'
            }, true);
          });
        });
      }
    );
  });
});

// --- PROFILE & EDIT PROFILE SCREEN ---
document.getElementById('navProfile').addEventListener('click', renderProfileScreen);

function renderProfileScreen() {
  const acc = getAccount() || { displayName: 'User', photoURL: 'https://i.pravatar.cc/150?img=47', email: '' };

  openScreen('My Profile', `
    <div class="profile-top">
      <div class="profile-avatar-wrap">
        <img src="${acc.photoURL}" id="profileDisplayImg" alt="">
      </div>
      <div class="pname" id="profileDisplayName">${acc.displayName}</div>
      <div style="color:var(--text-faint);font-size:12px;margin-top:2px;">${acc.email}</div>
      
      <button class="btn-secondary" id="editProfileBtn" style="width: auto; padding: 6px 16px; margin-top: 10px;">Edit Profile</button>

      <div class="profile-stats">
        <div><b>0</b><span>Posts</span></div>
        <div><b>0</b><span>Followers</span></div>
        <div><b>0</b><span>Following</span></div>
      </div>
    </div>

    <div style="text-align:center;margin-top:30px;">
      <button id="logoutBtn" class="btn-secondary" style="background:none;border:1px solid rgba(255,255,255,0.25);color:var(--white);">Log out</button>
    </div>
  `);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('bp_account');
    location.reload();
  });

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    openSheet(`
      <div class="sheet-title">Edit Profile</div>
      
      <div class="form-group">
        <label>Account Display Name</label>
        <input type="text" id="editNameInput" value="${acc.displayName}">
      </div>

      <div class="form-group">
        <label>Change Profile Photo</label>
        <input type="file" id="editAvatarInput" accept="image/*">
      </div>

      <button class="btn-primary" id="saveProfileBtn">Save Changes</button>
    `);

    document.getElementById('saveProfileBtn').addEventListener('click', () => {
      const newName = document.getElementById('editNameInput').value.trim();
      const avatarFile = document.getElementById('editAvatarInput').files[0];

      if (!newName) {
        showToast('Name cannot be empty!');
        return;
      }

      acc.displayName = newName;

      if (avatarFile) {
        showToast('Updating photo...');
        const storageRef = storage.ref(`avatars/${acc.uid}_${Date.now()}`);
        storageRef.put(avatarFile).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
          acc.photoURL = url;
          localStorage.setItem('bp_account', JSON.stringify(acc));
          closeSheet();
          showToast('Profile updated!');
          renderProfileScreen();
        });
      } else {
        localStorage.setItem('bp_account', JSON.stringify(acc));
        closeSheet();
        showToast('Profile updated!');
        renderProfileScreen();
      }
    });
  });
}

document.getElementById('navSearch').addEventListener('click', () => {
  openScreen('Search', `<input class="search-input" placeholder="Search accounts, posts, hashtags...">`);
});
document.getElementById('navLikes').addEventListener('click', () => {
  openScreen('Liked Posts', `<div class="empty-state"><div class="big">❤️</div><div class="title">No liked posts yet</div></div>`);
});

// Remove old service workers
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((reg) => reg.unregister()));
}
