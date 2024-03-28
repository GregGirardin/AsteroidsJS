/*
#!/usr/bin/python3

from Tanker import *
from Aliens import *
from Asteroid import *
from Ship import *

sList = \
  [
    [ 1000, 5000, -1, 2000, newBlackHole ],
    [ 1200, 2000, -1, 1200, newTanker ],
    [  150,  220,  0,    0, newAsteroid ],
    [  200,  300,  0,  500, newBigAlien ],
    [  200,  300,  0, 1000, newSmallAlien ]
  ]

class displayEngine():
  def __init__( self ):
    self.root = Tk()
    self.root.title( "Asteroids" )
    self.canvas = Canvas( self.root, width=SCREEN_WIDTH, height=SCREEN_HEIGHT )
    self.canvas.pack()
    self.highScore = 0
    self.events = gameEvents()
    self.gameOn = None
    self.newGame()
    self.spawn = spawnList( sList )

  def newGame( self ):
    self.objects = []
    self.numShips = NUM_SHIPS
    self.score = 0
    self.respawn = True
    self.gameOn = True
    self.newWave( 1 )

  def newWave( self, wave ):
    self.wave = wave
    self.waveComplete = False
    # cleanup
    sList[ 2 ][ 2 ] = wave * 15
    sList[ 3 ][ 2 ] = wave * 10
    sList[ 4 ][ 2 ] = wave * 7
    self.spawn = spawnList( sList )

  def gameOver( self ):
    if self.score > self.highScore:
      self.highScore = self.score
    self.newGame()
    s = None

  def update( self ):
    # collision detection
    for i in range( 0, len( self.objects ) - 1 ):
      for j in range( i + 1, len( self.objects ) ):
        obj1 = self.objects[ i ]
        obj2 = self.objects[ j ]
        if obj1.type != OBJECT_TYPE_NONE and obj2.type != OBJECT_TYPE_NONE:
          colDist = obj1.colRadius + obj2.colRadius
          actDist = obj1.p.distanceTo( obj2.p )
          if actDist < colDist:
            adjJust = colDist - actDist
            dir = obj2.p.directionTo( obj1.p )
            spd = obj2.v.dot( dir ) + obj1.v.dot( dir + PI ) # velocity towards each other.
            if spd > 0:  # make sure they're moving toward each other
              c = CollisionObject( obj2, Vector( spd * obj2.mass / obj1.mass, dir ), adjJust )
              obj1.colList.append( c )
              c = CollisionObject( obj1, Vector( spd * obj1.mass / obj2.mass, dir - PI ), adjJust )
              obj2.colList.append( c )

    # update objects
    for o in self.objects:
      if o.update( self ) == False:
        self.objects.remove( o )

    # spawn
    if self.gameOn:
      if self.spawn.update( e ) == True:
        checkComplete = True
        for obj in self.objects:
          if obj.type == OBJECT_TYPE_ALIEN or obj.type == OBJECT_TYPE_ASTEROID:
            checkComplete = False
            break
        if checkComplete == True:
          self.waveComplete = True
          self.score += WAVE_COMP_POINTS * self.wave
          if self.wave == NUM_WAVES:
            self.events.newEvent( "Congration. Your winner", EVENT_DISPLAY_COUNT * 2, self.gameOver )
            self.gameOn = False
          else:
            self.events.newEvent( "Wave complete bonus.", EVENT_DISPLAY_COUNT / 2, None )
            self.wave += 1
            t = "Wave %d" % self.wave
            self.events.newEvent( t, EVENT_DISPLAY_COUNT, self.newWave( self.wave ) )
    # events
    self.events.update()

  def addObj( self, obj ):
    # a little hack to put the ship at the head of the list since we search for it every 'space'
    if obj.type == OBJECT_TYPE_SHIP:
      self.objects.insert( 0, obj )
    else:
      self.objects.append( obj )

  def draw( self ):
    self.canvas.delete( ALL )
    for obj in self.objects:
      obj.draw( self.canvas, obj.p, obj.a )

    # display the remaining ships
    for s in range( 0, self.numShips ):
      self.canvas.create_line( 10 + 20 * s, 20, 15 + 20 * s,  5, fill="black" )
      self.canvas.create_line( 15 + 20 * s,  5, 20 + 20 * s, 20, fill="black" )

    t = "Score %08s" % self.score
    self.canvas.create_text( 600, 10, text=t, fill="black" )
    t = "High %08s" % self.highScore
    self.canvas.create_text( 700, 10, text=t, fill="black" )
    t = "Wave %d" % self.wave
    self.canvas.create_text( 350, 10, text=t, fill="black" )

    self.events.draw( self )
    self.root.update()

def leftHandler( event ):
  if s.spin < 0:
    s.spin = 0
  elif s.spin < MAX_SPIN:
    s.spin += SPIN_DELTA

def rightHandler( event ):
  if s.spin > 0:
    s.spin = 0
  elif s.spin > -MAX_SPIN:
    s.spin -= SPIN_DELTA

def upHandler( event ):
  s.accel += .03

def downHandler( event ):
  s.accel = 0
  s.v.magnitude *= .8

def keyHandler( event ):
  if event.char == " ":
    # Wasteful. Fix this.
    shipPresent = False
    for obj in e.objects:
      if obj.type == OBJECT_TYPE_SHIP:
        shipPresent = True
        break
    if shipPresent == False and e.numShips >= 0:
      e.respawn = True
    else:
      s.fireCannon = True

  elif event.char == 't' or event.char == 'z':
    s.fireTorpedo = True

e = displayEngine()

e.root.bind( "<Left>",  leftHandler )
e.root.bind( "<Right>", rightHandler )
e.root.bind( "<Up>",    upHandler )
e.root.bind( "<Down>",  downHandler )
e.root.bind( "<Key>",   keyHandler )

while True:
  time.sleep( .01 )

  if e.respawn == True:
    e.respawn = False
    s = Ship()
    e.addObj( s )

  e.update ()
  e.draw ()

  */

import { c } from './constants.js';
import { Ship } from './Ship.js';
import { Vector } from './Vector.js';
import { CollisionObject, gameEvents } from './Utils.js';
import { Asteroid, newAsteroid, Blackhole, newBlackhole } from './Asteroid.js';

window.onload = gameInit;

/*
const sList = [ [ 1000, 5000, -1, 2000, newBlackHole ],
                [ 1200, 2000, -1, 1200, newTanker ],
                [  150,  220,  0,    0, newAsteroid ],
                [  200,  300,  0,  500, newBigAlien ],
                [  200,  300,  0, 1000, newSmallAlien ] ];
*/
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
    // this.spawn = new spawnList( sList );
  }

  newGame()
  {
    this.objects = [];
    this.numShipes = c.NUM_SHIPS;
    this.score = 0;
    this.respawn = true;
    this.gameOn = true;
    this.newWave( 1 );
  }

  newWave( wave )
  {
    this.wave = wave;
    this.waveComplete = false
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
        if( shipPresent == false && this.e.numShips >= 0 )
          this.respawn = true;
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
        this.objects.splice( i, 1 );
    // spawn
    if( this.gameOn )
    {

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
  // document.addEventListener( "keyup", keyUpHandler, false );

  window.requestAnimationFrame( gameLoop );
}

function sleep( ms )
{
  return new Promise( resolve => setTimeout( resolve, ms ) );
}