import Phaser from "phaser";
import ballPath from './vendor/assets/images/asteroid1.png'
import shipPath from './vendor/assets/images/ship-rotated.png'

const paddleSpeedUp = 50
const ballSpeedNg = 45

class SpaceStretch2Game extends Phaser.Scene {
    preload() {
        this.load.image('ball', ballPath);
        this.load.image('ship', shipPath);
    }

    create() {
        this.score = 0
        this.cursors = this.input.keyboard.createCursorKeys();
        const textSytle = {
            fontFamily: 'Orbitron',
            fontSize: '25px',
            fill: '#fff'
        }
        // openingText
        this.add.text(
            5,
            5,
            'collect coins',
            textSytle
        );

        //Add the scoreboard in
        this.scoreBoard = this.add.text(
            this.physics.world.bounds.width - 150,
            0,
            "SCORE: 0", textSytle);

        this.physics.world.setBoundsCollision(true, true, true, true)

        this.player = this.physics.add.sprite(
            this.physics.world.bounds.width / 2, // x position
            this.physics.world.bounds.height / 2, // y position
            'ship', // key of image for the sprite
        );

        this.player.setScale(2.2)
        this.player.setCollideWorldBounds(true);

        let ballsGroup = this.physics.add.group({
            key: 'ball',
            quantity: 15,
            collideWorldBounds: true,
        })

        Phaser.Actions.RandomRectangle(ballsGroup.getChildren(), this.physics.world.bounds)

        this.physics.add.overlap(this.player, ballsGroup, collectBalls, null, this)

        function collectBalls(avatar, ball) {
            ball.destroy()
            this.score += 1
            this.scoreBoard.setText(`Score: ${this.score}`)
        }
    }

    update(time, delta) {
        this.player.body.setAngularVelocity(0);
        this.player.body.setVelocity(0, 0);
        this.player.body.setAcceleration(0)

        if (window.gameUpMove()) {
            const ng = this.player.angle
            const vec = this.physics.velocityFromAngle(ng, paddleSpeedUp)
            this.player.body.setVelocity(vec.x, vec.y);
        } else if (window.gameJumpMove() || this.cursors.up.isDown) {
            const ng = this.player.angle
            const vec = this.physics.velocityFromAngle(ng, paddleSpeedUp)
            this.player.body.setVelocity(vec.x, vec.y);
        } else if (window.gameLeftMove() || this.cursors.left.isDown) {
            this.player.body.setAngularVelocity(ballSpeedNg * -1);
        } else if (window.gameRightMove() || this.cursors.right.isDown) {
            this.player.body.setAngularVelocity(ballSpeedNg);
        }
    }
}

const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    // width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    // height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
    width: 1024,
    height: 768,
    scene: [SpaceStretch2Game],
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    }
};

const game = new Phaser.Game(config)
