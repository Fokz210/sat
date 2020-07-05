

// IMPORTS
import 
{
	SphereGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
    WebGLRenderer,
    TextureLoader,
    MeshLambertMaterial,
    Matrix4,
    Vector3,
    Curve,
    TorusBufferGeometry,
    TubeBufferGeometry,
    CylinderGeometry,
    LinearFilter,
    Group
} from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from './three.js-master/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from './three.js-master/examples/jsm/loaders/OBJLoader.js'

//not used
//import { MTLLoader } from './three.js-master/examples/jsm/loaders/MTLLoader.js';

/**
 * @author fokz210 / https://github.com/Fokz210
 **/

// APP
export class SatteliteVisualizer
{
    constructor (sizeX, sizeY)
    {
        this.stlLoader = new STLLoader ();

        this.canvasSizeX = sizeX;
        this.canvasSizeY = sizeY;

        this.axis = new Mesh (new CylinderGeometry (0.05, 0.05, 1000, 128, 64), new MeshBasicMaterial ({ color: 0xc9c9c9}));
        
        this.geostat = [];

        this.loaded1 = 0;
        this.loaded2 = 0;

        for (let i = 0; i < 10; i++)
            this.geostat.push (undefined);

        this.geostatnames = 
        [
            'AMY1',
            'AM7', 
            'AM6',
            'AT1',
            'AM33',
            'AM3',
            'AM5',
            'AT2',
            'AM8',
            'AM44'
        ];

        this.lstat = [];
        this.lstatnames = 
        [
            'rv',
            'rv',
            'rv',
            'rv',
        ];

        this.lmeshes = [];
        this.geostatmesh;

        function Ellipse(xRadius, yRadius)
        {
			Curve.call( this );

			this.xRadius = xRadius;
			this.yRadius = yRadius;
		}
		
		Ellipse.prototype = Object.create( Curve.prototype );
		Ellipse.prototype.constructor = Ellipse;
		
        Ellipse.prototype.getPoint = function (t)
        {
		    var radians = 2 * Math.PI * t;
		
		    return new Vector3 (this.xRadius * Math.cos (radians), this.yRadius * Math.sin (radians), 0);
		};

        this.t = 0;

        this.lmatrix = [];
        this.lshift = [];

        this.initlMatrix();
     
        this.lPath = new Ellipse (20, 50);
       
        this.node = document.getElementById ('container');

        this.scene = new Scene ();

        this.camera = new PerspectiveCamera (75, this.canvasSizeX / this.canvasSizeY, 0.1, 1000);
        this.camera.position.z = 100;

        this.renderer = new WebGLRenderer ({ alpha: true, antialias: true });
        this.renderer.setClearColor (0x000000, 0);
        this.renderer.setPixelRatio (window.devicePixelRatio);
        this.renderer.setSize (this.canvasSizeX, this.canvasSizeY);

        this.controls = new OrbitControls (this.camera, this.renderer.domElement);
        this.controls.autoRotate = false;
        this.controls.enablePan = false;

        this.controls.setDistance = function (distance) 
        {
            this.maxDistance = distance;
            this.minDistance = distance;
            this.update();
            this.maxDistance = Infinity;
            this.minDistance = 0;
        }

        var globeGeometry = new SphereGeometry (10, 100, 100);
        this.globeTexture = new TextureLoader ().load ("textures/_map2.png");
        this.globeTexture.minFilter = LinearFilter;
        var globeMaterial = new MeshBasicMaterial ({ map: this.globeTexture });
        this.globeMesh = new Mesh (globeGeometry, globeMaterial);

        var globeCoverGeometry = new SphereGeometry (10.5, 100, 100);
        var globeCoverTex = new TextureLoader ().load ("textures/globe_cover.png");
        var globeCoverAlpha = new TextureLoader ().load ("textures/globe_cover_alpha.png");
        globeCoverTex.minFilter = LinearFilter;
        globeCoverAlpha.minFilter = LinearFilter;
        var globeCoverMaterial = new MeshBasicMaterial ({ map: globeCoverTex, transparent: true, opacity: 0.5,});
        //globeCoverMaterial.alphaMap = globeCoverAlpha;
        this.globeCoverMesh = new Mesh (globeCoverGeometry, globeCoverMaterial);

        this.scene.add (this.globeMesh);
        this.scene.add (this.globeCoverMesh);

        this.satsLoaded = false;

        this.loadSatsMeshes ();

        document.getElementById ("leftSwitch").onclick = this.focusGlobeAndSats.bind(this);
        document.getElementById ("midSwitch").onclick = this.focusSat.bind(this);
        document.getElementById ("rightSwitch").onclick = this.focusGlobe.bind(this);

        this.initPathMeshes();

        this.scene.add (this.axis);

        this.node.appendChild (this.renderer.domElement);

        this.focusGlobeAndSats ();

        this.animate();
    }

    initlMatrix ()
    {
        this.lmatrix.push (new Matrix4().makeRotationY(- Math.PI / 3 - Math.PI / 12));
        this.lmatrix[0].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[0].applyMatrix4 (this.lmatrix[0]);
        this.lmatrix[0].setPosition (this.lshift[0]);

        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI / 2 - Math.PI / 3 - Math.PI / 12));
        this.lmatrix[1].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[1].applyMatrix4 (this.lmatrix[1]);
        this.lmatrix[1].setPosition (this.lshift[1]);

        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI - Math.PI / 3 - Math.PI / 12));
        this.lmatrix[2].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[2].applyMatrix4 (this.lmatrix[2]);
        this.lmatrix[2].setPosition (this.lshift[2]);
        
        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI / 2 * 3 - Math.PI / 3 - Math.PI / 12));
        this.lmatrix[3].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[3].applyMatrix4 (this.lmatrix[3]);
        this.lmatrix[3].setPosition (this.lshift[3]);

    }

    animate ()
    {
        requestAnimationFrame (this.animate.bind(this));
        
        if (this.satsLoaded)
        {
            for (let i = 0; i < this.lstat.length; i++)
            {
                var lt = (i % 2 == 0) ? this.t : this.t + 0.5;

                if (lt > 1) lt -= 1;

                this.lmeshes[i].applyMatrix4 (new Matrix4().makeRotationY(-Math.PI / 1000));

                var pt = this.lPath.getPoint (-lt);
                pt.applyMatrix4 (this.lmatrix[i]);
                pt.applyMatrix4 (new Matrix4 ().makeRotationY (-Math.PI  * this.t));
                this.lstat[i].position.set (pt.x, pt.y, pt.z);

                var up = new Vector3 (-1, 0, 0);
                up.applyMatrix4 (this.lmatrix[i]);
                up.applyMatrix4 (new Matrix4 ().makeRotationY (-Math.PI * this.t));

                if (i == 0)
                    console.log (-180 * this.t)

                this.meshLookAt (this.lstat[i], this.globeMesh, up);

            }
        
            this.t += 0.001;
        }

        this.renderer.render (this.scene, this.camera);


        this.controls.update ();  
    }

    initSats ()
    {
        for (let i = 0; i < this.lstat.length; i++)
            this.lstat[i].scale.set (0.1, 0.1, 0.1);

        for (let i = 0; i < this.geostat.length; i++)
            this.scene.add (this.geostat[i]);

        for (let i = 0; i < this.lstat.length; i++)
            this.scene.add (this.lstat[i]);

        this.satsLoaded = true;

    }

    loadSatsMeshes ()
    {
        for (let i = 0; i < this.lstatnames.length; i++)
        {
            var that = this;


            this.stlLoader.load ('3d/' + this.lstatnames[i] + '.stl', 
                function (geometry)
                {
                    var material = new MeshBasicMaterial ({ color: 0x737373 });
                    var mesh = new Mesh (geometry, material);

                    that.lstat.push(mesh);

                    that.loaded1++;

                    if (that.loaded2 == 10 && that.loaded1 == 4)
                        that.initSats();
                });
        }
              
        this.loadSat (0, 36);
        this.loadSat (1, 39);
        this.loadSat (2, 54);
        this.loadSat (3, 57);
        this.loadSat (4, 97);
        this.loadSat (5, 103);
        this.loadSat (6, 138);
        this.loadSat (7, 142);
        this.loadSat (8, 346);
        this.loadSat (9, 349);
    }

    loadSat (index, angle)
    {
        var that = this;
        
        this.stlLoader.load ('3d/' + this.geostatnames[index] + '.stl', function (geometry)
        {
            var material = new MeshBasicMaterial ({ color: 0x737373 });
            var mesh = new Mesh (geometry, material);

            that.geostat[index] = mesh;
            that.loaded2++;

            mesh.position.x = Math.cos (that.degToRad (angle));
            mesh.position.z = Math.sin (that.degToRad (angle));

            mesh.position.x *=  70;
            mesh.position.z *= -70;

            mesh.scale.x = 0.1;
            mesh.scale.y = 0.1;
            mesh.scale.z = 0.1;

            that.meshLookAt (mesh, that.globeMesh, new Vector3 (0, 0, 1));

            if (that.loaded2 == 10 && that.loaded1 == 4)
                     that.initSats();
        });
    }

    degToRad (angle)
    {
        return angle * 0.01745;
    }

    focusSat (satMesh)
    {
        if (!this.satsLoaded)
            return;

        if (satMesh == undefined)
            satMesh = this.geostat[4];

        this.showAllSats (false);

        this.controls.target = this.geostat[4].position;
        this.controls.setDistance (20);

        this.geostatmesh.visible = false;
        
        this.geostat[4].visible = true;
    }

    focusGlobeAndSats ()
    {
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (110);

        this.showAllSats (true);
        
        this.geostatmesh.visible = true;

    }

    focusGlobe ()
    {
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (40);
        
        this.showAllSats (true);
        
        this.geostatmesh.visible = true;
    }

    meshLookAt (mesh, target, up)
    {
        var pos = new Vector3 ().copy (mesh.position);
        var rot = new Matrix4 ().lookAt (mesh.position, target.position, up);

        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;

        mesh.rotation.set (0, 0, 0);

        mesh.applyMatrix4 (rot);

        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;
    }

    initPathMeshes ()
    {
        this.geostatmesh = new Mesh 
        (
            new TorusBufferGeometry (70, 0.02, 64, 200),
            new MeshBasicMaterial ({ color: 0xc9c9c9 })
        );
        this.geostatmesh.rotation.x = Math.PI / 2;
        this.scene.add (this.geostatmesh);

        this.geostatmesh_small = new Mesh
        (
            new TorusBufferGeometry (70, 0.005, 64, 200),
            new MeshBasicMaterial ({ color: 0xc9c9c9 })
        );
        this.geostatmesh_small.rotation.x = Math.PI / 2;
        this.scene.add (this.geostatmesh_small);


        this.lmeshes.push 
        (
            new Mesh 
            (
                new TubeBufferGeometry (this.lPath, 256, 0.02, 128, true),
                new MeshBasicMaterial ({ color: 0xc9c9c9 })
            )
        );

        this.lmeshes.push (this.lmeshes[0].clone());
        this.lmeshes.push (this.lmeshes[0].clone());
        this.lmeshes.push (this.lmeshes[0].clone());

        for (let i = 0; i < this.lmeshes.length; i++)
        {
            this.lmeshes[i].applyMatrix4 (this.lmatrix[i]);
            this.scene.add (this.lmeshes[i]);
        }
    }

    showAllSats (state)
    {
        if (!this.satsLoaded)
            return;

        for (let i = 0; i < this.geostat.length; i++)
            this.geostat[i].visible = state;

        for (let i = 0; i < this.lstat.length; i++)
            this.lstat[i].visible = state;
    }

};