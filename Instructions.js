import { c } from './constants.js';
import { Ship } from './Ship.js';
import { Vector } from './Vector.js';
import { newTanker } from './Tanker.js';
import { newBigAlien, newSmallAlien } from './Aliens.js';
import { spawnList, CollisionObject, gameEvents } from './Utils.js';
import { newAsteroid, newBlackhole } from './Asteroid.js';
import { gManager } from './main.js';

class InstructionText
{
  constructor()
  {
  }

  draw()
  {
    gManager.ctx.font = "20px Arial";
    gManager.ctx.fillText( "Asteroids:",  c.SCREEN_WIDTH *  .4, 20 );
  }
}

export class Instructions
{
  constructor()
  {
    this.displayObjects = 
    [
        new InstructionText(),
    ];

   }

   update()
   {

   }

   draw()
   {
     this.update(); // animate anything

     gManager.ctx.clearRect( 0, 0, c.SCREEN_WIDTH, c.SCREEN_HEIGHT );

     for( let obj of this.displayObjects )
       obj.draw();

   }
    
}