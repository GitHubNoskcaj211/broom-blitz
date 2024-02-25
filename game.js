// Define Box2D aliases
const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2AABB = Box2D.Collision.b2AABB;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2Fixture = Box2D.Dynamics.b2Fixture;
const b2World = Box2D.Dynamics.b2World;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

const FIELD_WIDTH_METERS = 100;
const FIELD_HEIGHT_METERS = 50;
const FIELD_LINE_WIDTH_METERS = 1;

const FPS = 60;
const TIME_STEP = 1 / FPS;
const VELOCITY_ITERATIONS = 10;
const POSITION_ITERATIONS = 10;

const SCOREBOARD_HEIGHT_PIXELS = 100;
const SCOREBOARD_LINE_WIDTH_PIXELS = 10;
const SCOREBOARD_TEXT_BUFFER_PIXELS = 5;

const GAME_TIME_SECONDS = 200;

const PLAYER_RADIUS = 1;
const MAX_FORWARD_PLAYER_SPEED = 15; // meters per second
const MAX_BACKWARD_PLAYER_SPEED = 5; // meters per second
const PLAYER_FORWARD_LINEAR_FORCE = 15; // netwons
const PLAYER_BACKWARD_LINEAR_FORCE = 20; // netwons
// const PLAYER_TURNING_TORQUE = 1; // netwons * meters
const PLAYER_TURNING_SPEED = Math.PI / 2; // rads per second
const PLAYER_MASS = 1;
const PLAYER_INERTIA = 1;

const WALL_FRICTION = 0;
const WALL_RESTITUTION = 0.5;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function angle_difference(angle1, angle2) {
    let difference = angle1 - angle2;
    while (difference > Math.PI) {
        difference -= 2 * Math.PI;
    }
    while (difference < -Math.PI) {
        difference += 2 * Math.PI;
    }

    return difference;
}

function project_vector(vector, angle) {
    const direction_vector = {x: Math.cos(angle), y: Math.sin(angle)};
    return direction_vector.x * vector.x + direction_vector.y + vector.y;
}

function adjust_dimensions(width, height, total_width, total_height) {
    const aspectRatio = width / height;
    const totalAspectRatio = total_width / total_height;

    if (aspectRatio > totalAspectRatio) {
        // Expand or contract width
        width = total_width;
        height = width / aspectRatio;
    } else {
        // Expand or contract height
        height = total_height;
        width = height * aspectRatio;
    }
    
    return { width, height };
}

class GameCanvas {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        
        this.update_constants();
    }

    update_constants() {
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;
        this.game_width = adjust_dimensions(FIELD_WIDTH_METERS, FIELD_HEIGHT_METERS, this.window_width, this.window_height - SCOREBOARD_HEIGHT_PIXELS).width;
        this.game_height = adjust_dimensions(FIELD_WIDTH_METERS, FIELD_HEIGHT_METERS, this.window_width, this.window_height - SCOREBOARD_HEIGHT_PIXELS).height;
        this.scale = this.game_width / FIELD_WIDTH_METERS; // pixels per meter

        this.canvas.width = this.game_width;
        this.canvas.height = this.game_height + SCOREBOARD_HEIGHT_PIXELS;
    }

    method2() {
        // Method 2 logic
    }

    clear_canvas_and_draw_background() {
        this.context.clearRect(0, 0, this.game_width, this.game_height);
        
        // Background
        this.context.fillStyle = 'green';
        this.context.fillRect(0, 0, this.game_width, this.game_height);
        
        // Border
        this.context.strokeStyle = 'white';
        this.context.lineWidth = FIELD_LINE_WIDTH_METERS * this.scale;
        this.context.strokeRect(this.context.lineWidth / 2, this.context.lineWidth / 2, this.game_width - this.context.lineWidth, this.game_height - this.context.lineWidth);
        
        // Middle Line
        this.context.beginPath();
        this.context.moveTo(this.game_width / 2, 0);
        this.context.lineTo(this.game_width / 2, this.game_height);
        this.context.stroke();
        
        // Field Border
        this.context.strokeStyle = 'black';
        this.context.lineWidth = FIELD_LINE_WIDTH_METERS / 2 * this.scale;
        this.context.strokeRect(this.context.lineWidth / 2, this.context.lineWidth / 2, this.game_width - this.context.lineWidth, this.game_height - this.context.lineWidth);
        
        // Scoreboard
        this.context.strokeStyle = 'black';
        this.context.lineWidth = SCOREBOARD_LINE_WIDTH_PIXELS;
        this.context.strokeRect(this.context.lineWidth / 2, this.game_height + this.context.lineWidth / 2, this.game_width - this.context.lineWidth, SCOREBOARD_HEIGHT_PIXELS - this.context.lineWidth);
    }

    render_player(player) {
        const body_position = player.player_body.GetPosition();
        const body_angle = player.player_body.GetAngle();

        const fixture = player.player_body.GetFixtureList();
        const circle_shape = fixture.GetShape();
        const radius = circle_shape.GetRadius();
        
        const canvas_center_x = body_position.x * this.scale;
        const canvas_center_y = this.game_height - (body_position.y * this.scale);
        const canvas_angle = -body_angle;

        // Draw circle
        this.context.beginPath();
        this.context.arc(canvas_center_x, canvas_center_y, radius * this.scale, 0, 2 * Math.PI);
        this.context.fillStyle = 'black';
        this.context.fill();
         
        // Draw line
        const edge_x = canvas_center_x + radius * this.scale * Math.cos(canvas_angle);
        const edge_y = canvas_center_y + radius * this.scale * Math.sin(canvas_angle);
        this.context.beginPath();
        this.context.moveTo(canvas_center_x, canvas_center_y);
        this.context.lineTo(edge_x, edge_y);
        this.context.lineWidth = 3;
        this.context.strokeStyle = 'red';
        this.context.stroke();
    }

    render_scoring_ball(scoring_ball) {

    }

    render_scoreboard(player1_score, player2_score, seconds_remaining_in_match) {    
        this.context.strokeStyle = 'black';
        this.context.lineWidth = SCOREBOARD_LINE_WIDTH_PIXELS;
        this.context.strokeRect(this.context.lineWidth / 2, this.game_height + this.context.lineWidth / 2, this.game_width - this.context.lineWidth, SCOREBOARD_HEIGHT_PIXELS - this.context.lineWidth);
        
        this.context.font = `${SCOREBOARD_HEIGHT_PIXELS - 2 * SCOREBOARD_LINE_WIDTH_PIXELS - 2 * SCOREBOARD_TEXT_BUFFER_PIXELS}px Arial`;
        this.context.textBaseline = 'top';
        this.context.fillStyle = 'black';
        this.context.fillText(player1_score, SCOREBOARD_LINE_WIDTH_PIXELS + SCOREBOARD_TEXT_BUFFER_PIXELS, this.game_height + SCOREBOARD_LINE_WIDTH_PIXELS + SCOREBOARD_TEXT_BUFFER_PIXELS);
        this.context.textAlign = 'right';
        this.context.fillText(player2_score, this.game_width - SCOREBOARD_LINE_WIDTH_PIXELS - SCOREBOARD_TEXT_BUFFER_PIXELS, this.game_height + SCOREBOARD_LINE_WIDTH_PIXELS + SCOREBOARD_TEXT_BUFFER_PIXELS);
    
        this.context.textAlign = 'center';
        this.context.fillText(seconds_remaining_in_match, this.game_width / 2, this.game_height + SCOREBOARD_LINE_WIDTH_PIXELS + SCOREBOARD_TEXT_BUFFER_PIXELS);
    }
}

class PlayerContactListener {
    constructor(players) {
        this.players = players;
        this.contact_listener = new Box2D.Dynamics.b2ContactListener();
        this.contact_listener.BeginContact = (contact) => {
            // contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
            
        }

        this.contact_listener.EndContact = (contact) => {
            // contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
            
        }

        this.contact_listener.PreSolve = (contact, oldManifold) => {
            // contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
            // oldManifold = Box2D.wrapPointer(oldManifold, Box2D.b2Manifold);
        }

        this.contact_listener.PostSolve = (contact, impulse) => {
            // contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
            // impulse = Box2D.wrapPointer(impulse, Box2D.b2ContactImpulse);
            const fixtureA = contact.GetFixtureA();
            const fixtureB = contact.GetFixtureB();
            const bodyA = fixtureA.GetBody();
            const bodyB = fixtureB.GetBody();
            for (let ii = 0; ii < this.players.length; ii++) {
                if (bodyA === this.players[ii].player_body || bodyB === this.players[ii].player_body) {
                    const player_body = this.players[ii].player_body;
                    const newVelocity = player_body.GetLinearVelocity();
                    const newAngle = Math.atan2(newVelocity.y, newVelocity.x);
                    player_body.SetUserData({'set_new_angle': true, 'new_angle': newAngle})
                }
            }
        }
    }
}

class Player {
    constructor(world, player_number, human_controlled) {
        this.player_number = player_number;
        this.human_controlled = human_controlled;
        this.score = 0;

        const player_body_def = new b2BodyDef;
        player_body_def.type = b2Body.b2_dynamicBody;

        const player_fixture = new b2FixtureDef;
        player_fixture.shape = new b2CircleShape(PLAYER_RADIUS);

        this.player_body = world.CreateBody(player_body_def);
        this.player_body.CreateFixture(player_fixture);
        // TODO atributes to choose?
        // this.player_body.SetUserData(player_number); // TODO remove
        const mass_data = new Box2D.Collision.Shapes.b2MassData();
        mass_data.mass = PLAYER_MASS;
        mass_data.center.Set(0.0, 0.0);
        mass_data.I = PLAYER_INERTIA;
        this.player_body.SetMassData(mass_data);

        this.reset_player();
    }

    starting_position() {
        let xx = 0;
        let yy = 0;
        let theta = 0;
        if (this.player_number === 1) {
            xx = FIELD_WIDTH_METERS / 4;
            yy = FIELD_HEIGHT_METERS / 2;
            theta = 0;
        } else {
            xx = FIELD_WIDTH_METERS * 3 / 4;
            yy = FIELD_HEIGHT_METERS / 2;
            theta = Math.PI;
        }
        return {xx, yy, theta}
    }

    reset_player() {
        const starting_position = this.starting_position();
        this.player_body.SetPosition(new b2Vec2(starting_position.xx, starting_position.yy));
        this.player_body.SetAngle(starting_position.theta);
        this.player_body.SetAngularVelocity(0);
        this.player_body.SetLinearVelocity(new b2Vec2(0, 0));
        this.moving_forward = false;
        this.moving_backward = false;
        this.turning_left = false;
        this.turning_right = false;
    }

    apply_forces() {
        if (!this.human_controlled) {
            return;
        }
        if (this.moving_forward) {
            this.player_body.ApplyForce(new b2Vec2(PLAYER_FORWARD_LINEAR_FORCE * Math.cos(this.player_body.GetAngle()), PLAYER_FORWARD_LINEAR_FORCE * Math.sin(this.player_body.GetAngle())), this.player_body.GetWorldCenter(), true);
        }
        if (this.moving_backward) {
            this.player_body.ApplyForce(new b2Vec2(-PLAYER_BACKWARD_LINEAR_FORCE * Math.cos(this.player_body.GetAngle()), -PLAYER_BACKWARD_LINEAR_FORCE * Math.sin(this.player_body.GetAngle())), this.player_body.GetWorldCenter(), true);
        }
        if (this.turning_left) {
            this.player_body.SetAngularVelocity(PLAYER_TURNING_SPEED, true);
        } else if (this.turning_right) {
            this.player_body.SetAngularVelocity(-PLAYER_TURNING_SPEED, true);
        } else {
            this.player_body.SetAngularVelocity(0, true);
        }
        const user_data = this.player_body.GetUserData();
        if (user_data && user_data['set_new_angle']) {
            this.player_body.SetAngle(user_data['new_angle']);
            this.player_body.SetUserData();
        }
        const player_linear_velocity = this.player_body.GetLinearVelocity();
        const player_speed = clamp(player_linear_velocity.x * Math.cos(this.player_body.GetAngle()) + player_linear_velocity.y * Math.sin(this.player_body.GetAngle()), -MAX_BACKWARD_PLAYER_SPEED, MAX_FORWARD_PLAYER_SPEED);
        this.player_body.SetLinearVelocity(new b2Vec2(player_speed * Math.cos(this.player_body.GetAngle()), player_speed * Math.sin(this.player_body.GetAngle())))
    }

    handle_key_down(key) {
        switch(key) {
            case 'w':
            case 'arrowup':
                this.moving_forward = true;
                break;
            case 's':
            case 'arrowdown':
                this.moving_backward = true;
                break;
            case 'a':
            case 'arrowleft':
                this.turning_left = true;
                break;
            case 'd':
            case 'arrowright':
                this.turning_right = true;
                break;
        }
    }

    handle_key_up(key) {
        switch(key) {
            case 'w':
            case 'arrowup':
                this.moving_forward = false;
                break;
            case 's':
            case 'arrowdown':
                this.moving_backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this.turning_left = false;
                break;
            case 'd':
            case 'arrowright':
                this.turning_right = false;
                break;
        }
    }
}

class ScoringBall {
    constructor() {
        // TODO atributes to choose?
        // TODO Label as bullet
    }

    method1() {
        // Method 1 logic
    }

    method2() {
        // Method 2 logic
    }
}

class HittingBall {
    constructor() {
        this.player_number = player_number; // true is player1, false is
        this.human_controlled = human_controlled;
        // TODO atributes to choose?
    }

    method1() {
        // Method 1 logic
    }

    method2() {
        // Method 2 logic
    }
}

class GoldenBall {
    constructor() {
        this.player_number = player_number; // true is player1, false is
        this.human_controlled = human_controlled;
        // TODO atributes to choose?
    }

    method1() {
        // Method 1 logic
    }

    method2() {
        // Method 2 logic
    }
}

class Walls {
    constructor(world) {
        const top_wall = new b2BodyDef();
        top_wall.position.Set(FIELD_WIDTH_METERS / 2, FIELD_LINE_WIDTH_METERS / 2);
        top_wall.type = b2Body.b2_staticBody;
        const top_wall_fixture = new b2FixtureDef();
        top_wall_fixture.shape = new b2PolygonShape();
        top_wall_fixture.friction = WALL_FRICTION;
        top_wall_fixture.restitution = WALL_RESTITUTION;
        top_wall_fixture.shape.SetAsBox(FIELD_WIDTH_METERS / 2, FIELD_LINE_WIDTH_METERS / 2, new b2Vec2(FIELD_WIDTH_METERS / 2, FIELD_LINE_WIDTH_METERS / 2), 0);
        const top_wall_body = world.CreateBody(top_wall);
        top_wall_body.CreateFixture(top_wall_fixture);

        const bottom_wall = new b2BodyDef();
        bottom_wall.position.Set(FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS - FIELD_LINE_WIDTH_METERS / 2);
        bottom_wall.type = b2Body.b2_staticBody;
        const bottom_wall_fixture = new b2FixtureDef();
        bottom_wall_fixture.shape = new b2PolygonShape();
        bottom_wall_fixture.friction = WALL_FRICTION;
        bottom_wall_fixture.restitution = WALL_RESTITUTION;
        bottom_wall_fixture.shape.SetAsBox(FIELD_WIDTH_METERS / 2, FIELD_LINE_WIDTH_METERS / 2, new b2Vec2(FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS - FIELD_LINE_WIDTH_METERS / 2), 0);
        const bottom_wall_body = world.CreateBody(bottom_wall);
        bottom_wall_body.CreateFixture(bottom_wall_fixture);

        const left_wall = new b2BodyDef();
        left_wall.position.Set(FIELD_LINE_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2);
        left_wall.type = b2Body.b2_staticBody;
        const left_wall_fixture = new b2FixtureDef();
        left_wall_fixture.shape = new b2PolygonShape();
        left_wall_fixture.friction = WALL_FRICTION;
        left_wall_fixture.restitution = WALL_RESTITUTION;
        left_wall_fixture.shape.SetAsBox(FIELD_LINE_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2, new b2Vec2(FIELD_LINE_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2), Math.PI / 2);
        const left_wall_body = world.CreateBody(left_wall);
        left_wall_body.CreateFixture(left_wall_fixture);

        const right_wall = new b2BodyDef();
        right_wall.position.Set(FIELD_WIDTH_METERS - FIELD_LINE_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2);
        right_wall.type = b2Body.b2_staticBody;
        const right_wall_fixture = new b2FixtureDef();
        right_wall_fixture.shape = new b2PolygonShape();
        right_wall_fixture.friction = WALL_FRICTION;
        right_wall_fixture.restitution = WALL_RESTITUTION;
        right_wall_fixture.shape.SetAsBox(FIELD_LINE_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2, new b2Vec2(FIELD_WIDTH_METERS - FIELD_LINE_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2), Math.PI / 2);
        const right_wall_body = world.CreateBody(right_wall);
        right_wall_body.CreateFixture(right_wall_fixture);
    }
}

class Game {
    constructor() {
        this.game_canvas = new GameCanvas();
        this.world = new b2World(new b2Vec2(0, 0), false);
        this.remaining_match_time = GAME_TIME_SECONDS;
        
        this.walls = new Walls(this.world)
        this.player1 = new Player(this.world, 1, true);
        this.player2 = new Player(this.world, 2, true);

        const contact_listener = new PlayerContactListener([this.player1, this.player2]);
        this.world.SetContactListener(contact_listener.contact_listener);
    }

    handle_key_down(key) {
        if (key == 'w' || key == 'a' || key == 's' || key == 'd') {
            this.player1.handle_key_down(key);
        }
        if (key == 'arrowup' || key == 'arrowdown' || key == 'arrowleft' || key == 'arrowright') {
            this.player2.handle_key_down(key);
        }
    }

    handle_key_up(key) {
        if (key == 'w' || key == 'a' || key == 's' || key == 'd') {
            this.player1.handle_key_up(key);
        }
        if (key == 'arrowup' || key == 'arrowdown' || key == 'arrowleft' || key == 'arrowright') {
            this.player2.handle_key_up(key);
        }
    }

    update() {
        this.world.ClearForces();
        this.game_canvas.update_constants();

        this.player1.apply_forces();
        this.player2.apply_forces();

        this.world.Step(TIME_STEP, VELOCITY_ITERATIONS, POSITION_ITERATIONS);
        this.remaining_match_time -= TIME_STEP;
    }

    render() {
        this.game_canvas.clear_canvas_and_draw_background();
        this.game_canvas.render_scoreboard(this.player1.score, this.player2.score, Math.ceil(this.remaining_match_time));
        this.game_canvas.render_player(this.player1);
        this.game_canvas.render_player(this.player2);
    }
}

const game = new Game();

// Keyboard event listeners for paddle movement
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        // TODO Pause with escape
        default:
            game.handle_key_down(event.key.toLowerCase())
            break;
        
    }
});

document.addEventListener('keyup', function(event) {
    switch(event.key) {
        default:
            game.handle_key_up(event.key.toLowerCase())
            break;
    }
});

function run() {
    game.update();
    game.render();
}

setInterval(run, 1000 / FPS);
