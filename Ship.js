import { c } from './constants.js';
import { WorldObject } from './Utils.js';
import { Line, Shape } from './Shape.js';
import { randInt, randFloat } from './Utils.js';
import { Point, Vector } from './Vector.js';
import { SmokeParticle, CannonParticle, Torpedo } from './Particles.js';

export class Ship extends WorldObject
{
  constructor()
  {
    super( c.OBJECT_TYPE_SHIP,
           new Point( c.SCREEN_WIDTH * .75, c.SCREEN_HEIGHT * .5 ),
           c.PI,
           new Vector( 0, 0 ),
           7,
           c.SHIP_MASS,
           false );

    const shipShape = [ [ -5, 5, 10, 0, 0 ],
                        [ -5,-5, 10, 0, 0 ],
                        [ -5,-5, -5, 5, 0 ] ];
    this.shape = new Shape( shipShape );

    this.fireCannon = false;
    this.fireTorpedo = false;
    this.rounds = 50;
    this.torpedos = 50;
    this.fuel = 50.0;
    this.torpedoDelay = 0;
  }

  update( e )
  {
    super.update( e );
  
    if( this.accel > 0 )
    {
      if( this.accel > c.THRUST_MAX )
        this.accel = c.THRUST_MAX;
      if( this.fuel < 0 )
      {
        this.fuel = 0;
        if( this.accel > 0)
          this.accel = c.THRUST_LOW
      }
      this.fuel -= this.accel * 2;
    }

    // bounce off walls
    if( this.p.x < 0 && this.v.dx() < 0 || this.p.x > c.SCREEN_WIDTH && this.v.dx() > 0 )
    {
      this.v.flipx();
      this.v.magnitude *= .9;
    }

    if( this.p.y < 0 && this.v.dy() < 0 || this.p.y > c.SCREEN_HEIGHT && this.v.dy() > 0 )
    {
      this.v.flipy();
      this.v.magnitude *= .9;
    }

    if( this.accel > 0 )
    {
      let p = new SmokeParticle( new Point( this.p.x, this.p.y ).move( new Vector( 3, this.a + c.PI ) ),
                                 new Vector( 3, this.a + c.PI + randFloat( -.3, .3 ) ),
                                 randInt( 5, 12 ),
                                 this.accel * randInt( 15, 30 ) );
      e.addObj( p );
    }

    if( this.fireCannon == true && this.rounds > 0 )
    {
      let p = new CannonParticle( new Point( this.p.x + 10 * Math.cos( this.a ),
                                             this.p.y - 10 * Math.sin( this.a ) ),
                                  new Vector( 7, this.a ).add( this.v, true ),
                                  120 );
      e.addObj( p );
      this.fireCannon = false;
      this.rounds -= .5;
      if( e.score > c.CANNON_COST )
        e.score -= c.CANNON_COST;
    }

    if( this.torpedoDelay > 0 )
    {
      this.torpedoDelay -= 1;
      this.fireTorpedo = false;
    }

    if( this.fireTorpedo == true )
    {
      if( this.torpedos > 0 )
      {
        let p = new Torpedo( new Point( this.p.x + 20 * Math.cos( this.a ),
                                       this.p.y - 20 * Math.sin( this.a ) ),
                             new Vector( 7, this.a ).add( this.v ),
                             150 );
        e.addObj( p );
        this.torpedos -= 10;
        this.torpedoDelay = c.TORPEDO_DELAY;
        if( e.score > c.TORPEDO_COST )
          e.score -= c.TORPEDO_COST;
      }
      this.fireTorpedo = false;
    }

    while( this.colList.length )
    {
      let colObj = this.colList.shift();
      if( colObj.o.type == c.OBJECT_TYPE_TANKER )
      {
        t = colObj.o;
        if( t.fuel > 0 && this.fuel < 100.0 )
        {
          this.fuel += 1;
          t.fuel -= 1;
        }
        else
          t.transferComplete |= c.TX_RESOURCE_FUEL;

        if( t.rounds > 0 && this.torpedos < 100.0 )
        {
          this.rounds += 1;
          t.rounds -= 1;
        }
        else
          t.transferComplete |= c.TX_RESOURCE_ROUNDS;

        if( t.torpedos > 0 && this.torpedos < 100.0 )
        {
          this.torpedos += 1;
          t.torpedos -= 1;
        }
        else
          t.transferComplete |= c.TX_RESOURCE_TORPEDOS;
      }
      else if( colObj.i.magnitude < c.SMALL_IMPULSE && colObj.o.weapon == false )
      {
        this.v.add( colObj.i, true /*???*/ );
        if( this.v.magnitude > c.SPEED_HI )
          this.v.magnitude = c.SPEED_HI;
      }
      else
      {
        e.numShips -= 1;
        if( e.numShips < 0 )
          e.events.newEvent( "Game Over man!", c.EVENT_DISPLAY_COUNT * 2, e.gameOver );
        for( var ix = 0;ix < randInt( 30, 40 );ix++ )
        {
          let p = new SmokeParticle( new Point( this.p.x, this.p.y ),
                                     new Vector( randFloat( 0, 2 ), c.TAU * randFloat( 0, 1 ) ).add( this.v ),
                                     randInt( 20, 50 ),
                                     randFloat( 3, 3.5 ) );
          e.addObj( p );
        }
        return false;
      }
      return true;
    }
  }

  draw( ctx )
  {
    this.shape.draw( ctx, this.p, this.a );
    ctx.strokeStyle = "black";
  
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.rect( 50, 5, 100, 10 );
    ctx.stroke();

    ctx.strokeStyle = ( this.fuel < 20 ) ? "red" : "black";
    ctx.beginPath();
    ctx.rect( 50, 5, this.fuel * 2, 2 );
    ctx.stroke();
  
    ctx.strokeStyle = ( this.rounds < 20 ) ? "red" : "black";
    ctx.beginPath();
    ctx.rect( 50, 10, 2 * this.rounds, 2 );
    ctx.stroke();
  
    ctx.strokeStyle = ( this.torpedos < 20 ) ? "red" : "black";
    ctx.beginPath();
    ctx.rect( 50, 15, 2 * this.torpedos, 2 );
    ctx.stroke();
  }
}
