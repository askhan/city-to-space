import type {Obstacle} from './game.ts';

/** Friendly overhead sprites, sized to match their forgiving collision bounds. */
export function drawMovingHazard(ctx:CanvasRenderingContext2D,o:Obstacle,x:number,y:number,width:number):boolean {
 if(!['person','bird','alien','traffic','plane','spaceship'].includes(o.kind))return false;
 const box=(x:number,y:number,w:number,h:number,r:number,color:string)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
 const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 const stroke=(points:number[][],color:string,w:number)=>{ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
 const shape=(points:number[][],color:string)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
 ctx.save();ctx.translate(x,y);
 // Fade bumped characters rather than showing injuries or destruction.
 if(o.hit)ctx.globalAlpha=.45;
 const phase=(o.age??0)*10;
 if(o.kind==='person'||o.kind==='alien'){
   const scale=Math.min(1.15,width/30);ctx.scale(scale,scale);
   oval(3,5,15,12,'#152c3533');
   // Characters face their direction of travel; alternating feet suggest walking.
   ctx.rotate((o.vx??1)>0?Math.PI/2:-Math.PI/2);
   const step=Math.sin(phase)*4;
   stroke([[-5,5],[-6,14+step]],o.kind==='alien'?'#6985b9':'#394e6b',6);
   stroke([[5,5],[6,14-step]],o.kind==='alien'?'#6985b9':'#394e6b',6);
   stroke([[-9,-3],[-13,4-step]],o.kind==='alien'?'#a4df90':'#d6a577',5);
   stroke([[9,-3],[13,4+step]],o.kind==='alien'?'#a4df90':'#d6a577',5);
   box(-10,-8,20,20,7,o.kind==='alien'?'#a6a3e5':'#e7976b');
   oval(0,-10,o.kind==='alien'?12:8,9,o.kind==='alien'?'#b2ee91':'#e3b78e');
   if(o.kind==='alien'){oval(-5,-12,3,4,'#254b43');oval(5,-12,3,4,'#254b43');stroke([[-7,-17],[-10,-22]],'#b2ee91',2);stroke([[7,-17],[10,-22]],'#b2ee91',2);}
   else {oval(0,-14,8,5,'#66513f');box(-7,-16,14,4,2,'#f4ce70');}
 }else if(o.kind==='bird'){
   ctx.scale(width/40,width/40);ctx.rotate((o.vx??1)>0?Math.PI/2:-Math.PI/2);
   const flap=Math.sin(phase)*9;
   stroke([[-19,flap],[-9,-4],[0,3],[9,-4],[19,flap]],'#526d86',8);
   stroke([[-19,flap-2],[-9,-6],[0,1],[9,-6],[19,flap-2]],'#fff8de',5);
   oval(0,0,5,11,'#f5efdb');shape([[-3,-10],[0,-17],[3,-10]],'#e8b35e');
 }else if(o.kind==='traffic'){
   ctx.scale(width/36,1);
   box(-19,-27,40,62,9,'#16332f30');
   for(const side of [-1,1]){box(side*17-3,-22,6,14,2,'#233b3e');box(side*17-3,13,6,14,2,'#233b3e');}
   box(-16,-31,32,62,9,'#d47765');box(-13,-28,26,55,7,'#ed9480');
   box(-11,0,22,17,4,'#294d57');stroke([[-7,4],[4,4]],'#97bbc1',2);
   box(-10,-21,20,10,3,'#406671');box(-10,-9,20,9,3,'#e8816c');
   box(-12,24,7,5,2,'#fff4ba');box(5,24,7,5,2,'#fff4ba');
   box(-12,-29,6,3,1,'#bb514d');box(6,-29,6,3,1,'#bb514d');
 }else if(o.kind==='plane'){
   ctx.scale(width/66,1);
   shape([[-5,-19],[-14,-26],[-14,-18],[-5,-8]],'#ddb868');shape([[5,-19],[14,-26],[14,-18],[5,-8]],'#ddb868');
   shape([[-4,-8],[-33,7],[-33,16],[-4,9],[4,9],[33,16],[33,7],[4,-8]],'#f6edcc');
   box(-7,-29,14,59,7,'#e7c576');box(-5,-12,10,24,4,'#fff1c6');
   box(-4,10,8,10,4,'#577f95');box(-32,10,8,5,1,'#dc9470');box(24,10,8,5,1,'#dc9470');
   stroke([[-12*Math.cos(phase*2),31],[12*Math.cos(phase*2),31]],'#53748b',3);
 }else{
   ctx.scale(width/66,1);
   const flame=9+Math.sin(phase*2)*4;
   shape([[-8,-20],[0,-31-flame],[8,-20]],'#edba71');shape([[-4,-20],[0,-29],[4,-20]],'#fff3c0');
   shape([[0,30],[-13,10],[-32,-17],[-27,-24],[-9,-13],[0,-22],[9,-13],[27,-24],[32,-17],[13,10]],'#aaabe6');
   shape([[0,30],[-9,8],[0,-17],[9,8]],'#d9dbf7');
   oval(0,3,6,11,'#6be0d4');oval(-22,-14,3,4,'#eec383');oval(22,-14,3,4,'#eec383');
 }
 ctx.restore();return true;
}
