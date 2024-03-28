/*
from Particles import *
from Utils import *

class Asteroid( WorldObject ):
  def __init__( self, radius, iron = False ):
    radii = 6 + random.randrange( 0, 5 )
    r = []
    for _ in range( 0, radii ):
      r.append( radius + random.uniform( 0, 5 ) )
    r.append( r[ 0 ] )

    s = []
    theta = 0
    delTheta = 2 * PI / ( len( r ) - 1 )
    for i in range( 0, len( r ) - 1 ):
      s.append( ( r[ i ] * math.cos( theta ), r[ i ] * math.sin( theta ),
                  r[ i + 1 ] * math.cos( theta + delTheta ), r[ i + 1 ] * math.sin( theta + delTheta ),
                  0 ) )
      theta += delTheta
    self.shape = Shape( s )

    if random.random() < .5:
      v = Vector( random.uniform( .2, 2 ), random.uniform( PI + PI * .2, PI + PI * .8 ) )
      initY = -SCREEN_BUFFER + 1
    else:
      v = Vector( random.uniform( .2, 2 ), random.uniform( PI * .2, PI * .8 ) )
      initY = SCREEN_HEIGHT + SCREEN_BUFFER - 1

    if iron == True:
      m = IRON_ASTEROID_MASS * radius
    else:
      m = ASTEROID_MASS * radius

    self.collision = OBJECT_TYPE_NONE
    WorldObject.__init__( self,
                          OBJECT_TYPE_ASTEROID,
                          Point( random.randrange( SCREEN_WIDTH * .1, SCREEN_WIDTH * .8 ), initY ),
                          0,
                          v,
                          radius,
                          mass = m )
    self.spin = random.uniform( -.05, .05 )
    self.iron = iron

  def update( self, e ):
    if self.offScreen():
      return False

    while self.colList:
      c = self.colList.pop( 0 )

      if c.o.type == OBJECT_TYPE_NONE:
        continue

      if( self.iron is True or ( c.i.magnitude < SMALL_IMPULSE and c.o.weapon is False ) ) and c.o.type != OBJECT_TYPE_BH:
        # Newtonian billiard ball
        self.v.add( c.i, mod = True )
        if self.v.magnitude > SPEED_HI:
          self.v.magnitude = SPEED_HI
      else:
        for _ in range( 1, random.randrange( 10, 20 ) ):
          p = SmokeParticle( Point( self.p.x, self.p.y ),
                             Vector( 2 * random.random(), random.uniform( 0, TAU ) ),
                             random.randrange( 10, 20 ),
                             random.uniform( 3, 4 ) )
          e.addObj( p )

        if self.colRadius > MIN_ASTEROID_RADIUS * 2:
          vector = random.uniform( 0, TAU )
          r = self.colRadius / 2
          for v in( 0, PI ):
            a = Asteroid( r )
            a.p.x = self.p.x + r * math.cos( vector + v )
            a.p.y = self.p.y + r * math.sin( vector + v )
            a.velocity = Vector( self.v.magnitude * 1.5, self.v.direction + v )
            e.addObj( a )

        t = c.o.type
        if t == OBJECT_TYPE_CANNON or t == OBJECT_TYPE_T_CANNON or t == OBJECT_TYPE_TORPEDO:
          e.score += ASTEROID_POINTS
        return False

    WorldObject.update( self, e )
    return True

  def draw( self, canvas, p, a ):
    width = 3 if self.iron is True else 1
    self.shape.draw( canvas, p, a, width = width )

def newAsteroid():
  return Asteroid( random.uniform( 10, 50 ), iron = True if random.random() < .2 else False )

class BlackHole( WorldObject ):
  def __init__( self ):
    self.radius = random.uniform( 20, 50 )
    self.collision = OBJECT_TYPE_NONE

    WorldObject.__init__( self, OBJECT_TYPE_BH,
                          Point( -5, random.randrange( SCREEN_HEIGHT * .2, SCREEN_HEIGHT * .8 ) ),
                          0,
                          Vector( random.uniform( 1.4, 3 ), random.uniform( -.5, .5 ) ),
                          self.radius,
                          mass = BH_MASS * self.radius,
                          weapon = True ) # BHs destroy everything.

  def update( self, e ):
    if self.offScreen():
      return False

    WorldObject.update( self, e )

    for obj in e.objects:
      if obj is not self:
        dis = obj.p.distanceTo( self.p )
        dir = obj.p.directionTo( self.p )
        m = self.mass / ( dis ** 2 )
        obj.v.add( Vector( m, dir ) )
        if obj.v.magnitude > SPEED_VHI:
           obj.v.magnitude = SPEED_VHI

    return True

  def draw( self, canvas, p, a ):
    canvas.create_oval( p.x - self.radius,
                        p.y - self.radius,
                        p.x + self.radius,
                        p.y + self.radius,
                        fill = "black" )

def newBlackHole():
  return BlackHole()
  */

import { c } from './constants.js';
import { WorldObject, randInt, randFloat } from './Utils.js';
//import { c } from './Utils.js';

export class Asteroid extends( WorldObject )
{
  constructor( radius, iron = false )
  {
    let radii = 6 + randInt( 0, 5 );
    let r = [];
    for( let count = 0;count < radii;count++ )
      r.push( radius + randFloat( 0, 5 ) );
    r.push( r[ 0 ] );

    let s = [];
    let theta = 0;
    let delTheta = 2 * c.PI / r.length;
    for( let i = 0;i < r.length;i++ )
    { 
      s.push( [ r[ i ] * Math.cos( theta ),
                r[ i ] * Math.sin( theta ),
                r[ i + 1 ] * Math.cos( theta + delTheta ),
                r[ i + 1 ] * Math.sin( theta + delTheta ),
                "black" ] );
      theta += delTheta;
    }
    this.shape = new Shape( s );

    if( Math.random() < .5 )
    {
      let v = new Vector( randFloat( -.2, .2 ), randFloat( c.PI + c.PI * .2, c.PI + c.PI * .8 ) );
      let initY = -c.SCREEN_BUFFER + 1;
    }
    else
    {
      let v = new Vector( randFloat( -.2, .2 ), randFloat( c.PI * .2, c.PI * .8 ) );
      let initY = c.SCREEN_HEIGHT + c.SCREEN_BUFFER - 1;
    }
    if( iron == true )
       m = c.IRON_ASTEROID_MASS * radius;
    else
       m = c.ASTEROID_MASS * radius;

    this.collision = c.OBJECT_TYPE_NONE;

    super( c.OBJECT_TYPE_ASTEROID, new Point( randInt( SCREEN_WIDTH * .1, SCREEN_WIDTH * .8 ), initY ), 0, v, radius, m );
    this.spin = randFloat( -.05, .05 );
    this.iron = iron;
  }

  update( e )
  {
    if( this.offScreen() )
      return false;

    while( this.colList.length )
    {
      let c = this.colList.shift();

      if( c.o.type == c.OBJECT_TYPE_NONE )
        continue;
    
      if( ( this.iron == true || ( c.i.magnitude < c.SMALL_IMPULSE && c.o.weapon == false ) ) && c.o.type != c.OBJECT_TYPE_BH ) 
      {
        this.v.add( c.i, true );
        if( this.v.magnitide > c.SPEED_HI )
          this.v.magnitide = c.SPEED_HI;
      }
      else
      {
        let count = randInt( 10, 20 );
        for( let v = 1;v < count;v++ )
        {
          let p = new SmokeParticle( new Point( self.p.x, self.p.y ),
                                     new Vector( randFloat( 0, 2 ), randFloat( 0, TAU ) ),
                                     randInt( 10, 20 ),
                                     randFloat( 3, 4 ));
          e.addObj( p );
        }
        if( this.colRadius > c.MIN_ASTEROID_RADIUS * 2 )
        {
          let vector = randFloat( 0, c.TAU );
          let r = this.colRadius / 2;
          for( ix = 0;ix < 2;ix++ )
          {
            const v = [ 0, c.PI ];
            let a = new Asteroid( r );
            a.p.x = this.p.x + r * Math.cos( vector + v[ ix ] );
            a.p.y = this.p.y + r * Math.sin( vector + v[ ix ] );
            a.velocity = new Vector( this.v.magnitide * 1.5, this.v.direction + v[ ix ] );
            e.addObj( a );
          }
        }
        let t = c.o.type;
        if( t == OBJECT_TYPE_CANNON || t == OBJECT_TYPE_T_CANNON || t == OBJECT_TYPE_TORPEDO )
          e.score += ASTEROID_POINTS
        return false
       }
     }
     super.update( e );
     return true;
   }

  draw( ctx, p, a )
  {
    width = ( this.iron == true ) ? 3 : 1;
    this.shape.draw( ctx, p, a );
  }
}

export function newAsteroid()
{
  return( new Asteroid() );
}

export class Blackhole extends WorldObject
{
  constructor()
  {
    this.radius = randInt( 20, 50 );
    this.collision = c.OBJECT_TYPE_NONE;
    super( c.OBJECT_TYPE_BH,
           new Point( -5, randInt( c.SCREEN_HEIGHT * .2, c.SCREEN_HEIGHT * .8 ) ),
           0,
           new Vector( randFloat( 1.4, 3), randFloat( -.5, .5 )),
           this.radius,
           c.BH_MASS * this.radius,
           true );
  }

  update()
  {
    if( offScreen() )
      return false;

    super.update( e );

    for( obj of e.objects )
      if( obj != this )
      {
        let dis = obj.p.distanceTo( this.a );
        let dir = obj.p.directionTo( this.p );
        let m = this.mass / ( dis ** 2 );
        obj.v.add( new Vector( m, dir ) );
        if( obj.v.magnitide > c.SPEED_HI )
          obj.v.magnitide = c.SPEED_HI;
      }
    return true;
  }

  draw( ctx, p, a )
  {
    ctx.beginPath();
    ctx.arc ( p.x, p.y, this.colRadius, 0, 2 * Math.PI, "black") ;
    ctx.stroke();
  }

}

export function newBlackhole()
{
  return( new Blackhole );
}