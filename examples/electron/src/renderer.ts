import { Color, Core } from "supersprite";
import { AudioEngine, MusicTrack, SoundEffect } from "supersound";
import { UnifiedInput } from "supercontroller";
import spr from "./sprites.json";

const core = new Core({
    atlas: {
        url: "assets/atlas.png",
    },
    presenter: {
        baseWidth: 300,
        baseHeight: 200,
    },
});

// Load and register sound effects
const ae = new AudioEngine();
const music = new MusicTrack(ae.context, "assets/sounds/music.ogg");
const sndPong = new SoundEffect(ae.context, "assets/sounds/pong.wav", 3);
const sndLose = new SoundEffect(ae.context, "assets/sounds/lose.wav", 1);
ae.register(music);
ae.register(sndPong);
ae.register(sndLose);

const input = new UnifiedInput();

// Game configuration
const paddleSpeed = 2;
const ballStartSpeed = 1.5;
const ballMultiply = 1.0007;

// Game state
let started = false;
let leftScore = 0;
let rightScore = 0;
let leftY = 100;
let rightY = 100;
let ballX = 150;
let ballY = 100;
let ballVelocityX = 0;
let ballVelocityY = 0;
let ballCountdown: number | null = null;

// Effects
const bg = new Color(0.2, 0.2, 0.2);
let n = 0;

function resetGame() {
    leftScore = 0;
    rightScore = 0;
    leftY = 100;
    rightY = 100;
    ballX = 150;
    ballY = 100;
    ballVelocityX = 0;
    ballVelocityY = 0;
}

function score(point: "left" | "right") {
    if (point === "left") leftScore++;
    if (point === "right") rightScore++;
    sndLose.play();
    ballCountdown = 150;
    ballX = 150;
    ballY = 100;
    ballVelocityX = 0;
    ballVelocityY = 0;
}

function launchBall() {
    ballVelocityX = ballStartSpeed * (1 - (2 * Number(Math.random() >= 0.5)));
    ballVelocityY = ballStartSpeed * (1 - (2 * Number(Math.random() >= 0.5)));
}

function collision(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
    return !(
        ((y1 + h1) < (y2)) ||
        (y1 > (y2 + h2)) ||
        ((x1 + w1) < x2) ||
        (x1 > (x2 + w2))
    );
}

function hitPaddle() {
    ballVelocityX *= -1;
    sndPong.play();
}

function main() {

    n += Math.PI / 120;
    if (n > Math.PI * 2) n -= Math.PI * 2;
    bg.red = 0.1 + (0.05 * Math.sin(n));
    bg.blue = 0.1 + (0.05 * Math.sin(n + Math.PI / 4));
    bg.green = 0.1 + (0.05 * Math.sin(n + Math.PI / 2));
    core.beginRender(bg);

    // Draw our paddles
    core.draw.sprite(spr.left, 0, 15, leftY - 30);
    core.draw.sprite(spr.right, 0, 275, rightY - 30);

    // Draw the ball
    core.draw.sprite(spr.ball, 0, ballX - 10, ballY - 10);

    // Draw the score
    if (started) {
        core.draw.text(String(leftScore), 40, 100, {
            hAlign: "left",
        });
        core.draw.text(String(rightScore), 260, 100, {
            hAlign: "right",
        });
    }

    if (!started) {
        core.draw.text("PONG EXAMPLE", 150, 60, {
            hAlign: "center",
            fontSize: 24,
        });
        core.draw.text("Click to begin!", 150, 120, {
            hAlign: "center",
            fontSize: 12,
        });

        if (input.pressed.mouseLeft) {
            // Kick off the game!
            started = true;
            music.play();
            resetGame();
            launchBall();
        }
    } else {
        // Game is in progress, allow the paddles to move
        // Left paddle (player)
        const axisValue = input.gamepad.getAxis("left", "y")
        if (axisValue !== 0) {
            // Use gamepad to move the paddle proportionally
            leftY += axisValue * paddleSpeed;
        } else {
            if (input.anyOf("held", ["keyS", "keyArrowDown", "gpDPadDown"])) {
                // Move down
                leftY += paddleSpeed;
            } else if (input.anyOf("held", ["keyW", "keyArrowUp", "gpDPadUp"])) {
                // Move up
                leftY -= paddleSpeed;
            }
        }

        // Right paddle (AI)
        rightY += Math.max(-paddleSpeed, Math.min(paddleSpeed, ballY - rightY));

        // Keep both paddles within the playing area
        if (leftY < 30) leftY = 30;
        if (leftY > 170) leftY = 170;
        if (rightY < 30) rightY = 30;
        if (rightY > 170) rightY = 170;

        // Logic to move the ball
        ballVelocityX *= ballMultiply;
        ballVelocityY *= ballMultiply;
        ballX += ballVelocityX;
        ballY += ballVelocityY;

        if (ballCountdown !== null) {
            ballCountdown--;
            if (ballCountdown <= 0) {
                ballCountdown = null;
                launchBall();
            }
        }

        // Bounce the ball off the walls
        if (ballY < 10) {
            ballY = 10;
            ballVelocityY *= -1;
            sndPong.play();
        }
        if (ballY > 190) {
            ballY = 190;
            ballVelocityY *= -1;
            sndPong.play();
        }

        // This collision checking is far from perfect, but it'll serve the purpose of the example.

        // Collision check with left paddle
        if (Math.sign(ballVelocityX) === -1 && collision(15, leftY - 30, 10, 60, ballX - 10, ballY - 10, 20, 20)) {
            hitPaddle();
        }

        // Collision check with right paddle
        if (Math.sign(ballVelocityX) === 1 && collision(275, rightY - 30, 10, 60, ballX - 10, ballY - 10, 20, 20)) {
            hitPaddle();
        }

        // Score for right
        if (ballX < -50) {
            score("right");
        }

        // Score for left
        if (ballX > 350) {
            score("left");
        }

        if (input.pressed.keyEscape) {
            // Reset!
            started = false;
            resetGame();
        }
    }

    // Sample IPC calls
    if (input.anyOf("pressed", ["keyF10", "gpSelect"])) {
        sndPong.play();
        toggle.scale();
    }
    if (input.anyOf("pressed", ["keyF11", "gpStart"])) {
        sndPong.play();
        toggle.fullscreen();
    }
    if (input.pressed.keyEscape) {
        toggle.forceQuit();
    }

    core.endRender();
    input.update();
    requestAnimationFrame(main);
}

main();
