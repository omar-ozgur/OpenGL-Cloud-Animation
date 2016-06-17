// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0, start_time = 0, center, firstFrame = 1;
		var gouraud = false, color_normals = false, solid = false;
var animTime, camOrigin, armRot = 0, camOriginStart, camPosStart, r, cloud = 1, cloudPrev = 1, cloudSizes = [], clouds = [], currentCloud, currentCloudSize, shrinkStart = -10000, growStart = 0, shouldShrink = 0, shouldGrow = 0;
var bg = 0, camBegin;
var cloudMat, end = 0, endTime = 0, endPos, endRotStart;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }


// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "stars.png", "text.png", "earth.gif", "mountain.png", "tent_texture.jpg" ];

// *******************************************************	
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		gl.clearColor( 0.5, 0.8, 1, 1 );			// Background color
		
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
		
		self.m_cube = new cube();

		// Objects used as cloud shapes
		self.m_obj = new shape_from_file( "teapot.obj" )
		clouds.push(self.m_obj);
		cloudSizes.push(0.8);
		self.m_horse = new shape_from_file( "horse.obj" )
		clouds.push(self.m_horse);
		cloudSizes.push(80);
		self.m_tree = new shape_from_file( "tree.obj" )
		clouds.push(self.m_tree);
		cloudSizes.push(15);
		self.m_sword = new shape_from_file( "sword.obj" )
		clouds.push(self.m_sword);
		cloudSizes.push(15);
		self.m_chair = new shape_from_file( "chair.obj" )
		clouds.push(self.m_chair);
		cloudSizes.push(50);
		self.m_shark = new shape_from_file( "shark.obj" )
		clouds.push(self.m_shark);
		cloudSizes.push(40);
		self.m_planet = new shape_from_file( "planet.obj" )
		clouds.push(self.m_planet);
		cloudSizes.push(30);
		self.m_hammer = new shape_from_file( "hammer.obj" )
		clouds.push(self.m_hammer);
		cloudSizes.push(10);
		self.m_star = new shape_from_file( "star.obj" )
		clouds.push(self.m_star);
		cloudSizes.push(15);
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 2 );
		self.m_particle = new sphere( mat4(), 2 );
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );
		self.m_text = new text_line( 20 );

		// Custom shapes
		self.m_tent = new tent();
		self.m_ground = new ground();
		
		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0, -45), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.context.render();	
	} ) ( this );	
	
	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;

	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = camBegin; self.graphicsState.animation_time = 0; animTime = 0; armRot = 0; end = 0; endTime = 0; }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );	

	// Custom keybinds
	shortcut.add( "1", function() { cloud = 1 }, {'type':'keyup'} );
	shortcut.add( "2", function() { cloud = 2 }, {'type':'keyup'} );
	shortcut.add( "3", function() { cloud = 3 }, {'type':'keyup'} );
	shortcut.add( "4", function() { cloud = 4 }, {'type':'keyup'} );
	shortcut.add( "5", function() { cloud = 5 }, {'type':'keyup'} );
	shortcut.add( "6", function() { cloud = 6 }, {'type':'keyup'} );
	shortcut.add( "7", function() { cloud = 7 }, {'type':'keyup'} );
	shortcut.add( "8", function() { cloud = 8 }, {'type':'keyup'} );
	shortcut.add( "9", function() { cloud = 9 }, {'type':'keyup'} );

	// Change the time of day
	shortcut.add( "b", function() { if(bg) bg = 0; else bg = 1; }, {'type':'keyup'} );

	// End the cloud sequence
	shortcut.add( "e", function() { if(animTime/1000 > 15 && end == 0 && endTime == 0) end = 1; }, {'type':'keyup'} );
}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0001 * animation_delta_time;
		var meters_per_frame  = .1 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;
		
		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

Animation.prototype.currentPos = function(current, end, speed){
	if(current < end){
		current += this.animation_delta_time / (1/speed);
	}
	else{
		current = end;
	}
	return current;
}

Animation.prototype.drawParticles = function(model_transform, vertices, size, color, pSize, vary){

	// Draw a given object by placing "particles" at each vertex position
	// Each particle moves and changes size base on the animation time
	var origin = model_transform;
	for(var i = 0; i < vertices.length; i++){
			model_transform = origin;
			var x = vertices[i][0] * size + Math.cos(this.graphicsState.animation_time/1000 + i) * 1;
			var y = vertices[i][1] * size + Math.sin(this.graphicsState.animation_time/1000 + i) * 1;
			var z = vertices[i][2] * size;
			model_transform = mult(model_transform, translation(x, y, z));
			var s = pSize * Math.cos(this.graphicsState.animation_time/1000 + i);
			// color.color[0] = 0.8 + 0.01 * Math.cos(this.graphicsState.animation_time/1000 + i * 4);
			// color.color[1] = 0.8 + 0.01 * Math.cos(this.graphicsState.animation_time/1000 + i * 4);
			if(vary)
				color.color[2] = 0.5 * Math.cos(this.graphicsState.animation_time/1000 + i * 4);
			model_transform = mult( model_transform, scale(s, s, s) );
			this.m_particle.draw(this.graphicsState, model_transform, color);
	}
}

Animation.prototype.drawParticles2 = function(model_transform, vertices, size, color, pSize, vary){

	// This is very similar to the first particle function, except it is geared toward drawing the player with particles
	var origin = model_transform;
	for(var i = 0; i < vertices.length; i++){
			model_transform = origin;
			var x = vertices[i][0] * size + Math.cos(this.graphicsState.animation_time/1000 + i) * 0;
			var y = vertices[i][1] * size + Math.sin(this.graphicsState.animation_time/1000 + i) * 0;
			var z = vertices[i][2] * size;
			model_transform = mult(model_transform, translation(x, y, z));
			var s = pSize * Math.cos(this.graphicsState.animation_time/1000 + i);
			// color.color[0] = 0.8 + 0.01 * Math.cos(this.graphicsState.animation_time/1000 + i * 4);
			// color.color[1] = 0.8 + 0.01 * Math.cos(this.graphicsState.animation_time/1000 + i * 4);
			if(vary)
				color.color[2] = 0.5 * Math.cos(this.graphicsState.animation_time/1000 + i * 4);
			model_transform = mult( model_transform, scale(s, s, s) );
			this.m_particle.draw(this.graphicsState, model_transform, color);
	}
}

Animation.prototype.drawGround = function(model_transform){

	// Draw the ground with the custom ground shape
	model_transform = mult(model_transform, scale(groundScale[0], groundScale[1], groundScale[2]));
	this.m_ground.draw(this.graphicsState, model_transform, green);
};

Animation.prototype.drawBoy = function(model_transform){
	var origin = model_transform;

	// Draw body
	if(this.graphicsState.animation_time/10 < 90){
		model_transform = mult(model_transform, rotation(90 - this.graphicsState.animation_time/10, 1, 0, 0));
	}
	model_transform = mult(model_transform, scale(bodyScale[0], bodyScale[1], bodyScale[2]));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		model_transform = mult(model_transform, translation(0, 0, 0.2));
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.4, white, 0.3, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, shirt);
	}
	model_transform = mult(model_transform, scale(1/bodyScale[0], 1/bodyScale[1], 1/bodyScale[2]));

	// Draw head
	model_transform = mult(model_transform, translation(0, bodyScale[1]/2 + headScale[1]/2, 0.5));
	model_transform = mult(model_transform, scale(headScale[0], headScale[1], headScale[2]));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.4, white, 0.3, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, skin);
	}
	model_transform = mult(model_transform, scale(1/headScale[0], 1/headScale[1], 1/headScale[2]));
	var head = model_transform;
	model_transform = mult(model_transform, translation(0, headScale[1]/2 - 1.5, -0.1));
	model_transform = mult(model_transform, scale(headScale[0] + 0.5, 5, headScale[2]));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.4, white, 0.3, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, brown);
	}

	// Draw eyes
	model_transform = head;
	model_transform = mult(model_transform, translation(-eyeDistance/2, 0, headScale[2]/2));
	model_transform = mult(model_transform, scale(eyeScale[0], eyeScale[1], eyeScale[2]));
	this.m_cube.draw(this.graphicsState, model_transform, black);
	model_transform = mult(model_transform, scale(1/eyeScale[0], 1/eyeScale[1], 1/eyeScale[2]));
	model_transform = mult(model_transform, translation(eyeDistance, 0, 0));
	model_transform = mult(model_transform, scale(eyeScale[0], eyeScale[1], eyeScale[2]));
	this.m_cube.draw(this.graphicsState, model_transform, black);

	// Draw legs
	model_transform = origin;
	model_transform = mult(model_transform, translation(-legDistance/2, -bodyScale[1]/2 - legScale[1]/2, 1));
	model_transform = mult(model_transform, scale(legScale[0], legScale[1], legScale[2]));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, pants);
	}
	model_transform = mult(model_transform, scale(1/legScale[0], 1/legScale[1], 1/legScale[2]));
	model_transform = mult(model_transform, translation(0, -legScale[1]/2 - 1, 0));
	model_transform = mult(model_transform, scale(2, 2, 2));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, black);
	}
	model_transform = origin;
	model_transform = mult(model_transform, translation(legDistance/2, -bodyScale[1]/2 - legScale[1]/2, 1));
	model_transform = mult(model_transform, scale(legScale[0], legScale[1], legScale[2]));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, pants);
	}
	model_transform = mult(model_transform, scale(1/legScale[0], 1/legScale[1], 1/legScale[2]));
	model_transform = mult(model_transform, translation(0, -legScale[1]/2 - 1, 0));
	model_transform = mult(model_transform, scale(2, 2, 2));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, black);
	}

	// Draw arms
	model_transform = origin;
	model_transform = mult(model_transform, translation(-bodyScale[0]/2 - armScale[0]/2, 0, 1));
	model_transform = mult(model_transform, scale(armScale[0], armScale[1], armScale[2]));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, shirt);
	}
	model_transform = mult(model_transform, scale(1/armScale[0], 1/armScale[1], 1/armScale[2]));
	model_transform = mult(model_transform, translation(0, -armScale[1]/2 - 1, 0));
	model_transform = mult(model_transform, scale(2, 2, 2));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, skin);
	}
	model_transform = origin;
	if(animTime/1000 > 6 && animTime/1000 < 7){
		armRot = 90 * (animTime/1000 - 6) / 1;
	}
	else if(animTime/1000 > 10 && animTime/1000 < 11){
		armRot = 90 - 90 * (animTime/1000 - 10) / 1;
	}
	model_transform = mult(model_transform, rotation(armRot, -1, 0, 0));
	model_transform = mult(model_transform, translation(bodyScale[0]/2 + armScale[0]/2, -armRot * 0.03, 1));
	model_transform = mult(model_transform, scale(armScale[0], armScale[1], armScale[2]));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, shirt);
	}
	model_transform = mult(model_transform, scale(1/armScale[0], 1/armScale[1], 1/armScale[2]));
	model_transform = mult(model_transform, translation(0, -armScale[1]/2 - 1, 0));
	model_transform = mult(model_transform, scale(2, 2, 2));
	if(this.graphicsState.animation_time/1000 > endTime + 8 && endTime > 0){
		this.drawParticles2(model_transform, this.m_cube.vertices, 0.5, white, 0.4, 0);
	}
	else{
		this.m_cube.draw(this.graphicsState, model_transform, skin);
	}
}

var tree = [];

Animation.prototype.drawTree = function(model_transform){

	// Draw trunk
	var origin = model_transform;
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	model_transform = mult(model_transform, scale(trunkScale[0], trunkScale[2], trunkScale[1]));
	this.m_cylinder.draw(this.graphicsState, model_transform, brown);

	// Draw leaves
	model_transform = origin;
	model_transform = mult(model_transform, translation(0, leavesScale[1] + trunkScale[1]/2, 0));
	model_transform = mult(model_transform, rotation(90, -1, 0, 0));
	model_transform = mult(model_transform, scale(leavesScale[0], leavesScale[2], leavesScale[1]));
	this.m_fan.draw(this.graphicsState, model_transform, tree);
	model_transform = mult(model_transform, translation(0, 0, 0.3));
	this.m_fan.draw(this.graphicsState, model_transform, tree);
	model_transform = mult(model_transform, translation(0, 0, 0.3));
	this.m_fan.draw(this.graphicsState, model_transform, tree);
}

var seed = 1.1;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

var blue = new Material( vec4( 0.0, 0.5, 0.9, 1 ), .2, 1.0, 0.0, 40 ),
	orange = new Material( vec4( 0.9, 0.5, 0.0, 1 ), .2, 1.0, 0.0, 40 ),
	red = new Material( vec4( 1.0, 0.2, 0.0, 1 ), .2, 1.0, 0.0, 40 ),
	pink = new Material( vec4( 1.0, 0.2, 0.5, 1 ), .2, 1.0, 0.0, 40 ),
	white = new Material( vec4( 0.8, 0.8, 0.8, 1 ), 0.5, 1.0, 0.0, 40 ),
	yellow = new Material( vec4( 0.9, 0.9, 0.3, 1 ), 0.5, 1.0, 0.0, 40 ),
	brown = new Material( vec4( 0.5, 0.2, 0.0, 1 ), .1, 1.0, 0.0, 40 ),
	green = new Material( vec4( 0.0, 0.7, 0.4, 1 ), .0, 1.0, 0.0, 40 ),
	tree = new Material( vec4( 0.0, 0.5, 0.4, 1 ), .0, 1.0, 0.0, 40 ),
	black = new Material( vec4( 0.0, 0.0, 0.0, 1 ), 0.5, 0.0, 1.0, 20 ),
	shirt = new Material( vec4( 0.0, 0.4, 0.9, 1 ), 0.5, 1.0, 0.0, 20 ),
	pants = new Material( vec4( 0.0, 0.2, 0.4, 1 ), 0.5, 1.0, 0.0, 20 ),
	skin = new Material( vec4( 0.7, 0.5, 0.4, 1 ), 0.5, 1.0, 0.0, 20 ),
	blanket = new Material( vec4( 0.8, 0.2, 0.2, 1 ), 0.5, 1.0, 0.0, 20 ),
	stars = new Material( vec4( 0,0,0,1 ), 1, 0, 0, 20, "stars.png" ),
	mountain = new Material( vec4( 0,0,0,1 ), 1, 0, 0, 20, "mountain.png" ),
	tentMat = new Material( vec4( 0,0,0,1 ), 1, 0, 0, 20, "tent_texture.jpg" );
var groundScale = [750, 0.5, 750], tileScale = 25;
var bodyScale = [6, 8, 5], headScale = [7, 7, 5], eyeScale = [1, 1, 1], armScale = [2, 5, 2], legScale = [2, 5, 2], legDistance = 2.5,
	eyeScale = [1, 1.5, 1], eyeDistance = 2.25, blanketScale = [12, 1.5, 30], trunkScale = [4, 20, 4], leavesScale = [10, 15, 10],
	tentScale = [20, 20, 45];
var trees = [];
var camPos = [];
var origin;
var ground;

Animation.prototype.drawScene = function(model_transform){
	origin = model_transform;

	if(bg){
		model_transform = mult(model_transform, scale(950, 950, 950));
		this.m_cube.draw(this.graphicsState, model_transform, stars);
		cloudMat = yellow;
	}
	else{
		cloudMat = white;
	}

	model_transform = origin;
	model_transform = mult(model_transform, translation(0, -10, 0));
	model_transform = mult(model_transform, translation(0, -1, 0));
	ground = model_transform;
	this.drawGround(model_transform);

	// Draw blanket
	model_transform = ground;
	model_transform = mult(model_transform, translation(0, groundScale[1]/2 + blanketScale[1]/2 - 0.5, -5));
	model_transform = mult(model_transform, scale(blanketScale[0], blanketScale[1], blanketScale[2]));
	this.m_cube.draw(this.graphicsState, model_transform, blanket);

	// Draw mountain
	model_transform = ground;
	model_transform = mult(model_transform, translation(250, 0, -250));
	model_transform = mult(model_transform, rotation(45, 0, 1, 0));
	model_transform = mult(model_transform, scale(500, 500, 500));
	this.m_strip.draw(this.graphicsState, model_transform, mountain);

	// Draw mountain
	model_transform = ground;
	model_transform = mult(model_transform, rotation(-85, 0, 1, 0));
	model_transform = mult(model_transform, translation(400, 0, 0));
	model_transform = mult(model_transform, scale(500, 500, 500));
	this.m_strip.draw(this.graphicsState, model_transform, mountain);

	// Draw fire particles
	model_transform = ground;
	model_transform = mult(model_transform, translation(-14, groundScale[1]/2 + 2, -28));
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
	// this.drawParticles(model_transform, this.m_cube.vertices, 8, red, 3, 1);

	// Draw log
	model_transform = ground;
	model_transform = mult(model_transform, translation(-14, groundScale[1]/2, -29));
	model_transform = mult(model_transform, rotation(-50, 1.8, 0.5, 0));
	model_transform = mult(model_transform, scale(1, 1, 10));
	this.m_cylinder.draw(this.graphicsState, model_transform, brown);
	model_transform = mult(model_transform, scale(1/1, 1/1, 1/10));

	// Draw log
	model_transform = ground;
	model_transform = mult(model_transform, translation(-12, groundScale[1]/2 + 0.6, -28));
	model_transform = mult(model_transform, rotation(70, 0.8, 0.7, 0));
	model_transform = mult(model_transform, scale(1, 1, 10));
	this.m_cylinder.draw(this.graphicsState, model_transform, brown);
	model_transform = mult(model_transform, scale(1/1, 1/1, 1/10));

	// Draw log
	model_transform = ground;
	model_transform = mult(model_transform, translation(-15, groundScale[1]/2 + 0.6, -27));
	model_transform = mult(model_transform, rotation(90, 0.5, -0.5, 0));
	model_transform = mult(model_transform, scale(1, 1, 10));
	this.m_cylinder.draw(this.graphicsState, model_transform, brown);
	model_transform = mult(model_transform, scale(1/1, 1/1, 1/10));

	// Draw tent
	model_transform = ground;
	model_transform = mult(model_transform, translation(2, tentScale[1]/2 + 3, -80));
	model_transform = mult(model_transform, rotation(-5, 0, 0, -1));
	model_transform = mult(model_transform, scale(tentScale[0], tentScale[1], tentScale[2]));
	this.m_tent.draw(this.graphicsState, model_transform, tentMat);

	// Draw trees
	model_transform = ground;
	if(firstFrame){
		for(var i = 0; i < 100; i++){
			var x = -300 + random() * 600;
			var y = -300 + random() * 600;
			if(x*x > 1000 && y*y > 1000){
				model_transform = ground;
				model_transform = mult(model_transform, translation(x, trunkScale[1]/2 + groundScale[1]/2, y));
				trees.push(model_transform);
				this.drawTree(model_transform);
			}
		}
	}
	else{
		for(var i = 0; i < trees.length; i++){
			this.drawTree(trees[i]);
		}
	}

	// Draw boy
	model_transform = ground;
	model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
	if(this.graphicsState.animation_time/1000 > endTime + 9 && endTime > 0){
		model_transform = mult(model_transform, translation(0, bodyScale[1]/2 + groundScale[1]/2, 1 + (this.graphicsState.animation_time/1000 - (endTime + 9)) * 25));
	}
	else{
		model_transform = mult(model_transform, translation(0, bodyScale[1]/2 + groundScale[1]/2, 1));
	}
	this.drawBoy(model_transform);

	// Move camera
	if(firstFrame){
		cloudMat = white;
		currentCloud = clouds[cloud - 1];
		currentCloudSize = cloudSizes[cloud - 1];
		camOrigin = this.graphicsState.camera_transform;
		this.graphicsState.camera_transform = mult( translation(-200, 25, -150), this.graphicsState.camera_transform );
		camPos = [this.graphicsState.camera_transform[0][3], this.graphicsState.camera_transform[1][3], -this.graphicsState.camera_transform[2][3]];
		this.graphicsState.camera_transform = lookAt(camPos, [0, 0, -5], [0, 1, 0]);
		camBegin = this.graphicsState.camera_transform;
		camOriginStart = this.graphicsState.camera_transform;
	}

	// Change variables based on timing during the animation sequence
	if(this.graphicsState.animation_time/800 < 4 && animate){
		camPosStart = 300 * (this.graphicsState.animation_time/1000)/4;
		this.graphicsState.camera_transform = camOriginStart;
		this.graphicsState.camera_transform = mult( translation(0, 0, camPosStart), this.graphicsState.camera_transform );
		camOrigin = this.graphicsState.camera_transform;
	}
	else if (this.graphicsState.animation_time/800 <= 10 && animate){
		this.graphicsState.camera_transform = camOrigin;
	}
	else if(this.graphicsState.animation_time/1000 > 10 && this.graphicsState.animation_time/1000 < 15 && animate){
		r = 90 * (this.graphicsState.animation_time/1000 - 10) / 5;
		this.graphicsState.camera_transform = camOrigin;
		this.graphicsState.camera_transform = mult( rotation(r, 0, 1, 0), this.graphicsState.camera_transform );
		this.graphicsState.camera_transform = mult( rotation(r, -1, 0, 0), this.graphicsState.camera_transform );
		this.graphicsState.camera_transform = mult( translation(r / 3, 0, 0), this.graphicsState.camera_transform );
	}
	else if(this.graphicsState.animation_time/1000 > 15 && end){
		endPos = model_transform;
		endTime = this.graphicsState.animation_time/1000;
		end = 0;
	}
	else if(endTime > 0 && this.graphicsState.animation_time/1000 < endTime + 5){
		r = 90 - 90 * (this.graphicsState.animation_time/1000 - endTime) / 5;
		this.graphicsState.camera_transform = camOrigin;
		this.graphicsState.camera_transform = mult( rotation(r, 0, 1, 0), this.graphicsState.camera_transform );
		this.graphicsState.camera_transform = mult( rotation(r, -1, 0, 0), this.graphicsState.camera_transform );
		this.graphicsState.camera_transform = mult( translation(r / 3, 0, 0), this.graphicsState.camera_transform );
	}

	firstFrame = 0;

	// Draw clouds/stars based on time variables
	if(cloud == cloudPrev){
		model_transform = ground;
		model_transform = mult(model_transform, translation(0, 250, 0));
		model_transform = mult(model_transform, rotation(45, 0, 1, 0));
		model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
		if(!(this.graphicsState.animation_time/1000 > endTime + 9 && endTime > 0)){
			// Draw particles in the shape of the specified object
			this.drawParticles(model_transform, currentCloud.vertices, currentCloudSize, cloudMat, 8 - 5 * bg, 0);
		}
		if(this.graphicsState.animation_time < growStart + 1000 && shouldGrow){
			// Grow the new cloud
			currentCloudSize = cloudSizes[cloud - 1] * (this.graphicsState.animation_time - growStart) / 1000;
		}
		else if(shouldGrow){
			currentCloudSize = cloudSizes[cloud - 1];
			shouldGrow = 0;
		}
		if(this.graphicsState.animation_time > shrinkStart + 1000 && shouldShrink){
			// Start growing the new cloud
			currentCloud = clouds[cloud - 1];
			shouldShrink = 0;
			growStart = this.graphicsState.animation_time;
			shouldGrow = 1;
		}
		else if(shouldShrink){
			// Shrink the cloud
			currentCloudSize = currentCloudSize - currentCloudSize * (this.graphicsState.animation_time - shrinkStart) / 1000;
		}
	}
	else if(cloud != cloudPrev){
		// Start shrinking the cloud
		shrinkStart = this.graphicsState.animation_time;
		shouldShrink = 1;
		cloudPrev = cloud;
	}

	// Change the camera's end rotation
	if(this.graphicsState.animation_time/1000 > endTime + 9 && endTime > 0 && animate && this.graphicsState.animation_time/1000 < endTime + 12){
		var endRot = 40 * (this.graphicsState.animation_time/1000 - (endTime + 9)) / 3;
		this.graphicsState.camera_transform = endRotStart;
		this.graphicsState.camera_transform = mult( rotation(-endRot, 1, 0, 0), this.graphicsState.camera_transform );
	}
	else if(this.graphicsState.animation_time/1000 < endTime + 9 && endTime > 0 && animate){
		endRotStart = this.graphicsState.camera_transform;
	}

	model_transform = ground;
	model_transform = mult(model_transform, translation(0, 50, 0));
	this.m_text.set_string( "Controls:" );
	this.m_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );		// Comment this out to not display any strings on the UI

}

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
		if(animate) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
		
		update_camera( this, this.animation_delta_time );
			
		this.basis_id = 0;
		
		var model_transform = mat4();
		center = model_transform;
			
		/**********************************
		Start coding here!!!!
		**********************************/

		animTime = this.graphicsState.animation_time;

		if(start_time = 0){
			start_time = this.graphicsState.animation_time;
		}
		this.drawScene(model_transform);
	}	



Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
	debug_screen_strings.string_map["time"] = "FPS: " + (1/(this.animation_delta_time/1000)).toFixed(1);
	debug_screen_strings.string_map["basis"] = "";
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	debug_screen_strings.string_map["thrust"] = "";
}