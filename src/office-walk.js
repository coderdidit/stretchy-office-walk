import Phaser from "phaser";
import faunePngPath from './vendor/assets/sprites/faune.png'
import fauneJsonPath from './vendor/assets/sprites/faune.json'
import dangeonPngPath from './vendor/assets/tilemaps/dangeon.png'
import dangeonJsonPath from './vendor/assets/tilemaps/dangeon.json'
import {debugCollisonBounds} from './utils/debugger'


const playerSpeed = 100
const playerScale = 2
const mapScale = 3
const debug = false

class DangeonStretchGame extends Phaser.Scene {
    constructor() {
        super({ key: 'dangeon-stretchGame' });
    }

    preload() {
        this.load.image('tiles', dangeonPngPath)
        this.load.tilemapTiledJSON('dangeon', dangeonJsonPath)
        this.load.atlas('faune', faunePngPath, fauneJsonPath)
    }

    create() {
        // map [background]
        const map = this.make.tilemap({ key: 'dangeon' })
        const tileset = map.addTilesetImage('dangeon', 'tiles')
        const groundLayer = map.createLayer('ground', tileset)
        this.wallsLayer = map.createLayer('walls', tileset)
        groundLayer.setScale(mapScale)
        this.wallsLayer.setScale(mapScale)

        this.wallsLayer.setSize(
            this.wallsLayer.width * 0.5,
            this.wallsLayer.height * 0.8
        )

        this.wallsLayer.setCollisionByProperty({
            collides: true
        })

        // debugging
        if (debug) {
            debugCollisonBounds(this.wallsLayer, this)
        }
        
        this.cursors = this.input.keyboard.createCursorKeys();

        // player setup
        const fauneKey = 'faune'
        this.player = this.physics.add.sprite(
            this.physics.world.bounds.width / 2,
            this.physics.world.bounds.height / 2,
            fauneKey,
            'run-down-1.png'
        );
        this.player.setScale(playerScale)
        
        // adjust collision box
        this.player.body.setSize(
            this.player.width * 0.5,
            this.player.height * 0.8
        )

        this.createPlayerAnims(this.player, fauneKey)
        this.player.anims.play('faune-idle-down', true)
        this.physics.add.collider(this.player, this.wallsLayer)
        this.cameras.main.startFollow(this.player);
    }

    createPlayerAnims(player, fauneKey) {
        // idle down
        player.anims.create({
            key: 'faune-idle-down',
            frames: [{ key: fauneKey, frame: 'run-down-3.png' }]
        })

        // idle up
        player.anims.create({
            key: 'faune-idle-up',
            frames: [{ key: fauneKey, frame: 'run-up-3.png' }]
        })

        // idle side
        player.anims.create({
            key: 'faune-idle-side',
            frames: [{ key: fauneKey, frame: 'run-side-3.png' }]
        })

        // down
        player.anims.create({
            key: 'faune-run-down',
            frames: this.anims.generateFrameNames(
                fauneKey,
                { start: 1, end: 8, prefix: 'run-down-', suffix: '.png' },
            ),
            repeat: -1,
            frameRate: 15
        })

        // up
        player.anims.create({
            key: 'faune-run-up',
            frames: this.anims.generateFrameNames(
                fauneKey,
                { start: 1, end: 8, prefix: 'run-up-', suffix: '.png' },
            ),
            repeat: -1,
            frameRate: 15
        })

        // side
        player.anims.create({
            key: 'faune-run-side',
            frames: this.anims.generateFrameNames(
                fauneKey,
                { start: 1, end: 8, prefix: 'run-side-', suffix: '.png' },
            ),
            repeat: -1,
            frameRate: 15
        })
    }

    update(time, delta) {
        this.handlePlayerMoves()
    }

    handlePlayerMoves() {

        if (window.gameUpMove() || this.cursors.up.isDown) {
            this.player.setVelocity(0, -playerSpeed)
            this.player.anims.play('faune-run-up', true)
        } else if (window.gameDownMove() || this.cursors.down.isDown) {
            this.player.setVelocity(0, playerSpeed)
            this.player.anims.play('faune-run-down', true)
        } else if (window.gameLeftMove() || this.cursors.left.isDown) {
            this.player.setVelocity(-playerSpeed, 0)
            this.player.anims.play('faune-run-side', true)
            this.player.setFlipX(true)
        } else if (window.gameRightMove() || this.cursors.right.isDown) {
            this.player.setVelocity(playerSpeed, 0)
            this.player.anims.play('faune-run-side', true)
            this.player.setFlipX(false)
        } else {
            // idle
            const direction = this.player.anims.currentAnim.key
                .split('-')[2]
            this.player.setVelocity(0, 0)
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
    scene: [DangeonStretchGame],
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
            debug: debug
        },
    },
    fps: 30
}

const game = new Phaser.Game(config)
