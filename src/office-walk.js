import Phaser from "phaser";
import hotDogPath from './vendor/assets/images/hotdog.png'
import shipPath from './vendor/assets/images/car90.png'
import bgPath from './vendor/assets/images/concrete2.jpeg'
import faunePngPath from './vendor/assets/sprites/faune.png'
import fauneJsonPath from './vendor/assets/sprites/faune.json'


const playerNgSpeed = 30
const playerSpeed = 80

class SpaceStretch2Game extends Phaser.Scene {
    constructor() {
        super({ key: 'space-stretch-2' });
    }

    preload() {
        this.load.image('ship', shipPath);
        this.load.image('bg', bgPath);
        this.load.atlas('faune', faunePngPath, fauneJsonPath)
    }

    create() {
        // background
        this.bg = this.add.image(config.width / 2, config.height / 2, 'bg');
        this.bg.setDisplaySize(config.width, config.height);

        const playerScale = 1.4
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBoundsCollision(true, true, true, true)

        this.player = this.physics.add.sprite(
            this.physics.world.bounds.width / 2,
            this.physics.world.bounds.height / 2,
            'ship',
        );

        this.player.setScale(playerScale)
        this.player.setCollideWorldBounds(true);   
    }

    update(time, delta) {
        this.handlePlayerMoves()
    }

    handlePlayerMoves() {
        this.player.body.setAngularVelocity(0);
        this.player.body.setVelocity(0, 0);
        this.player.body.setAcceleration(0)

        if (window.gameUpMove() || this.cursors.up.isDown) {
            this.player.y -= 2;
            this.player.angle = -90;
        } else if (window.gameDownMove() || this.cursors.down.isDown) {
            this.player.y += 2;
            this.player.angle = 90;
        } else if (window.gameLeftMove() || this.cursors.left.isDown) {
            this.player.x -= 2;
            this.player.angle = 180;
        } else if (window.gameRightMove() || this.cursors.right.isDown) {
            this.player.x += 2;
            this.player.angle = 0;
        }
    }
}

const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
    scene: [SpaceStretch2Game],
    audio: {
        noAudio: true
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    },
    fps: 30
}

const game = new Phaser.Game(config)

