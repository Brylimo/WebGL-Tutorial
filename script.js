let gl;
let gl1;
let gl2;

const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

let drag = false;
let pre_x = 0.0, pre_y = 0.0;
let image;
let count = 1;

const init = (event) => {
	const canvas3 = document.getElementById('canvas3');
	const ctx = canvas3.getContext('2d');
	
	ctx.fillStyle = 'white'; 

	ctx.fillRect(0, 0, canvas3.width, canvas3.height);

	ctx.fillStyle = 'black';

	ctx.lineWidth = 10;
	// house
	ctx.strokeRect(75, 140, 150, 110);

	ctx.fillRect(130, 190, 40, 60);

	ctx.beginPath();
	ctx.moveTo(50, 140);
	ctx.lineTo(150, 60);
	ctx.lineTo(250, 140);
	ctx.closePath();
	ctx.stroke();
}

if (window.addEventListener) {
	window.addEventListener('load', init, false);
}

function isPowerOfTwo(x) {
    return x && !(x & (x - 1));
}

function apply(e) {
	const can3 = document.querySelector('#canvas3');
	const dataURL = can3.toDataURL();
    image.src = dataURL;
}

function testGLError(functionLastCalled) {
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas1, canvas2, canvas3) {
    try {
		gl1 = canvas1.getContext('webgl', {stencil:true, alpha:true, depth:true, antialias:true, preserveDrawingBuffer:false})
		 || canvas1.getContext("experimental-webgl", {stencil:true, alpha:true, depth:true, antialias:true, preserveDrawingBuffer:false});
		gl1.viewport(0, 0, canvas1.width, canvas1.height);
		gl2 = canvas2.getContext('webgl', {stencil:true, alpha:true, depth:true, antialias:true, preserveDrawingBuffer:false})
		|| canvas2.getContext("experimental-webgl", {stencil:true, alpha:true, depth:true, antialias:true, preserveDrawingBuffer:false});
	   gl2.viewport(0, 0, canvas2.width, canvas2.height);
    }
    catch (e) {
    }

    if (!gl1 || !gl2) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }
    return true;
}

let shaderProgram;

const vertexData1 = [
		// Backface (RED/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
        -0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
        -0.5,  0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0, 1.0, 1.0, 
		// Front (BLUE/WHITE) -> z = 0.5
        -0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
         0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
		 0.5,  0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		 -0.5,  0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
		// LEFT (GREEN/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, 
		// RIGHT (YELLOW/WHITE) -> z = 0.5
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
		 0.5,  0.5,  0.5,  1.0, 1.0, 0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		 0.5, -0.5,  0.5,  1.0, 1.0, 0.0, 1.0,
		// BOTTON (MAGENTA/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
		 0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0,
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		 -0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0,
		// TOP (CYAN/WHITE) -> z = 0.5
        -0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0,
         0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0 
];

const vertexData2 = [
	// Backface (RED/WHITE) -> z = 0.5
	-0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
	 0.5,  0.5, -0.5,  1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
	 0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0, 0.0, 1.0,
	-0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
	-0.5,  0.5, -0.5,  1.0, 0.0, 0.0, 1.0, 1.0, 0.0,
	 0.5,  0.5, -0.5,  1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
	// Front (BLUE/WHITE) -> z = 0.5
	-0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
	 0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	 0.5, 0.5,  0.5,  0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
	-0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
	 0.5, 0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
	 -0.5, 0.5,  0.5,  0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
	// LEFT (GREEN/WHITE) -> z = 0.5
	-0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0, 1.0, 1.0,
	-0.5,  0.5,  0.5,  0.0, 1.0, 0.0, 1.0, 0.0, 0.0,
	-0.5,  0.5, -0.5,  0.0, 1.0, 0.0, 1.0, 1.0, 0.0,
	-0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0, 1.0, 1.0,
	-0.5, -0.5,  0.5,  0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
	-0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, 0.0, 0.0,
	// RIGHT (YELLOW/WHITE) -> z = 0.5
	 0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
	 0.5,  0.5, -0.5,  1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
	 0.5,  0.5,  0.5,  1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
	 0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
	 0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
	 0.5, -0.5,  0.5,  1.0, 1.0, 0.0, 1.0, 1.0, 1.0,
	// BOTTON (MAGENTA/WHITE) -> z = 0.5
	-0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
	 0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	 0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0, 0.0, 0.0,
	-0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
	 0.5, -0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
	 -0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0, 1.0, 0.0,
	// TOP (CYAN/WHITE) -> z = 0.5
	-0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
	 0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, 0.0, 1.0,
	 0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0, 0.0, 0.0,
	-0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
	-0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
	 0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 0.0, 1.0
];


function initialiseBuffer1() {

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData1), gl.STATIC_DRAW);

    return testGLError("initialiseBuffers");
}

let tex;
function initialiseBuffer2() {

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData2), gl.STATIC_DRAW);

	tex = gl.createTexture();
	image = new Image();
	image.src = "./images/ham.jpg";
	
	image.addEventListener('load', function() {
		if (!isPowerOfTwo(this.width) || !isPowerOfTwo(this.height)) {
			alert("Only power of two textures are supported.");
			return testGLError("initialiseBuffers");
		}

		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	});

    return testGLError("initialiseBuffers");
}

function initialiseShaders1() {

    const fragmentShaderSource1 = `
			varying highp vec4 col; 
			void main(void) 
			{ 
				gl_FragColor = col;
			}`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource1);
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    const vertexShaderSource1 = `
			attribute highp vec4 myVertex; 
			attribute highp vec4 myColor; 
			uniform mediump mat4 mMat; 
			uniform mediump mat4 vMat; 
			uniform mediump mat4 pMat; 
			varying  highp vec4 col;
			void main(void)  
			{ 
				gl_Position = pMat * vMat * mMat * myVertex; 
				gl_PointSize = 8.0;
				col = myColor; 
			}`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource1);
    gl.compileShader(gl.vertexShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);
    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    // Link the program
    gl.linkProgram(gl.programObject);
    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

function initialiseShaders2() {

    const fragmentShaderSource2 = `
			varying highp vec4 col; 
			varying highp vec2 uv;
			uniform sampler2D tex;
			void main(void) 
			{ 
				gl_FragColor = texture2D(tex, uv);
			}`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource2);
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    const vertexShaderSource2 = `
			attribute highp vec4 myVertex; 
			attribute highp vec4 myColor; 
			attribute highp vec2 myUV; 
			uniform mediump mat4 mMat; 
			uniform mediump mat4 vMat; 
			uniform mediump mat4 pMat; 
			varying  highp vec4 col;
			varying  highp vec2 uv;
			void main(void)  
			{ 
				gl_Position = pMat * vMat * mMat * myVertex; 
				gl_PointSize = 8.0;
				col = myColor; 
				uv = myUV;
			}`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource2);
    gl.compileShader(gl.vertexShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);
    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
	gl.bindAttribLocation(gl.programObject, 2, "myUV");
    // Link the program
    gl.linkProgram(gl.programObject);
    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

function updateBuffer() {
	for (var i=0; i< 6; i++)
	{
		if (vertexData2[i*54+7] >= 1) vertexData2[i*54+7] = count;
		if (vertexData2[i*54+16] >= 1) vertexData2[i*54+16] = count;
		if (vertexData2[i*54+25] >= 1) vertexData2[i*54+25] = count;
		if (vertexData2[i*54+34] >= 1) vertexData2[i*54+34] = count;
		if (vertexData2[i*54+43] >= 1) vertexData2[i*54+43] = count;
		if (vertexData2[i*54+52] >= 1) vertexData2[i*54+52] = count;
		if (vertexData2[i*54+8] >= 1) vertexData2[i*54+8] = count;
		if (vertexData2[i*54+17] >= 1) vertexData2[i*54+17] = count;
		if (vertexData2[i*54+26] >= 1) vertexData2[i*54+26] = count;
		if (vertexData2[i*54+35] >= 1) vertexData2[i*54+35] = count;
		if (vertexData2[i*54+44] >= 1) vertexData2[i*54+44] = count;
		if (vertexData2[i*54+53] >= 1) vertexData2[i*54+53] = count;
	}
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData2), gl.STATIC_DRAW);

    return testGLError("updateBuffers");
}

let xRot1 = 0.0;
let yRot1 = 0.0;
let zRot1 = 0.0;
let xRot2 = 0.0;
let yRot2 = 0.0;
let zRot2 = 0.0;
let speedRot = 0.01; 

let flag_animation = 0; 

function fn_speed_scale(a)
{
	speedRot *= a; 
}

let draw_mode = 4; // 4 Triangles, 3 line_strip 0-Points

function fn_draw_mode(a)
{
	draw_mode = a;
}

let fov_degree = 90.0; 
function fn_update_fov(val)
{
	document.getElementById('textFOV').innerHTML=val; 
	fov_degree = val; 
}

function counter(event) {
	count = document.querySelector('#count').value;
	updateBuffer();
}

function fn_toggle(mode)
{
	if (gl.isEnabled(mode))
		gl.disable(mode);
	else
		gl.enable(mode); 
}

function fn_depth_mode(val)
{
	gl.depthFunc(val);
}

let mMat1, vMat1, pMat1; 
let mMat2, vMat2, pMat2;
let depth_clear_value = 1.0; 

let red = 255.0 / 255.0, green = 235.0 / 255.0, blue = 227.0 / 255.0, alpha = 255.0 / 255.0; // default

function renderScene() {
	gl = gl1;
	gl.enable(gl.DEPTH_TEST); // Enable depth test
    gl.clearColor(1.0, 0.92, 0.89, 1);
	gl.clearDepth(depth_clear_value); // Added for depth Test 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// Added for depth Test 
	
    const mMatLocation = gl.getUniformLocation(gl.programObject, "mMat");
	const vMatLocation = gl.getUniformLocation(gl.programObject, "vMat");
	const pMatLocation = gl.getUniformLocation(gl.programObject, "pMat");
    pMat1 = mat4.create(); 
	vMat1 = mat4.create(); 
	mMat1 = mat4.create();  
	mat4.perspective(pMat1, 90 * Math.PI / 180.0 , 1 , 0.5, 8); 
	mat4.lookAt(vMat1, [0,0,2], [0,0,0], [0,1,0]);
	mat4.rotateX(mMat1, mMat1, xRot1);
	mat4.rotateY(mMat1, mMat1, yRot1);
	
	gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat1 );
	gl.uniformMatrix4fv(vMatLocation, gl.FALSE, vMat1 );
	gl.uniformMatrix4fv(pMatLocation, gl.FALSE, pMat1 );

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }
	gl.drawArrays(draw_mode, 0, 36); 
	
    if (!testGLError("gl.drawArrays")) {
        return false;
    }

	gl = gl2;
	gl.enable(gl.DEPTH_TEST); // Enable depth test
    gl.clearColor(red, green, blue, alpha);
	gl.clearDepth(depth_clear_value); // Added for depth Test 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// Added for depth Test 
	
    const mMatLocation2 = gl.getUniformLocation(gl.programObject, "mMat");
	const vMatLocation2 = gl.getUniformLocation(gl.programObject, "vMat");
	const pMatLocation2 = gl.getUniformLocation(gl.programObject, "pMat");
    pMat2 = mat4.create(); 
	vMat2 = mat4.create(); 
	mMat2 = mat4.create();  
	mat4.perspective(pMat2, fov_degree * Math.PI / 180.0 , 1 , 0.5, 8); 
	mat4.lookAt(vMat2, [0,0,2], [0,0,0], [0,1,0]);
	mat4.rotateX(mMat2, mMat2, xRot2);
	mat4.rotateY(mMat2, mMat2, yRot2);
	
	var texLocation = gl.getUniformLocation(gl.programObject, "tex");

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.uniform1i(texLocation, 0);

	gl.uniformMatrix4fv(mMatLocation2, gl.FALSE, mMat2 );
	gl.uniformMatrix4fv(vMatLocation2, gl.FALSE, vMat2 );
	gl.uniformMatrix4fv(pMatLocation2, gl.FALSE, pMat2 );

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 36, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 36, 12);
	gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 36, 28);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

	gl.drawArrays(draw_mode, 0, 36); 
	
    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function resizedataURL(datas, wantedWidth, wantedHeight) {
    let img = document.createElement('img');
    img.onload = function () {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = wantedWidth;
        canvas.height = wantedHeight;
        ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);
        let dataURI = canvas.toDataURL();

        image.src = dataURI;
    };
    img.src = datas;
}

function modeChanged_textureMINFILTER() {
    var mode = document.getElementById("selectTextureModeMINFILTER").value;
    textureModeMINFILTER = mode;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, textureModeMINFILTER);
}

function modeChanged_textureMAGFILTER() {
    var mode = document.getElementById("selectTextureModeMAGFILTER").value;
    textureModeMAGFILTER = mode;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, textureModeMAGFILTER);
}

function modeChanged_textureWrapT() {
    var mode = document.getElementById("selectTextureModeWRAPT").value;
    textureModeWRAPT = mode;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, textureModeWRAPT);
}

function modeChanged_textureWrapS() {
    var mode = document.getElementById("selectTextureModeWRAPS").value;
    textureModeWRAPS = mode;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, textureModeWRAPS);
}


function main() {
    const canvas1 = document.getElementById("canvas1");
	const canvas2 = document.getElementById("canvas2");

	let red_changer = document.querySelector("#red");
	let red_value = document.querySelector("#red-value");
	red_value.innerHTML = red_changer.value;
	red_changer.oninput = () => {
        red_value.innerHTML = red_changer.value;
        red = red_changer.value / 255;
    };

	let green_changer = document.querySelector("#green");
	let green_value = document.querySelector("#green-value");
	green_value.innerHTML = green_changer.value;
	green_changer.oninput = () => {
        green_value.innerHTML = green_changer.value;
        green = green_changer.value / 255;
    };

	let blue_changer = document.querySelector("#blue");
	let blue_value = document.querySelector("#blue-value");
	blue_value.innerHTML = blue_changer.value;
	blue_changer.oninput = () => {
        blue_value.innerHTML = blue_changer.value;
        blue = blue_changer.value / 255;
    };

	let alpha_changer = document.querySelector("#alpha");
	let alpha_value = document.querySelector("#alpha-value"); 
	alpha_value.innerHTML = alpha_changer.value;
	alpha_changer.oninput = () => {
        alpha_value.innerHTML = alpha_changer.value;
        alpha = alpha_changer.value / 255;
    };

	let mousedownhandler = (event) => {
		drag = true;
		pre_x = event.pageX; pre_y = event.pageY;
		event.preventDefault();
	}

	let mouseuphandler = (event) => {
		drag = false;
	}

	let mousemovehandler1 = (event) => {
		if (!drag) return false;

		const gap_x = event.pageX - pre_x;
		const gap_y = event.pageY - pre_y;

		yRot1 += gap_x * 2 * Math.PI / canvas1.width;
		xRot1 += gap_y * 2 * Math.PI / canvas1.height;
		pre_x = event.pageX;
		pre_y = event.pageY;
		event.preventDefault();
	}

	let mousemovehandler2 = (event) => {
		if (!drag) return false;

		const gap_x = event.pageX - pre_x;
		const gap_y = event.pageY - pre_y;

		yRot2 += gap_x * 2 * Math.PI / canvas2.width;
		xRot2 += gap_y * 2 * Math.PI / canvas2.height;
		pre_x = event.pageX;
		pre_y = event.pageY;
		event.preventDefault();
	}

	canvas1.addEventListener("mousedown", mousedownhandler, false);
	canvas1.addEventListener("mouseup", mouseuphandler, false);
	canvas1.addEventListener("mouseout", mouseuphandler, false);
	canvas1.addEventListener("mousemove", mousemovehandler1, false);

	canvas2.addEventListener("mousedown", mousedownhandler, false);
	canvas2.addEventListener("mouseup", mouseuphandler, false);
	canvas2.addEventListener("mouseout", mouseuphandler, false);
	canvas2.addEventListener("mousemove", mousemovehandler2, false);

    if (!initialiseGL(canvas1, canvas2)) {
        return;
    }

	gl = gl1;
    if (!initialiseBuffer1()) {
        return;
    }

	gl = gl2;
    if (!initialiseBuffer2()) {
        return;
    }

	gl = gl1;
    if (!initialiseShaders1()) {
        return;
    }

	gl = gl2;
    if (!initialiseShaders2()) {
        return;
    }

	function readFile() {
        if (this.files && this.files[0]) {
            let type = this.files[0].type.split('/')[0]

            let FR = new FileReader();
            FR.addEventListener("load", function (e) {
                resizedataURL(e.target.result, 128, 128);
                document.getElementById("img").src = e.target.result;
            });
            FR.readAsDataURL(this.files[0]);
        }
	}

	document.getElementById("file").addEventListener("change", readFile);

    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function (callback) {
			    window.setTimeout(callback, 1000, 60);
			};
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
