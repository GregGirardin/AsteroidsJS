
import { c } from './constants.js';
import { angleTo, angleNorm, randInt, randFloat } from './Utils.js';
import { Point, Vector, dir, vectorDiff } from './Vector.js';

export class Heuristic
{
  constructor( id, next, heuristic )
  {
    this.id = id;
    this.next = next;
    this.heuristic = heuristic;
  }
}

export class HeuristicGo
{
  constructor( velocity, duration )
  {
    this.hVelocity = velocity;
    this.hDuration = duration;
  }

  update( s, e )
  {
    if( this.hDuration > 0 )
    {
      this.hDuration--;
      if( s.v.magnitude < this.hVelocity )
        s.accel = c.THRUST_MED;
      else
        s.accel = 0;
      return false;
    }
    return true;
  }
}

export class HeuristicFace
{
  constructor( angle )
  {
    this.hAngle = angle;
  }

  update( s, e )
  {
    let dirTo = angleTo( s.a, this.hAngle );
    if( Math.abs( dirTo ) > .05 )
    {
      s.spin = dirTo / 20;
      return false;
    }
    else
    {
      s.spin = 0;
      return true;
    }
  }
}

export class HeuristicStop
{
  update( s, e )
  {
    if( s.v.magnitude > c.SPEED_SLOW / 20 )
    {
      // turn around
      let targetDir = angleNorm( s.v.direction + c.PI );
      let dirTo = angleTo( s.a, targetDir );
      if( Math.abs( dirTo ) > .05 )
      {
        s.accel = 0;
        s.spin = dirTo / 20;
      }
      else
      {
        s.accel = c.THRUST_HI;
        s.spin = 0;
      }
      return false;
    }

    s.accel = 0;
    s.spin = 0;
    return true;
  }
}

export class HeuristicGoto
{
  constructor( target, distance )
  {
    this.target = target;
    this.distance = distance;
  }

  update( s, e )
  {
    let distToTarget = s.p.distanceTo( this.target );

    s.accel = 0;
    s.spin = 0;

    if( ( distToTarget < c.OBJECT_DIST_FAR ) &&
         ( ( this.distance == c.OBJECT_DIST_FAR ) ||
           ( ( distToTarget < c.OBJECT_DIST_MED && this.distance == c.OBJECT_DIST_MED ) ||
           ( distToTarget < c.OBJECT_DIST_NEAR ) ) ) )
      return true;

  let dirToTarget = s.p.directionTo( this.target );
  let targetVector = new Vector( c.SPEED_HI * 1.5, dirToTarget ); // hack. Long vector and drag smooth out ship.
  let correctionVec = vectorDiff( s.v, targetVector ); // vector to make our velocity approach targetVector
  let da = angleTo( s.a, correctionVec.direction );

  s.spin = da / 20;
  let dp = s.v.dot( correctionVec.direction );
  if( dp < c.SPEED_HI )
    s.accel = c.THRUST_HI;
  else if( dp < c.SPEED_MED )
    s.accel = c.THRUST_LOW;

  // Cheating. Drag allows us to stay behind target vector. Tricky to fix and this works.
  // otherwise you have to deal with turning around to slow down if you're too fast.
  s.v.magnitude *= .99;

  return false;
  }
}

export function HeuristicGotoRandom()
{
  return( new HeuristicGoto( new Point( randInt( 0, c.SCREEN_WIDTH ), randInt( 0, c.SCREEN_HEIGHT ), c.OBJECT_DIST_MED ) ) );
}

export class HeuristicWait
{
  constructor( duration )
  {
    this.hDuration = duration;
  }

  update( s, e )
  {
    s.accel = 0;
    s.spin = 0;

    this.hDuration--;
    if( this.hDuration < 0 )
      return true;

   return false;
  }
}

export class HeuristicAttack
{
  constructor( duration = 50 )
  {
    this.duration = duration;
    this.durationCounter = duration;
    this.attackState = c.ATTACK_INIT;
    this.aangleOffset = 0;
    this.ttNextAttack = 1;
  }

  update( s, e )
  {
    this.durationCounter--;
    if( this.durationCounter <= 0 )
    {
      this.durationCounter = this.duration;
      return true;
    }
    if( this.attackState == c.ATTACK_INIT )
    {
      if( this.ttNextAttack == 0 )
      {
        this.attackState = c.ATTACK_ALIGN;
        this.aangleOffset = randFloat( -.2, .2 ); // shoot a bit randomly
      }
      else
        this.ttNextAttack--;
    }

    if( this.attackState == c.ATTACK_ALIGN )
    {
      let sh = false;
      for( let obj of e.objects )
      {
        if( obj.type == c.OBJECT_TYPE_SHIP )
        {
          sh = obj;
          break;
        }
      }
      if( sh == false )
        return true;

      let goalDir = dir( sh.p.x - s.p.x, sh.p.y - s.p.y ) + this.aangleOffset;
      let aToGoal = angleTo( s.a, goalDir );

      if( Math.abs( aToGoal ) < .1 )
      {
        s.cannon = 1; //  cannon handled in update
        this.attackState = c.ATTACK_INIT;
        this.ttNextAttack = randFloat( 20, 70 );
      }
      else
        s.spin = aToGoal / 10;
      }
    return false;
  }
}

export class Pilot
{
  constructor( parent, hList )
  {
    this.parent = parent; // the ship this is piloting. A WorldObject
    this.hList = hList;

    if( this.hList )
      this.currentH = hList[ 0 ];
    else
      this.currentH = undefined;
  }

  setHlist( hList )
  {
    this.hList = hList;
    this.currentH = hList[ 0 ];
  }

  pilot( e )
  {
    // Adjust, thrust, direction, and cannon based on heuristics.
    if( this.hList == undefined || this.currentH == undefined )
      return;

    let s = this.currentH.heuristic.update( this.parent, e );

    if( s == true )
      for( let h of this.hList )
        if( h.id == this.currentH.next )
        {
          this.currentH = h;
          break;
        }
  }
}