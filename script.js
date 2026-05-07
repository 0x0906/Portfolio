let audioCtx = null;
let soundEnabled = false;

function initAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(freq, type='sine', duration=0.15, vol=0.08, delay=0){
  if(!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + delay + duration);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration + 0.01);
}

function playClick(){ playTone(400,'sine',0.1,0.06); }
function playHover(){
  if(!soundEnabled || !audioCtx) return;
  const freq = 600 + (Math.random() * 200);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.2, audioCtx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}
function playStackHover(){
  if(!soundEnabled || !audioCtx) return;
  playTone(280, 'sine', 0.12, 0.07);
}
function playWhoosh(){
  if(!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.start(); osc.stop(audioCtx.currentTime + 0.6);
}
function playLuck(){
  if(!soundEnabled || !audioCtx) return;
  [523,659,784,987].forEach((f,i)=> playTone(f,'sine',0.4,0.05,i*0.15));
}

document.getElementById('sound-toggle').addEventListener('click',function(){
  initAudio();
  soundEnabled = !soundEnabled;
  this.classList.toggle('active', soundEnabled);
  if(soundEnabled) playTone(330,'sine',0.3,0.04);
});

const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx=0, my=0, rx=0, ry=0;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isMobileWidth = window.innerWidth <= 900;

if (!isTouchDevice && !isMobileWidth) {
  document.addEventListener('mousemove', e=>{
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx+'px'; cursor.style.top = my+'px';
  });

  (function animCursor(){
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx+'px';
    cursorRing.style.top = ry+'px';
    requestAnimationFrame(animCursor);
  })();

  document.querySelectorAll('a,button,[class*="card"],[class*="btn"],.trait-item,.edu-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{
      cursor.style.transform='translate(-50%,-50%) scale(2)';
      cursorRing.style.width='60px';
      cursorRing.style.height='60px';
      
      if (el.classList.contains('tech-card')) {
        playStackHover();
      } else {
        playHover();
      }
    });
    el.addEventListener('mouseleave',()=>{
      cursor.style.transform='translate(-50%,-50%) scale(1)';
      cursorRing.style.width='36px';
      cursorRing.style.height='36px';
    });
    el.addEventListener('click',()=>{
      playClick();
      if (el.classList.contains('tech-card')) {
        const techName = el.querySelector('.tech-name').textContent;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(techName)}`, '_blank');
      }
    });
  });
} else {
  document.querySelectorAll('a,button,[class*="card"],[class*="btn"],.trait-item,.edu-card').forEach(el=>{
    el.addEventListener('click',()=>{
      playClick();
      if (el.classList.contains('tech-card')) {
        const techName = el.querySelector('.tech-name').textContent;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(techName)}`, '_blank');
      }
    });
  });
}

const loaderBar = document.getElementById('loader-bar');
const loaderPct = document.getElementById('loader-pct');

let pct = 0;
let isLoaded = false;

Promise.all([
  new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  }),
  document.fonts ? document.fonts.ready : Promise.resolve()
]).then(() => {
  isLoaded = true;
});

const loaderInterval = setInterval(()=>{
  if (isLoaded) {
    pct += 8;
  } else {
    pct += (85 - pct) * 0.1;
  }
  
  if(pct >= 100){ 
    pct = 100; 
    clearInterval(loaderInterval); 
    finishLoader(); 
  }
  
  loaderBar.style.width = pct+'%';
  loaderPct.textContent = Math.floor(pct)+'%';
}, 30);

function finishLoader(){
  setTimeout(()=>{
    gsap.to('#loader',{
      opacity:0, duration:0.8, ease:'power2.in',
      onComplete:()=>{ document.getElementById('loader').style.display='none'; initAnimations(); }
    });
  }, 400);
}

gsap.registerPlugin(ScrollTrigger);

function initAnimations(){
  const tl = gsap.timeline();
  tl.to('.hero-eyebrow',{opacity:1,y:0,duration:0.8,ease:'power3.out'}, 0.2)
    .to('.hero-title-line',{
      y:0, opacity:1,
      duration:2, stagger:0.15, ease:'expo.out'
    }, 0.4)
    .to('.hero-sub',{opacity:1,y:0,duration:0.8,ease:'power3.out'}, 0.8)
    .to('.hero-cta-row',{opacity:1,y:0,duration:0.8,ease:'power3.out'}, 1.0)
    .to('.hero-contact-card',{opacity:1,x:0,y:0,z:0,duration:1,ease:'expo.out'}, 0.6)
    .to('.hero-right-deco',{opacity:0.5,x:0,y:0,duration:1,ease:'expo.out'}, 0.6)
    .to('.hero-scroll-indicator',{opacity:1,duration:0.6}, 1.3);

  window.addEventListener('scroll',()=>{
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 80);
    const total = document.body.scrollHeight - window.innerHeight;
    document.getElementById('progress-bar').style.width = (window.scrollY/total*100)+'%';
  });

  gsap.fromTo('.about-visual',
    {opacity:0, x:-60},
    {opacity:1, x:0, duration:1, ease:'power3.out',
     scrollTrigger:{trigger:'#about',start:'top 75%'}});
  gsap.fromTo('.about-text',
    {opacity:0, x:60},
    {opacity:1, x:0, duration:1, ease:'power3.out',
     scrollTrigger:{trigger:'#about',start:'top 75%'}});
  gsap.fromTo('.trait-item',
    {opacity:0, y:20},
    {opacity:1, y:0, duration:0.5, stagger:0.1,
     scrollTrigger:{trigger:'.about-traits',start:'top 80%'}});

  gsap.fromTo('.edu-card',
    {opacity:0, y:40},
    {opacity:1, y:0, duration:0.7, stagger:0.15, ease:'power3.out',
     scrollTrigger:{trigger:'#education',start:'top 75%'}});

  gsap.to('.tech-card',{
    opacity:1, y:0,
    duration:0.5, stagger:0.04,
    ease:'power3.out',
    scrollTrigger:{trigger:'#tech',start:'top 70%'}
  });

  gsap.fromTo('.project-card',
    {opacity:0, y:40},
    {opacity:1, y:0, duration:0.7, stagger:0.1, ease:'power3.out',
     scrollTrigger:{trigger:'#projects',start:'top 70%'}});

  gsap.fromTo('#quotes .section-title',
    {opacity:0, y:30},
    {opacity:1, y:0, duration:0.8,
     scrollTrigger:{trigger:'#quotes',start:'top 75%'}});
}

function countUp(id, target){
  const el = document.getElementById(id);
  if(!el) return;
  let current = 0;
  const increment = Math.ceil(target/60);
  const interval = setInterval(()=>{
    current = Math.min(current+increment, target);
    el.textContent = current + (id==='stat2'?'':'+');
    if(current>=target) clearInterval(interval);
  }, 25);
}

const allAnimeQuotes = [
  { text: "Hard work is worthless for those that don’t believe in themselves.", author: "Naruto Uzumaki (Naruto)" },
  { text: "If you don’t like your destiny, don’t accept it. Instead, have the courage to change it.", author: "Naruto Uzumaki (Naruto)" },
  { text: "A smile is the best way to get yourself out of a tight spot, even if it is a fake one.", author: "Sai (Naruto)" },
  { text: "Knowing what it feels like to be in pain, is exactly why we try to be kind to others.", author: "Jiraiya (Naruto)" },
  { text: "A person grows up when he’s able to overcome hardships.", author: "Jiraiya (Naruto)" },
  { text: "A person's strength is measured by what they can endure.", author: "Jiraiya (Naruto)" },
  { text: "Growth occurs when one goes beyond one’s limits. Realizing that is also part of the process.", author: "Itachi Uchiha (Naruto)" },
  { text: "Those who forgive themselves, and are able to accept their true nature... They are the strong ones!", author: "Itachi Uchiha (Naruto)" },
  { text: "It is not wise to judge others based on your own preconceptions and by their appearances.", author: "Itachi Uchiha (Naruto)" },
  { text: "If you want to know who you are, you have to look at your real self and acknowledge what you see.", author: "Itachi Uchiha (Naruto)" },
  { text: "Never give up without even trying. Do what you can, no matter how small the effect it may have!", author: "Onoki (Naruto)" },
  { text: "Failing doesn't give you a reason to give up, as long as you believe.", author: "Naruto Uzumaki (Naruto)" },
  { text: "There is no point in working hard if you don't believe in yourself.", author: "Might Guy (Naruto)" },
  { text: "To help others, you must first learn to help yourself.", author: "Kakashi Hatake (Naruto)" },
  { text: "If you don't take risks, you can't create a future.", author: "Monkey D. Luffy (One Piece)" },
  { text: "When the world shoves you around, you just gotta stand up and shove back.", author: "Roronoa Zoro (One Piece)" },
  { text: "Experience victory and defeat, running away and shedding tears, to become a man.", author: "Shanks (One Piece)" },
  { text: "No matter how hard or impossible it is, never lose sight of your goal.", author: "Monkey D. Luffy (One Piece)" },
  { text: "A man's dream will never die!", author: "Marshall D. Teach (One Piece)" },
  { text: "Miracles only occur for those with the determination to never stop trying!", author: "Emporio Ivankov (One Piece)" },
  { text: "You can't bring back what you've lost. Think about what you have now!", author: "Jinbe (One Piece)" },
  { text: "Being strong isn't just about having power or skill, it's about one's spirit.", author: "Roronoa Zoro (One Piece)" },
  { text: "Only those who have suffered long can see the light within the shadows.", author: "Roronoa Zoro (One Piece)" },
  { text: "If you win, you live. If you lose, you die. If you don’t fight, you can’t win!", author: "Eren Yeager (Attack on Titan)" },
  { text: "The only thing we’re allowed to do is to believe that we won’t regret the choice we made.", author: "Levi Ackerman (Attack on Titan)" },
  { text: "A person who cannot sacrifice anything, can change nothing.", author: "Armin Arlert (Attack on Titan)" },
  { text: "If you begin to regret, you’ll dull your future decisions and let others make your choices for you.", author: "Erwin Smith (Attack on Titan)" },
  { text: "This world is cruel, but it's also very beautiful.", author: "Mikasa Ackerman (Attack on Titan)" },
  { text: "You have to be willing to take action if you want to change the world.", author: "Armin Arlert (Attack on Titan)" },
  { text: "You're going to care what other people think and be someone you're not your whole life? You're fine as you are.", author: "Ymir (Attack on Titan)" },
  { text: "My greatest strength is never giving up.", author: "Asta (Black Clover)" },
  { text: "Surpass your limits. Right here, right now.", author: "Yami Sukehiro (Black Clover)" },
  { text: "Being weak is nothing to be ashamed of… Staying weak is!", author: "Fuegoleon Vermillion (Black Clover)" },
  { text: "Even if you're not chosen, even if you're not wanted... You need to stand your ground!", author: "Asta (Black Clover)" },
  { text: "As long as you don't give up, you can always do something.", author: "Asta (Black Clover)" },
  { text: "If you don't fight to win, you've already lost.", author: "Yami Sukehiro (Black Clover)" },
  { text: "Protect whatever is precious to you. One day it will lead you to protect something else.", author: "Yami Sukehiro (Black Clover)" },
  { text: "A dream is only a dream until you decide to make it a reality.", author: "All Might (My Hero Academia)" },
  { text: "Whether you win or lose, looking back and learning from your experience is a part of life.", author: "All Might (My Hero Academia)" },
  { text: "Sometimes I do feel like I’m a failure. But even so, I’m not gonna give up. Ever!", author: "Izuku Midoriya (My Hero Academia)" },
  { text: "Never forget who you want to become.", author: "Shoto Todoroki (My Hero Academia)" },
  { text: "If you feel yourself hitting up against your limit, remember for what cause you clench your fists.", author: "All Might (My Hero Academia)" },
  { text: "A smiling face is a sign of strength, not just for you, but for the people who depend on you.", author: "All Might (My Hero Academia)" },
  { text: "There’s nothing crueler than letting a dream end midway.", author: "Shota Aizawa (My Hero Academia)" },
  { text: "There is no such thing as 'perfect' in this world. That's why we're always searching for something more.", author: "Kisuke Urahara (Bleach)" },
  { text: "A man who cannot control his own heart is not a man at all.", author: "Byakuya Kuchiki (Bleach)" },
  { text: "We can't just be standing still. We have to keep moving forward, even if it's just a little bit.", author: "Ichigo Kurosaki (Bleach)" },
  { text: "To protect what is precious, one must be prepared to change themselves.", author: "Byakuya Kuchiki (Bleach)" },
  { text: "Fear is not something to be avoided; it is a stepping stone to strength.", author: "Ichigo Kurosaki (Bleach)" },
  { text: "Even if no one believes in you, stick to your own path.", author: "Ichigo Kurosaki (Bleach)" }
];

let currentQuote = 0;
let displayedQuotes = [];

function initQuoteCarousel() {
  const carousel = document.getElementById('quote-carousel');
  const dotsContainer = document.getElementById('quote-dots');
  
  const shuffled = [...allAnimeQuotes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  displayedQuotes = shuffled.slice(0, 10);
  
  carousel.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  displayedQuotes.forEach((q, i) => {
    const item = document.createElement('div');
    item.className = `quote-item ${i === 0 ? 'active' : ''}`;
    item.innerHTML = `
      <div class="quote-mark">"</div>
      <p class="quote-text">${q.text}</p>
      <div class="quote-author">— ${q.author}</div>
    `;
    carousel.appendChild(item);
    
    const dot = document.createElement('div');
    dot.className = `q-dot ${i === 0 ? 'active' : ''}`;
    dot.onclick = () => goQuote(i);
    dotsContainer.appendChild(dot);
  });
}

function goQuote(n) {
  const quotesItems = document.querySelectorAll('.quote-item');
  const dotItems = document.querySelectorAll('.q-dot');
  
  quotesItems[currentQuote].classList.remove('active');
  dotItems[currentQuote].classList.remove('active');
  currentQuote = n;
  quotesItems[currentQuote].classList.add('active');
  dotItems[currentQuote].classList.add('active');
}

initQuoteCarousel();

let quoteInterval = setInterval(() => { 
  const quotesItems = document.querySelectorAll('.quote-item');
  if (quotesItems.length > 0) {
    goQuote((currentQuote + 1) % quotesItems.length); 
  }
}, 5000);

const carouselEl = document.getElementById('quote-carousel');
carouselEl.addEventListener('mouseenter', () => clearInterval(quoteInterval));
carouselEl.addEventListener('mouseleave', () => {
  quoteInterval = setInterval(() => { 
    const quotesItems = document.querySelectorAll('.quote-item');
    goQuote((currentQuote + 1) % quotesItems.length); 
  }, 5000);
});

const lucks = [
  "A pleasant surprise is waiting just around the corner.",
  "Your kindness will return to you tenfold.",
  "Great fortune follows those who stay curious.",
  "A new opportunity will soon brighten your path.",
  "Happiness begins with a single brave step.",
  "Someone admires your quiet strength.",
  "Your future is filled with unexpected victories.",
  "A joyful moment will arrive when you least expect it.",
  "Luck favors your next decision.",
  "The answer you seek is already finding you.",
  "A meaningful connection will soon appear.",
  "Your patience will reward you richly.",
  "Good news is traveling toward you now.",
  "Adventure and success walk side by side for you.",
  "A smile today will open tomorrow’s door.",
  "You are closer to success than you realize.",
  "Unexpected wealth may come from a simple idea.",
  "Your talents will soon be recognized.",
  "Peace arrives when you trust yourself.",
  "A cheerful heart attracts wonderful things.",
  "An exciting journey is in your future.",
  "Your courage will inspire someone important.",
  "A dream you forgot about will return stronger.",
  "The stars favor your ambitions.",
  "A lucky encounter will change your perspective.",
  "You will soon celebrate a personal victory.",
  "Your creativity will lead to abundance.",
  "The right moment is approaching quickly.",
  "You are about to discover hidden strengths.",
  "A generous act will bring you unexpected joy.",
  "Prosperity begins with the next step you take.",
  "A peaceful mind creates powerful outcomes.",
  "Your energy attracts positive opportunities.",
  "The best is yet to come.",
  "A trusted friend will bring valuable advice.",
  "New beginnings carry excellent fortune.",
  "You will find beauty in unexpected places.",
  "An old challenge is finally fading away.",
  "A golden opportunity is closer than it appears.",
  "You will soon receive well-deserved praise.",
  "Your optimism is your greatest treasure.",
  "A happy surprise will brighten your week.",
  "Success grows from your steady efforts.",
  "A chance meeting may lead to lasting happiness.",
  "Your confidence will unlock new doors.",
  "Fortune smiles upon your persistence.",
  "You will soon enjoy a moment of pure joy.",
  "Good things come to those who believe in themselves.",
  "A bold choice will lead to rewarding results.",
  "Your future shines with promise.",
  "A hidden opportunity will soon reveal itself.",
  "You are destined for meaningful accomplishments.",
  "Joy will arrive in an unexpected package.",
  "A calm heart attracts wonderful possibilities.",
  "The universe is aligning in your favor.",
  "A new friendship will bring great happiness.",
  "You will soon hear words that lift your spirit.",
  "The path ahead is brighter than ever.",
  "Small actions today create big rewards tomorrow.",
  "Your hard work is preparing a pleasant surprise.",
  "A fortunate turn of events is approaching.",
  "The right people are entering your life.",
  "A cheerful attitude will lead to success.",
  "You are about to overcome an important obstacle.",
  "An exciting chapter is beginning for you.",
  "Your instincts will guide you wisely.",
  "A rewarding experience is waiting nearby.",
  "You will soon discover a reason to celebrate.",
  "The next conversation you have may change everything.",
  "Fortune follows those who stay grateful.",
  "A brilliant idea will soon come to you.",
  "Unexpected support will arrive at the perfect time.",
  "Your future contains many reasons to smile.",
  "A happy memory will inspire a new goal.",
  "You are attracting success with every step.",
  "Good fortune will find you in simple moments.",
  "A personal wish is closer to reality.",
  "The effort you make today will bloom tomorrow.",
  "You are entering a season of abundance.",
  "A kind gesture will lead to unexpected rewards.",
  "Your positive spirit is opening new paths.",
  "An answer will arrive when you stop searching for it.",
  "A fresh opportunity will bring exciting changes.",
  "Your next achievement will exceed expectations.",
  "Wonderful things happen to those who stay hopeful.",
  "A peaceful decision will lead to lasting happiness.",
  "You will soon experience a lucky breakthrough.",
  "A new perspective will bring great clarity.",
  "Your talents are leading you toward success.",
  "An important dream is moving closer.",
  "You are surrounded by unseen support.",
  "A cheerful surprise is waiting for you soon.",
  "Your future rewards are worth your patience.",
  "A lucky discovery will brighten your day.",
  "You are about to enter a joyful phase of life.",
  "Unexpected happiness will arrive through a small detail.",
  "Your determination is creating wonderful outcomes.",
  "A wise decision will bring lasting peace.",
  "You will soon cross paths with good fortune.",
  "The coming days hold exciting possibilities.",
  "A heartfelt wish is quietly becoming reality.",
  "Your brightest moments are still ahead.",
  "The universe has something special prepared for you."
];

document.getElementById('luck-btn').addEventListener('click', showLuck);
document.getElementById('luck-btn-mobile').addEventListener('click', showLuck);

function showLuck() {
  initAudio();
  
  const today = new Date().toLocaleDateString('en-CA');
  const savedFortune = localStorage.getItem('daily_fortune');
  const savedDate = localStorage.getItem('fortune_date');
  
  let fortune;
  
  if (savedDate === today && savedFortune) {
    fortune = savedFortune;
  } else {
    fortune = lucks[Math.floor(Math.random() * lucks.length)];
    localStorage.setItem('daily_fortune', fortune);
    localStorage.setItem('fortune_date', today);
  }
  
  document.getElementById('luck-kanji').textContent = "🍀";
  document.getElementById('luck-kanji').style.color = "#ffd166";
  document.getElementById('luck-title').textContent = "YOUR FORTUNE";
  document.getElementById('luck-title').style.color = "#ffd166";
  document.getElementById('luck-msg').textContent = fortune;
  document.getElementById('luck-modal').classList.add('open');
  
  const hamburger = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-drawer');
  if (hamburger) hamburger.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
  
  playLuck();
}

function closeLuck(){
  document.getElementById('luck-modal').classList.remove('open');
  playClick();
}

document.getElementById('luck-modal').addEventListener('click',function(e){
  if(e.target===this) closeLuck();
});

document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeLuck(); });

document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth'});
    playClick();
  });
});

const hamburger = document.getElementById('nav-hamburger');
const drawer = document.getElementById('nav-drawer');
const drawerLinks = document.querySelectorAll('.drawer-links a');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  drawer.classList.toggle('open');
  playClick();
});

drawerLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({behavior:'smooth'});
    playClick();
  });
});

// Canvas Background Waves
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let w, h;
let time = 0;

function resizeCanvas() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawWaves() {
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';

  const waves = [
    { yOffset: h * 0.45, amp: 140, freq: 0.0018, speed: 0.0012, color: 'rgba(230, 57, 70, 0.15)' },
    { yOffset: h * 0.5, amp: 200, freq: 0.0012, speed: 0.0015, color: 'rgba(230, 57, 70, 0.25)' },
    { yOffset: h * 0.55, amp: 120, freq: 0.0025, speed: 0.0008, color: 'rgba(230, 57, 70, 0.1)' }
  ];

  waves.forEach(wave => {
    ctx.beginPath();
    ctx.strokeStyle = wave.color;
    for (let x = 0; x <= w; x += 10) {
      const y = wave.yOffset + Math.sin(x * wave.freq + time * wave.speed) * wave.amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  time += 16; // approximate 60fps step
  requestAnimationFrame(drawWaves);
}
drawWaves();