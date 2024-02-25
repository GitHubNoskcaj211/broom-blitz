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
const PLAYER_FRICTION = 0.0;
const PLAYER_RESTITUTION = 0.5;
// const PLAYER_TURNING_TORQUE = 1; // netwons * meters
const PLAYER_TURNING_SPEED = Math.PI / 2; // rads per second
const PLAYER_MASS = 1;
const PLAYER_INERTIA = 1;
const PLAYER_GRAB_THROW_DELAY_SECONDS = 0.5;

// TODO Try movement without elastic collision.
const WALL_FRICTION = 0.0;
const WALL_RESTITUTION = 0.5;

const SCORING_BALL_FRICTION = 0.0;
const SCORING_BALL_RESTITUTION = 0.1;
const SCORING_BALL_RADIUS = 0.5;
const SCORING_BALL_THROW_SPEED = 20;
const SCORING_BALL_MASS = 0.1;
const SCORING_BALL_INERTIA = 1;
const SCORING_BALL_GRAB_DISTANCE = 1.0;
const SCORING_BALL_LINEAR_DAMPING = 0.5;

const HITTING_BALL_FRICTION = 0.0;
const HITTING_BALL_RESTITUTION = 0.1;
const HITTING_BALL_RADIUS = 1.0;
const HITTING_BALL_THROW_SPEED = 30;
const HITTING_BALL_MASS = 2.0;
const HITTING_BALL_INERTIA = 1;
const HITTING_BALL_GRAB_DISTANCE = 1.0;
const HITTING_BALL_LINEAR_DAMPING = 0.5;

const PLAYER_1_COLOR = "rgb(0 83 99 / 100%)";
const PLAYER_2_COLOR = "rgb(162 0 26 / 100%)";
const BOTH_PLAYERS_COLOR = "rgb(81 41 62 / 100%)"; // TODO fix these colors

const SCORING_BALL_COLOR = "rgb(56 7 0 / 100%)";
const HITTING_BALL_COLOR = "rgb(0 0 0 / 100%)";
const BALL_GRABBABLE_STROKE_PERCENTAGE = 0.5;

function distance_between_player_and_ball(player, ball) {
    const player_radius = player.player_body.GetFixtureList().GetShape().GetRadius();
    const ball_radius = ball.ball_body.GetFixtureList().GetShape().GetRadius();
    const player_position = player.player_body.GetPosition();
    const ball_position = ball.ball_body.GetPosition();
    return Math.sqrt(Math.pow(player_position.x - ball_position.x, 2) + Math.pow(player_position.y - ball_position.y, 2)) - player_radius - ball_radius
}

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
        this.context.fillStyle = player.player_color;
        this.context.fill();
         
        // Draw line
        const edge_x = canvas_center_x + radius * this.scale * Math.cos(canvas_angle);
        const edge_y = canvas_center_y + radius * this.scale * Math.sin(canvas_angle);
        this.context.beginPath();
        this.context.moveTo(canvas_center_x, canvas_center_y);
        this.context.lineTo(edge_x, edge_y);
        this.context.lineWidth = 3;
        this.context.strokeStyle = 'black';
        this.context.stroke();
    }

    render_scoring_ball(scoring_ball) {
        const body_position = scoring_ball.ball_body.GetPosition();
        const canvas_center_x = body_position.x * this.scale;
        const canvas_center_y = this.game_height - (body_position.y * this.scale);
        const radius = scoring_ball.ball_body.GetFixtureList().GetShape().GetRadius();

        const grabbable_players = scoring_ball.get_grabbable_players();
        const grabbable_players_colors = grabbable_players.map((player) => player.player_color);
        const stroke_color = (grabbable_players_colors.length == 0) ? SCORING_BALL_COLOR : (grabbable_players_colors.length > 2) ? BOTH_PLAYERS_COLOR : grabbable_players_colors[0];
        
        this.context.beginPath();
        this.context.arc(canvas_center_x, canvas_center_y, radius * this.scale, 0, 2 * Math.PI);
        this.context.fillStyle = SCORING_BALL_COLOR;
        this.context.lineWidth = radius * this.scale * BALL_GRABBABLE_STROKE_PERCENTAGE;
        this.context.strokeStyle = stroke_color;
        this.context.fill();
        this.context.stroke();
    }

    render_hitting_ball(hitting_ball) {
        const body_position = hitting_ball.ball_body.GetPosition();
        const canvas_center_x = body_position.x * this.scale;
        const canvas_center_y = this.game_height - (body_position.y * this.scale);
        const radius = hitting_ball.ball_body.GetFixtureList().GetShape().GetRadius();

        const grabbable_players = hitting_ball.get_grabbable_players();
        const grabbable_players_colors = grabbable_players.map((player) => player.player_color);
        const stroke_color = (grabbable_players_colors.length == 0) ? HITTING_BALL_COLOR : (grabbable_players_colors.length > 2) ? BOTH_PLAYERS_COLOR : grabbable_players_colors[0];
        
        this.context.beginPath();
        this.context.arc(canvas_center_x, canvas_center_y, radius * this.scale, 0, 2 * Math.PI);
        this.context.fillStyle = HITTING_BALL_COLOR;
        this.context.lineWidth = radius * this.scale * BALL_GRABBABLE_STROKE_PERCENTAGE;
        this.context.strokeStyle = stroke_color;
        this.context.fill();
        this.context.stroke();
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
    constructor(game, player_number, human_controlled) {
        this.game = game
        this.player_number = player_number;
        this.human_controlled = human_controlled;
        this.score = 0;

        const player_body_def = new b2BodyDef;
        player_body_def.type = b2Body.b2_dynamicBody;

        const player_fixture = new b2FixtureDef;
        player_fixture.shape = new b2CircleShape(PLAYER_RADIUS);
        player_fixture.friction = PLAYER_FRICTION;
        player_fixture.restitution = PLAYER_RESTITUTION;

        this.player_body = this.game.world.CreateBody(player_body_def);
        this.player_body.CreateFixture(player_fixture);
        // TODO atributes to choose?
        
        const mass_data = new Box2D.Collision.Shapes.b2MassData();
        mass_data.mass = PLAYER_MASS;
        mass_data.center.Set(0.0, 0.0);
        mass_data.I = PLAYER_INERTIA;
        this.player_body.SetMassData(mass_data);

        this.grabbed_ball = null;
        this.last_grab_throw_time = game.remaining_match_time + PLAYER_GRAB_THROW_DELAY_SECONDS;

        this.player_color = (this.player_number === 1) ? PLAYER_1_COLOR : PLAYER_2_COLOR;

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
        if (this.grabbed_ball !== null) {
            this.grabbed_ball.grabbing_player = null;
        }
        this.grabbed_ball = null;
        this.moving_forward = false;
        this.moving_backward = false;
        this.turning_left = false;
        this.turning_right = false;
        this.grab_throw = false;
    }

    apply_movement() {
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

    handle_grabbing(grabbable_objects_precedence_order) {
        for (let ii = 0; ii < grabbable_objects_precedence_order.length; ii++) {
            const ball = grabbable_objects_precedence_order[ii];
            if (distance_between_player_and_ball(this, ball) > ball.grab_distance) {
                continue;
            }
            ball.grabbed_by_player(this);
            this.grabbed_ball = ball;
            this.last_grab_throw_time = this.game.remaining_match_time;
            return; // Can only grab one thing.
        }
    }

    handle_throwing() {
        this.grabbed_ball.throw();
        this.last_grab_throw_time = this.game.remaining_match_time;
    }

    handle_grab_throw() {
        if (this.last_grab_throw_time - PLAYER_GRAB_THROW_DELAY_SECONDS < this.game.remaining_match_time) {
            return;
        }
        if (this.grabbed_ball === null) {
            this.handle_grabbing([this.game.scoring_ball, this.game.hitting_ball_1, this.game.hitting_ball_2]) // Order is the precendence of grabbing
        } else {
            this.handle_throwing();
        }
    }

    handle_action_logic() {
        if (this.grab_throw) {
            this.handle_grab_throw()
        }
    }

    handle_key_down(key) {
        switch(key) {
            case 'KeyW':
            case 'KeyP':
                this.moving_forward = true;
                break;
            case 'KeyS':
            case 'Semicolon':
                this.moving_backward = true;
                break;
            case 'KeyA':
            case 'KeyL':
                this.turning_left = true;
                break;
            case 'KeyD':
            case 'Quote':
                this.turning_right = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.grab_throw = true;
                break;
        }
    }

    handle_key_up(key) {
        switch(key) {
            case 'KeyW':
            case 'KeyP':
                this.moving_forward = false;
                break;
            case 'KeyS':
            case 'Semicolon':
                this.moving_backward = false;
                break;
            case 'KeyA':
            case 'KeyL':
                this.turning_left = false;
                break;
            case 'KeyD':
            case 'Quote':
                this.turning_right = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.grab_throw = false;
                break;
        }
    }
}

// TODO Make a grabbable ball abstract class
class GrabbableBall {
    constructor(game, radius, friction, restitution, linear_damping, mass, inertia, grab_distance, throw_speed) {
        // TODO Label as bullet
        this.game = game;
        const ball_body_def = new b2BodyDef;
        ball_body_def.type = b2Body.b2_dynamicBody;

        const ball_fixture = new b2FixtureDef;
        ball_fixture.shape = new b2CircleShape(radius);
        ball_fixture.friction = friction;
        ball_fixture.restitution = restitution;

        this.ball_body = this.game.world.CreateBody(ball_body_def);
        this.ball_body.CreateFixture(ball_fixture);
        this.ball_body.SetLinearDamping(linear_damping);

        const mass_data = new Box2D.Collision.Shapes.b2MassData();
        mass_data.mass = mass;
        mass_data.center.Set(0.0, 0.0);
        mass_data.I = inertia;
        this.ball_body.SetMassData(mass_data);

        this.grabbing_player = null;
        this.grab_distance = grab_distance;
        this.throw_speed = throw_speed
    }

    get_grabbable_players() {
        return this.game.players.filter((player) => distance_between_player_and_ball(player, this) <= this.grab_distance);
    }

    remove_grab() {
        if (this.grabbing_player !== null) {
            this.grabbing_player.grabbed_ball = null;
        }
        this.grabbing_player = null;
        this.ball_body.GetFixtureList().SetSensor(false);
    }

    grabbed_by_player(player) {
        this.remove_grab();
        this.grabbing_player = player;
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        this.ball_body.GetFixtureList().SetSensor(true);
    }

    throw() {
        this.ball_body.SetLinearVelocity(new b2Vec2(Math.cos(this.grabbing_player.player_body.GetAngle()) * this.throw_speed, Math.sin(this.grabbing_player.player_body.GetAngle()) * this.throw_speed));
        const player_radius = this.grabbing_player.player_body.GetFixtureList().GetShape().GetRadius();
        const ball_radius = this.ball_body.GetFixtureList().GetShape().GetRadius()
        this.ball_body.SetPosition(new b2Vec2(this.grabbing_player.player_body.GetPosition().x + (player_radius + ball_radius) * Math.cos(this.grabbing_player.player_body.GetAngle()), this.grabbing_player.player_body.GetPosition().y + (player_radius + ball_radius) * Math.sin(this.grabbing_player.player_body.GetAngle())))
        this.remove_grab();
    }

    drop() {
        this.ball_body.SetLinearVelocity(this.grabbing_player.player_body.GetLinearVelocity());
        this.remove_grab();
    }
}

class ScoringBall extends GrabbableBall {
    constructor(game) {
        super(game, SCORING_BALL_RADIUS, SCORING_BALL_FRICTION, SCORING_BALL_RESTITUTION, SCORING_BALL_LINEAR_DAMPING, SCORING_BALL_MASS, SCORING_BALL_INERTIA, SCORING_BALL_GRAB_DISTANCE, SCORING_BALL_THROW_SPEED)
        this.reset_ball();
    }

    apply_movement() {
        if (this.grabbing_player === null) {
            return;
        }
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        const player_radius = this.grabbing_player.player_body.GetFixtureList().GetShape().GetRadius();
        const ball_radius = this.ball_body.GetFixtureList().GetShape().GetRadius()
        this.ball_body.SetPosition(new b2Vec2(this.grabbing_player.player_body.GetPosition().x + (player_radius + ball_radius) * Math.sin(this.grabbing_player.player_body.GetAngle()), this.grabbing_player.player_body.GetPosition().y - (player_radius + ball_radius) * Math.cos(this.grabbing_player.player_body.GetAngle())))
    }

    reset_ball() {
        this.ball_body.SetPosition(new b2Vec2(FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2));
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        this.remove_grab();
    }
}

// TODO Prevent throwing ball outside boundary (bullet mode / make the walls really thick)
class HittingBall extends GrabbableBall {
    constructor(game, starting_x, starting_y) {
        super(game, HITTING_BALL_RADIUS, HITTING_BALL_FRICTION, HITTING_BALL_RESTITUTION, HITTING_BALL_LINEAR_DAMPING, HITTING_BALL_MASS, HITTING_BALL_INERTIA, HITTING_BALL_GRAB_DISTANCE, HITTING_BALL_THROW_SPEED)
        this.starting_x = starting_x;
        this.starting_y = starting_y;
        this.reset_ball();
    }

    apply_movement() {
        if (this.grabbing_player === null) {
            return; 
            // TODO Random movement
            // TODO Fly towards player
        }
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        const player_radius = this.grabbing_player.player_body.GetFixtureList().GetShape().GetRadius();
        const ball_radius = this.ball_body.GetFixtureList().GetShape().GetRadius()
        this.ball_body.SetPosition(new b2Vec2(this.grabbing_player.player_body.GetPosition().x + (player_radius + ball_radius) * Math.sin(this.grabbing_player.player_body.GetAngle()), this.grabbing_player.player_body.GetPosition().y - (player_radius + ball_radius) * Math.cos(this.grabbing_player.player_body.GetAngle())))
    }

    reset_ball() {
        this.ball_body.SetPosition(new b2Vec2(this.starting_x, this.starting_y));
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        this.remove_grab();
    }
}

class GoldenBall {
    constructor() {
        
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
        this.player1 = new Player(this, 1, true);
        this.player2 = new Player(this, 2, true);
        this.players = [this.player1, this.player2];
        this.scoring_ball = new ScoringBall(this);
        this.hitting_ball_1 = new HittingBall(this, FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 4);
        this.hitting_ball_2 = new HittingBall(this, FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS * 3 / 4);

        const contact_listener = new PlayerContactListener(this.players);
        this.world.SetContactListener(contact_listener.contact_listener);
    }

    handle_key_down(key) {
        if (key == 'KeyW' || key == 'KeyA' || key == 'KeyS' || key == 'KeyD' || key == 'ShiftLeft') {
            this.player1.handle_key_down(key);
        }
        if (key == 'KeyP' || key == 'KeyL' || key == 'Semicolon' || key == 'Quote' || key == 'ShiftRight') {
            this.player2.handle_key_down(key);
        }
    }

    handle_key_up(key) {
        if (key == 'KeyW' || key == 'KeyA' || key == 'KeyS' || key == 'KeyD' || key == 'ShiftLeft') {
            this.player1.handle_key_up(key);
        }
        if (key == 'KeyP' || key == 'KeyL' || key == 'Semicolon' || key == 'Quote' || key == 'ShiftRight') {
            this.player2.handle_key_up(key);
        }
    }

    update() {
        this.world.ClearForces();
        this.game_canvas.update_constants();

        for (const player_ii in this.players) {
            this.players[player_ii].handle_action_logic();
        }

        for (const player_ii in this.players) {
            this.players[player_ii].apply_movement();
        }

        this.scoring_ball.apply_movement();
        this.hitting_ball_1.apply_movement();
        this.hitting_ball_2.apply_movement();

        this.world.Step(TIME_STEP, VELOCITY_ITERATIONS, POSITION_ITERATIONS);
        this.remaining_match_time -= TIME_STEP;
    }

    render() {
        this.game_canvas.clear_canvas_and_draw_background();
        this.game_canvas.render_scoreboard(this.player1.score, this.player2.score, Math.ceil(this.remaining_match_time));
        this.game_canvas.render_player(this.player1);
        this.game_canvas.render_player(this.player2);
        this.game_canvas.render_scoring_ball(this.scoring_ball);
        this.game_canvas.render_hitting_ball(this.hitting_ball_1);
        this.game_canvas.render_hitting_ball(this.hitting_ball_2);
    }
}

const game = new Game();

// Keyboard event listeners for paddle movement
document.addEventListener('keydown', function(event) {
    switch(event.code) {
        // TODO Pause with escape
        default:
            game.handle_key_down(event.code)
            break;
        
    }
});

document.addEventListener('keyup', function(event) {
    switch(event.code) {
        default:
            game.handle_key_up(event.code)
            break;
    }
});

function run() {
    game.update();
    game.render();
}

setInterval(run, 1000 / FPS);
