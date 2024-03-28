/*
from Constants import *
import math
from Utils import *
from Shape import *

class SmokeParticle( WorldObject ):
  def __init__( self, p, v, ttl, size ):
    self.ttl = ttl
    s = [ ( -size,-size, size, size, None ),
          ( -size, size, size,-size, None ) ]
    self.shape = Shape( s )
    WorldObject.__init__( self, OBJECT_TYPE_NONE, p, 0, v, 0 )
    if random.random() < .5:
      self.spin = 5
    else:
      self.spin = -5

  def update( self, e ):
    WorldObject.update( self, e )
    if self.ttl > 0:
      self.ttl -= 1
      return True
    else:
      return False

  def draw( self, canvas, p, a ):
    self.shape.draw( canvas, p, a )

class CanonParticle( WorldObject ):
  def __init__( self, p, v, ttl, type = OBJECT_TYPE_CANNON ):
    self.ttl = ttl
    WorldObject.__init__( self, type, p, 0, v, 2, CANNON_MASS, weapon=True )

  def update( self, e ):
    WorldObject.update( self, e )
    if self.ttl > 0:
      self.ttl -= 1
    if self.ttl <= 0:
      return False

    if self.colList:
      c = self.colList.pop()
      t = c.o.type
      if t == OBJECT_TYPE_TORPEDO or t == OBJECT_TYPE_NONE or t == OBJECT_TYPE_T_CANNON:
        return True
      return False

  def draw( self, canvas, p, a ):
    canvas.create_oval( p.x - 2, p.y - 2, p.x + 2, p.y + 2, fill="black" )

class Torpedo( WorldObject ):
  def __init__( self, p, v, ttl, radius = 5 ):
    self.ttl = ttl
    self.radius = radius
    self.age = 0
    WorldObject.__init__( self, OBJECT_TYPE_TORPEDO, p, 0, v, radius, TORPEDO_MASS, weapon=True )

  def update( self, e ):
    WorldObject.update( self, e )
    self.age += 1
    if self.age > 20:
      p = CanonParticle( Point ( self.p.x, self.p.y ),
                         Vector( 1 + 2 * random.random(), TAU * random.random () ).add( self.v ),
                         random.uniform( 20, 30 ),
                         type = OBJECT_TYPE_T_CANNON )
      e.addObj( p )

    if self.ttl < 0:
      return False

    self.ttl -= 1
    while self.colList:
      c = self.colList.pop( 0 )

      if c.o.type == OBJECT_TYPE_ASTEROID and c.o.iron == True:
        self.v.add( c.i, mod=True )
        if self.v.magnitude > SPEED_HI:
          self.v.magnitude = SPEED_HI
        self.p.move( Vector( c.d / 2, c.i.direction ) )

    return True

  def draw( self, canvas, p, a ):
    r = self.radius + random.uniform( -2, 1 )
    canvas.create_oval( p.x - r, p.y - r, p.x + r, p.y + r, fill="black" )
  
    */

import { c } from './constants.js';
import { WorldObject, randInt, randFloat } from './Utils.js';
import { Line, Shape } from './Shape.js';
import { Point, Vector } from './Vector.js';

export class SmokeParticle extends WorldObject
{
  constructor( p, v, ttl, size )
  {
    super( c.OBJECT_TYPE_NONE, p, 0, v, false ); v
    this.ttl = ttl;
    let s = [ [ -size, -size, size, size, "black" ],
              [ -size,  size, size,-size, "black" ] ];
  
    this.shape = new Shape( s );
    if( Math.random() < .5 )
      this.spin = 5;
    else
      this.spin = -5;
  }

  update( e )
  {
    super.update( e );
    if( this.ttl > 0 )
    {
      this.ttl--;
      return true;
    }
    else
      return false;
  }

  draw( ctx )
  {
    this.shape.draw( ctx, this.p, this.a );
  }
}

export class CannonParticle extends WorldObject
{
  constructor( p, v, ttl, type=c.OBJECT_TYPE_CANNON )
  {
    super( type, p, 0, v, 2, c.CANNON_MASS, true );
    this.ttl = ttl;
  }

  update( e )
  {
    super.update( e );
    if( this.ttl > 0 )
      this.ttl--;
    if( this.ttl <= 0 )
      return false;

    if( this.colList.length > 0 )
    {
      let c = this.colList.shift();
      let t = c.o.type;
      if( t == c.OBJECT_TYPE_TORPEDO || t == c.OBJECT_TYPE_NONE || t == c.OBJECT_TYPE_CANNON )
        return true;
    }
    return true;
  }
  
  draw( ctx, p, a )
  {
    let r = this.colRadius + randFloat( -2, 1 );
    ctx.beginPath();
    ctx.arc ( this.p.x, this.p.y, r, 0, 2 * Math.PI, "black") ;
    ctx.stroke();
  }
}

export class Torpedo extends WorldObject
{
  constructor( p, v, ttl, radius = 5 )
  {
    super( c.OBJECT_TYPE_TORPEDO, p, 0, v, radius, c.TORPEDO_MASS, true );
    this.ttl = ttl;
    this.radius = radius;
    this.age = 0;
  }
  update( e )
  {
    super.update( e );
    this.age += 1;
    if( this.age > 20 )
    {
      let p = new CannonParticle( new Point ( this.p.x, this.p.y ),
                                  new Vector( randFloat( 1, 3 ), randFloat( 0, c.TAU ) ).add( this.v ),
                                  randInt( 20, 30 ),
                                  c.OBJECT_TYPE_T_CANNON );
      e.addObj( p );
    }

    if( this.ttl < 0 )
      return false;

    this.ttl--;
    while( this.colList.length )
    {
      let c = this.colList.shift();

      if( c.o.type == c.OBJECT_TYPE_ASTEROID && c.o.iron == true )
      {
        this.v.add( c.i, true );
        if( this.v.magnitude > c.SPEED_HI )
          this.v.magnitude = c.SPEED_HI;
        this.p.move( new Vector( c.d / 2, c.i.direction ) );
      }
    }
    return true;
  }

  draw( ctx, p, a )
  {
    let r = this.radius + randFloat( -2, 1 );
    ctx.beginPath();
    ctx.arc ( this.p.x, this.p.y, r, 0, 2 * Math.PI, "black");
    ctx.stroke();
  }
}
  