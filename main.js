import { c } from './constants.js';
import { Ship } from './Ship.js';
import { Vector } from './Vector.js';
import { newTanker } from './Tanker.js';
import { newBigAlien, newSmallAlien } from './Aliens.js';
import { spawnList, CollisionObject, gameEvents } from './Utils.js';
import { newAsteroid, newBlackhole } from './Asteroid.js';

window.onload = gameInit;

let sList = [ [ 1000, 5000, -1, 2000, newBlackhole ],
              [ 1200, 2000, -1, 1200, newTanker ],
              [  150,  220,  0,    0, newAsteroid ],
              [  200,  300,  0,  500, newBigAlien ],
              [  200,  300,  0, 1000, newSmallAlien ]
            ];

class gameEngine
{
  constructor()
  {
    this.canvas = document.getElementById( "myCanvas" );
    this.ctx = this.canvas.getContext( "2d" );

    this.canvas.width = c.SCREEN_WIDTH; // widen to check that we're not drawing far off screen
    this.canvas.height = c.SCREEN_HEIGHT;

    this.highScore = 0;
    this.events = new gameEvents();
    this.gameOn = false;
    this.newGame();
  }

  newGame()
  {
    this.objects = [];
    this.numShips = c.NUM_SHIPS;
    this.score = 0;
    this.respawn = true;
    this.gameOn = true;
    this.newWave( 1 );
  }

  newWave( wave )
  {
    this.wave = wave;
    this.waveComplete = false
    sList[ 2 ][ 2 ] = wave * 15;
    sList[ 3 ][ 2 ] = wave * 10;
    sList[ 4 ][ 2 ] = wave * 7;
    this.spawnList = new spawnList( sList );
  }

  gameOver()
  {
    if( this.score > this.highScore )
      this.highScore = this.score;
    this.newGame();
    this.ship = undefined;
  }

  addObj( obj )
  {
    // a little hack to put the ship at the head of the list since we search for it often
    if( obj.type == c.OBJECT_TYPE_SHIP )
      this.objects.unshift( obj );
    else
      this.objects.push( obj );
  }

  keyDownHandler( param )
  {
    switch( param.key )
    {
      case "ArrowLeft":
        if( this.ship.spin < 0 )
          this.ship.spin = 0;
        else if( this.ship.spin < c.MAX_SPIN )
          this.ship.spin += c.SPIN_DELTA;
        break;

      case "ArrowRight":
        if( this.ship.spin > 0 )
          this.ship.spin = 0;
        else if( this.ship.spin > -1 * c.MAX_SPIN )
          this.ship.spin -= c.SPIN_DELTA;
        break;

      case "ArrowUp":
        this.ship.accel += .03;
        break;

      case "ArrowDown":
        this.ship.accel = 0;
        this.ship.v.magnitude *= .8;
        break;

      case " ":
        let shipPresent = false;
        for( let obj of this.objects )
          if( obj.type == c.OBJECT_TYPE_SHIP )
          {
            shipPresent = true;
            break;
          }
        if( shipPresent == false && this.numShips >= 0 )
        {
          this.respawn = true;
        }
        else
          this.ship.fireCannon = true;

       break;

      case "t":
        this.ship.fireTorpedo = true;
        break;
    }
  }

  update ( deltaMs )
  {
    var obj;
    // collision detection
    for( let i = 0;i < this.objects.length - 1;i++ )
      for( let j = i + 1;j < this.objects.length;j++ )
      {
        let obj1 = this.objects[ i ];
        let obj2 = this.objects[ j ];

        if( obj1.type != c.OBJECT_TYPE_NONE && obj2.type != c.OBJECT_TYPE_NONE )
        {
          let colDist = obj1.colRadius + obj2.colRadius;
          let actDist = obj1.p.distanceTo( obj2.p );
          if( actDist < colDist )
          {
            let adjJust = colDist - actDist;
            let dir = obj2.p.directionTo( obj1.p );
            let spd = obj2.v.dot( dir ) + obj1.v.dot( dir + c.PI ); // velocity towards each other.
            if( spd > 0 )  // make sure they're moving toward each other
            {
              let co = new CollisionObject( obj2, new Vector( spd * obj2.mass / obj1.mass, dir ), adjJust );
              obj1.colList.push( co );
              co = new CollisionObject( obj1, new Vector( spd * obj1.mass / obj2.mass, dir - c.PI ), adjJust );
              obj2.colList.push( co );
            }
          }
        }
      }

    // update objects
    for( let i = 0;i < this.objects.length;i++ )
      if( this.objects[ i ].update( this ) == false )
      {
        //console.log( "Del:", this.objects[ i ] );
        this.objects.splice( i, 1 );
      }
    // spawn
    if( this.gameOn )
      if( this.spawnList.update( this ) == true )
      {
        var checkComplete = true;
        for( obj of this.objects )
        {
          if( obj.type == c.OBJECT_TYPE_ALIEN || obj.type == c.OBJECT_TYPE_ASTEROID )
          {
            checkComplete = false;
            break;
          }
        }
        if( checkComplete == true )
        {
          this.waveComplete = true;
          this.score += c.WAVE_COMP_POINTS * this.wave;
          if( this.wave == c.NUM_WAVES )
          {
            this.events.newEvent( "Congration. Your winner", c.EVENT_DISPLAY_COUNT * 2, this.gameOver );
            this.gameOn = false;
          }
          else
          {
            this.events.newEvent( "Wave complete bonus.", c.EVENT_DISPLAY_COUNT / 2, undefined );
            this.wave++;
            let t = "Wave " + this.wave;
            this.events.newEvent( t, c.EVENT_DISPLAY_COUNT, this.newWave( this.wave ) );
          }
        }
      }
    // events
    this.events.update();
  }

  draw()
  {
    var obj;

    this.ctx.clearRect( 0, 0, c.SCREEN_WIDTH, c.SCREEN_HEIGHT );

    // draw
    for( obj of this.objects )
      obj.draw( this.ctx );

    // display the remaining ships
    this.ctx.strokeStyle = 'black';

    for( var x = 0;x < this.numShipes;x++ )
    {
      this.ctx.beginPath();
      this.ctx.moveTo( 10 + 20 * x, 20 );
      this.ctx.lineTo( 15 + 20 * x, 5 );
      this.ctx.lineTo( 20 + 20 * x, 20 );
      this.ctx.stroke();
    }

    // high score
    this.ctx.font = "20px Arial";
    this.ctx.fillText( "Score:" + this.score,     c.SCREEN_WIDTH *  .6, 15 );
    this.ctx.fillText(  "High:" + this.highScore, c.SCREEN_WIDTH *  .7, 15 );
    this.ctx.fillText(  "Wave:" + this.wave,      c.SCREEN_WIDTH * .25, 15 );
  }

  loop( deltaMs ) // The game loop
  {
    if( this.respawn == true )
    {
      this.respawn = false;
      this.ship = new Ship();
      this.addObj( this.ship );
    }

    this.update( deltaMs );
    this.draw();
  }
}

let gEngine;
let lastTimestamp = 0;
function gameLoop( timeStamp )
{ 
  var delta = timeStamp - lastTimestamp;
  lastTimestamp = timeStamp;
  gEngine.loop( delta );
  sleep( 10 ).then(() => { window.requestAnimationFrame( gameLoop ); } );
}

function keyDownHandler( e ) { gEngine.keyDownHandler( e ); }

function gameInit()
{
  gEngine = new gameEngine();

  document.addEventListener( "keydown", keyDownHandler, false );

  window.requestAnimationFrame( gameLoop );
}

function sleep( ms )
{
  return new Promise( resolve => setTimeout( resolve, ms ) );
}