

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
    Vector3
} from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from './three.js-master/examples/jsm/loaders/STLLoader.js';

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

        this.geostat = [];
        this.satnames = 
        [
            'AMY1',
            'AM3', // AM1
            'AM6',
            'AT1',
            'AM3', // AM33
            'AM3',
            'AM5',
            'AM8',
            'AM3'  // AM44 
        ];

       
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
        //this.controls.maxPolarAngle = Math.PI / 2;
        //this.controls.minPolarAngle = Math.PI / 2;
        //this.controls.enablePan = false;
        //this.controls.enableZoom = false;

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
        var globeMaterial = new MeshBasicMaterial ({ map: this.globeTexture });
        this.globeMesh = new Mesh (globeGeometry, globeMaterial);

        this.scene.add (this.globeMesh);

        this.satsLoaded = false;

        this.loadSatsMeshes ();

        document.getElementById ("leftSwitch").onclick = this.focusGlobeAndSats.bind(this);
        document.getElementById ("midSwitch").onclick = this.focusSat.bind(this);
        document.getElementById ("rightSwitch").onclick = this.focusGlobe.bind(this);

        this.node.appendChild (this.renderer.domElement);
        this.animate();
    }

    animate ()
    {
        requestAnimationFrame (this.animate.bind(this));
        
        this.renderer.render (this.scene, this.camera);
    
        this.controls.update ();  
    }

    initSats ()
    {
        this.geostat[0].position.x = Math.cos (this.degToRad (36));
        this.geostat[0].position.z = Math.sin (this.degToRad (36));

        this.geostat[1].position.x = Math.cos (this.degToRad (39));
        this.geostat[1].position.z = Math.sin (this.degToRad (39));
        
        this.geostat[2].position.x = Math.cos (this.degToRad (54));
        this.geostat[2].position.z = Math.sin (this.degToRad (54));
        
        this.geostat[3].position.x = Math.cos (this.degToRad (57));
        this.geostat[3].position.z = Math.sin (this.degToRad (57));
        
        this.geostat[4].position.x = Math.cos (this.degToRad (97));
        this.geostat[4].position.z = Math.sin (this.degToRad (97));
        
        this.geostat[5].position.x = Math.cos (this.degToRad (103));
        this.geostat[5].position.z = Math.sin (this.degToRad (103));
        
        this.geostat[6].position.x = Math.cos (this.degToRad (140));
        this.geostat[6].position.z = Math.sin (this.degToRad (140));
        
        this.geostat[7].position.x = Math.cos (this.degToRad (346));
        this.geostat[7].position.z = Math.sin (this.degToRad (346));
        
        this.geostat[8].position.x = Math.cos (this.degToRad (349));
        this.geostat[8].position.z = Math.sin (this.degToRad (349));

        for (let i = 0; i < this.geostat.length; i++)
        {
            this.geostat[i].position.x *= 46;
            this.geostat[i].position.z *= -46;

            this.geostat[i].scale.x = 0.1;
            this.geostat[i].scale.y = 0.1;
            this.geostat[i].scale.z = 0.1;

            this.meshLookAt (this.geostat[i], this.globeMesh, new Vector3 (0, 0, 1));
        }

        for (let i = 0; i < this.geostat.length; i++)
            this.scene.add (this.geostat[i]);

        this.satsLoaded = true;

    }

    loadSatsMeshes ()
    {
        for (let i = 0; i < this.satnames.length; i++)
        {
            var that = this;

            this.stlLoader.load ('/3d/' + this.satnames[i] + '.stl', 
                function (geometry)
                {
                    var material = new MeshBasicMaterial ({ color: 0x737373 });
                    var mesh = new Mesh (geometry, material);

                    that.geostat.push(mesh);

                    if (that.geostat.length == 9)
                        that.initSats();
                });
        }
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

        this.controls.target = this.geostat[4].position;
        this.controls.setDistance (10);
    }

    focusGlobeAndSats ()
    {
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (100);
    }

    focusGlobe ()
    {
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (40);
    }

    meshLookAt (mesh, target, up)
    {
        var pos = new Vector3 ().copy (mesh.position);
        var rot = new Matrix4 ().lookAt (mesh.position, target.position, up);

        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;

        mesh.applyMatrix4 (rot);

        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;
    }
};