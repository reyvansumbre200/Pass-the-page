/* Small, browser-native additions to the bookshelf. No external services. */
let homesShown = 8;
function renderHomeShelf() {
  const sold = BOOKS.filter(b => b.status === 'sold');
  const rows = [];
  for (let i = 0; i < Math.min(homesShown, sold.length); i += currentShelfSize)
    rows.push(`<div class="shelf-row">${sold.slice(i, Math.min(i + currentShelfSize, homesShown)).map(b => card(b, 'home')).join('')}</div>`);
  $('homeShelf').innerHTML = rows.join('') || '<p class="fine">The first new home is still waiting. Yours could be next.</p>';
  $('moreHomes').hidden = sold.length <= homesShown;
}
function validDonations(records) {
  return (Array.isArray(records) ? records : []).filter(d => d && Number.isFinite(+d.amount) && +d.amount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && !Number.isNaN(Date.parse(d.date)) && new Date(d.date).toISOString().slice(0,10) === d.date);
}
function receiptURL(value) {
  try { const u = new URL(value, location.href); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; }
}
function renderDonations() {
  const records = validDonations(S.donations).sort((a,b) => b.date.localeCompare(a.date));
  const collected = BOOKS.filter(b=>b.status==='sold').reduce((sum,b)=>sum+(+b.soldFor||0),0);
  const donated = records.reduce((sum,d)=>sum+(+d.amount),0);
  $('donationTotals').innerHTML = `<p><strong>₹${inr(collected)}</strong><span>Collected from book sales</span></p><p><strong>₹${inr(donated)}</strong><span>Recorded as donated</span></p><p><strong>₹${inr(Math.max(0,collected-donated))}</strong><span>Remaining to donate</span></p>`;
  $('donationUpdates').innerHTML = records.length ? records.map(d => {
    const url = receiptURL(d.receipt || '');
    return `<article class="donation-update"><time datetime="${esc(d.date)}">${new Date(d.date+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</time><p><strong>₹${inr(d.amount)} donated to ${esc(S.ngoName)}</strong></p>${d.note ? `<p>${esc(d.note)}</p>` : ''}${d.receipt && url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">View donation receipt</a>` : '<p class="fine">Receipt not published.</p>'}</article>`;
  }).join('') : '<p>No donation transfers have been recorded here yet. Dated updates and receipts will appear here when published.</p>';
}
async function downloadShareCard(book) {
  const button = $('saveCard'); button.disabled = true; button.textContent = 'Preparing image…';
  try {
    await document.fonts.ready;
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
    const c = canvas.getContext('2d');
    const text = (value,x,y,width,size=48,maxLines=3,color='#2a2118',family='Georgia') => {
      c.fillStyle=color; c.font=`${size}px ${family}`;
      const words=String(value).split(/\s+/); const lines=[]; let line='';
      for(const word of words) { const next=line ? line+' '+word : word; if(c.measureText(next).width>width && line) {lines.push(line);line=word;} else line=next; } if(line)lines.push(line);
      lines.slice(0,maxLines).forEach((l,i)=> { if(i===maxLines-1 && lines.length>maxLines)l+='…'; while(c.measureText(l).width>width && l.length>1)l=l.slice(0,-2)+'…'; c.fillText(l,x,y+i*size*1.25); });
    };
    c.fillStyle='#f7f1e6'; c.fillRect(0,0,1080,1350);
    text('Pass the Page',72,100,936,52,1); text('A shelf with a purpose',72,145,936,25,1,'#74685a','sans-serif');
    c.fillStyle=`hsl(${hue(book.blind?'mystery':book.title)} 33% 29%)`; c.fillRect(300,205,480,580);
    let photoLoaded=false;
    if(!book.blind && book.photos?.[0]) {
      try {
        const url=new URL(book.photos[0],location.href);
        if(url.origin===location.origin) {
          const img=await new Promise((resolve,reject)=> { const image=new Image(); const timer=setTimeout(()=>reject(new Error('Image timeout')),5000); image.onload=()=>{clearTimeout(timer);resolve(image);};image.onerror=()=>{clearTimeout(timer);reject(new Error('Image unavailable'));};image.src=url.href; });
          const scale=Math.min(480/img.width,580/img.height); c.drawImage(img,300+(480-img.width*scale)/2,205+(580-img.height*scale)/2,img.width*scale,img.height*scale);photoLoaded=true;
        }
      } catch { /* Keep a designed text cover when an image cannot load. */ }
    }
    if(!photoLoaded) {
      text(book.blind?'Blind date with a book':book.title,340,310,400,48,5,'#fff8e8');
      text(book.blind?(book.hint||'A little mystery awaits.'):book.author,340,660,400,27,3,'#fff8e8','sans-serif');
    }
    text(shownTitle(book),72,872,936,48,2);
    text(book.status==='sold'?`Found a home · Raised ₹${inr(book.soldFor)}`:`Pay what you like · ₹${S.minPrice}–₹${S.maxPrice}`,72,1010,936,34,1,'#a44324','sans-serif');
    text(`Every rupee supports ${S.ngoName}`,72,1080,936,30,2,'#2a2118','sans-serif');
    text('Choose a book. Help feed Mumbai.',72,1180,936,28,1,'#74685a','sans-serif');
    text('reyvansumbre200.github.io/Pass-the-page',72,1245,936,25,1,'#74685a','sans-serif');
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png')); if(!blob)throw new Error('Could not create image');
    const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=`pass-the-page-${book.blind?'mystery-book':book.id}.png`; document.body.append(a); a.click(); a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    toast('Share card saved. Use Share to send the book link too.');
  } catch { toast('Could not create the image. Please try again.'); }
  finally { button.disabled=false;button.textContent='Save share card'; }
}

// React to actual mouse travel, not boundary events caused by an expanding book.
// Let the 550ms shelf layout transition settle before choosing another spine.
function createShelfHoverHandler(reveal, now = () => performance.now(), isBlocked = () => false) {
  let lastX, lastY, settleUntil = 0;
  return event => {
    if (isBlocked()) { lastX = event.clientX; lastY = event.clientY; settleUntil = now() + 600; return; }
    if (event.pointerType !== 'mouse') return;
    if (event.clientX === lastX && event.clientY === lastY) return;
    lastX = event.clientX; lastY = event.clientY;
    if (now() < settleUntil) return;
    const book = event.target.closest('.shelf-book');
    if (!book || book.classList.contains('revealed')) return;
    reveal(book);
    settleUntil = now() + 600;
  };
}
