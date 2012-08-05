function WebGLRenderEngine( canvas, world ) {

    var gl              = canvas.getContext( "experimental-webgl" );

    this.gl             =                                        gl;
    this.viewportWidth  =                              canvas.width;
    this.viewportHeight =                             canvas.height;

    if( !this.gl )                     throw new NoWebGLException();

    this.projectionMat  =                             mat4.create();
    this.vertexBuff     =                         gl.createBuffer();

    gl.bindBuffer(               gl.ARRAY_BUFFER, this.vertexBuff );
    gl.bufferData(   gl.ARRAY_BUFFER, this.__vert, gl.STATIC_DRAW );

    mat4.ortho(                                  0,  canvas.width, 
                                                 0, canvas.height, 
                                                         0.1, 100, 
                                               this.projectionMat );

    var shaderProgram   =                        gl.createProgram();
    var vertexShader    =        this.fetchShader( "vertexShader" );
    var fragmentShader  =        this.fetchShader(   "fragShader" );

    gl.attachShader(                shaderProgram,   vertexShader );
    gl.attachShader(                shaderProgram, fragmentShader );

    gl.linkProgram(                                 shaderProgram );

    if ( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {

        throw new ShaderLoadFailed();

    }

    gl.useProgram(                                          shaderProgram );

    this.vertexAttrib   = gl.getAttribLocation(  shaderProgram, "aVertex" );
    this.matrixUniform  = gl.getUniformLocation( shaderProgram, "uMatrix" );

    gl.enableVertexAttribArray(                         this.vertexAttrib );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(          gl.DEPTH_TEST );

    this.draw();
}

WebGLRenderEngine.prototype.fetchShader = function( id ) {

    var gl   =                       this.gl;

    var elem = document.getElementById( id );
    if( !elem ) throw new ShaderLoadFailed();

    var content = "";
    var child   = elem.firstChild;

    while( child ) {

        if ( child.nodeType == 3 ) content += child.textContent;
        child                               = child.nextSibling;

    }

    var shader;
    if      ( elem.type == "x-shader/x-fragment" ) { shader = gl.createShader( gl.FRAGMENT_SHADER ); }
    else if ( elem.type ==   "x-shader/x-vertex" ) { shader = gl.createShader(   gl.VERTEX_SHADER ); }
    else                                           { throw                   new ShaderLoadFailed(); }

    gl.shaderSource( shader, content );
    gl.compileShader(         shader );

    if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {

        console.log( gl.getShaderInfoLog( shader ) );
        throw                 new ShaderLoadFailed();

    }

    return shader;
}

WebGLRenderEngine.prototype.draw   = function() {

    var gl           =                                           this.gl;
    var modelViewMat =                                     mat4.create();

    gl.viewport(         0, 0, this.viewportWidth, this.viewportHeight );
    gl.clear(                gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    gl.bindBuffer(                    gl.ARRAY_BUFFER, this.vertexBuff );

    gl.vertexAttribPointer(        this.vertexAttrib, this.__vertWidth, 
                                                 gl.FLOAT, false, 0, 0 );

    mat4.identity(                                        modelViewMat );
    mat4.translate(                   modelViewMat, [ 100.0, 100.0, -1.0 ] );

    mat4.multiply(      this.projectionMat, modelViewMat, modelViewMat );

    gl.uniformMatrix4fv(       this.matrixUniform, false, modelViewMat );


    gl.drawArrays(                   gl.TRIANGLES, 0, this.__vertCount );
};


WebGLRenderEngine.prototype.__vert = new Float32Array( [

     0.0,  10.0, 0.0,
     5.0, -10.0, 0.0,
    -5.0, -10.0, 0.0

] );

WebGLRenderEngine.prototype.__vertWidth = 3;
WebGLRenderEngine.prototype.__vertCount = 3;

function NoWebGLException() {} // WebGL Not Supported Error
function ShaderLoadFailed() {} // Could not Link Shaders Error