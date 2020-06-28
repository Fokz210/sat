

// IMPORTS
import 
{
	SphereGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
    WebGLRenderer,
    TextureLoader
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

        this.sats = [];
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
        this.controls.autoRotate = true;

        var globeGeometry = new SphereGeometry (10, 100, 100);
        this.globeTexture = new TextureLoader ().load ("textures/_map2.png");
        var globeMaterial = new MeshBasicMaterial ({ map: this.globeTexture });
        this.globeMesh = new Mesh (globeGeometry, globeMaterial);

        this.scene.add (this.globeMesh);

        this.loadSatsMeshes ();

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
        this.sats[0].position.x = Math.cos (this.degToRad (36));
        this.sats[0].position.z = Math.sin (this.degToRad (36));
        this.sats[0].rotation.set (0, -this.degToRad (270 - 36), 0)
        
        this.sats[1].position.x = Math.cos (this.degToRad (39));
        this.sats[1].position.z = Math.sin (this.degToRad (39));
        this.sats[1].rotation.set (0, -this.degToRad (270 - 39), 0)
        
        this.sats[2].position.x = Math.cos (this.degToRad (54));
        this.sats[2].position.z = Math.sin (this.degToRad (54));
        this.sats[2].rotation.set (0, -this.degToRad (270 - 54), 0)
        
        this.sats[3].position.x = Math.cos (this.degToRad (57));
        this.sats[3].position.z = Math.sin (this.degToRad (57));
        this.sats[3].rotation.set (0, -this.degToRad (270 - 57), 0)
        
        this.sats[4].position.x = Math.cos (this.degToRad (97));
        this.sats[4].position.z = Math.sin (this.degToRad (97));
        this.sats[4].rotation.set (0, -this.degToRad (270 - 97), 0)
        
        this.sats[5].position.x = Math.cos (this.degToRad (103));
        this.sats[5].position.z = Math.sin (this.degToRad (103));
        this.sats[5].rotation.set (0, -this.degToRad (270 - 103), 0)
        
        this.sats[6].position.x = Math.cos (this.degToRad (140));
        this.sats[6].position.z = Math.sin (this.degToRad (140));
        this.sats[6].rotation.set (0, -this.degToRad (270 - 140), 0)
        
        this.sats[7].position.x = Math.cos (this.degToRad (346));
        this.sats[7].position.z = Math.sin (this.degToRad (346));
        this.sats[7].rotation.set (0, -this.degToRad (270 - 346), 0)
        
        this.sats[8].position.x = Math.cos (this.degToRad (349));
        this.sats[8].position.z = Math.sin (this.degToRad (349));
        this.sats[8].rotation.set (0, -this.degToRad (270 - 349), 0)

        for (let i = 0; i < this.sats.length; i++)
        {
            this.sats[i].position.x *= 46;
            this.sats[i].position.z *= -46;

            this.sats[i].scale.x = 0.1;
            this.sats[i].scale.y = 0.1;
            this.sats[i].scale.z = 0.1;
        }

        for (let i = 0; i < this.sats.length; i++)
            this.scene.add (this.sats[i]);
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

                    that.sats.push(mesh);

                    if (that.sats.length == 9)
                        that.initSats();
                });
        }
    }

    degToRad (angle)
    {
        return angle * 0.01745;
    }
};