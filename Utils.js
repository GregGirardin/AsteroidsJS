/*
from Constants import *
from Shape import *
from Vector import *

class WorldObject():
  # Attributes every object has.
  def __init__( self, type, p, a=0.0, v=None, colRadius=0, mass=1.0, weapon=False ):
    if not v:
      v = Vector( 0, 0 )
    self.v = v
    self.spin = 0.0
    self.p = p # position
    self.a = a # angle
    self.type = type
    self.accel = 0.0
    self.weapon = weapon # Explode even on slow contact
    self.colRadius = colRadius
    self.colList = [] # a list of CollisionObject
    self.mass = mass

  def offScreen( self ):
    if self.p.x < -SCREEN_BUFFER or self.p.x > SCREEN_WIDTH + SCREEN_BUFFER or \
       self.p.y < -SCREEN_BUFFER or self.p.y > SCREEN_HEIGHT + SCREEN_BUFFER:
      return True
    else:
      return False

  def update( self, e ):
    self.a += self.spin
    if self.a < 0:
      self.a += TAU
    elif self.a > TAU:
      self.a -= TAU
    self.p.move( self.v )
    self.v.add( Vector( self.accel, self.a ) )

class CollisionObject():
  def __init__( self, o, i, d ):
    self.o = o # the object
    self.i = i # impulse = speed * their mass / my mass, dir
    self.d = d # distance between objects.

class Event ():
  def __init__( self, msg, dur, action ):
    self.msg = msg
    self.dur = dur
    self.action = action # callback

class gameEvents():
  def __init__( self ):
    self.eventList = []

  def newEvent( self, msg, dur, action ):
    ev = Event( msg, dur, action )
    self.eventList.append( ev )

  def update( self ):
    if len( self.eventList ) > 0:
      e = self.eventList[ 0 ]
      e.dur -= 1
      if e.dur < 0:
        if e.action:
          e.action()
        del self.eventList[ 0 ]
    return True # Event object is always here

  def draw( self, e ):
    if len( self.eventList ) > 0:
      ev = self.eventList[ 0 ]
      if ev.msg:
        e.canvas.create_text( SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, text=ev.msg, fill="black" )

class spawnAble():
  def __init__( self, min, max, num, ict, newFunc ):
    self.min = min
    self.max = max
    self.num = num
    self.newFunc = newFunc
    self.spawnCountdown = ict

  def update( self, e ):
    if self.num > 0 or self.num == -1:
      self.spawnCountdown -= 1
      if self.spawnCountdown <= 0:
        self.spawnCountdown = random.randrange( self.min, self.max )
        s = self.newFunc()
        e.addObj( s )
        if self.num > 0:
          self.num -= 1

class spawnList():
  def __init__( self, l ):
    self.spawnAbles = []
    for s in l:
      self.spawnAbles.append( spawnAble( *s ) )

  def update( self, e ):
    if self.spawnAbles:
      for s in self.spawnAbles:
        s.update( e )
    done = True
    for s in self.spawnAbles:
      if s.num > 0:
        done = False
        break
    return done

# if you're facing dir and want to go goalDir, return the delta. -PI to PI
def angleTo( dir, goalDir ):
  dif = goalDir - dir
  if dif > PI:
    dif -= TAU
  elif dif < -PI:
    dif += TAU
  return dif

def angleNorm( dir ):
  if dir > PI:
    dir -= TAU
  elif dir < -PI:
    dir += TAU
  return dir
  */
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