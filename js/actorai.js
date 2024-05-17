/** 
 * @namespace 
 * @description Artificial intelligence
 */
Wolf.ActorAI = (function() {

    var dsounds = [
        "sfx/025.ogg",
        "sfx/026.ogg",
        "sfx/086.ogg",
        "sfx/088.ogg",
        "sfx/105.ogg",
        "sfx/107.ogg",
        "sfx/109.ogg"
    ]; 

    /**
     * @description Initiate death scream sound effect.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} game The game object.
     */
    function deathScream(self, game) {
        var plyr = game.player;
        console.log("deathScream: "+self.type);
        
        switch (self.type) {
            case Wolf.en_mutant:  //added 0's to all of these in order to check if sounds are correct... gsh
                Wolf.Sound.startSound("sfx/037.ogg", plyr, self);
                break;

            case Wolf.en_guard:
                Wolf.Sound.startSound(dsounds[Wolf.Random.rnd() % 6], plyr, self);
                break;

            case Wolf.en_officer:
                Wolf.Sound.startSound("sfx/074.ogg", plyr, self);
                break;

            case Wolf.en_ss:
                Wolf.Sound.startSound("sfx/046.ogg", plyr, self);
                break;

            case Wolf.en_dog:
                Wolf.Sound.startSound("sfx/035.ogg", plyr, self);
                break;

            case Wolf.en_boss:
                Wolf.Sound.startSound("sfx/019.ogg", plyr, self);
                break;

            case Wolf.en_schabbs:
                Wolf.Sound.startSound("sfx/061.ogg", plyr, self);            
                break;

            case Wolf.en_fake:
                Wolf.Sound.startSound("sfx/069.ogg", plyr, self);            
                break;

            case Wolf.en_mecha:
                Wolf.Sound.startSound("sfx/084.ogg", plyr, self);            
                break;

            case Wolf.en_hitler:
                Wolf.Sound.startSound("sfx/044.ogg", plyr, self);
                break;

            case Wolf.en_gretel:
                Wolf.Sound.startSound("sfx/115.ogg", plyr, self);
                break;

            case Wolf.en_gift:
                Wolf.Sound.startSound("sfx/091.ogg", plyr, self);            
                break;

            case Wolf.en_fat:
                Wolf.Sound.startSound("sfx/119.ogg", plyr, self);
                break;
        }
    }

    /* Hitler */
    
    /**
     * @description Play Mecha sound.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} game The game object.
     */
    function mechaSound(self, game) {
        if (game.level.state.areabyplayer[self.areanumber]) {
            Wolf.Sound.startSound("sfx/080.ogg", game.player, self);
        }
    }

    
    /**
     * @description Play Slurpie sound.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     */
    function slurpie(self, game) {
        Wolf.Sound.startSound("lsfx/061.ogg", game.player, self);
    }


    /**
     * @description Spawn new actor, when Mecha Hitler is dead.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} game The game object.
     */
    function hitlerMorph(self, game) {
        var hitpoints = [500, 700, 800, 900],
            level = game.level,
            hitler;

        hitler = Wolf.Actors.getNewActor(level);
        if(!hitler) {
            return;
        }

        hitler.x = self.x;
        hitler.y = self.y;
        hitler.distance = self.distance;
        hitler.tile.x = self.tile.x;
        hitler.tile.y = self.tile.y;
        hitler.angle = self.angle;
        hitler.dir = self.dir;
        hitler.health = hitpoints[game.skill];
        hitler.areanumber = self.areanumber;
        hitler.state = Wolf.st_chase1;
        hitler.type = Wolf.en_hitler;
        hitler.speed = Wolf.SPDPATROL * 5;
        hitler.ticcount = 0;
        hitler.flags = self.flags | Wolf.FL_SHOOTABLE;
        hitler.sprite = Wolf.Sprites.getNewSprite(level);

        // Don't want to increase monster count since Hitler is just changing form.. right?
        //if (++level.state.killedMonsters == level.state.totalMonsters) {
        //    Wolf.Game.notify("You killed the last enemy!");
        //}
    }
    
    /* Angel of Death */
    
    
    // Angel can't shoot more then 3 sparks in a row. It will get tired!
    var angel_temp = 0;

    
    /**
     * @description Play Angel of Death Breathing sound.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     */
    function breathing(self) {
        Wolf.Sound.startSound("lsfx/080.ogg");
    }

    
    /**
     * @description Reset Angel of Death attack counter
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     */
    function startAttack(self) {
        angel_temp = 0;
    }
    

    /**
     * @description Angel of Death AI.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     */
    function relaunch(self) {
        if (++angel_temp == 3) {
            Wolf.Actors.stateChange(self, Wolf.st_pain);
            return;
        }

        if (Wolf.Random.rnd() & 1) {
            Wolf.Actors.stateChange(self, Wolf.st_chase1);
            return;
        }
    }

    /**
     * @description Victory - start intermission.
     * @memberOf Wolf.ActorAI
     */
    function victory(game) {
        Wolf.Game.startIntermission(game);
    }

    
    /**
     * @description Entity is dormant state. 
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} game The game object.
     */
    function dormant(self, game) {
        var level = game.level,
            player = game.player,
            deltax, 
            deltay,
            xl, xh, yl, yh, 
            x, y, n,
            moveok = false;

        deltax = self.x - player.position.x;
        deltay = self.y - player.position.y;
        
        if (deltax < -Wolf.MINACTORDIST || deltax > Wolf.MINACTORDIST) {
            moveok = true;
        } else if(deltay < -Wolf.MINACTORDIST || deltay > Wolf.MINACTORDIST) {
            moveok = true;
        }
        
        if (!moveok) {
            return;
        }

        // moveok:
        xl = (self.x - Wolf.MINDIST) >> Wolf.TILESHIFT;
        xh = (self.x + Wolf.MINDIST) >> Wolf.TILESHIFT;
        yl = (self.y - Wolf.MINDIST) >> Wolf.TILESHIFT;
        yh = (self.y + Wolf.MINDIST) >> Wolf.TILESHIFT;

        for(y = yl; y <= yh ; ++y ) {
            for(x = xl;x <= xh;++x) {
                if (level.tileMap[x][y] & Wolf.SOLID_TILE) {
                    return;
                }
                for (n=0;n<level.state.numGuards;++n) {
                    if (level.state.guards[n].state >= Wolf.st_die1) {
                        continue;
                    }
                    if (level.state.guards[n].tile.x == x && level.state.guards[n].tile.y == y) {
                        return; // another guard in path
                    }
                }
            }
        }

        self.flags |= Wolf.FL_AMBUSH | Wolf.FL_SHOOTABLE;
        self.flags &= ~Wolf.FL_ATTACKMODE;
        self.dir = Wolf.Math.dir8_nodir;
        Wolf.Actors.stateChange(self, Wolf.st_path1);
    }


    /**
     * @description Death cam animation.
     *              Tthe DeathCam feature isn't implimented, but we want to 
     *              give the animation time to play before declaring victory.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} game The game object.
     */
    function startDeathCam(game, self) {
        self.playstate = Wolf.ex_complete;
        setTimeout(function() {
            Wolf.Game.startIntermission(game);
        }, 5000);
    }
    

    /**
     * @description Rockets emmit smoke.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} level The level object.
     */
    function smoke(self, game) {
        var level = game.level,
            smokeEnt = Wolf.Actors.getNewActor(level);
        
        if (!smokeEnt) {
            return;
        }

        smokeEnt.x = self.x;
        smokeEnt.y = self.y;
        smokeEnt.tile.x = self.tile.x;
        smokeEnt.tile.y = self.tile.y;
        smokeEnt.state = Wolf.st_die1;
        smokeEnt.type = (self.type == Wolf.en_hrocket) ? Wolf.en_hsmoke : Wolf.en_smoke;
        smokeEnt.ticcount = 6;
        smokeEnt.flags = Wolf.FL_NEVERMARK;
        smokeEnt.sprite = Wolf.Sprites.getNewSprite(level);
    }

    

    /**
     * @description Puts an actor into attack mode and possibly reverses the direction if the player is behind it.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     */
    function firstSighting(self, game) {
        switch (self.type) {
            case Wolf.en_guard:
                Wolf.Sound.startSound("sfx/001.ogg", game.player, self);
                self.speed *= 3;    // go faster when chasing player
                break;

            case Wolf.en_officer:
                Wolf.Sound.startSound("sfx/071.ogg", game.player, self);
                self.speed *= 5;    // go faster when chasing player
                break;

            case Wolf.en_mutant:
                self.speed *= 3;    // go faster when chasing player
                break;

            case Wolf.en_ss:
                Wolf.Sound.startSound("sfx/015.ogg", game.player, self);    
                self.speed *= 4;            // go faster when chasing player
                break;

            case Wolf.en_dog:
                Wolf.Sound.startSound("sfx/002.ogg", game.player, self);
                self.speed *= 2;            // go faster when chasing player
                break;

            case Wolf.en_boss:
                Wolf.Sound.startSound("sfx/017.ogg", game.player, self);
                self.speed = Wolf.SPDPATROL * 3;    // go faster when chasing player
                break;

            case Wolf.en_gretel:
                Wolf.Sound.startSound("sfx/112.ogg", game.player, self);
                self.speed *= 3;            // go faster when chasing player
                break;

            case Wolf.en_gift:
                Wolf.Sound.startSound("sfx/096.ogg", game.player, self);
                self.speed *= 3;            // go faster when chasing player
                break;

            case Wolf.en_fat:
                Wolf.Sound.startSound("sfx/102.ogg", game.player, self);
                self.speed *= 3;            // go faster when chasing player
                break;

            case Wolf.en_schabbs:
                Wolf.Sound.startSound("sfx/065.ogg", game.player, self);
                self.speed *= 3;            // go faster when chasing player
                break;

            case Wolf.en_fake:
                Wolf.Sound.startSound("sfx/054.ogg", game.player, self);
                self.speed *= 3;            // go faster when chasing player
                break;

            case Wolf.en_mecha:
                Wolf.Sound.startSound("sfx/040.ogg", game.player, self);
                self.speed *= 3;            // go faster when chasing player
                break;

            case Wolf.en_hitler:
                Wolf.Sound.startSound("sfx/040.ogg", game.player, self);
                self.speed *= 5;            // go faster when chasing player
                break;

            case Wolf.en_blinky:
            case Wolf.en_clyde:
            case Wolf.en_pinky:
            case Wolf.en_inky:
                self.speed *= 2;            // go faster when chasing player
                break;

            default:
                return;
        }

        Wolf.Actors.stateChange(self, Wolf.st_chase1);
        
        if (self.waitfordoorx) {
            self.waitfordoorx = self.waitfordoory = 0;    // ignore the door opening command
        }

        self.dir = Wolf.Math.dir8_nodir;
        self.flags |= Wolf.FL_ATTACKMODE | Wolf.FL_FIRSTATTACK;
    }


    /**
     * @description Called when the player succesfully hits an enemy.
     *              Does damage points to enemy ob, either putting it into a stun frame or killing it.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} game The game object.
     * @param {object} player The player object.
     * @param {number} damage The number of damage points.
     */
    function damageActor(self, game, player, damage) {
        player.madenoise = 1;

        // do double damage if shooting a non attack mode actor
        if (!(self.flags & Wolf.FL_ATTACKMODE)) {
            damage <<= 1;
        }

        self.health -= damage;

        if (self.health <= 0) {
            killActor(self, game, player);
        } else {
            if (!(self.flags & Wolf.FL_ATTACKMODE) ) {
                firstSighting(self, game); // put into combat mode
            }
            switch (self.type) { // dogs only have one hit point
                case Wolf.en_guard:
                case Wolf.en_officer:
                case Wolf.en_mutant:
                case Wolf.en_ss:
                    if (self.health & 1) {
                        Wolf.Actors.stateChange(self, Wolf.st_pain);
                    } else {
                        Wolf.Actors.stateChange(self, Wolf.st_pain1);
                    }
                    break;
            }
        }
    }
    
    
    /**
     * @description Actor has been killed, so give points and spawn powerups.
     * @memberOf Wolf.ActorAI
     * @param {object} self The enemy actor object.
     * @param {object} game The game object.
     * @param {object} player The player object.
     */
    function killActor(self, game, player) {
        var level = game.level,
            tilex = self.tile.x = self.x >> Wolf.TILESHIFT; // drop item on center, 
            tiley = self.tile.y = self.y >> Wolf.TILESHIFT;

        switch (self.type) {
            case Wolf.en_guard:
                Wolf.Player.givePoints(player, 100);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;

            case Wolf.en_officer:
                Wolf.Player.givePoints(player, 400);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;

            case Wolf.en_mutant:
                Wolf.Player.givePoints(player, 700);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;

            case Wolf.en_ss:
                Wolf.Player.givePoints(player, 500);
                if (player.items & Wolf.ITEM_WEAPON_3) { // have a schmeiser?
                    Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                } else {
                    Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_machinegun);
                }
                break;

            case Wolf.en_dog:
                Wolf.Player.givePoints(player, 200);
                break;

            case Wolf.en_boss:
                Wolf.Player.givePoints(player, 5000);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_key1);
                break;

            case Wolf.en_gretel:
                Wolf.Player.givePoints(player, 5000);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_key1);
                break;

            case Wolf.en_gift:
                Wolf.Player.givePoints(player, 5000);
                startDeathCam(game, self);
                break;

            case Wolf.en_fat:
                Wolf.Player.givePoints(player, 5000);
                startDeathCam(game, self);
                break;

            case Wolf.en_schabbs:
                Wolf.Player.givePoints(player, 5000);
                deathScream(self, game);
                startDeathCam(game, self);
                break;

            case Wolf.en_fake:
                Wolf.Player.givePoints(player, 2000);
                break;

            case Wolf.en_mecha:
                Wolf.Player.givePoints(player, 5000);
                break;

            case Wolf.en_hitler:
                Wolf.Player.givePoints(player, 5000);
                deathScream(self, game);
                startDeathCam(game, self);
                break;

        }

        Wolf.Actors.stateChange(self, Wolf.st_die1);
        
        if (++level.state.killedMonsters == level.state.totalMonsters) {
            Wolf.Game.notify("You killed the last enemy!");
        }
        
        self.flags &= ~Wolf.FL_SHOOTABLE;
        self.flags |= Wolf.FL_NONMARK;
    }
    
    return {
        firstSighting : firstSighting,
        damageActor : damageActor,
        killActor : killActor,
        deathScream : deathScream,
        mechaSound : mechaSound,
        slurpie : slurpie,
        hitlerMorph : hitlerMorph,
        breathing : breathing,
        startAttack : startAttack,
        relaunch : relaunch,
        victory : victory,
        dormant : dormant,
        startDeathCam : startDeathCam,
        smoke : smoke
    };

})();