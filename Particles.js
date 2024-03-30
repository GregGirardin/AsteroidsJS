import { c } from './constants.js';
import { WorldObject, randInt, randFloat } from './Utils.js';
import { Shape } from './Shape.js';
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
      let colObj = this.colList.shift();
      let t = colObj.o.type;
      if( t == c.OBJECT_TYPE_TORPEDO || t == c.OBJECT_TYPE_NONE || t == c.OBJECT_TYPE_CANNON )
        return true;
    }
    return true;
  }
  
  draw( ctx )
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
      var colObj = this.colList.shift();

      if( colObj.o.type == c.OBJECT_TYPE_ASTEROID && colObj.o.iron == true )
      {
        this.v.add( colObj.i, true );
        if( this.v.magnitude > c.SPEED_HI )
          this.v.magnitude = c.SPEED_HI;
        this.p.move( new Vector( colObj.d / 2, colObj.i.direction ) );
      }
    }
    return true;
  }

  draw( ctx )
  {
    let r = this.radius + randFloat( -2, 1 );
    ctx.beginPath();
    ctx.arc ( this.p.x, this.p.y, r, 0, 2 * Math.PI, "black");
    ctx.stroke();
  }
}
  