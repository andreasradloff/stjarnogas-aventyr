var game = new Phaser.Game(256, 240, Phaser.CANVAS, '', {
  preload: preload,
  create: create,
  update: update
}, false, false);

function preload() {
  game.load.spritesheet('tiles', 'tiles.png', 16, 16);
  //game.load.spritesheet('goomba', 'https://res.cloudinary.com/harsay/image/upload/v1464614984/goomba_nmbtds.png', 16, 16);
  game.load.spritesheet('hamster', 'hamster.png', 27, 27);
    game.load.spritesheet('mario', 'mario.png', 16, 16);

  //game.load.spritesheet('coin', 'https://res.cloudinary.com/harsay/image/upload/v1464614984/coin_iormvy.png', 16, 16);
  game.load.spritesheet('nut', 'nut.png', 16, 16);
  game.load.spritesheet('apple', 'apple.png', 16, 16);


  game.load.tilemap('level', 'level.json', null, Phaser.Tilemap.TILED_JSON);

// https://downloads.khinsider.com/game-soundtracks/album/super-mario-bros.-3
  game.load.audio('music', ['music.mp3']);
  game.load.audio('levelclear', ['levelclear.mp3']);
  game.load.audio('1-down', ['1-down.mp3']);
  game.load.audio('get', ['get.mp3']);
    game.load.audio('warp', ['warp.mp3']);

  game.load.audio('argh', ['argh.ogg']);
}

function create() {
      music = game.add.audio('music', 1, true);
    music.play();
    getSound = game.add.audio('get');
invincible = false
score = 0
scoreDisplay = game.add.text(20, 10, 0, { font: "10px Arial", fontWeight: 'bold', fill: "#ffffff", align: "left", stroke: '#000000', strokeThickness: 2})
scoreDisplay.fixedToCamera = true;
scoreIcon = game.add.sprite(10,10,'apple')
scoreIcon.scale.setTo(0.5);
scoreIcon.fixedToCamera = true;

  Phaser.Canvas.setImageRenderingCrisp(game.canvas)
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.stage.backgroundColor = '#5c94fc';

  map = game.add.tilemap('level');
  map.addTilesetImage('tiles', 'tiles');
  map.setCollisionBetween(3, 12, true, 'solid');

  map.createLayer('background');

  layer = map.createLayer('solid');
  layer.resizeWorld();

  coins = game.add.group();
  coins.enableBody = true;
  map.createFromTiles(2, null, 'apple', 'stuff', coins);
  //coins.callAll('animations.add', 'animations', 'spin', [0, 0, 1, 2], 3, true);
  //coins.callAll('animations.play', 'animations', 'spin');

  nuts = game.add.group();
  nuts.enableBody = true;
  map.createFromTiles(12, null, 'nut', 'stuff', nuts);

  goombas = game.add.group();
  goombas.enableBody = true;
  map.createFromTiles(1, null, 'mario', 'stuff', goombas);
  goombas.callAll('animations.add', 'animations', 'walk', [8, 9, 10], 10, true);
  goombas.callAll('animations.play', 'animations', 'walk');
  goombas.setAll('body.bounce.x', 1);
  goombas.setAll('body.velocity.x', -20);
  goombas.setAll('body.gravity.y', 500);

  player = game.add.sprite(27, game.world.height - 48, 'hamster');
  game.physics.arcade.enable(player);
  player.body.gravity.y = 170;
  player.body.collideWorldBounds = true;
  player.animations.add('walkRight', [1, 2, 3], 10, true);
  player.animations.add('walkLeft', [8, 9, 10], 10, true);
  player.goesRight = true;

  player.scale.setTo(score / 100 + 0.1);


  game.camera.follow(player);

  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  game.physics.arcade.collide(player, layer);
  game.physics.arcade.collide(goombas, layer);

  if (!invincible) game.physics.arcade.overlap(player, goombas, goombaOverlap);
  game.physics.arcade.overlap(player, coins, coinOverlap);
  game.physics.arcade.overlap(player, nuts, nutOverlap);


  if (player.body.enable) {
    player.body.velocity.x = 0;
    if (cursors.left.isDown) {
      player.body.velocity.x = -90;
      player.animations.play('walkLeft');
      player.goesRight = false;
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 90;
      player.animations.play('walkRight');
      player.goesRight = true;
    } else {
      player.animations.stop();
      if (player.goesRight) player.frame = 0;
      else player.frame = 7;
    }

    if (cursors.up.isDown && player.body.onFloor()) {
      player.body.velocity.y = -190;
      player.animations.stop();
    }

    if (player.body.velocity.y != 0) {
      if (player.goesRight) player.frame = 5;
      else player.frame = 12;
    }
  }
}

function coinOverlap(player, coin) {
      getSound.play();
  setScore(score+1);
  coin.kill();
}

function setScore(x) {
  score = x
  scoreDisplay.setText(score)
  player.scale.setTo(score / 100 + 0.1);
}

function nutOverlap(player, nut) {
  goombas.callAll('kill');
  nut.kill();
  game.add.audio('levelclear').play();
  music.stop();
  player.frame = 13;
  player.body.enable = false;
  player.animations.stop();
  game.time.events.add(Phaser.Timer.SECOND * 3, function() {
    game.paused = true;
  });
}

function goombaOverlap(player, goomba) {
  if (player.body.touching.down) {
          goomba.animations.stop();
      goomba.frame = 6;
      goomba.body.enable = false;
      player.body.velocity.y = -80;
      game.add.audio('argh').play();
    game.time.events.add(Phaser.Timer.SECOND, function() {
      goomba.kill();

    });
  } else {
        if (score > 30) {
                game.add.audio('warp').play();
  invincible = true;
      game.time.events.add(Phaser.Timer.SECOND * 2, function() {
        invincible = false;
      });
      setScore(0);  
    } else {
        game.add.audio('1-down').play();
      music.stop();
      player.frame = 6;
      player.body.enable = false;
      player.animations.stop();
      game.time.events.add(Phaser.Timer.SECOND * 3, function() {
        game.paused = true;
      });
    }

  }
}
