import Phaser from "phaser";
import faunePngPath from './vendor/assets/sprites/faune.png'
import fauneJsonPath from './vendor/assets/sprites/faune.json'
import dangeonPngPath from './vendor/assets/tilemaps/dangeon.png'
import dangeonJsonPath from './vendor/assets/tilemaps/dangeon.json'
import knifePath from './vendor/assets/weapons/weapon_knife.png'
import treasurePngPath from './vendor/assets/treasure/treasure.png'
import treasureJsonPath from './vendor/assets/treasure/treasure.json'
import lizardPngPath from './vendor/assets/sprites/lizard.png'
import lizardJsonPath from './vendor/assets/sprites/lizard.json'
import { debugCollisonBounds } from './utils/debugger'
import party from "party-js"


const canvasParent = document.getElementById('main-canvas')
const playerSpeed = 100
const playerScale = 2
const mapScale = 3
const debug = false
const fauneKey = 'faune'
const lizardKey = 'lizard'

class DangeonStretchGame extends Phaser.Scene {
    constructor() {
        super({ key: 'dangeon-stretch' });
    }

    preload() {
        this.load.image('tiles', dangeonPngPath)
        this.load.tilemapTiledJSON('dangeon', dangeonJsonPath)
        this.load.atlas(fauneKey, faunePngPath, fauneJsonPath)
        this.load.atlas(lizardKey, lizardPngPath, lizardJsonPath)
        this.load.image('knife', knifePath)
        this.load.atlas('treasure', treasurePngPath, treasureJsonPath)
    }

    create() {
        this.coins = 0
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

        const treasuresGroup = this.physics.add.staticGroup()
        const treasuresLayer = map.getObjectLayer('treasures')
        treasuresLayer.objects.forEach((co, idx) => {
            const x = co.x * mapScale
            const y = co.y * mapScale
            treasuresGroup
                .get(x + co.width * 1.4, y - co.height * 1.55,
                    'treasure')
                .setScale(mapScale)
                .setName(idx)
        })
        // treasure anims
        this.anims.create({
            key: 'chest-open',
            frames: this.anims.generateFrameNames('treasure', { start: 0, end: 2, prefix: 'chest_empty_open_anim_f', suffix: '.png' }),
            frameRate: 15
        })

        // debugging
        if (debug) {
            debugCollisonBounds(this.wallsLayer, this)
        }

        this.cursors = this.input.keyboard.createCursorKeys();

        this.knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
        })

        // player setup
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

        // enemies
        this.lizards = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
        })
        const lizardsLayer = map.getObjectLayer('lizards')
        lizardsLayer.objects.forEach((co, idx) => {
            const x = co.x * mapScale
            const y = co.y * mapScale
            const lizard = this.lizards
                .get(x + co.width * 1.4, y - co.height * 1.55,
                    lizardKey)
                .setScale(playerScale * 1.25)
                .setName(idx)
                .setImmovable(true)
            lizard.body.setSize(
                lizard.width * 0.5,
                lizard.height * 0.8
            )
            this.createLizardAnims(lizard)
            lizard.anims.play('lizard-idle')
        })

        // world collider
        this.physics.add.collider(this.player, this.wallsLayer)
        this.physics.add.collider(this.knives, this.wallsLayer)

        // enemies collider
        this.physics.add.collider(this.player, this.lizards)
        this.physics.add.collider(this.knives, this.lizards, (lizard, knife) => {
            knife.destroy()
            lizard.destroy()
        })

        // treasures collider
        const openedTreasures = new Set()
        this.physics.add.collider(this.player, treasuresGroup, (avatar, treasure) => {
            if (!openedTreasures.has(treasure.name)) {
                treasure.play('chest-open')
                this.coins += Phaser.Math.Between(5, 100)
                scoreText.setText(`💰: ${this.coins}`)
                party.confetti(canvasParent)
                openedTreasures.add(treasure.name)
            }
        })
        this.cameras.main.startFollow(this.player);

        const textStyle = {
            fontSize: '26px',
            fill: '#fff',
            fontFamily: 'Orbitron'
        }
        const scoreText = this.add
            .text(5, 5, `💰: ${this.coins}`, textStyle)
            .setScrollFactor(0, 0)
    }

    createLizardAnims(lizard) {
        lizard.anims.create({
            key: 'lizard-idle',
            frames: this.anims.generateFrameNames(
                lizardKey,
                { start: 0, end: 3, prefix: 'lizard_m_idle_anim_f', suffix: '.png' },
            ),
            repeat: -1,
            frameRate: 5
        })
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

    getPlayerDirection() {
        return this.player.anims.currentAnim.key
            .split('-')[2]
    }

    throwKnife() {
        const knifeSpeed = 300
        const knife = this.knives.get(this.player.x, this.player.y, 'knife')
        knife.setScale(1.2)
        if (knife) {
            const direction = this.getPlayerDirection()
            const vec = new Phaser.Math.Vector2(0, 0)

            switch (direction) {
                case 'up':
                    vec.y = -1
                    break

                case 'down':
                    vec.y = 1
                    break

                default:
                case 'side':
                    if (this.player.flipX) {
                        vec.x = -1
                    }
                    else {
                        vec.x = 1
                    }
                    break
            }
            const angle = vec.angle()

            knife.setActive(true)
            knife.setVisible(true)
            knife.setRotation(angle)
            knife.setVelocity(vec.x * knifeSpeed, vec.y * knifeSpeed)
        }
    }

    handlePlayerMoves() {

        if (window.gameFireMove() || this.cursors.space.isDown) {
            this.throwKnife()
        } else if (window.gameUpMove() || this.cursors.up.isDown) {
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
            const direction = this.getPlayerDirection()
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
