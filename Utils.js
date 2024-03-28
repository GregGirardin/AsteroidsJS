import { c } from './constants.js';
import { Point, Vector } from './vector.js';

export class WorldObject
{
  constructor( type, p, a, v, colRadius, mass, weapon )
  {
    this.v = v;
    this.spin = 0;
    this.p = p; // position
    this.a = a; // angle
    this.type = type;
    this.accel = 0.0;
    this.weapon = weapon;
    this.colRadius = colRadius;
    this.colList = []; // list (array) of CollisionObject
    this.mass = mass;
  }

  offScreen()
  {
    if( this.p.x < -c.SCREEN_BUFFER || this.p.x > c.SCREEN_WIDTH + SCREEN_BUFFER ||
        this.p.y < -c.SCREEN_BUFFER || this.p.y > c.SCREEN_HEIGHT + SCREEN_BUFFER )
      return true;
    else
      return false;
  }

  update( e )
  {
    this.a += this.spin;
    if( this.a < 0 )
      this.a += c.TAU;
    else if( this.a > c.TAU )
      this.a -= c.TAU;

    this.p.move( this.v );
    this.v.add( new Vector( this.accel, this.a ) );
  }
}

export class CollisionObject
{
  constructor( o, i, d )
  {
    this.o = o; // the object
    this.i = i; // impulse
    this.d = d; // distance
  }
}

export class Event
{
  constructor( msg, dur, action )
  {
    this.msg = msg;
    this.dur = dur;
    this.aaction = action; // callback
  }
}

export class gameEvents
{
  constructor()
  {
    this.eventList = []; // array of events.
  }

  newEvent( msg, dur, action )
  {
    ev = new Event( msg, dur, action )
    this.eventList.push( ev );
  }

  update( )
  {
    if( this.eventList.length > 0 )
    {
      e = this.eventList[ 0 ];
      e.dur--;
      if( e.dur < 0 )
      {
        if( e.action )
          e.action();
        this.eventList.shift();
      }
    }
    return true;
  }

  draw( e )
  {
    if( this.eventList.length > 0 )
    {
      ev = this.eventList[ 0 ];
      if( ev.msg )
        e.ctx.fillText( ev.msg, c.SCREEN_WIDTH / 2, c.SCREEN_HEIGHT / 2 );
    }
  }
}

export class spawnAble
{
  constructor( spawnAlbe )
  {
    this.min = spawnAlbe[ 0 ];
    this.max = spawnAlbe[ 1 ];
    this.num = spawnAlbe[ 2 ];
    this.count = spawnAlbe[ 3 ];
    this.newFunc = spawnAlbe[ 4 ];
  }

  update( e )
  {
    if( this.num > 0 || this.num == -1 )
    {
      this.count--;
      if( this.count <= 0 )
      {
        this.count = randInt( self.min, self.max );
        s = this.newFunc();
        e.addObj( s );
        if( this.num > 0 )
          this.num--;
      }
    }
  }
}

export class spawnList
{
  constructor( l )
  {
    this.spawnAbles = [];
    for( o of l )
      this.spawnAbles.push( new spawnAble( o ) );
  }

  update( e )
  {
    for( s of this.spawnAbles )
      s.update( e )
    let done = true;
    for( s of this.spawnAbles )
      if( s.num > 0 )
      {
        done = false;
        break;
      }

    return done;
  }
}

export function angleTo( dir, goalDir )
{
  let dif = goalDir - dir;

  if( dif > c.PI )
    dif -= c.TAU;
  else if( dif < -c.PI )
    dif += c.TAU;

  return dif;
}

export function angleNorm( dir )
{
  if( dir > c.PI )
    dir -= c.TAU;
  else if( dir < -c.PI )
    dir += c.TAU;

  return dir;
}

export function randInt( min, max ) { return Math.floor( Math.random() * ( max - min + 1 ) ) + min; }
export function randFloat( min, max ) { return Math.random() * ( max - min ) + min; }