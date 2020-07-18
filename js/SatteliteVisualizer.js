// IMPORTS
import 
{
	SphereGeometry,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	Scene,
    WebGLRenderer,
    TextureLoader,
    TorusBufferGeometry,
    Matrix4,
    Vector3,
    Curve,
    TubeBufferGeometry,
    CylinderGeometry,
    LinearFilter,
    DirectionalLight,
    AmbientLight,
    ShaderMaterial,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    SphereBufferGeometry,
} from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from './three.js-master/examples/jsm/loaders/STLLoader.js';

//not used
//import { MTLLoader } from './three.js-master/examples/jsm/loaders/MTLLoader.js';

/**
 * @author fokz210 / https://github.com/Fokz210
 **/

class Beam
{
    constructor (Cfixed1, Cfixed2, Creaim1, Creaim2, KUfixed1, KUfixed2, KUreaim1, KUreaim2, KAreaim, C, Ku, Ka)
    {
        this.tLoader = new TextureLoader ();

        // BEAMS

        if (Cfixed1 != "none")
        {
            var cf1 = this.tLoader.load (Cfixed1);
            cf1.minFilter = LinearFilter;
            var mcf1 = new MeshBasicMaterial ({ transparent: true, map: cf1 });
            this.CFixed1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcf1);
        }

        if (Cfixed2 != "none")
        {  
            var cf2 = this.tLoader.load (Cfixed2);
            cf2.minFilter = LinearFilter;
            var mcf2 = new MeshBasicMaterial ({ transparent: true, map: cf2 });
            this.CFixed2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcf2);
        }

        if (Creaim1 != "none")
        {  
            var cr1 = this.tLoader.load (Creaim1);
            cr1.minFilter = LinearFilter;
            var mcr1 = new MeshBasicMaterial ({ transparent: true, map: cr1 });
            this.CReaim1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcr1);
        }

        if (Creaim2 != "none")
        {
            var cr2 = this.tLoader.load (Creaim2);
            cr2.minFilter = LinearFilter;
            var mcr2 = new MeshBasicMaterial ({ transparent: true, map: cr2 });
            this.CReaim2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcr2);
        }

        if (KUfixed1 != "none")
        {
            var kuf1 = this.tLoader.load (KUfixed1);
            kuf1.minFilter = LinearFilter;
            var mkuf1 = new MeshBasicMaterial ({ transparent: true, map: kuf1 });
            this.KUFixed1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkuf1);
        }

        if (KUfixed2 != "none")
        {
            var kuf2 = this.tLoader.load (KUfixed2);
            kuf2.minFilter = LinearFilter;
            var mkuf2 = new MeshBasicMaterial ({ transparent: true, map: kuf2 });
            this.KUFixed2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkuf2);
        }

        if (KUreaim1 != "none")
        {
            var kur1 = this.tLoader.load (KUreaim1);
            kur1.minFilter = LinearFilter;
            var mkur1 = new MeshBasicMaterial ({ transparent: true, map: kur1 });
            this.KUreaim1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkur1);
        }


        if (KUreaim2 != "none")
        {
            var kur2 = this.tLoader.load (KUreaim2);
            kur2.minFilter = LinearFilter;
            var mkur2 = new MeshBasicMaterial ({ transparent: true, map: kur2 });
            this.KUFixed2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkur2);
        }


        if (KAreaim != "none")
        {
            var ka = this.tLoader.load (KAreaim);
            ka.minFilter = LinearFilter;
            var mka = new MeshBasicMaterial ({ transparent: true, map: ka });
            this.KAReaim = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mka);
        }

        // RANGES

        if (C != "none")
        {
            var c = this.tLoader.load (C);
            c.minFilter = LinearFilter;
            var mc = new MeshBasicMaterial ({ transparent: true, map: c });
            this.c = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mc);
        }

        if (Ku != "none")
        {
            var ku = this.tLoader.load (Ku);
            ku.minFilter = LinearFilter;
            var mku = new MeshBasicMaterial ({ transparent: true, map: ku });
            this.Ku = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mku);
        }

        if (Ka != "none")
        {
            var ka = this.tLoader.load (Ka);
            ka.minFilter = LinearFilter;
            var mka = new MeshBasicMaterial ({ transparent: true, map: ka }); 
            this.Ka = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mka);
        }
    }

    addToScene (scene)
    {
        this.setVisible (false);

        var add  = function (mesh, scene2)
        {
            if (mesh != undefined)
                scene2.add (mesh);
        }

        add (this.CFixed1, scene);
        add (this.CFixed2, scene);
        add (this.CReaim1, scene);
        add (this.CReaim2, scene);
        add (this.KUFixed1, scene);
        add (this.KUFixed2, scene);
        add (this.KUReaim1, scene);
        add (this.KUReaim2, scene);
        add (this.KAReaim,  scene);

        add (this.c, scene);
        add (this.Ku, scene);
        add (this.Ka, scene);
    }

    setVisible (state)
    {
        var setVisibility = function (mesh, state)
        {
            if (mesh != undefined)
                mesh.visible = state;
        }

        setVisibility (this.CFixed1, state);
        setVisibility (this.CFixed2, state);
        setVisibility (this.CReaim1, state);
        setVisibility (this.CReaim2, state);
        setVisibility (this.KUFixed1, state);
        setVisibility (this.KUFixed2, state);
        setVisibility (this.KUreaim1, state);
        setVisibility (this.KUreaim2, state);
        setVisibility (this.KAReaim, state);

        setVisibility (this.c, state);
        setVisibility (this.Ku, state);
        setVisibility (this.Ka, state);
    }
}

// APP
function meshLookAt (mesh, target, up)
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

export class SatteliteVisualizer
{
    constructor (sizeX, sizeY)
    {
        document.getElementById ("sv9").style.opacity = 1;

        this.satData = JSON.parse(document.getElementById('sat-data').innerText);
        this.satViewChosen = 9;
        this.earthViewChosen = undefined;

        this.stlLoader = new STLLoader ();

        this.fragmentShader = document.getElementById ("2121").innerHTML;
        this.vertexShader = document.getElementById ("1212").innerHTML;

        this.canvasSizeX = sizeX;
        this.canvasSizeY = sizeY;

        this.axis = new Mesh (new CylinderGeometry (0.05, 0.05, 1000, 128, 64), new MeshPhongMaterial ({ color: 0xc9c9c9}));
        
        this.geostat = [];

        this.loaded1 = 0;
        this.loaded2 = 0;

   

        for (let i = 0; i < 10; i++)
            this.geostat.push (undefined);

        this.gAngles = 
        [
            36,
            39,
            54,
            57,
            97,
            103,
            138,
            142,
            346,
            349
        ];

        this.geostatnames = 
        [
            'AMY1',
            'Am7', 
            'AM6',
            'AT1',
            'AM33',
            'AM3',
            'AM5',
            'AT2',
            'AM8',
            'AM44'
        ];

        this.satDataRows = 
        [
            8,
            7,
            5,
            9,
            2,
            3,
            4,
            10,
            6,
            1
        ];

        this.lstat = [];
        this.lstatnames = 
        [
            'rv',
            'rv',
            'rv',
            'rv',
        ];

        this.lOrbitMeshes = [];
        this.geoStatOrbit;

        this.lnames = [];
        for (let i = 0; i < 10; i++)
            this.lnames.push (undefined);

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
        this.node.style.top = "20%";

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
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 150;
        this.controls.minDistance = 15;

        this.controls.setDistance = function (distance) 
        {
            this.maxDistance = distance;
            this.minDistance = distance;
            this.update();
            this.maxDistance = 150;
            this.minDistance = 15;
        }

        var globeGeometry = new SphereGeometry (10, 100, 100);
        this.globeTexture = new TextureLoader ().load ("textures/_map2.png");
        this.globeTexture.minFilter = LinearFilter;
        var globeMaterial = new MeshBasicMaterial ({ map: this.globeTexture, shininess: 15 });
        this.globeMesh = new Mesh (globeGeometry, globeMaterial);

        var globeCoverGeometry = new SphereGeometry (10.01, 100, 100);
        var globeCoverTex = new TextureLoader ().load ("textures/globe_cover.png");
        var globeCoverPol = new TextureLoader ().load ("textures/_edges.png");
        globeCoverTex.minFilter = LinearFilter;
        globeCoverPol.minFilter = LinearFilter;


        //globeCoverMaterial.alphaMap = globeCoverAlpha;

        var uniforms = 
        {
            tOne: { type: "t", value: globeCoverTex },
            tSec: { type: "t", value: globeCoverPol }
        };

        var globeCoverMaterial = new ShaderMaterial
        ({
            uniforms: uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });

        globeCoverMaterial.transparent = true;

        this.globeCoverMesh = new Mesh (globeCoverGeometry, globeCoverMaterial);

        this.scene.add (this.globeMesh);
        this.scene.add (this.globeCoverMesh);
        
        this.light = new DirectionalLight (0xffffff, 0.5);
        this.light.position.x = //Math.cos (Math.PI / 4) * 100;
        this.light.position.z = -100;
        this.light.position.y = 30;
        this.light.target = this.globeMesh;

        this.ambientLight = new AmbientLight (0xffffff, 0.5);

        this.scene.add (this.light);
        this.scene.add (this.ambientLight);

        this.satsLoaded = false;

        this.loadSatsMeshes ();

        document.getElementById ("leftSwitch").onclick = this.focusGlobeAndSats.bind(this);
        document.getElementById ("midSwitch").onclick = this.focusSat.bind(this);
        document.getElementById ("rightSwitch").onclick = this.focusGlobe.bind(this);

        this.initPathMeshes();

        this.scene.add (this.axis);

        this.node.appendChild (this.renderer.domElement);

        this.focusGlobeAndSats ();

        this.diskImage = document.getElementById("disk");
        this.diskDegrees = document.getElementById("disk-degrees");

        this.beams = [];

        this.loadBeams();

        this.beams[1].c.visible = true;

        console.log (this.beams);

        this.animate();
    }

    initlMatrix ()
    {
        this.lmatrix.push (new Matrix4().makeRotationY(- Math.PI / 4 - Math.PI / 12));
        this.lmatrix[0].multiply (new Matrix4().makeRotationX (0.471239));
        this.lmatrix2 = [];
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[0].applyMatrix4 (this.lmatrix[0]);
        this.lmatrix[0].setPosition (this.lshift[0]);

        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI / 2 - Math.PI / 4 - Math.PI / 12));
        this.lmatrix[1].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[1].applyMatrix4 (this.lmatrix[1]);
        this.lmatrix[1].setPosition (this.lshift[1]);

        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI - Math.PI / 4 - Math.PI / 12));
        this.lmatrix[2].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[2].applyMatrix4 (this.lmatrix[2]);
        this.lmatrix[2].setPosition (this.lshift[2]);
        
        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI / 2 * 3 - Math.PI / 4 - Math.PI / 12));
        this.lmatrix[3].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[3].applyMatrix4 (this.lmatrix[3]);
        this.lmatrix[3].setPosition (this.lshift[3]);

        this.lmatrix2.push (new Matrix4().makeRotationY(- Math.PI / 4 - Math.PI / 12));
        this.lmatrix2[0].multiply (new Matrix4().makeRotationX (0.471239));
        
        this.lmatrix2.push (new Matrix4().makeRotationY(Math.PI / 2 - Math.PI / 4 - Math.PI / 12));
        this.lmatrix2[1].multiply (new Matrix4().makeRotationX (0.471239));
        
        this.lmatrix2.push (new Matrix4().makeRotationY(Math.PI - Math.PI / 4 - Math.PI / 12));
        this.lmatrix2[2].multiply (new Matrix4().makeRotationX (0.471239));
        
        this.lmatrix2.push (new Matrix4().makeRotationY(Math.PI / 2 * 3 - Math.PI / 4 - Math.PI / 12));
        this.lmatrix2[3].multiply (new Matrix4().makeRotationX (0.471239));

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

                this.lOrbitMeshes[i].applyMatrix4 (new Matrix4().makeRotationY(-Math.PI / 1000));
               
                //this.light.position.x = 30;
                //this.light.position.z = -100;
                //this.light.applyMatrix4 (new Matrix4().makeRotationY(Math.PI - Math.PI  * this.t));
               
                var pt = this.lPath.getPoint (-lt);
                pt.applyMatrix4 (this.lmatrix[i]);
                pt.applyMatrix4 (new Matrix4 ().makeRotationY (-Math.PI  * this.t));
                this.lstat[i].position.set (pt.x, pt.y, pt.z);

                var up = new Vector3 (0, 0, 1);
                up.applyMatrix4 (this.lmatrix2[i]);
                up.applyMatrix4 (new Matrix4 ().makeRotationY (-Math.PI * this.t));

                meshLookAt (this.lstat[i], this.globeMesh, up);

                this.light

            }
        
            this.t += 0.001;
        }

        this.renderer.render (this.scene, this.camera);
        this.controls.update ();  

        this.updateDisk();
    }

    updateDisk ()
    {
        var angle = Math.atan2 (this.camera.position.z, this.camera.position.x);
        angle /= Math.PI;
        angle *= 180;
        this.diskImage.style.transform = "rotate(" + angle + "deg)";

        var text;

        if (angle < 0)
            text = "" + (-angle.toFixed(1)) + "° в.д.";
        else 
            text = "" + angle.toFixed(1) + "° з.д.";

        this.diskDegrees.innerText = text;
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

        this.bindSatsChooser();

    }

    loadSatsMeshes ()
    {
        for (let i = 0; i < this.lstatnames.length; i++)
        {
            var that = this;


            this.stlLoader.load ('3d/' + this.lstatnames[i] + '.stl', 
                function (geometry)
                {
                    var material = new MeshPhongMaterial ({ color: 0x737373 });
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
            var material = new MeshPhongMaterial ({ color: 0x838383 });
            var mesh = new Mesh (geometry, material);

            var labelTex = new TextureLoader().load ("textures/" + that.geostatnames[index] + ".png");
            labelTex.minFilter = LinearFilter;
            var labelMat = new MeshBasicMaterial ({ map: labelTex, transparent: true });
            var label = new Mesh (new PlaneBufferGeometry (1.68, 0.26), labelMat);

            that.scene.add (label);

            that.geostat[index] = mesh;
            that.loaded2++;

            mesh.position.x = Math.cos (that.degToRad (angle));
            mesh.position.z = Math.sin (that.degToRad (angle));

            mesh.position.x *=  70;
            mesh.position.z *= -70;

            mesh.scale.x = 0.1;
            mesh.scale.y = 0.1;
            mesh.scale.z = 0.1;

            label.position.x = Math.cos (that.degToRad (angle - 0.01));
            label.position.z = Math.sin (that.degToRad (angle - 0.01));

            label.position.x *=  70.35;
            label.position.z *= -70.35;

            that.lnames[index] = label;
            
            meshLookAt (mesh, that.globeMesh, new Vector3 (0, 0, 1));
            meshLookAt (label, that.globeMesh, new Vector3 (0, 0, 1));

            label.position.y = 3;

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
            satMesh = this.geostat[this.satViewChosen];

        this.showAllSats (false);
        this.showAllOrbit (false);

        //this.controls.target = this.geostat[4].position;
        //this.controls.setDistance (20);

        this.camera.position.x = Math.cos (this.degToRad (this.gAngles[this.satViewChosen] - 2)) * 85;
        this.camera.position.z = Math.sin (this.degToRad (this.gAngles[this.satViewChosen] - 2)) * -85;
        this.camera.position.y = 0.5;

        this.controls.update();
        
        this.geostat[this.satViewChosen].visible = true;
        this.lnames[this.satViewChosen].visible = true;
        this.geoStatOrbitSmall.visible = true;

        this.light.position.x = this.camera.position.x;
        this.light.position.z = this.camera.position.z;

        
        this.ambientLight.intensity = 0.5;
        this.light.intensity = 0.5;

    }

    focusGlobeAndSats ()
    {
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (110);

        this.showAllSats (true);
        this.showAllOrbit (true);

        this.ambientLight.intensity = 1;
        this.light.intensity = 0;
    }

    focusGlobe ()
    {
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (40);
        
        this.showAllSats (false);
        this.showAllOrbit (false);

        
        this.ambientLight.intensity = 1;
        this.light.intensity = 0;
    }


    initPathMeshes ()
    {
        this.geoStatOrbit = new Mesh 
        (
            new TorusBufferGeometry (70, 0.02, 64, 200),
            new MeshPhongMaterial ({ color: 0xc9c9c9, shininess: 0})
        );
        this.geoStatOrbit.rotation.x = Math.PI / 2;
        this.scene.add (this.geoStatOrbit);

        this.geoStatOrbitSmall = new Mesh
        (
            new TorusBufferGeometry (70, 0.005, 64, 200),
            new MeshPhongMaterial ({ color: 0xc9c9c9, shininess: 0 })
        );
        this.geoStatOrbitSmall.rotation.x = Math.PI / 2;
        this.scene.add (this.geoStatOrbitSmall);


        this.lOrbitMeshes.push 
        (
            new Mesh 
            (
                new TubeBufferGeometry (this.lPath, 256, 0.02, 128, true),
                new MeshPhongMaterial ({ color: 0xc9c9c9, shininess: 0 })
            )
        );

        this.lOrbitMeshes.push (this.lOrbitMeshes[0].clone());
        this.lOrbitMeshes.push (this.lOrbitMeshes[0].clone());
        this.lOrbitMeshes.push (this.lOrbitMeshes[0].clone());

        for (let i = 0; i < this.lOrbitMeshes.length; i++)
        {
            this.lOrbitMeshes[i].applyMatrix4 (this.lmatrix[i]);
            this.scene.add (this.lOrbitMeshes[i]);
        }
    }

    showAllSats (state)
    {
        if (!this.satsLoaded)
            return;

        for (let i = 0; i < this.geostat.length; i++)
        {
            this.geostat[i].visible = state;
            this.lnames[i].visible = state;
        }

        for (let i = 0; i < this.lstat.length; i++)
            this.lstat[i].visible = state;
    }

    showAllOrbit (state)
    {
        for (let i = 0; i < this.lOrbitMeshes.length; i++)
        {
            this.lOrbitMeshes[i].visible = state;
        }

        this.geoStatOrbit.visible = state;
        this.geoStatOrbitSmall.visible = state;
        this.axis.visible = state;
    }

    bindSvSat (index)
    {
        document.getElementById ("sv" + index).onclick = function ()
        {
            this.satViewChosen = index;

            var a = this.satData[this.satDataRows[index]].a;
            var b = this.satData[this.satDataRows[index]].b;
            var c = this.satData[this.satDataRows[index]].c;
            var e = this.satData[this.satDataRows[index]].e;
            var f = this.satData[this.satDataRows[index]].f;
            var g = this.satData[this.satDataRows[index]].g;
            var h = this.satData[this.satDataRows[index]].h;
            var i = this.satData[this.satDataRows[index]].i;
            var j = this.satData[this.satDataRows[index]].j;
            var k = this.satData[this.satDataRows[index]].k;

            var def = function (a)
            {
                if (a == undefined)
                    return "";
                else
                    return a;
            }

            document.getElementById("svda").innerHTML = def(a);
            document.getElementById("svdb").innerHTML = def(b);
            document.getElementById("svdc").innerHTML = def(c);
            document.getElementById("svde").innerHTML = def(e);
            document.getElementById("svdf").innerHTML = def(f);
            document.getElementById("svdg").innerHTML = def(g);
            document.getElementById("svdh").innerHTML = def(h);
            document.getElementById("svdi").innerHTML = def(i);
            document.getElementById("svdj").innerHTML = def(j);
            document.getElementById("svdk").innerHTML = def(k);

            this.focusSat();

        }.bind(this);
    }

    bindSatsChooser ()
    {
        console.log (this.satData);

        this.bindSvSat (0);
        this.bindSvSat (1);
        this.bindSvSat (2);
        this.bindSvSat (3);
        this.bindSvSat (4);
        this.bindSvSat (5);
        this.bindSvSat (6);
        this.bindSvSat (7);
        this.bindSvSat (8);
        this.bindSvSat (9);
    }

    loadBeams()
    {
        this.beams.push (new Beam ("none", "none", "none", "none", "./beams/AMU1_afr.png", "./beams/AMU1_rus.png", "none", "none", "./beams/AMU1_ka.png", "none", "./bands/AMU1-Ku.png", "./bands/AMU1-Ka.png"));  
        this.beams.push (new Beam ("./beams/AM7_FC.png", "./beams/AM7_SC.png", "none", "none", "./beams/AM7_FK1.png", "./beams/AM7_FK2.png", "./beams/AM7_FK3.png", "./beams/AM7_SK.png", "none", "./bands/AM7-C.png", "./bands/AM7-Ku.png", "none"));
        this.beams.push (new Beam ("./beams/AM6_FC1.png", "./beams/AM6_FC2.png", "none", "none", "./beams/AM6_FK1.png", "./beams/AM6_FK2.png", "./beams/AM6_STK1.png", "./beams/AM6_STK2.png", "./beams/AM6_KaMB.png", "./bands/AM6-C.png", "./bands/AM6-Ku.png", "none"));
        this.beams.push (new Beam ("none", "none", "none", "none", "./beams/AT1_FK-east.png", "./beams/AT1_FK-wide.png", "none", "none", "none", "none", "none", "./bands/AT1-Ku.png", "none"));
        this.beams.push (new Beam ("./beams/AM33_S1.png", "none", "none", "none", "./beams/AM33_ST1.png", "./beams/AM33_ST2.png", "none", "none", "none", "./bands/AM33-C.png", "none", "none"));
        this.beams.push (new Beam ("./beams/AM3_FC.png", "./beams/AM3_SC.png", "none", "none", "./beams/AM3_FK.png", "./beams/AM3_SK.png", "none", "none", "none", "./bands/AM3-C copy.png", "./bands/AM3-Ku.png", "none"));
        this.beams.push (new Beam ("./beams/AM5_FC.png", "./beams/AM5_SC.png", "none", "none", "./beams/AM5_FK1.png", "./beams/AM5_FK2.png", "none", "none", "none", "./bands/AM5-C.png", "./bands/AM5-Ku.png", "./bands/AM5-Ka.png"));
        this.beams.push (new Beam ("none", "none", "none", "none", "./beams/AT2_FK-west.png", "none", "none", "none", "none", "none", "./bands/AT2-Ku.png", "none"));
        this.beams.push (new Beam ("./beams/AM8_FC1.png", "./beams/AM8_FC2.png", "none", "none", "./beams/AM8_FK1.png", "./beams/AM8_FK2.png", "./beams/AM8_FK3.png", "none", "none", "none", "./bands/AM8-Ku.png", "none"));
        this.beams.push (new Beam ("./beams/AM44_S1.png", "none", "none", "none", "./beams/AM44_ST1.png", "./beams/AM44_ST2.png", "none", "none", "none", "./bands/AM44-C.png", "./bands/AM44-Ku.png", "none"));
    
        for (let i = 0; i < 10; i++)
        {
            this.beams[i].addToScene (this.scene);
        }
    }

};