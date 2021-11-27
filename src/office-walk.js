import Phaser from "phaser";
import hotDogPath from './vendor/assets/images/hotdog.png'
import shipPath from './vendor/assets/images/car90.png'
import bgPath from './vendor/assets/images/concrete2.jpeg'
import faunePngPath from './vendor/assets/sprites/faune.png'
import fauneJsonPath from './vendor/assets/sprites/faune.json'


const playerSpeed = 2
const playerScale = 2

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

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBoundsCollision(true, true, true, true)

        // player setup
        const fauneKey = 'faune'
        this.player = this.physics.add.sprite(
            this.physics.world.bounds.width / 2,
            this.physics.world.bounds.height / 2,
            fauneKey,
            'run-down-1.png'
        );
        this.player.setScale(playerScale)
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(
            this.player.width * 0.5,
            this.player.height * 0.8
        )

        // idle down
        this.anims.create({
            key: 'faune-idle-down',
            frames: [{ key: fauneKey, frame: 'run-down-3.png' }]
        })

        // idle up
        this.anims.create({
            key: 'faune-idle-up',
            frames: [{ key: fauneKey, frame: 'run-up-3.png' }]
        })

        // idle side
        this.anims.create({
            key: 'faune-idle-side',
            frames: [{ key: fauneKey, frame: 'run-side-3.png' }]
        })

        // down
        this.anims.create({
            key: 'faune-run-down',
            frames: this.anims.generateFrameNames(
                fauneKey,
                { start: 1, end: 8, prefix: 'run-down-', suffix: '.png' },
            ),
            repeat: -1,
            frameRate: 15
        })

        // up
        this.anims.create({
            key: 'faune-run-up',
            frames: this.anims.generateFrameNames(
                fauneKey,
                { start: 1, end: 8, prefix: 'run-up-', suffix: '.png' },
            ),
            repeat: -1,
            frameRate: 15
        })

        // side
        this.anims.create({
            key: 'faune-run-side',
            frames: this.anims.generateFrameNames(
                fauneKey,
                { start: 1, end: 8, prefix: 'run-side-', suffix: '.png' },
            ),
            repeat: -1,
            frameRate: 15
        })

        this.player.anims.play('faune-idle-down', true)
    }

    update(time, delta) {
        this.handlePlayerMoves()
    }

    handlePlayerMoves() {

        if (window.gameUpMove() || this.cursors.up.isDown) {
            this.player.y -= playerSpeed;
            this.player.anims.play('faune-run-up', true)
            // this.player.angle = -90;
        } else if (window.gameDownMove() || this.cursors.down.isDown) {
            this.player.y += playerSpeed;
            this.player.anims.play('faune-run-down', true)
            // this.player.angle = 90;
        } else if (window.gameLeftMove() || this.cursors.left.isDown) {
            this.player.x -= playerSpeed;
            this.player.anims.play('faune-run-side', true)
            this.player.scaleX = -1 * playerScale
            this.player.body.offset.x = 24
            // this.player.angle = 180;
        } else if (window.gameRightMove() || this.cursors.right.isDown) {
            this.player.x += playerSpeed;
            this.player.anims.play('faune-run-side', true)
            this.player.scaleX = 1 * playerScale
            this.player.body.offset.x = 8
            // this.player.angle = 0;
        } else {
            // idle
            // this.player.body.setAngularVelocity(0);
            const direction = this.player.anims.currentAnim.key
                .split('-')[2]
            this.player.body.setVelocity(0, 0)
            this.player.body.setAcceleration(0)
            this.player.anims.play(`faune-idle-${direction}`, true)
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
            // debug: true
        },
    },
    fps: 30
}

const game = new Phaser.Game(config)

