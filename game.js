// Define Box2D aliases
// TODO Make hitting balls more likely to target the person in the lead if up by 30+.
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
const SCALE_PLAYER_GRAPHIC = 2.0;
const MAX_FORWARD_PLAYER_SPEED = 20; // meters per second
const MAX_FORWARD_PLAYER_SPEED_WHEN_GRABBING_BALL = 16;
const MAX_BACKWARD_PLAYER_SPEED = 5; // meters per second
const PLAYER_FORWARD_LINEAR_FORCE = 30; // netwons
const PLAYER_BACKWARD_LINEAR_FORCE = 35; // netwons
const PLAYER_FRICTION = 0.0;
const PLAYER_RESTITUTION = 0.5;
// const PLAYER_TURNING_TORQUE = 1; // netwons * meters
const PLAYER_TURNING_SPEED = Math.PI; // rads per second
const PLAYER_MASS = 1;
const PLAYER_INERTIA = 1;
const PLAYER_GRAB_DELAY_SECONDS = 0.25;
const PLAYER_THROW_DELAY_SECONDS = 0.75;
const PLAYER_DROPPED_BALL_GRAB_DELAY_SECONDS = 0.75;
const PLAYER_STUN_DURATION = 1;
const PLAYER_STUN_NUMBER_OF_ROTATIONS = 4;
const PLAYER_LINEAR_DAMPING = 0.5;
const PLAYER_CONTACT_BUMPER_VELOCITY = 1.0;

const WALL_FRICTION = 0.0;
const WALL_RESTITUTION = 0.5;
const WALL_THICKNESS = 10;

const SCORING_BALL_FRICTION = 0.0;
const SCORING_BALL_RESTITUTION = 0.1;
const SCORING_BALL_RADIUS = 0.5;
const SCORING_BALL_THROW_SPEED = 40;
const SCORING_BALL_MASS = 0.1;
const SCORING_BALL_INERTIA = 1;
const SCORING_BALL_GRAB_DISTANCE = 2.0;
const SCORING_BALL_LINEAR_DAMPING = 2.0;
const SCORING_BALL_SCORE = 10;

const BALL_DROP_VELOCITY_PERCENT = 0.25;

const HITTING_BALL_FRICTION = 0.0;
const HITTING_BALL_RESTITUTION = 0.1;
const HITTING_BALL_RADIUS = 1.25;
const MAX_HITTING_BALL_SPEED = 40;
const HITTING_BALL_MASS = 2.0;
const HITTING_BALL_INERTIA = 1;
const HITTING_BALL_GRAB_DISTANCE = 2.0;
const HITTING_BALL_LINEAR_DAMPING = 0.5;
const HITTING_BALL_MIN_COLLISION_SPEED = 1;
const HITTING_BALL_SEEKING_LINEAR_FORCE = 60;
const HITTING_BALL_MAX_TIME_BETWEEN_SEEKING_MODES = 3;
const HITTING_BALL_MIN_TIME_BETWEEN_SEEKING_MODES = 1;
const RECENT_PLAYER_THROW_MIN_SPEED = 20;
const HITTING_BALL_STOP_SEEKING_SCORING_BALL_DISTANCE = 0.1;
const HITTING_BALL_TURN_SPEED = Math.PI;
const HITTING_BALL_VERTICAL_RANDOM_DISTANCE = FIELD_HEIGHT_METERS * 4 / 10;
const HITTING_BALL_HORIZONTAL_RANDOM_DISTANCE = FIELD_HEIGHT_METERS * 4 / 10;
const THROW_DISTANCE_FROM_PLAYER = 0.1;

const AIM_ASSIST_SEEK_MODE_TIME = 1.5;
const AIM_ASSIST_MAX_THROW_ANGLE_DIFFERENCE = 45 * Math.PI / 180;

const BOTH_PLAYERS_COLOR = "rgb(200 200 200 / 100%)";

const SCORING_BALL_COLOR = "rgb(56 7 0 / 100%)";
const HITTING_BALL_COLOR = "rgb(0 0 0 / 100%)";
const BALL_GRABBABLE_STROKE_PERCENTAGE = 0.5;

const GOAL_WIDTH = 5;
const GOAL_POST_RADIUS = 0.5;
const GOAL_POST_FRICTION = 0.0;
const GOAL_POST_RESTITUTION = 0.5;
const GOAL_COLOR = "rgb(255 255 255 / 100%)";

const MAX_CPU_LEVEL = 10;
const MIN_TIME_RANDOMIZE_CPU_NOISE = 1.0;
const MAX_TIME_RANDOMIZE_CPU_NOISE = 2.0;
const MAX_ANGULAR_NOISE_STD = 20 / 180 * Math.PI;
const MAX_POSITIONAL_NOISE_STD = 5.0;

class GraphicsElement {
    constructor() {
        this.images = [];
    }

    is_graphic_ready() {
        return this.images.every(image => image.complete);
    }
}

class PlayerGraphics extends GraphicsElement {
    constructor(player_color) {
        super();
        this.player_color = player_color
        this.player_normal = this.load_image('art/player_normal.svg');
        this.player_grabbing = this.load_image('art/player_grabbing.svg');
        this.images = [this.player_normal, this.player_grabbing];
    }

    load_image(file) {
        const xhr = new XMLHttpRequest();
        const image = new Image();
        xhr.onload = () => {
            if (xhr.status === 200) {
                const parser = new DOMParser();
                const svg_doc = parser.parseFromString(xhr.responseText, "image/svg+xml");
                this.change_player_color(svg_doc);
                const svg_string = new XMLSerializer().serializeToString(svg_doc);
                const blob = new Blob([svg_string], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(blob);
                image.src = url
            } else {
                throw new Error(`Player graphic ${file} could not load.`);
            }
        };
        xhr.open('GET', file);
        xhr.send();
        return image;
    }
    
    change_player_color(svg) {
        let player_color_dark;
        let player_color_middle;
        let player_color_highlight1;
        let player_color_highlight2;
        switch(this.player_color) {
            case 'red':
                player_color_dark = '#740001'
                player_color_middle = '#AE0001'
                player_color_highlight1 = '#EEBA30'
                player_color_highlight2 = '#D3A625'
                break;
            case 'blue':
                player_color_dark = '#0C1A40'
                player_color_middle = '#222F5B'
                player_color_highlight1 = '#946B2D'
                player_color_highlight2 = '#BEBEBE'
                break;
            case 'yellow':
                player_color_dark = '#EEB939'
                player_color_middle = '#F0C75E'
                player_color_highlight1 = '#372E29'
                player_color_highlight2 = '#726255'
                break;
            case 'green':
                player_color_dark = '#1A472A'
                player_color_middle = '#2A623D'
                player_color_highlight1 = '#AAAAAA'
                player_color_highlight2 = '#5D5D5D'
                break;
            default:
                throw new Error('Invalid player color.');
        }
        const set_color = function(name, type, color) {
            svg.querySelectorAll(name).forEach(function(element) {
                element.setAttribute(type, color);
            });
        }
        set_color('.player_color_dark', 'fill', player_color_dark)
        set_color('.player_color_middle', 'fill', player_color_middle)
        set_color('.player_color_highlight1', 'fill', player_color_highlight1)
        set_color('.player_color_highlight2', 'fill', player_color_highlight2)
    }

    get_ball_stroke_player_color() {
        switch(this.player_color) {
            case 'red':
                return '#AE0001'
                break;
            case 'blue':
                return '#2547ba'
                break;
            case 'yellow':
                return '#F0C75E'
                break;
            case 'green':
                return '#15bd20'
                break;
            default:
                throw new Error('Invalid player color.');
        }
    }
}

class ScoringBallGraphics extends GraphicsElement {
    constructor() {
        super();
        this.scoring_ball = new Image();
        this.scoring_ball.src = 'art/scoring_ball.svg';

        this.images = [this.scoring_ball];
    }
}

class HittingBallGraphics extends GraphicsElement {
    constructor() {
        super();
        this.hitting_ball = new Image();
        this.hitting_ball.src = 'art/hitting_ball.svg';

        this.images = [this.hitting_ball];
    }
}


function random(min, max) {
    return Math.random() * (max - min) + min;
}

function random_normal(mean, standardDeviation) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + standardDeviation * normal;
}

function random_int(max) {
    return Math.floor(Math.random() * (max + 1));
}

function vector_magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function distance_between_positions(position1, position2) {
    return vector_magnitude(new b2Vec2(position1.x - position2.x, position1.y - position2.y))
}

function add_noise_to_position(position, x_value, y_value) {
    return new b2Vec2(position.x + x_value, position.y + y_value)
}

function distance_between_player_and_ball(player, ball) {
    const player_radius = player.player_body.GetFixtureList().GetShape().GetRadius();
    const ball_radius = ball.ball_body.GetFixtureList().GetShape().GetRadius();
    const player_position = player.player_body.GetPosition();
    const ball_position = ball.ball_body.GetPosition();
    return distance_between_positions(player_position, ball_position) - player_radius - ball_radius;
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

const BodyType = Object.freeze({
	PLAYER: 0,
	WALL: 1,
    SCORING_BALL:  2,
    HITTING_BALL:  3,
	GOAL_POST: 4,
	GOAL_SENSOR: 5,
})

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

    clear_canvas_and_draw_background() {
        this.canvas.innerText = '';
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
    
        // Load the SVG file
    
        // Draw the SVG onto the canvas at the player's position and angle
        const player_graphic_to_draw = player.can_grab() ? player.player_graphics.player_normal : player.player_graphics.player_grabbing;
        console.assert(player_graphic_to_draw.complete, "Player graphic not ready.");
        const scale = (radius * this.scale * 2 * SCALE_PLAYER_GRAPHIC) / player_graphic_to_draw.width;
        this.context.save();
        this.context.translate(canvas_center_x, canvas_center_y);
        this.context.rotate(canvas_angle);
        this.context.scale(scale, scale);
        this.context.drawImage(player_graphic_to_draw, -player_graphic_to_draw.width / 2, -player_graphic_to_draw.height / 2, player_graphic_to_draw.width, player_graphic_to_draw.height);
        this.context.restore();
        
        // Draw circle
        // this.context.beginPath();
        // this.context.arc(canvas_center_x, canvas_center_y, radius * this.scale, 0, 2 * Math.PI);
        // this.context.fillStyle = player.player_color;
        // this.context.fill();
         
        // Draw line
        // const edge_x = canvas_center_x + radius * this.scale * Math.cos(canvas_angle);
        // const edge_y = canvas_center_y + radius * this.scale * Math.sin(canvas_angle);
        // this.context.beginPath();
        // this.context.moveTo(canvas_center_x, canvas_center_y);
        // this.context.lineTo(edge_x, edge_y);
        // this.context.lineWidth = 3;
        // this.context.strokeStyle = 'black';
        // this.context.stroke();
    }

    render_scoring_ball(scoring_ball) {
        const body_position = scoring_ball.ball_body.GetPosition();
        const body_angle = scoring_ball.ball_body.GetAngle();
        const canvas_center_x = body_position.x * this.scale;
        const canvas_center_y = this.game_height - (body_position.y * this.scale);
        const canvas_angle = -body_angle;
        const radius = scoring_ball.ball_body.GetFixtureList().GetShape().GetRadius();

        const grabbable_players = scoring_ball.get_grabbable_players();
        const grabbable_players_colors = grabbable_players.map((player) => player.ball_stroke_player_color);
        
        const graphic_to_draw = scoring_ball_graphics.images[0]
        console.assert(graphic_to_draw.complete, "Scoring ball graphic not ready.");
        const scale = (radius * this.scale * 2) / graphic_to_draw.width;
        this.context.save();
        this.context.translate(canvas_center_x, canvas_center_y);
        this.context.rotate(canvas_angle);
        this.context.scale(scale, scale);
        this.context.drawImage(graphic_to_draw, -graphic_to_draw.width / 2, -graphic_to_draw.height / 2, graphic_to_draw.width, graphic_to_draw.height);
        this.context.restore();

        if (grabbable_players_colors.length != 0) {
            const stroke_color = (grabbable_players_colors.length >= 2) ? BOTH_PLAYERS_COLOR : grabbable_players_colors[0];
            this.context.beginPath();
            this.context.arc(canvas_center_x, canvas_center_y, radius * this.scale, 0, 2 * Math.PI);
            this.context.lineWidth = radius * this.scale * BALL_GRABBABLE_STROKE_PERCENTAGE;
            this.context.strokeStyle = stroke_color;
            this.context.stroke();
        }
    }

    render_hitting_ball(hitting_ball) {
        const body_position = hitting_ball.ball_body.GetPosition();
        const body_angle = hitting_ball.ball_body.GetAngle();
        const canvas_center_x = body_position.x * this.scale;
        const canvas_center_y = this.game_height - (body_position.y * this.scale);
        const canvas_angle = -body_angle;
        const radius = hitting_ball.ball_body.GetFixtureList().GetShape().GetRadius();

        const grabbable_players = hitting_ball.get_grabbable_players();
        const grabbable_players_colors = grabbable_players.map((player) => player.ball_stroke_player_color);

        const graphic_to_draw = hitting_ball_graphics.images[0]
        console.assert(graphic_to_draw.complete, "Hitting ball graphic not ready.");
        const scale = (radius * this.scale * 2) / graphic_to_draw.width;
        this.context.save();
        this.context.translate(canvas_center_x, canvas_center_y);
        this.context.rotate(canvas_angle);
        this.context.scale(scale, scale);
        this.context.drawImage(graphic_to_draw, -graphic_to_draw.width / 2, -graphic_to_draw.height / 2, graphic_to_draw.width, graphic_to_draw.height);
        this.context.restore();

        if (grabbable_players_colors.length != 0) {
            const stroke_color = (grabbable_players_colors.length >= 2) ? BOTH_PLAYERS_COLOR : grabbable_players_colors[0];
            this.context.beginPath();
            this.context.arc(canvas_center_x, canvas_center_y, radius * this.scale, 0, 2 * Math.PI);
            this.context.lineWidth = radius * this.scale * BALL_GRABBABLE_STROKE_PERCENTAGE;
            this.context.strokeStyle = stroke_color;
            this.context.stroke();
        }
    }

    render_goal(goal) {
        const render_post_body = (post_body) => {
            const body_position = post_body.GetPosition();
            const canvas_center_x = body_position.x * this.scale;
            const canvas_center_y = this.game_height - (body_position.y * this.scale);
            const radius = post_body.GetFixtureList().GetShape().GetRadius();
    
            this.context.beginPath();
            this.context.arc(canvas_center_x, canvas_center_y, radius * this.scale, 0, 2 * Math.PI);
            this.context.fillStyle = GOAL_COLOR;
            this.context.fill();
        }
        render_post_body(goal.post_body_1);
        render_post_body(goal.post_body_2);
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

class CustomContactListener {
    constructor() {
        this.contact_listener = new Box2D.Dynamics.b2ContactListener();
        this.contact_listener.BeginContact = (contact) => {
            const fixture_a = contact.GetFixtureA();
            const fixture_b = contact.GetFixtureB();
            const body_a = fixture_a.GetBody();
            const body_b = fixture_b.GetBody();
            
            const handle_double_body_contact = (body_a, body_b) => {
                const combined_types = [body_a.GetUserData()['type'], body_b.GetUserData()['type']].sort().join('_');
                switch(combined_types) {
                    case BodyType.SCORING_BALL + '_' + BodyType.GOAL_SENSOR:
                        const goal = (body_a.GetUserData()['type'] === BodyType.GOAL_SENSOR) ? body_a.GetUserData()['object'] : body_b.GetUserData()['object'];
                        const scoring_ball = (body_a.GetUserData()['type'] === BodyType.SCORING_BALL) ? body_a.GetUserData()['object'] : body_b.GetUserData()['object'];
                        if (scoring_ball.grabbing_player !== null) {
                            break;
                        }
                        goal.player_to_add_score.score += SCORING_BALL_SCORE;
                        scoring_ball.collision_hit_score_sensor = true;
                        break;
                    case BodyType.PLAYER + '_' + BodyType.HITTING_BALL:
                        const player = (body_a.GetUserData()['type'] === BodyType.PLAYER) ? body_a.GetUserData()['object'] : body_b.GetUserData()['object'];
                        const hitting_ball = (body_a.GetUserData()['type'] === BodyType.HITTING_BALL) ? body_a.GetUserData()['object'] : body_b.GetUserData()['object'];
                        const ball_velocity = hitting_ball.ball_body.GetLinearVelocity();
                        const ball_speed = vector_magnitude(ball_velocity)
                        if (ball_speed < HITTING_BALL_MIN_COLLISION_SPEED) {
                            break;
                        }
                        hitting_ball.roll_random_mode([HittingBallSeekingModes.RANDOM]);
                        player.collision_with_hitting_ball = true;
                        break;
                    case BodyType.PLAYER + '_' + BodyType.PLAYER:
                        const player_1 = body_a.GetUserData()['object'];
                        const player_2 = body_b.GetUserData()['object'];
                        // player_1.collision_with_player = true;
                        // player_2.collision_with_player = true;
                        break;
                    default:
                        break;
                }
            }

            handle_double_body_contact(body_a, body_b);
        }

        this.contact_listener.EndContact = (contact) => {
            
        }

        this.contact_listener.PreSolve = (contact, oldManifold) => {
        }

        this.contact_listener.PostSolve = (contact, impulse) => {
            const fixture_a = contact.GetFixtureA();
            const fixture_b = contact.GetFixtureB();
            const body_a = fixture_a.GetBody();
            const body_b = fixture_b.GetBody();
            
            const handle_single_body_contact = (body) => {
                switch(body.GetUserData()['type']) {
                    case BodyType.PLAYER:
                        const player = body.GetUserData()['object'];
                        const contact_normal = contact.GetManifold().m_localPlaneNormal;
                        let contact_normal_magnitude = vector_magnitude(contact_normal);
                        if (contact_normal_magnitude === 0) {
                            contact_normal_magnitude = 1;
                        }
                        const new_velocity = new b2Vec2(body.GetLinearVelocity().x + contact_normal.x / contact_normal_magnitude * PLAYER_CONTACT_BUMPER_VELOCITY, body.GetLinearVelocity().y + contact_normal.y / contact_normal_magnitude * PLAYER_CONTACT_BUMPER_VELOCITY);
                        body.SetLinearVelocity(new_velocity);
                        const new_angle = Math.atan2(new_velocity.y, new_velocity.x);
                        
                        player.collision_set_new_angle = true;
                        player.collision_new_angle = new_angle;
                        break;
                    default:
                        break;
                }
            }

            handle_single_body_contact(body_a);
            handle_single_body_contact(body_b);
        }
    }
}

class Player {
    constructor(game, player_number, human_controlled, player_graphics, cpu_level) {
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
        this.player_body.SetUserData({'type': BodyType.PLAYER, 'object': this});
        this.player_body.SetLinearDamping(PLAYER_LINEAR_DAMPING);
        
        const mass_data = new Box2D.Collision.Shapes.b2MassData();
        mass_data.mass = PLAYER_MASS;
        mass_data.center.Set(0.0, 0.0);
        mass_data.I = PLAYER_INERTIA;
        this.player_body.SetMassData(mass_data);

        this.grabbed_ball = null;
        this.next_grab_time = game.remaining_match_time;

        this.ball_stroke_player_color = player_graphics.get_ball_stroke_player_color();
        
        this.collision_set_new_angle = false
        this.collision_new_angle = null
        this.collision_with_hitting_ball = false
        this.collision_with_player = false
        this.time_stopped_stunned = game.remaining_match_time;

        this.player_graphics = player_graphics;

        this.cpu_level = cpu_level / MAX_CPU_LEVEL
        this.roll_random_cpu_noise()

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
        this.collision_set_new_angle = false
        this.collision_new_angle = null
        this.collision_with_hitting_ball = false;
        this.collision_with_player = false;
        this.time_stopped_stunned = this.game.remaining_match_time;
        
        if (this.grabbed_ball !== null) {
            this.grabbed_ball.grabbing_player = null;
        }
        this.grabbed_ball = null;
        this.moving_forward = false;
        this.moving_backward = false;
        this.turning_left = false;
        this.turning_right = false;
        this.grab = false;
    }

    is_stunned() {
        return this.game.remaining_match_time > this.time_stopped_stunned;
    }

    can_grab() {
        return this.next_grab_time > this.game.remaining_match_time && !this.is_stunned();
    }

    apply_movement() {
        if (!this.is_stunned()) {
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
        }
        
        if (this.collision_set_new_angle) {
            this.player_body.SetAngle(this.collision_new_angle);
            this.collision_set_new_angle = false
            this.collision_new_angle = null
        }
        
        const max_forward_speed = (this.grabbed_ball === null) ? MAX_FORWARD_PLAYER_SPEED : MAX_FORWARD_PLAYER_SPEED_WHEN_GRABBING_BALL;
        if (!this.is_stunned()) {
            const player_linear_velocity = this.player_body.GetLinearVelocity();
            const player_speed = clamp(player_linear_velocity.x * Math.cos(this.player_body.GetAngle()) + player_linear_velocity.y * Math.sin(this.player_body.GetAngle()), -MAX_BACKWARD_PLAYER_SPEED, max_forward_speed);
            this.player_body.SetLinearVelocity(new b2Vec2(player_speed * Math.cos(this.player_body.GetAngle()), player_speed * Math.sin(this.player_body.GetAngle())))
        } else {
            const linear_velocity = this.player_body.GetLinearVelocity();
            const current_speed = vector_magnitude(linear_velocity);
            const new_speed = Math.min(current_speed, max_forward_speed);
            if (current_speed > 0) {
                this.player_body.SetLinearVelocity(new b2Vec2(linear_velocity.x / current_speed * new_speed, linear_velocity.y / current_speed * new_speed));
            }
        }
    }

    handle_grabbing(grabbable_objects_precedence_order) {
        for (let ii = 0; ii < grabbable_objects_precedence_order.length; ii++) {
            const ball = grabbable_objects_precedence_order[ii];
            if (distance_between_player_and_ball(this, ball) > ball.grab_distance) {
                continue;
            }
            const success = ball.grabbed_by_player(this);
            if (success) {
                this.grabbed_ball = ball;
                return; // Can only grab one thing.
            }
        }
    }

    handle_throwing() {
        this.grabbed_ball.throw();
        this.next_grab_time = this.game.remaining_match_time - PLAYER_THROW_DELAY_SECONDS;
    }

    handle_grab_throw() {
        if (this.grab && this.grabbed_ball === null && this.can_grab()) {
            this.handle_grabbing(this.game.grabbing_objects)
        } else if (!this.grab && this.grabbed_ball !== null) {
            this.handle_throwing();
        }
    }

    roll_random_cpu_noise() {
        this.time_to_roll_cpu_noise = this.game.remaining_match_time - random(MIN_TIME_RANDOMIZE_CPU_NOISE, MAX_TIME_RANDOMIZE_CPU_NOISE)
        this.opposing_player_position_x_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.opposing_player_position_y_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.player_position_x_noise = random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.player_position_y_noise = random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.scoring_ball_position_x_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.scoring_ball_position_y_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.goal_position_x_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.goal_position_y_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.hitting_ball_position_x_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.hitting_ball_position_y_noise = 0//random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.target_position_x_noise = random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.target_position_y_noise = random_normal(0, MAX_POSITIONAL_NOISE_STD * (1 - this.cpu_level))
        this.angular_player_noise = random_normal(0, MAX_ANGULAR_NOISE_STD * (1 - this.cpu_level))
        this.angular_target_noise = random_normal(0, MAX_ANGULAR_NOISE_STD * (1 - this.cpu_level))
    }

    cpu_movement() {
        if (this.game.remaining_match_time <= this.time_to_roll_cpu_noise) {
            this.roll_random_cpu_noise();
        }
        let target_position = null;
        const grabbing_hitting_ball = this.grabbed_ball !== null && this.grabbed_ball.ball_body.GetUserData()['type'] === BodyType.HITTING_BALL;
        const grabbing_scoring_ball = this.grabbed_ball !== null && this.grabbed_ball.ball_body.GetUserData()['type'] === BodyType.SCORING_BALL;
        const opposing_player = this.game.player1 === this ? this.game.player2 : this.game.player1;
        const opposing_player_position = add_noise_to_position(opposing_player.player_body.GetPosition(), this.opposing_player_position_x_noise, this.opposing_player_position_y_noise);
        const player_position = add_noise_to_position(this.player_body.GetPosition(), this.player_position_x_noise, this.player_position_y_noise);
        const target_goals = this.game.player1 === this ? this.game.player_1_target_goals : this.game.player_2_target_goals;
        const target_goal_positions = target_goals.map((goal) => add_noise_to_position(goal.goal_sensor.GetPosition(), this.goal_position_x_noise, this.goal_position_y_noise))
        const hitting_ball_positions = this.game.hitting_balls.map((ball) => add_noise_to_position(ball.ball_body.GetPosition(), this.hitting_ball_position_x_noise, this.hitting_ball_position_y_noise))
        const player_angle = this.player_body.GetAngle()// + this.angular_player_noise;
        const scoring_ball_position = add_noise_to_position(this.game.scoring_ball.ball_body.GetPosition(), this.scoring_ball_position_x_noise, this.scoring_ball_position_y_noise);

        if (grabbing_hitting_ball) {
            target_position = opposing_player_position;
        } else if (grabbing_scoring_ball) {
            target_position = target_goal_positions.reduce((closest_goal_position, goal_position) => distance_between_positions(goal_position, player_position) < distance_between_positions(closest_goal_position, player_position) ? goal_position : closest_goal_position, target_goal_positions[0]);
        }
        this.grab = true;
        if (target_position === null) {
            // Seeking
            const closest_hitting_ball_position = hitting_ball_positions.reduce((closest_hitting_ball_position, hitting_ball_position) => distance_between_positions(hitting_ball_position, player_position) < distance_between_positions(closest_hitting_ball_position, player_position) ? hitting_ball_position : closest_hitting_ball_position, hitting_ball_positions[0])
            if (distance_between_positions(opposing_player_position, scoring_ball_position) > distance_between_positions(player_position, scoring_ball_position) || opposing_player.is_stunned()) {
                target_position = scoring_ball_position;
            } else if (distance_between_positions(player_position, opposing_player_position) < distance_between_positions(player_position, closest_hitting_ball_position)) {
                target_position = scoring_ball_position;
            } else {
                target_position = closest_hitting_ball_position;
            }
        }

        target_position = add_noise_to_position(target_position, this.target_position_x_noise, this.target_position_y_noise)
        const angle_to_target = Math.atan2(target_position.y - player_position.y, target_position.x - player_position.x)// + this.angular_target_noise
        const angle_difference_to_target = angle_difference(angle_to_target, player_angle);
        if (grabbing_hitting_ball && Math.abs(angle_difference_to_target) < 45 * Math.PI / 180 && distance_between_positions(target_position, player_position) < 50) {
            this.grab = false;
        } else if (grabbing_scoring_ball && Math.abs(angle_difference_to_target) < 5 * Math.PI / 180 && distance_between_positions(target_position, player_position) < 15) {
            this.grab = false;
        }
        
        if (angle_difference_to_target > 1 * Math.PI / 180) {
            this.turning_left = true;
            this.turning_right = false;
        } else if (angle_difference_to_target < -1 * Math.PI / 180) {
            this.turning_left = false;
            this.turning_right = true;
        } else {
            this.turning_left = false;
            this.turning_right = false;
        }
        if (Math.abs(angle_difference_to_target) < 75 * Math.PI / 180 && (distance_between_positions(target_position, player_position) > 5 || this.grabbed_ball === null)) {
            this.moving_forward = true;
            this.moving_backward = false;
        } else if (Math.abs(angle_difference_to_target) > 145 * Math.PI / 180 && (distance_between_positions(target_position, player_position) > 5 || this.grabbed_ball === null)) {
            this.moving_forward = false;
            this.moving_backward = true;
        } else {
            this.moving_forward = false;
            this.moving_backward = false;
        }
    }

    handle_logic() {
        if (!this.human_controlled) {
            this.cpu_movement();
        }
        if (this.collision_with_hitting_ball) {
            this.time_stopped_stunned = this.game.remaining_match_time - PLAYER_STUN_DURATION;
            this.player_body.SetAngularVelocity(Math.PI * 2 * PLAYER_STUN_NUMBER_OF_ROTATIONS / PLAYER_STUN_DURATION);
            this.drop_ball();
            this.collision_with_hitting_ball = false;
        }
        if (this.collision_with_player) {
            this.drop_ball();
            this.collision_with_player = false;
        }
        this.handle_grab_throw()
    }

    drop_ball() {
        if (this.grabbed_ball !== null) {
            this.grabbed_ball.drop();
        }
    }

    handle_key_down(key) {
        if (!this.human_controlled) {
            return;
        }
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
                this.grab = true;
                break;
        }
    }

    handle_key_up(key) {
        if (!this.human_controlled) {
            return;
        }
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
                this.grab = false;
                break;
        }
    }
}

class GrabbableBall {
    constructor(game, radius, friction, restitution, linear_damping, mass, inertia, grab_distance, throw_speed, body_type) {
        this.game = game;
        const ball_body_def = new b2BodyDef;
        ball_body_def.type = b2Body.b2_dynamicBody;
        ball_body_def.bullet = true;

        const ball_fixture = new b2FixtureDef;
        ball_fixture.shape = new b2CircleShape(radius);
        ball_fixture.friction = friction;
        ball_fixture.restitution = restitution;

        this.ball_body = this.game.world.CreateBody(ball_body_def);
        this.ball_body.SetUserData({'type': body_type, 'object': this});
        this.ball_body.CreateFixture(ball_fixture);
        this.ball_body.SetLinearDamping(linear_damping);

        const mass_data = new Box2D.Collision.Shapes.b2MassData();
        mass_data.mass = mass;
        mass_data.center.Set(0.0, 0.0);
        mass_data.I = inertia;
        this.ball_body.SetMassData(mass_data);

        this.grabbing_player = null;
        this.grab_distance = grab_distance;
        this.throw_speed = throw_speed;
    }

    get_grabbable_players() {
        return this.game.players.filter((player) => distance_between_player_and_ball(player, this) <= this.grab_distance && (player.can_grab() || player === this.grabbing_player));
    }

    remove_grab() {
        if (this.grabbing_player !== null) {
            this.grabbing_player.grabbed_ball = null;
        }
        this.grabbing_player = null;
        this.ball_body.GetFixtureList().SetSensor(false);
    }

    grabbed_by_player(player) {
        if (this.grabbing_player !== null) {
            this.grabbing_player.next_grab_time = this.game.remaining_match_time - PLAYER_DROPPED_BALL_GRAB_DELAY_SECONDS;
        }
        this.remove_grab();
        this.grabbing_player = player;
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        this.ball_body.GetFixtureList().SetSensor(true);
        return true;
    }

    throw() {
        this.ball_body.SetLinearVelocity(new b2Vec2(Math.cos(this.grabbing_player.player_body.GetAngle()) * this.throw_speed, Math.sin(this.grabbing_player.player_body.GetAngle()) * this.throw_speed));
        const player_radius = this.grabbing_player.player_body.GetFixtureList().GetShape().GetRadius();
        const ball_radius = this.ball_body.GetFixtureList().GetShape().GetRadius()
        this.ball_body.SetPosition(new b2Vec2(this.grabbing_player.player_body.GetPosition().x + (player_radius + ball_radius + THROW_DISTANCE_FROM_PLAYER) * Math.cos(this.grabbing_player.player_body.GetAngle()), this.grabbing_player.player_body.GetPosition().y + (player_radius + ball_radius + THROW_DISTANCE_FROM_PLAYER) * Math.sin(this.grabbing_player.player_body.GetAngle())))
        this.remove_grab();
    }

    drop() {
        if (this.grabbing_player !== null) {
            this.grabbing_player.next_grab_time = this.game.remaining_match_time - PLAYER_DROPPED_BALL_GRAB_DELAY_SECONDS;
        }
        this.ball_body.SetLinearVelocity(new b2Vec2(BALL_DROP_VELOCITY_PERCENT * this.grabbing_player.player_body.GetLinearVelocity().x, BALL_DROP_VELOCITY_PERCENT * this.grabbing_player.player_body.GetLinearVelocity().y));
        this.remove_grab();
    }
}

class ScoringBall extends GrabbableBall {
    constructor(game) {
        super(game, SCORING_BALL_RADIUS, SCORING_BALL_FRICTION, SCORING_BALL_RESTITUTION, SCORING_BALL_LINEAR_DAMPING, SCORING_BALL_MASS, SCORING_BALL_INERTIA, SCORING_BALL_GRAB_DISTANCE, SCORING_BALL_THROW_SPEED, BodyType.SCORING_BALL)
        this.collision_hit_score_sensor = false;
        this.reset_ball();
    }

    apply_movement() {
        if (this.collision_hit_score_sensor) {
            this.reset_ball();
            return;
        }
        if (this.grabbing_player === null) {
            return;
        }
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        const player_radius = this.grabbing_player.player_body.GetFixtureList().GetShape().GetRadius();
        const ball_radius = this.ball_body.GetFixtureList().GetShape().GetRadius()
        this.ball_body.SetPosition(new b2Vec2(this.grabbing_player.player_body.GetPosition().x + (player_radius + ball_radius) * Math.sin(this.grabbing_player.player_body.GetAngle()), this.grabbing_player.player_body.GetPosition().y - (player_radius + ball_radius) * Math.cos(this.grabbing_player.player_body.GetAngle())))
    }

    handle_logic() {

    }

    reset_ball() {
        this.ball_body.SetPosition(new b2Vec2(FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 2));
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        this.collision_hit_score_sensor = false;
        this.remove_grab();
    }
}

const HittingBallSeekingModes = Object.freeze({
    RANDOM: 0,
    CLOSEST_SCORING_PLAYER: 1,
    PLAYER: 2,
    SCORING_BALL: 3,
    NONE: 4,
})

class HittingBall extends GrabbableBall {
    constructor(game, starting_x, starting_y, disable_seeking_hitting_ball) {
        super(game, HITTING_BALL_RADIUS, HITTING_BALL_FRICTION, HITTING_BALL_RESTITUTION, HITTING_BALL_LINEAR_DAMPING, HITTING_BALL_MASS, HITTING_BALL_INERTIA, HITTING_BALL_GRAB_DISTANCE, MAX_HITTING_BALL_SPEED, BodyType.HITTING_BALL)
        this.starting_x = starting_x;
        this.starting_y = starting_y;
        this.disable_seeking_hitting_ball = disable_seeking_hitting_ball;
        this.reset_ball();
    }

    get_grabbable_players() {
        if (this.seeking_mode === HittingBallSeekingModes.PLAYER) {
            return this.game.players.filter((player) => player !== this.seeking_player);
        }
        return super.get_grabbable_players();
    }

    roll_random_mode(mode_options) {
        if (this.disable_seeking_hitting_ball) {
            this.seeking_mode = HittingBallSeekingModes.NONE;
            return;
        }
        this.seeking_mode = mode_options[random_int(mode_options.length - 1)];
        this.time_to_change_seeking_mode = this.game.remaining_match_time - random(HITTING_BALL_MIN_TIME_BETWEEN_SEEKING_MODES, HITTING_BALL_MAX_TIME_BETWEEN_SEEKING_MODES);
        this.seeking_player = this.game.players[random_int(this.game.players.length - 1)];

        // Random seek around the scoring ball
        // const scoring_ball_position = this.game.scoring_ball.ball_body.GetPosition();
        // this.seeking_position = new b2Vec2(random(Math.max(FIELD_WIDTH_METERS / 10, scoring_ball_position.x - HITTING_BALL_HORIZONTAL_RANDOM_DISTANCE), Math.min(FIELD_WIDTH_METERS * 9 / 10, scoring_ball_position.x + HITTING_BALL_HORIZONTAL_RANDOM_DISTANCE)), random(Math.max(FIELD_LINE_WIDTH_METERS, scoring_ball_position.y - HITTING_BALL_VERTICAL_RANDOM_DISTANCE), Math.min(FIELD_HEIGHT_METERS - FIELD_LINE_WIDTH_METERS, scoring_ball_position.y + HITTING_BALL_VERTICAL_RANDOM_DISTANCE)));
        this.seeking_position = new b2Vec2(random(FIELD_WIDTH_METERS / 10, FIELD_WIDTH_METERS * 9 / 10), random(FIELD_LINE_WIDTH_METERS, FIELD_HEIGHT_METERS - FIELD_LINE_WIDTH_METERS));
    }

    grabbed_by_player(player) {
        if (this.seeking_mode === HittingBallSeekingModes.PLAYER) {
            return false;
        }
        return super.grabbed_by_player(player);
    }

    throw() {
        this.recent_player_throw = true;
        const other_player = (this.game.players[0] === this.grabbing_player) ? this.game.players[1] : this.game.players[0];
        const difference_vector = new b2Vec2(other_player.player_body.GetPosition().x - this.grabbing_player.player_body.GetPosition().x, other_player.player_body.GetPosition().y - this.grabbing_player.player_body.GetPosition().y)
        const throw_angle_difference = angle_difference(this.grabbing_player.player_body.GetAngle(), Math.atan2(difference_vector.y, difference_vector.x));
        if (Math.abs(throw_angle_difference) < AIM_ASSIST_MAX_THROW_ANGLE_DIFFERENCE) {
            this.seeking_mode = HittingBallSeekingModes.PLAYER;
            this.seeking_player = other_player;
            this.time_to_change_seeking_mode = this.game.remaining_match_time - AIM_ASSIST_SEEK_MODE_TIME;
        } else {
            this.seeking_mode = HittingBallSeekingModes.NONE;
            this.time_to_change_seeking_mode = this.game.remaining_match_time - AIM_ASSIST_SEEK_MODE_TIME;
        }

        super.throw();
    }
    
    drop() {
        this.roll_random_mode([HittingBallSeekingModes.RANDOM]);
        super.drop();
    }

    apply_movement() {
        if (this.grabbing_player !== null) {
            this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
            const player_radius = this.grabbing_player.player_body.GetFixtureList().GetShape().GetRadius();
            const ball_radius = this.ball_body.GetFixtureList().GetShape().GetRadius()
            this.ball_body.SetPosition(new b2Vec2(this.grabbing_player.player_body.GetPosition().x + (player_radius + ball_radius) * Math.sin(this.grabbing_player.player_body.GetAngle()), this.grabbing_player.player_body.GetPosition().y - (player_radius + ball_radius) * Math.cos(this.grabbing_player.player_body.GetAngle())))
            return;
        }

        // Seeking
        let difference_vector = null;
        switch(this.seeking_mode) {
            case HittingBallSeekingModes.RANDOM:
                difference_vector = new b2Vec2(this.seeking_position.x - this.ball_body.GetPosition().x, this.seeking_position.y - this.ball_body.GetPosition().y);
                if (vector_magnitude(difference_vector) <= this.ball_body.GetFixtureList().GetShape().GetRadius()) {
                    this.roll_random_mode([HittingBallSeekingModes.RANDOM, HittingBallSeekingModes.CLOSEST_SCORING_PLAYER]);
                    difference_vector = null;
                }
                break;
            case HittingBallSeekingModes.PLAYER:
                difference_vector = new b2Vec2(this.seeking_player.player_body.GetPosition().x - this.ball_body.GetPosition().x, this.seeking_player.player_body.GetPosition().y - this.ball_body.GetPosition().y);
                break;
            case HittingBallSeekingModes.CLOSEST_SCORING_PLAYER:
                const closest_player = this.game.players.reduce((min_player, player) => distance_between_player_and_ball(player, this.game.scoring_ball) < distance_between_player_and_ball(min_player, this.game.scoring_ball) ? player : min_player, this.game.players[0]);
                difference_vector = new b2Vec2(closest_player.player_body.GetPosition().x - this.ball_body.GetPosition().x, closest_player.player_body.GetPosition().y - this.ball_body.GetPosition().y);
                break;
            case HittingBallSeekingModes.SCORING_BALL:
                difference_vector = new b2Vec2(this.game.scoring_ball.ball_body.GetPosition().x - this.ball_body.GetPosition().x, this.game.scoring_ball.ball_body.GetPosition().y - this.ball_body.GetPosition().y);
                if (vector_magnitude(difference_vector) - this.ball_body.GetFixtureList().GetShape().GetRadius() - this.game.scoring_ball.ball_body.GetFixtureList().GetShape().GetRadius()<= HITTING_BALL_STOP_SEEKING_SCORING_BALL_DISTANCE) {
                    this.roll_random_mode();
                    difference_vector = null;
                }
                break;
            case HittingBallSeekingModes.NONE:
                difference_vector = null;
                break;
        }
        if (difference_vector !== null) {
            const direction_vector = new b2Vec2(difference_vector.x / vector_magnitude(difference_vector), difference_vector.y / vector_magnitude(difference_vector));
            this.ball_body.ApplyForce(new b2Vec2(HITTING_BALL_SEEKING_LINEAR_FORCE * direction_vector.x, HITTING_BALL_SEEKING_LINEAR_FORCE * direction_vector.y), this.ball_body.GetWorldCenter(), true);
            const linear_velocity = this.ball_body.GetLinearVelocity();
            const speed = vector_magnitude(linear_velocity);
            const target_angle = Math.atan2(direction_vector.y, direction_vector.x);
            const current_angle = Math.atan2(linear_velocity.y, linear_velocity.x);
            const new_angle = clamp(angle_difference(target_angle, current_angle), -HITTING_BALL_TURN_SPEED / FPS, HITTING_BALL_TURN_SPEED / FPS) + current_angle;
            this.ball_body.SetLinearVelocity(new b2Vec2(Math.cos(new_angle) * speed, Math.sin(new_angle) * speed));
        }
        const linear_velocity = this.ball_body.GetLinearVelocity();
        const current_speed = vector_magnitude(linear_velocity);
        const new_speed = Math.min(current_speed, MAX_HITTING_BALL_SPEED);
        if (current_speed > 0) {
            this.ball_body.SetLinearVelocity(new b2Vec2(linear_velocity.x / current_speed * new_speed, linear_velocity.y / current_speed * new_speed));
        }
    }

    handle_logic() {
        if (this.game.remaining_match_time <= this.time_to_change_seeking_mode) {
            this.roll_random_mode([HittingBallSeekingModes.RANDOM, HittingBallSeekingModes.CLOSEST_SCORING_PLAYER]);
        }
    }

    reset_ball() {
        this.ball_body.SetPosition(new b2Vec2(this.starting_x, this.starting_y));
        this.ball_body.SetLinearVelocity(new b2Vec2(0, 0));
        this.remove_grab();
        this.roll_random_mode([HittingBallSeekingModes.RANDOM]);
        this.recent_player_throw = false;
    }
}

class GoldenBall {
    constructor() {
        
    }
}

class Walls {
    constructor(world) {
        const create_wall = (position_x, position_y, width, height, angle) => {
            const wall = new b2BodyDef();
            wall.position.Set(position_x, position_y);
            wall.type = b2Body.b2_staticBody;
            const wall_fixture = new b2FixtureDef();
            wall_fixture.shape = new b2PolygonShape();
            wall_fixture.friction = WALL_FRICTION;
            wall_fixture.restitution = WALL_RESTITUTION;
            wall_fixture.shape.SetAsBox(width, height, new b2Vec2(position_x, position_y), angle);
            const wall_body = world.CreateBody(wall);
            wall_body.SetUserData({'type': BodyType.WALL, 'object': this});
            wall_body.CreateFixture(wall_fixture);

            return wall_body;
        }
        const top_wall_body = create_wall(FIELD_WIDTH_METERS / 2, FIELD_LINE_WIDTH_METERS - WALL_THICKNESS / 2, FIELD_WIDTH_METERS / 2, WALL_THICKNESS / 2, 0);
        const bottom_wall_body = create_wall(FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS - FIELD_LINE_WIDTH_METERS + WALL_THICKNESS / 2, FIELD_WIDTH_METERS / 2, WALL_THICKNESS / 2, 0);
        const left_wall_body = create_wall(FIELD_LINE_WIDTH_METERS - WALL_THICKNESS / 2, FIELD_HEIGHT_METERS / 2, WALL_THICKNESS / 2, FIELD_HEIGHT_METERS / 2, Math.PI / 2);
        const right_wall_body = create_wall(FIELD_WIDTH_METERS - FIELD_LINE_WIDTH_METERS + WALL_THICKNESS / 2, FIELD_HEIGHT_METERS / 2, WALL_THICKNESS / 2, FIELD_HEIGHT_METERS / 2, Math.PI / 2);
    }
}

class Goal {  
    constructor(game, center_x, center_y, player_to_add_score) {
        this.game = game
        this.player_to_add_score = player_to_add_score;
        
        const get_post_body_def = function(post_center_x, post_center_y) {
            const post_body_def = new b2BodyDef();
            post_body_def.position.Set(post_center_x, post_center_y);
            post_body_def.type = b2Body.b2_staticBody;
            return post_body_def;
        }

        const create_post_fixture = function(body) {
            const post_fixture = new b2FixtureDef;
            post_fixture.shape = new b2CircleShape(GOAL_POST_RADIUS);
            post_fixture.friction = GOAL_POST_FRICTION;
            post_fixture.restitution = GOAL_POST_RESTITUTION;
            body.CreateFixture(post_fixture);
        }

        this.post_body_1 = this.game.world.CreateBody(get_post_body_def(center_x, center_y + GOAL_WIDTH / 2));
        this.post_body_1.SetUserData({'type': BodyType.GOAL_POST, 'object': this});
        create_post_fixture(this.post_body_1);
        
        this.post_body_2 = this.game.world.CreateBody(get_post_body_def(center_x, center_y - GOAL_WIDTH / 2));
        this.post_body_2.SetUserData({'type': BodyType.GOAL_POST, 'object': this});
        create_post_fixture(this.post_body_2);
        
        const post_1_position = this.post_body_1.GetPosition();
        const post_2_position = this.post_body_2.GetPosition();
        
        const create_goal_sensor_fixture = function(body, post_1_position, post_2_position, width) {
            var dx = post_1_position.x - post_2_position.x;
            var dy = post_1_position.y - post_2_position.y;
            var length = Math.sqrt(dx * dx + dy * dy);
            var angle = Math.atan2(dy, dx);
        
            var center_x = (post_1_position.x + post_2_position.x) / 2;
            var center_y = (post_1_position.y + post_2_position.y) / 2;

            const goal_sensor_fixture = new b2FixtureDef;
            goal_sensor_fixture.shape = new b2PolygonShape();
            goal_sensor_fixture.shape.SetAsBox(width / 2, length / 2, new b2Vec2(center_x, center_y), angle);
            body.CreateFixture(goal_sensor_fixture);
        }

        // Create a kinematic body for the gap
        const goal_sensor_def = new b2BodyDef();
        goal_sensor_def.type = b2Body.b2_kinematicBody;
        goal_sensor_def.position.Set((post_1_position.x + post_2_position.x) / 2, (post_1_position.y + post_2_position.y) / 2);
        this.goal_sensor = this.game.world.CreateBody(goal_sensor_def);
        this.goal_sensor.SetUserData({'type': BodyType.GOAL_SENSOR, 'object': this});
        create_goal_sensor_fixture(this.goal_sensor, post_1_position, post_2_position, GOAL_POST_RADIUS / 2)
        this.goal_sensor.GetFixtureList().SetSensor(true);
    }
}

class Game {
    constructor(player_1_graphics, player_2_graphics) {
        this.game_canvas = new GameCanvas();
        this.world = new b2World(new b2Vec2(0, 0), false);
        this.remaining_match_time = GAME_TIME_SECONDS;
        this.paused = false;
        
        this.disable_seeking_hitting_ball = url_params.get('disable_seeking_hitting_ball') !== null && url_params.get('disable_seeking_hitting_ball') === 'true';

        this.walls = new Walls(this.world)
        this.player1 = new Player(this, 1, url_params.get('is_player1_human') !== null && url_params.get('is_player1_human') === 'true', player_1_graphics, url_params.get('cpu_level1'));
        this.player2 = new Player(this, 2, url_params.get('is_player2_human') !== null && url_params.get('is_player2_human') === 'true', player_2_graphics, url_params.get('cpu_level2'));
        this.players = [this.player1, this.player2];
        this.scoring_ball = new ScoringBall(this);
        this.hitting_ball_1 = new HittingBall(this, FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS / 4, this.disable_seeking_hitting_ball);
        this.hitting_ball_2 = new HittingBall(this, FIELD_WIDTH_METERS / 2, FIELD_HEIGHT_METERS * 3 / 4, this.disable_seeking_hitting_ball);
        this.hitting_balls = [this.hitting_ball_1, this.hitting_ball_2];
        this.grabbing_objects = [this.scoring_ball, this.hitting_ball_1, this.hitting_ball_2]; // Order is the precedence for grabbing.

        this.goal_1 = new Goal(this, FIELD_WIDTH_METERS * 0.15, GOAL_WIDTH / 2 + FIELD_LINE_WIDTH_METERS + 2 * GOAL_POST_RADIUS + 2 * SCORING_BALL_RADIUS, this.player2);
        this.goal_2 = new Goal(this, FIELD_WIDTH_METERS * 0.85, GOAL_WIDTH / 2 + FIELD_LINE_WIDTH_METERS + 2 * GOAL_POST_RADIUS + 2 * SCORING_BALL_RADIUS, this.player1);
        this.goal_3 = new Goal(this, FIELD_WIDTH_METERS * 0.15, FIELD_HEIGHT_METERS / 2, this.player2);
        this.goal_4 = new Goal(this, FIELD_WIDTH_METERS * 0.85, FIELD_HEIGHT_METERS / 2, this.player1);
        this.goal_5 = new Goal(this, FIELD_WIDTH_METERS * 0.15, FIELD_HEIGHT_METERS - GOAL_WIDTH / 2 - FIELD_LINE_WIDTH_METERS - 2 * GOAL_POST_RADIUS - 2 * SCORING_BALL_RADIUS, this.player2);
        this.goal_6 = new Goal(this, FIELD_WIDTH_METERS * 0.85, FIELD_HEIGHT_METERS - GOAL_WIDTH / 2 - FIELD_LINE_WIDTH_METERS - 2 * GOAL_POST_RADIUS - 2 * SCORING_BALL_RADIUS, this.player1);
        this.player_1_target_goals = [this.goal_2, this.goal_4, this.goal_6]
        this.player_2_target_goals = [this.goal_1, this.goal_3, this.goal_5]
        this.goals = [this.goal_1, this.goal_2, this.goal_3, this.goal_4, this.goal_5, this.goal_6];

        const contact_listener = new CustomContactListener(this.players, this.goals, this.scoring_ball, this.hitting_balls);
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
        if (this.paused) {
            return;
        }
        this.world.ClearForces();
        this.game_canvas.update_constants();
        
        for (const player_ii in this.players) {
            this.players[player_ii].handle_logic();
        }
        
        for (const ii in this.hitting_balls) {
            this.hitting_balls[ii].handle_logic();
        }
        
        for (const player_ii in this.players) {
            this.players[player_ii].apply_movement();
        }

        this.scoring_ball.apply_movement();
        
        for (const ii in this.hitting_balls) {
            this.hitting_balls[ii].apply_movement();
        }

        const current_frame_time = performance.now() / 1000;
        let dt = current_frame_time - last_frame_time;
        this.world.Step(dt, VELOCITY_ITERATIONS, POSITION_ITERATIONS);
        last_frame_time = current_frame_time;
        this.remaining_match_time -= dt;
    }

    render() {
        if (this.paused) {
            return;
        }
        this.game_canvas.clear_canvas_and_draw_background();
        this.game_canvas.render_scoreboard(this.player1.score, this.player2.score, Math.ceil(this.remaining_match_time));
        for (const player_ii in this.players) {
            this.game_canvas.render_player(this.players[player_ii]);
        }
        this.game_canvas.render_scoring_ball(this.scoring_ball);
        for (const ii in this.hitting_balls) {
            this.game_canvas.render_hitting_ball(this.hitting_balls[ii]);
            
        }
        for (const goal_ii in this.goals) {
            this.game_canvas.render_goal(this.goals[goal_ii]);
        }
        if (this.remaining_match_time < 0) {
            toggle_pause();
        }
    }
}

const url_params = new URLSearchParams(window.location.search);
const player_1_graphics = new PlayerGraphics(url_params.get('player1_color'));
const player_2_graphics = new PlayerGraphics(url_params.get('player2_color'));
const scoring_ball_graphics = new ScoringBallGraphics();
const hitting_ball_graphics = new HittingBallGraphics();
const all_graphics = [player_1_graphics, player_2_graphics, scoring_ball_graphics, hitting_ball_graphics];
const game = new Game(player_1_graphics, player_2_graphics);
const pause_menu = document.getElementById('pauseMenu');
let last_frame_time = performance.now() / 1000;

function toggle_pause() {
    if (game.remaining_match_time < 0) {
        game.paused = true;
        pause_menu.style.visibility = 'visible';
        resume_button.style.display = 'none';
        return;
    }
    game.paused = !game.paused;
    if (game.paused) {
        pause_menu.style.visibility = 'visible';
    } else {
        pause_menu.style.visibility = 'hidden';
    }
}

const resume_button = document.getElementById('resumeButton');
const restart_button = document.getElementById('restartButton');
const main_menu_button = document.getElementById('mainMenuButton');
resume_button.addEventListener('click', toggle_pause);
restart_button.addEventListener('click', () => {
    window.location.reload();
});
main_menu_button.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Keyboard event listeners for paddle movement
document.addEventListener('keydown', function(event) {
    switch(event.code) {
        case 'Escape':
            toggle_pause();
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
    if (all_graphics.every(graphic => graphic.is_graphic_ready())) {
        game.update();
        game.render();
    } else {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const text = 'Loading...';
        const textWidth = ctx.measureText(text).width;
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        ctx.fillText(text, x, y);
    }
}

setInterval(run, 1000 / FPS);
