var width = 700,
    height = 500;
var canvas = ctx = false;
var frameRate = 1/40;
var frameDelay = frameRate * 300;
var paddleAngle = Math.PI/16;
var loopTimer = false;
var drawLoopTimer = false;

// An array of objects that represent
// lines drawn
var platforms = [];

var maxplatforms = 0;


// Singleton representing the ball
var ball = {
    position: { x: width/2, y: 200 },
    velocity: { x: 40, y: 0},
    mass: 0.2, // kg
    radius: 15, // 1px = 1cm
    restitution: -1.2
};


// Singleton representing the target
var target =  {
    radius: ball.radius * 1.5,
    position: { 
        x: Math.floor(Math.random() * (width - (ball.radius * 3)) ),
        y: Math.floor(Math.random() * (height - (ball.radius * 3)) )
    }
};


var Cd  = 0.47; // (Coefficient of drag), Dimensionless
var rho = 1.22; // Density of air, kg / m^3
var A = Math.PI * ball.radius * ball.radius / (10000);
var mouse = {x: 0, y: 0, isDown: false };
var lastclick = {x: 0, y: 0};

            
/**
 * Get current mouse coordinates as x, y
 * and assign to 'mouse' object
 */
function getMousePosition(e) {
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;
}


/**
 * Canvas callback when mouse is pressed
 *
 */
var mouseDown = function (e) {
    if (e.which == 1) {    
        getMousePosition(e);
        mouse.isDown = true;
        
        // Store x,y coordinate for this current click
        // so I can reference this initial click in mouseUp
        lastclick.x = mouse.x;
        lastclick.y = mouse.y; 
    }
}


/**
 * Canvas callback when mouse is released
 *
 */
var mouseUp = function (e) {
    if (e.which == 1) {
        mouse.isDown = false;
        
        getMousePosition(e);
        
        // Store latest drawn platform in platforms array
        platforms.push(
            // An object with 'moveTo' and 'lineTo' properties
            // which are objects themselves containing x,y coordinates
            { 
                moveTo: {
                    x: lastclick.x,
                    y: lastclick.y
                },
                lineTo: {
                    x: mouse.x,
                    y: mouse.y
                }
            }
        );
    }
}


/**
 * Game initialization
 *
 */
var setup = function () {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    
    canvas.onmousemove = getMousePosition;
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    
    ctx.fillStyle = 'blue';
    
    maxplatforms = platforms.length;

    // Start draw (platform) loop
    drawLoopTimer = setInterval(drawloop, frameDelay);
}


/**
 * Start the game
 *
 */
var start = function () {
    // Reset ball position
    ball = {
        position: { x: width/2, y: 200 },
        velocity: { x: 40, y: 0},
        mass: 0.2, // kg
        radius: 15, // 1px = 1cm
        restitution: -1.2
    };
    
    // Stop draw loop
    clearInterval(drawLoopTimer);

    // Start game loop
    loopTimer = setInterval(loop, frameDelay);
}


/**
 * Stop the game
 *
 */
var stop = function () {
    clearInterval(loopTimer);
    ctx.clearRect(0, 0, width, height);
    platforms = [];
    drawLoopTimer = setInterval(drawloop, frameDelay);
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/dot-line-length [rev. #1]
dotLineLength = function(x, y, x0, y0, x1, y1, o){
	function lineLength(x, y, x0, y0){
		return Math.sqrt((x -= x0) * x + (y -= y0) * y);
	}
	if(o && !(o = function(x, y, x0, y0, x1, y1){
		if(!(x1 - x0)) return {x: x0, y: y};
		else if(!(y1 - y0)) return {x: x, y: y0};
		var left, tg = -1 / ((y1 - y0) / (x1 - x0));
		return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
	}(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
		var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
		return l1 > l2 ? l2 : l1;
	}
	else {
		var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
		return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
	}
};


var drawTarget = function () {
    var fillStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, target.radius, 0, Math.PI*2, true);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    
    // Draw center of target
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, ball.radius/2, 0, Math.PI*2, true);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.closePath();
}


/**
 * Initial loop to capture platform drawing
 *
 */
var drawloop = function () {
    drawTarget();
    
    if (mouse.isDown) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
           
        drawTarget();
        
        // Draw all existing platforms stored in 'platforms' array
        for (var i = 0; i < maxplatforms; i += 1) {
            ctx.beginPath();
            ctx.moveTo(platforms[i].moveTo.x, platforms[i].moveTo.y);
            ctx.lineTo(platforms[i].lineTo.x, platforms[i].lineTo.y);
            ctx.stroke();
            ctx.closePath();   
        }
        
        // Display platform as its being drawn
        ctx.beginPath();
        ctx.moveTo(lastclick.x, lastclick.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.closePath();
    }
    
    // Update platform count
    maxplatforms = platforms.length;
}


/**
 * Main game loop
 *
 */
var loop = function () {
    var i = 0;

    // Do physics

    // Drag force: Fd = -1/2 * Cd * A * rho * v * v
    var Fx = -0.5 * Cd * A * rho * ball.velocity.x * ball.velocity.x * ball.velocity.x / Math.abs(ball.velocity.x);
    var Fy = -0.5 * Cd * A * rho * ball.velocity.y * ball.velocity.y * ball.velocity.y / Math.abs(ball.velocity.y);

    Fx = (isNaN(Fx) ? 0: Fx);
    Fy = (isNaN(Fy) ? 0: Fy);

    // Calculate acceleration (F = ma)
    var ax = Fx / ball.mass;
    var ay = 9.81 + (Fy / ball.mass);

    // Integrate to get velocity
    ball.velocity.x += ax * frameRate;
    ball.velocity.y += ay * frameRate;

    // Integrate to get position
    ball.position.x += ball.velocity.x * frameRate * 100;
    ball.position.y += ball.velocity.y * frameRate * 100;
        
    /**
     * Handle collisions
     *
     */
    
    // Handle ceiling collisions
    if (ball.position.y < 0 - ball.radius) {
        ball.velocity.y *= ball.restitution;
        ball.position.y = 0 + ball.radius;
    }
    
    // Handle floor collisions
    if (ball.position.y > height - ball.radius) {
        ball.velocity.y *= ball.restitution;
        ball.position.y = height - ball.radius;
    }

    // Handle right-wall collisions
    if (ball.position.x > width - ball.radius) {
        ball.velocity.x *= ball.restitution;
        ball.position.x = width - ball.radius;
    }
    
    // Handle left-wall collisions
    if (ball.position.x < ball.radius) {
        ball.velocity.x *= ball.restitution;
        ball.position.x = ball.radius;
    }
    
    // Handle target collisions
    if ( ball.position.x >= target.position.x
         && 
         ball.position.x <= target.position.x + ball.radius
         &&
         ball.position.y >= target.position.y
         &&
         ball.position.y <= target.position.y + ball.radius ) {
             alert("Victory!");
         }
	
	// Handle collisions for all platforms drawn
	for (i = 0; i < maxplatforms; i += 1) {
    	var paddleX1 = platforms[i].moveTo.x + Math.cos(paddleAngle);
    	var paddleY1 = platforms[i].moveTo.y + Math.sin(paddleAngle);

    	var paddleX2 = platforms[i].lineTo.x - Math.cos(paddleAngle);
    	var paddleY2 = platforms[i].lineTo.y - Math.sin(paddleAngle);

    	// How far is the ball from the paddle?
    	var d = dotLineLength(ball.position.x, ball.position.y, paddleX1, paddleY1, paddleX2, paddleY2, true);
    	// Is the ball's radius overlapping the line?
    	if (d < ball.radius) {
    		// Total velocity (ie, Magnitude of the Resultant vector)
    		// Calculated using Pythagoras
    		var velocityMagnitude = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
    		// Velocity's angle, calculated using arc tangent (atan_2_ means that we consider signs)
    		var velocityAngle = Math.atan2(ball.velocity.y, ball.velocity.x);

    		// Let's figure out the angle of the Normal as compared to the horizontal.
    		// We have to do this because when the ball hits the paddly, the new velocity vector should be on the other side of the normal
    		var normalAngle = paddleAngle + Math.PI/2;

    		// The incidence angle is the difference between the ball's velocity vector and the normal's angle
    		var incidenceAngle = (Math.PI) - velocityAngle - normalAngle;
    		// The new angle is the incidence angle added to the normal (ie, on the other side)
    		var newAngle = normalAngle + (-1*incidenceAngle);

    		// Calculate new velocity components
    		// If you wanted the ball to lose momentum on collisions, it would look like:
    		// ball.velocity.x = RESTITUTION * velocityMagnitude * Math.cos(newAngle), etc
    		ball.velocity.x = ball.restitution * velocityMagnitude*Math.cos(newAngle);
    		ball.velocity.y = ball.restitution * velocityMagnitude*Math.sin(newAngle);
    	}	    
	}

	   
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    drawTarget();
    
    // Draw all platforms 
    for (var i = 0; i < maxplatforms; i += 1) {
        ctx.beginPath();
        ctx.moveTo(platforms[i].moveTo.x, platforms[i].moveTo.y);
        ctx.lineTo(platforms[i].lineTo.x, platforms[i].lineTo.y);
        ctx.stroke();
        ctx.closePath();   
    }
    
    // Save context
    ctx.save();
    
    ctx.translate(ball.position.x, ball.position.y);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI*2, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

// Do setup when JS is loaded
setup();