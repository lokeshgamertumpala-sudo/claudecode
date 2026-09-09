// Simple mob‑control style game
const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
canvas.width=400;canvas.height=400;

const player={x:200,y:200,r:10,dx:0,dy:0};
const mobs=[
  {x:50,y:50,r:8,dx:1,dy:1},
  {x:350,y:80,r:8,dx:-1,dy:1},
  {x:100,y:300,r:8,dx:0.5,dy:-1}
];
function update(){ // movement
  player.x+=player.dx;player.y+=player.dy;
  mobs.forEach(m=>{m.x+=m.dx;m.y+=m.dy;});
}
function draw(){
  ctx.fillStyle='black';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='cyan';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='red';mobs.forEach(m=>{ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,Math.PI*2);ctx.fill();});
}
function loop(){update();draw();requestAnimationFrame(loop);}
loop();
// Simple controls: arrow keys adjust player velocity
window.addEventListener('keydown',e=>{switch(e.key){case 'ArrowUp':player.dy=-2;break;case 'ArrowDown':player.dy=2;break;case 'ArrowLeft':player.dx-=-2;break;case 'ArrowRight':player.dx=2;break;}});
window.addEventListener('keyup',e=>{switch(e.key){case 'ArrowUp':case 'ArrowDown':player.dy=0;break;case 'ArrowLeft':case 'ArrowRight':player.dx=0;break;}});
