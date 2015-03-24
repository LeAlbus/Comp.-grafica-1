var	vertexShaderSource, 
	fragmentShaderSource,
	vertexShader,
	fragmentShader,
	shaderProgram,
	canvas,
	gl,
	data;
	
	//atributos
	
var positionBuffer,
	colorBuffer,
	positionAttr,
	colorAttr;

//tres matrizes	
var model,
	modelLocation,
	view, 
	viewLocation,
	projection,
	projectionLocation;
	
	//camera, deeer
var camera;
	
	
window.addEventListener("SHADERS_LOADED", main);
loadFile("vertex.glsl","VERTEX",loadShader);
loadFile("fragment.glsl","FRAGMENT",loadShader);

function loadFile(filename, type, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("GET",filename,true);
	xhr.onload = function(){callback(xhr.responseText,type)};
	xhr.send();
}

function getGLContext(){
	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.enable(gl.DEPTH_TEST);
}

function loadShader(text,type){
	if(type == "VERTEX") vertexShaderSource = text;
	if(type == "FRAGMENT") fragmentShaderSource = text;
	if(vertexShaderSource && fragmentShaderSource) window.dispatchEvent(new Event("SHADERS_LOADED"));
}

function compileShader(source,type){
	shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(shader));
	return shader;
}

function linkProgram(vertexShader,fragmentShader){
	var program	= gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.log("Error: Program Linking.");
	return program;
}

function getData(){
	
	
	var p = [
		[-0.5,0.5,-0.5],
		[0.5,0.5,-0.5],
		[0.5,0.5,0.5],
		[-0.5,0.5,0.5],
		[-0.5,-0.5,-0.5],
		[0.5,-0.5,-0.5],
		[0.5,-0.5,0.5],
		[-0.5,-0.5,0.5]
	];
	var faces = [
	//desenha os triangulos das faces, dois de cada lado
		p[0],p[1],p[2],
		p[0],p[2],p[3],
		
		p[0],p[3],p[4],
		p[3],p[4],p[7],
		
		p[0],p[1],p[4],
		p[1],p[4],p[5],
		
		p[1],p[2],p[5],
		p[2],p[5],p[6],
		
		p[4],p[5],p[6],
		p[4],p[6],p[7],
		
		p[2],p[3],p[6],
		p[3],p[6],p[7]
	];
	
	var c = [
	//cores das faces
		[1,0,0,1],
		[0,1,0,1],
		[0,0,1,1],
		[1,1,0,1],
		[0,1,1,1],
		[1,0,1,1]
	];
	
	var colors = [
	//seis pontos. e seis lados
		c[0],c[0],c[0],c[0],c[0],c[0],
		c[1],c[1],c[1],c[1],c[1],c[1],
		c[2],c[2],c[2],c[2],c[2],c[2],
		c[3],c[3],c[3],c[3],c[3],c[3],
		c[4],c[4],c[4],c[4],c[4],c[4],
		c[5],c[5],c[5],c[5],c[5],c[5]
	];
	
	return {
		"points": new Float32Array(flatten(faces)),
		"colors": new Float32Array(flatten(colors)),
		
	};
}

function flatten(nested){
	var flat = [];//joga os numeros do vetor, um por vez, para o shadder
	for(var i=0; i < nested.length; i++){
		flat = flat.concat(nested[i]);
	}
	return flat;
}

function main() {
	/* LOAD GL */
	getGLContext();
	
	/* COMPILE AND LINK */
	vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
	fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
	shaderProgram = linkProgram(vertexShader,fragmentShader);
	gl.useProgram(shaderProgram);
	
	/* UNIFORMS */
	model = mat4.create();
	modelLocation = gl.getUniformLocation(shaderProgram,"model");
	gl.uniformMatrix4fv(modelLocation, false, new Float32Array(model));
	
	view = mat4.lookAt([],[10,10,-20],[0,0,0],[0,1,0]);//posicao da camera, pra onde ela ta olhando, e para onde eh "pra cima"
	viewLocation = gl.getUniformLocation(shaderProgram,"view");
	gl.uniformMatrix4fv(viewLocation, false, new Float32Array(view));
	
	projection = mat4.perspective([],50, canvas.width/canvas.height, 0.1, 100);
	projectionLocation = gl.getUniformLocation(shaderProgram,"projection");
	gl.uniformMatrix4fv(projectionLocation, false, new Float32Array(projection));
	
	
	/* ATTRIBUTES */
	data = getData();
	
	positionAttr = gl.getAttribLocation(shaderProgram, "position");
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, data.points, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionAttr);
	gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);
	
	colorAttr = gl.getAttribLocation(shaderProgram, "color");
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, data.colors, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(colorAttr);
	gl.vertexAttribPointer(colorAttr, 4, gl.FLOAT, false, 0, 0);
	
	/* DRAW */
	//gl.lineWidth(5.0);
	//gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	gl.drawArrays(gl.TRIANGLES, 0, data.points.length/3);
	
	
	
		 //listener
	canvas.addEventListener("mousedown", seleciona);
}


	function seleciona(click) {
		if(click.button == 0)
		{
			draw();
			console.log(click);
		}
		else
		{
			undraw();
			console.log(click);
		}
	}
	
	function draw(){
	
	if(!camera) camera = [10,10,-20];
	//camera[2] += -0.1;
	
	view = mat4.lookAt([],camera,[0,0,0],[0,1,0]);
	gl.uniformMatrix4fv(viewLocation, false, new Float32Array(view));
	
	//model = mat4.rotate([], model,5*Math.PI/180,[0,1,0]);
	model = mat4.rotate([], model,5*Math.PI/180,[1,0,0]);
	//cada linha faz o objeto girar em uma direçao, dependendo do ultimo parametro
	gl.uniformMatrix4fv(modelLocation, false, new Float32Array(model));
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,data.points.length/3);
	
	requestAnimationFrame(draw); //chama a função recursivamente
}
function undraw(){
	
	if(!camera) camera = [10,10,-20];
	camera[2] += -0.001;
	
	view = mat4.lookAt([],camera,[0,0,0],[0,1,0]);
	gl.uniformMatrix4fv(viewLocation, false, new Float32Array(view));
	
	model = mat4.rotate([], model,50*Math.PI/180,[0,1,0]);
	model = mat4.rotate([], model,0*Math.PI/180,[0,1,1]);
	//cada linha faz o objeto girar em uma direçao, dependendo do ultimo parametro
	gl.uniformMatrix4fv(modelLocation, false, new Float32Array(model));
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,data.points.length/3);
	
	requestAnimationFrame(undraw); //chama a função recursivamente
}



