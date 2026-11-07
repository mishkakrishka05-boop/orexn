(() => {
  const section = document.getElementById('gift');
  if (!section) return;

  section.classList.add('gift-work');
  section.setAttribute('aria-labelledby', 'gift-title');
  section.innerHTML = `
    <div class="gift-layout">
      <div class="gift-story">
        <p class="gift-series">Подарок «Энергия»</p>
        <h2 id="gift-title">Искусство<br><em>дарить</em></h2>
        <p class="gift-intro">На закрытой шкатулке цветут золотые ветви. Раскройте створки, чтобы рассмотреть узор из орехов и сухофруктов.</p>
        <button class="gift-trigger" type="button" aria-controls="gift-inside" aria-expanded="false"><span class="gift-action">Раскрыть шкатулку</span><span aria-hidden="true">↗</span></button>
        <p class="gift-inside" id="gift-inside" hidden>Внутри — миндаль, грецкий орех, фисташки, курага и золотистый изюм.</p>
      </div>
      <div class="gift-stage">
        <img class="gift-still" src="assets/hero-gift-closed.jpg" width="1536" height="1024" alt="Бордовая подарочная шкатулка с золотистым цветочным узором">
        <canvas class="gift-canvas" aria-hidden="true"></canvas>
      </div>
    </div>`;

  const button = section.querySelector('button');
  const action = section.querySelector('.gift-action');
  const inside = section.querySelector('.gift-inside');
  const still = section.querySelector('.gift-still');
  const canvas = section.querySelector('canvas');
  const stage = section.querySelector('.gift-stage');
  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const closedImage = new Image();
  const openImage = new Image();
  closedImage.src = 'assets/hero-gift-closed.jpg';
  openImage.src = 'assets/hero-gift.jpg';

  // Landmarks on the two original art frames, recorded in their 1536 x 1024 space.
  // The polygons follow the chamfered edges of each door.
  const doors = [
    {
      closed: [[178,510],[238,422],[451,328],[880,356],[658,667],[268,627]],
      open: [[48,300],[196,115],[618,7],[753,7],[534,346],[177,548]]
    },
    {
      closed: [[880,356],[1177,386],[1308,504],[1268,593],[1057,702],[658,667]],
      open: [[1006,152],[1046,149],[1347,323],[1426,427],[1452,507],[1171,685]]
    }
  ];
  const tray = [[165,523],[503,371],[748,295],[1053,352],[1198,627],
    [1050,714],[256,636],[168,566]];
  let position = 0;
  let goal = 0;
  let frame = 0;
  let ready = false;

  function polygon(points) {
    context.beginPath();
    points.forEach(([x,y], index) => index ? context.lineTo(x,y) : context.moveTo(x,y));
    context.closePath();
  }

  // Map a source triangle onto the moving lid while keeping its engraving attached.
  function triangle(image, source, target) {
    const [[x0,y0],[x1,y1],[x2,y2]] = source;
    const [[u0,v0],[u1,v1],[u2,v2]] = target;
    const dx1=x1-x0, dx2=x2-x0, dy1=y1-y0, dy2=y2-y0;
    const area=dx1*dy2-dx2*dy1;
    if (Math.abs(area)<0.1) return;
    const a=((u1-u0)*dy2-(u2-u0)*dy1)/area;
    const b=((v1-v0)*dy2-(v2-v0)*dy1)/area;
    const c=(dx1*(u2-u0)-dx2*(u1-u0))/area;
    const d=(dx1*(v2-v0)-dx2*(v1-v0))/area;
    context.save();
    polygon(target);
    context.clip();
    context.transform(a,b,c,d,u0-a*x0-c*y0,v0-b*x0-d*y0);
    context.drawImage(image,0,0,1536,1024);
    context.restore();
  }

  function draw() {
    if (!ready) return;
    const t=position;
    context.setTransform(canvas.width/1536,0,0,canvas.height/1024,0,0);
    context.globalAlpha=1;
    context.drawImage(t===1?openImage:closedImage,0,0,1536,1024);
    if (t===0 || t===1) return;
    context.save();
    polygon(tray);
    context.clip();
    context.drawImage(openImage,0,0,1536,1024);
    context.restore();

    doors.forEach(({closed,open},side) => {
      const target=closed.map(([x,y],index) => {
        const [endX,endY]=open[index];
        const arc=Math.sin(t*Math.PI);
        return [x+(endX-x)*t+(side?18:-18)*arc,y+(endY-y)*t-54*arc];
      });
      for(let index=1;index<closed.length-1;index++) {
        const points=[0,index,index+1];
        triangle(closedImage,points.map(i=>closed[i]),points.map(i=>target[i]));
        context.globalAlpha=t;
        triangle(openImage,points.map(i=>open[i]),points.map(i=>target[i]));
        context.globalAlpha=1;
      }
    });
    // Resolve the small changes of lighting and the cast shadows in the final frame.
    if(t>.7) {
      context.globalAlpha=(t-.7)/.3;
      context.drawImage(openImage,0,0,1536,1024);
      context.globalAlpha=1;
    }
  }

  function resize() {
    if (!ready) return;
    const width=Math.min(1536,Math.max(1,Math.round(stage.clientWidth*(window.devicePixelRatio||1))));
    canvas.width=width;
    canvas.height=Math.round(width*2/3);
    draw();
  }

  Promise.all([closedImage.decode(),openImage.decode()]).then(() => {
    if (!context) return;
    ready=true;
    position=goal;
    resize();
    canvas.style.visibility='visible';
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize',resize);
  }).catch(() => { /* The image element remains a functional state switch. */ });

  function toggle() {
    goal=goal?0:1;
    const expanded=Boolean(goal);
    button.setAttribute('aria-expanded',String(expanded));
    action.textContent=expanded?'Закрыть шкатулку':'Раскрыть шкатулку';
    inside.hidden=!expanded;
    still.src=expanded?openImage.src:closedImage.src;
    still.alt=expanded?'Открытая шкатулка с пятью секциями орехов и сухофруктов':'Бордовая шкатулка с золотистым цветочным узором';
    cancelAnimationFrame(frame);
    if(!ready || reduceMotion.matches) {
      position=goal;
      draw();
      return;
    }
    const from=position;
    const start=performance.now();
    const duration=Math.max(180,950*Math.abs(goal-from));
    function tick(now) {
      const time=Math.min(1,(now-start)/duration);
      const eased=time*time*(3-2*time);
      position=from+(goal-from)*eased;
      draw();
      if(time<1) frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
  }
  button.addEventListener('click',toggle);
  stage.addEventListener('click',toggle);
})();

