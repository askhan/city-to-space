import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,update,spawnObstacle,CONFIG} from '../src/game.ts';
const idle={left:false,right:false,up:false,down:false};
test('scores with elapsed time and supports frame independent steering',()=>{const a=createState(),b=createState();a.spawn=b.spawn=100;for(let i=0;i<60;i++)update(a,{...idle,right:true},1/60,700,300);for(let i=0;i<30;i++)update(b,{...idle,right:true},1/30,700,300);assert.ok(Math.abs(a.score-10)<1e-8);assert.ok(Math.abs(a.x-.93)<1e-8);assert.ok(Math.abs(a.distance-b.distance)<1e-8);});
test('collision penalty, score floor, and protection',()=>{const s=createState();s.score=100;s.spawn=100;s.obstacles=[{x:.5,y:546,width:.19,kind:'barrier',hit:false},{x:.5,y:546,width:.19,kind:'barrier',hit:false}];update(s,idle,0,700,300);assert.equal(s.score,50);assert.equal(s.crashes,1);update(s,idle,.1,700,300);assert.equal(s.crashes,1);s.protection=0;s.score=2;s.obstacles=[{x:.5,y:546,width:.19,kind:'cone',hit:false}];update(s,idle,0,700,300);assert.equal(s.score,0);});
test('stage unlocks persist and completion caps score',()=>{const s=createState();s.score=500;update(s,idle,0,700,300);assert.equal(s.stage,1);s.score=450;update(s,idle,0,700,300);assert.equal(s.stage,1);s.score=1000;update(s,idle,0,700,300);assert.equal(s.stage,2);s.score=1500;update(s,idle,0,700,300);assert.equal(s.finished,true);update(s,idle,10,700,300);assert.equal(s.score,1500);assert.equal(createState().score,0);});
test('speed modifiers and steering bounds',()=>{const s=createState();update(s,{...idle,up:true},.1,700,300);assert.equal(s.speed,260);update(s,{...idle,down:true,left:true},1,700,300);assert.equal(s.speed,130);assert.equal(s.x,.07);});
test('the entire car stays within narrow phone roads',()=>{const s=createState();update(s,{...idle,left:true},1,500,140);assert.ok(s.x*140>=20);update(s,{...idle,right:true},2,500,140);assert.ok((1-s.x)*140>=19.99);});
test('each stage includes its crossing character, oncoming vehicle, and original obstacle',()=>{
 const expected=[['person','traffic','cone'],['bird','plane','cone'],['alien','spaceship','asteroid']];
 for(let stage=0;stage<3;stage++)for(let sequence=0;sequence<3;sequence++){
  const o=spawnObstacle(stage,()=>0,sequence);
  assert.equal(o.kind,expected[stage][sequence]);assert.ok(o.width<=.24);
  if(sequence===0){assert.equal(o.x,-.12);assert.ok(o.vx>0);const reverse=spawnObstacle(stage,()=>.99,sequence);assert.equal(reverse.x,1.12);assert.ok(reverse.vx<0);}
  else {assert.ok(o.x>=.15&&o.x<=.85);if(sequence===1)assert.ok(o.approachSpeed>0);}
 }
});
test('crossing characters reach the road in both orientations and at every driving speed',()=>{
 for(const height of [230,380,700,1000])for(let stage=0;stage<3;stage++)for(const multiplier of [.65,1,1.3]){
  const o=spawnObstacle(stage,()=>0,0,height);
  const arrival=(height*.78-o.y)/(CONFIG.speeds[stage]*multiplier);
  const crossingX=o.x+o.vx*arrival;
  assert.ok(crossingX>.07&&crossingX<.93);
 }
});
test('oncoming traffic approaches faster, with frame-independent motion',()=>{
 const a=createState(),b=createState();a.spawn=b.spawn=100;
 a.obstacles=[spawnObstacle(0,()=>.8,1)];b.obstacles=[structuredClone(a.obstacles[0])];
 for(let i=0;i<30;i++)update(a,idle,1/30,700,300);
 for(let i=0;i<60;i++)update(b,idle,1/60,700,300);
 assert.ok(Math.abs(a.obstacles[0].y-b.obstacles[0].y)<1e-8);
 assert.ok(a.obstacles[0].y>110);
});
test('new waves wait until the previous hazard passes the car',()=>{
 const s=createState();s.spawn=0;s.obstacles=[spawnObstacle(0,()=>.5,1)];
 update(s,idle,0,700,300);assert.equal(s.obstacles.length,1);
 s.obstacles[0].y=700*.78+81;update(s,idle,0,700,300);assert.equal(s.obstacles.length,2);
});
test('all moving hazards apply the same penalty only once per protected contact',()=>{
 for(let stage=0;stage<3;stage++)for(let sequence=0;sequence<2;sequence++){
  const s=createState();s.score=100;s.spawn=100;const o=spawnObstacle(stage,()=>.5,sequence);o.x=.5;o.y=546;s.obstacles=[o];
  update(s,idle,0,700,300);assert.equal(s.score,50);assert.equal(s.crashes,1);assert.equal(s.lastCollision,o.kind);
  update(s,idle,0,700,300);assert.equal(s.crashes,1);
 }
});
test('full drive reaches all three stages',()=>{const s=createState(),seen=new Set([0]);for(let i=0;i<10000&&!s.finished;i++){// Anticipate where the moving hazard will cross the car, like a cautious player.
const next=s.obstacles.find(o=>o.y<700*.78+40);const arrival=next?Math.max(0,(700*.78-next.y)/(s.speed+(next.approachSpeed??0))):0;const projectedX=next?next.x+(next.vx??0)*arrival:.5;const target=next?(projectedX>=.5?.12:.88):s.x;update(s,{...idle,left:s.x>target+.02,right:s.x<target-.02},1/30,700,300,()=>.7);seen.add(s.stage);}assert.deepEqual([...seen],[0,1,2]);assert.equal(s.finished,true);});

