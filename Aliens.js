import { c } from './constants.js';
import { WorldObject, randInt, randFloat } from "./Utils.js";
import { Pilot, Heuristic, HeuristicFace, HeuristicGo, HeuristicAttack, HeuristicGoto, HeuristicGotoRandom } from "./Pilot.js";
import { Point, Vector } from './Vector.js';
import { Shape } from './Shape.js';
import { SmokeParticle, CannonParticle } from './Particles.js';

class SmallAlien extends WorldObject
{
  constructor()
  {
    const s = [ [ -2,-3, 10, 0, false ],
                [ -2,-3, -2, 3, false ] ];

    let p = new Point( -c.SCREEN_BUFFER + 1, randFloat( 0, c.SCREEN_HEIGH ) );
    super( c.OBJECT_TYPE_ALIEN, p, randFloat( -.1, .1 ), new Vector( 0, 0 ), 5, c.SMALL_ALIEN_MASS );

    this.shape = new Shape( s );
    this.cannon = 0;

    const hLists =
      [
        [ // randomly flys among a few new Points, stopping to shoot.
          new Heuristic( "1", "1a", new HeuristicGotoRandom() ),
          new Heuristic( "1a", "2", new HeuristicAttack( 100 ) ),
          new Heuristic( "2", "2a", new HeuristicGotoRandom() ),
          new Heuristic( "2a", "3", new HeuristicAttack( randFloat( 100, 300 ) ) ),
          new Heuristic( "3", "3a", new HeuristicGotoRandom() ),
          new Heuristic( "3a", "1", new HeuristicAttack( 100 ) ),
        ],
        [ // this one flys around forever and shoots at you
          new Heuristic( "1", "1a", new HeuristicGoto( new Point( c.swh, c.shl ), c.OBJECT_DIST_MED ) ),
          new Heuristic( "1a", "2", new HeuristicAttack( 100 ) ),
          new Heuristic( "2", "2a", new HeuristicGoto( new Point( c.swl, c.shl ), c.OBJECT_DIST_MED ) ),
          new Heuristic( "2a", "3", new HeuristicAttack( 100 ) ),
          new Heuristic( "3", "3a", new HeuristicGoto( new Point( c.swh, c.shh ), c.OBJECT_DIST_MED ) ),
          new Heuristic( "3a", "4", new HeuristicAttack( 100 ) ),
          new Heuristic( "4", "4a", new HeuristicGoto( new Point( c.swl, c.shh ), c.OBJECT_DIST_MED ) ),
          new Heuristic( "4a", "1", new HeuristicAttack( 100 ) ),
        ],
        [ // This one flys across this screen but shoots at you at a couple new Points.
          new Heuristic( "1",  "2", new HeuristicGoto( new Point( c.swl, randFloat( c.shl, c.shh ) ), c.OBJECT_DIST_MED ) ),
          new Heuristic( "2", "2a", new HeuristicGoto( new Point( c.SCREEN_WIDTH * .5, randFloat( c.shl, c.shh ) ), c.OBJECT_DIST_MED ) ),
          new Heuristic( "2a", "3", new HeuristicAttack( 300 ) ),
          new Heuristic( "3", "3a", new HeuristicGoto( new Point( c.swh, randFloat( c.shl, c.shh ) ), c.OBJECT_DIST_MED ) ),
          new Heuristic( "3a", "4", new HeuristicAttack( 300 ) ),
          new Heuristic( "4", undefined, new HeuristicGoto( new Point( c.SCREEN_WIDTH * 1.5, randFloat( 0, c.SCREEN_HEIGHT ) ), c.OBJECT_DIST_FAR ) )
        ]
      ];
  
    this.pilot = new Pilot( this, hLists[ randInt( 0, 2 ) ] );
  }

  update( e )
  {
    super.update( e );
    this.pilot.pilot( this, e );
    if( this.offScreen() )
      return false;

    if( this.cannon > 0)
    {
      this.cannon--;
      let p = new CannonParticle( new Point( this.p.x + 10 * Math.cos( this.a ),
                                             this.p.y - 10 * Math.sin( this.a ) ),
                                  new Vector( 7, this.a ), 120, c.OBJECT_TYPE_AL_CANNON );
      e.addObj( p );
    }
  
    while( this.colList.length )
    {
      let colObj = this.colList.shift();
      if( colObj.i.magnitude < c.SMALL_IMPULSE && colObj.o.weapon == false )
      {
        if( this.v.magnitude > c.SPEED_HI )
          this.v.magnitude = c.SPEED_HI;
        this.p.move( new Vector( colObj.d / 2, colObj.i.direction ) );
      }
      else if ( colObj.o.type != c.OBJECT_TYPE_NONE )
      {
        const total = randInt( 10, 20 );
        for( let count = 1;count < total;count++ )
        {
          p = new SmokeParticle( new Point( this.p.x, this.p.y ),
                                 new Vector( randFloat( 0, 1 ), randFloat( 0, c.TAU ) ).add( this.v ),
                                 20 + randFloat( 0, 20 ), randFloat( 2, 2.5 ) );
          e.addObj( p );
        }
        let t = colObj.o.type;
        if( t == OBJECT_TYPE_CANNON || t == OBJECT_TYPE_TORPEDO || t == OBJECT_TYPE_T_CANNON )
          e.score += c.SMALL_ALIEN_POINTS;
        return false;
      }
      if( this.accel > 0 )
      {
        let p = new SmokeParticle( new Point( this.p.x, this.p.y ).move( new Vector( 3, this.a + c.PI ) ),
                                    new Vector( 2, this.a + c.PI + randFloat( -.25, .25 ) ),
                                    randFloat( 5, 10 ),
                                    this.accel * randFloat( 15, 30 ) )
        e.addObj( p );
      }
    }
  }

  draw( ctx )
  {
    this.shape.draw( ctx, this.p, this.a );
  }
}

class BigAlien extends WorldObject
{
  constructor()
  {
    const s = [ [ -10, 8, 15, 0, "black" ],
                [ -10,-8, 15, 0, "black" ],
                [ -10,-8,-10, 8, "black" ] ];

    let p = new Point( c.SCREEN_BUFFER + 1, randFloat( 0, c.SCREEN_HEIGHT ) );
    super( c.OBJECT_TYPE_ALIEN, p, randFloat( -.1, .1 ), new Vector( 0, 0), 12, c.BIG_ALIEN_MASS );

    this.shape = new Shape( s );

    const hLists = [
      [
        new Heuristic( "i", "x", new HeuristicGoto( new Point( c.SCREEN_WIDTH * randFloat( .3, .7 ), randFloat( c.shl, c.shh ) ), c.OBJECT_DIST_NEAR ) ),
        new Heuristic( "x", undefined, new HeuristicGoto( new Point( c.SCREEN_WIDTH * 1.1, randInt( -200, c.SCREEN_HEIGHT + 200 ) ), c.OBJECT_DIST_MED ) )
      ],
      [
        new Heuristic( "i", "b", new HeuristicGoto( new Point( c.SCREEN_WIDTH / 4, randInt( c.shl, c.shh ) ), c.OBJECT_DIST_NEAR ) ),
        new Heuristic( "b", "c", new HeuristicGoto( new Point( c.SCREEN_WIDTH / 2, randInt( c.SCREEN_HEIGHT * .1, c.SCREEN_HEIGHT * .9 ) ), c.OBJECT_DIST_MED ) ),
        new Heuristic( "c", undefined, new HeuristicGoto( new Point( c.SCREEN_WIDTH * 1.5, randInt( c.shl, c.shh ) ), c.OBJECT_DIST_MED ) )
      ],
      [
        new Heuristic( "f", "g", new HeuristicFace( randFloat( -.4, .4 ) ) ), // face right ish
        new Heuristic( "g", "d", new HeuristicGo( c.SPEED_HI, randInt( 200, 700 ) ) ),
        new Heuristic( "d", undefined, new HeuristicGoto( new Point( c.SCREEN_WIDTH * 1.2, randInt( 0, c.SCREEN_HEIGHT ), c.OBJECT_DIST_NEAR ) ) )
      ]
    ];

    this.pilot = new Pilot( this, hLists[ randInt( 0, 2 ) ] );
  }

  update( e )
  {
    this.pilot.pilot( this, e );
    super.update( e );
    if( this.offScreen() )
      return false;
   
    while( this.colList.length )
    {
      let colObj = this.colList.shift();

      if( colObj.i.magnitude < c.SMALL_IMPULSE && colObj.o.weapon == false )
      {
        if( this.v.magnitude > c.SPEED_HI )
          this.v.magnitude = c.SPEED_HI;
        this.p.move( new Vector( colObj.d / 2, colObj.i.direction ) );
      }
      else if( colObj.o.type != c.OBJECT_TYPE_NONE )
      {
        const total = randInt( 30, 40 );
        for( let count = 1;count < total;count++ )
        {
          let p = new SmokeParticle( new Point( this.p.x, this.p.y ),
                                     new Vector( randFloat( 0, 1 ), randFloat( 0, c.TAU ) ).add( this.v ),
                                     20 + randFloat( 0, 20 ), randFloat( 2, 2.5 ) );
          e.addObj( p );
        }
        let t = colObj.o.type;
        if( t == c.OBJECT_TYPE_CANNON || t == c.OBJECT_TYPE_TORPEDO || t == c.OBJECT_TYPE_T_CANNON )
          e.score += c.BIG_ALIEN_POINTS;
        return false;
      }

      if( this.accel > 0 )
      {
        let p = new SmokeParticle( new Point( this.p.x, this.p.y ).move( new Vector( 7, this.a + c.PI ) ),
                                    new Vector( 2, this.a + c.PI + randFloat( -.25, .25 ) ),
                                    randFloat( 5, 10 ),
                                    this.accel * randFloat( 15, 30 ) )
        e.addObj( p );
      }
    }
  }

  draw( ctx )
  {
    this.shape.draw( ctx, this.p, this.a );
  }
}

export function newSmallAlien()
{
  return new SmallAlien();
}

export function newBigAlien()
{
  return new BigAlien();
}