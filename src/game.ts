export const CONFIG = { scoreRate: 10, collisionPenalty: 50, protection: 1, thresholds: [0, 500, 1000], finish: 1500, speeds: [200, 245, 285], spawnEvery: [1.8, 1.5, 1.3], steering: 1.15 };
export type Input = {left:boolean;right:boolean;up:boolean;down:boolean};
export type HazardKind = 'cone'|'barrier'|'asteroid'|'person'|'bird'|'alien'|'traffic'|'plane'|'spaceship';
export type Obstacle = {x:number;y:number;width:number;kind:HazardKind;hit:boolean;vx?:number;approachSpeed?:number;halfHeight?:number;age?:number};
export type State = {score:number;stage:number;previousStage:number;transition:number;x:number;distance:number;protection:number;spawn:number;spawnCount:number;obstacles:Obstacle[];finished:boolean;crashes:number;lastCollision?:HazardKind;speed:number};
export function createState():State { return {score:0,stage:0,previousStage:0,transition:0,x:.5,distance:0,protection:0,spawn:.7,spawnCount:0,obstacles:[],finished:false,crashes:0,speed:200}; }
// Alternate crossing characters, oncoming vehicles, and the original obstacles.
// Crossing speed scales with the visible road so short landscape screens still
// give the character time to enter the road before reaching the player's car.
export function spawnObstacle(stage:number, random:()=>number = Math.random, sequence=0, height=700):Obstacle {
 const pattern=sequence%3;
 if(pattern===0){const direction=random()<.5?1:-1;return {x:direction===1?-.12:1.12,y:height*.16,width:.14,kind:(['person','bird','alien'] as const)[stage],hit:false,vx:direction*.65*CONFIG.speeds[stage]/(height*.62),halfHeight:14,age:0};}
 if(pattern===1)return {x:.18+random()*.64,y:-90,width:stage===0?.15:.24,kind:(['traffic','plane','spaceship'] as const)[stage],hit:false,approachSpeed:CONFIG.speeds[stage]*.65,halfHeight:27,age:0};
 return {x:.15+random()*.7,y:-90,width:stage===2?.17:.19,kind:stage===2?'asteroid':random()>.5?'barrier':'cone',hit:false,age:0};
}
export function update(s:State,input:Input,dt:number,height:number,roadWidth:number,random:()=>number = Math.random) {
 if(s.finished)return;
 s.protection=Math.max(0,s.protection-dt);s.transition=Math.max(0,s.transition-dt);
 s.speed=CONFIG.speeds[s.stage]*(input.up?1.3:input.down?.65:1);
 s.distance+=s.speed*dt;const margin=Math.max(.07,20/roadWidth);s.x=Math.max(margin,Math.min(1-margin,s.x+(Number(input.right)-Number(input.left))*CONFIG.steering*dt));
 s.score+=CONFIG.scoreRate*dt;
 const playerY=height*.78;
 // Keep a clear reaction window: a fast vehicle cannot catch a crossing
 // character and form an unavoidable wall at the player's position.
 s.spawn-=dt;if(s.spawn<=0&&!s.obstacles.some(o=>o.y<playerY+80&&o.x>-.2&&o.x<1.2)){s.obstacles.push(spawnObstacle(s.stage,random,s.spawnCount++,height));s.spawn=CONFIG.spawnEvery[s.stage];}
 for(const o of s.obstacles){o.y+=(s.speed+(o.approachSpeed??0))*dt;o.x+=(o.vx??0)*dt;o.age=(o.age??0)+dt;if(!o.hit&&s.protection===0&&Math.abs(o.y-playerY)<(o.halfHeight??10)+19&&Math.abs(o.x-s.x)*roadWidth<o.width*roadWidth*.42+11){o.hit=true;s.score=Math.max(0,s.score-CONFIG.collisionPenalty);s.protection=CONFIG.protection;s.crashes++;s.lastCollision=o.kind;}}
 s.obstacles=s.obstacles.filter(o=>o.y<height+100&&o.x>-.35&&o.x<1.35);
 const next=s.score>=1000?2:s.score>=500?1:0;
 if(next>s.stage){s.previousStage=s.stage;s.stage=next;s.transition=2.4;}
 if(s.score>=CONFIG.finish){s.score=CONFIG.finish;s.finished=true;}
}

