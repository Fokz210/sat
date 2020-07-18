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

        var geometry = new SphereBufferGeometry (10, 64, 64);

        // BEAMS

        if (Cfixed1 != "none")
        {
            var cf1 = this.tLoader.load (Cfixed1);
            var mcf1 = new MeshBasicMaterial ({ transparent: true, map: cf1 });
            this.CFixed1 = new Mesh (geometry.copy(), mcf1);
        }

        if (Cfixed2 != "none")
        {  
            var cf2 = this.tLoader.load (Cfixed2);
            var mcf2 = new MeshBasicMaterial ({ transparent: true, map: cf2 });
            this.CFixed2 = new Mesh (geometry.copy(), mcf2);
        }

        if (Creaim1 != "none")
        {  
            var cr1 = this.tLoader.load (Creaim1);
            var mcr1 = new MeshBasicMaterial ({ transparent: true, map: cr1 });
            this.CReaim1 = new Mesh (geometry.copy(), mcr1);
        }

        if (Creaim2 != "none")
        {
            var cr2 = this.tLoader.load (Creaim2);
            var mcr2 = new MeshBasicMaterial ({ transparent: true, map: cr2 });
            this.CReaim2 = new Mesh (geometry.copy(), mcr2);
        }

        if (KUfixed1 != "none")
        {
            var kf1 = this.tLoader.load (KUfixed1);
            var mkf1 = new MeshBasicMaterial ({ transparent: true, map: kf1 });
            this.KUFixed1 = new Mesh (geometry.copy(), mkf1);
        }

        if (KUfixed2 != "none")
        {
            var kf2 = this.tLoader.load (KUfixed2);
            var mkf2 = new MeshBasicMaterial ({ transparent: true, map: kf2 });
            this.KUFixed2 = new Mesh (geometry.copy(), mkf2);
        }

        if (KUreaim2 != "none")
        {
            var kf2 = this.tLoader.load (KUfixed2);
            var mkf2 = new MeshBasicMaterial ({ transparent: true, map: kf2 });
            this.KUFixed2 = new Mesh (geometry.copy(), mkf2);
        }


        if (KUfixed2 != "none")
        {
            var kf2 = this.tLoader.load (KUfixed2);
            var mkf2 = new MeshBasicMaterial ({ transparent: true, map: kf2 });
            this.KUFixed2 = new Mesh (geometry.copy(), mkf2);
        }


        if (KAreaim != "none")
        {
            var ka = this.tLoader.load (KAreaim);
            var mka = new MeshBasicMaterial ({ transparent: true, map: ka });
            this.KAReaim = new Mesh (geometry.copy(), mka);
        }

        // RANGES

        if (C != "none")
        {
            var c = this.tLoader.load (C);
            var mc = new MeshBasicMaterial ({ transparent: true, map: c });
            this.c = new Mesh (geometry.copy(), mc);
        }

        if (Ku != "none")
        {
            var ku = this.tLoader.load (Ku);
            var mku = new MeshBasicMaterial ({ transparent: true, material: ku });
            this.Ku = new Mesh (geometry.copy(), mku);
        }

        if (Ka != "none")
        {
            var ka = this.tLoader.load (Ka);
            var mka = new MeshBasicMaterial ({ transparent: true, material: ka }); 
            this.Ka = new Mesh (geometry.copy(), mka);
        }
    }

    addToScene (scene)
    {
        this.setVisible (false);

        scene.add (this.Cfixed1);
        scene.add (this.CFixed2);
        scene.add (this.CReaim1);
        scene.add (this.CReaim2);
        scene.add (this.KUfixed1);
        scene.add (this.KUfixed2);
        scene.add (this.KUReaim);

        scene.add (this.c);
        scene.add (this.Ku);
        scene.add (this.Ka);
    }

    setVisible (state)
    {
        this.CFixed1.visible = state;
        this.CFixed2.visible = state;
        this.CReaim1.visible = state;
        this.CReaim2.visible = state;
        this.KUFixed1.visible = state;
        this.KUFixed2.visible = state;
        this.KUReaim.visible = state;

        this.c.visible = state;
        this.Ku.visible = state;
        this.Ka.visible = state;
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

        this.beams = [];

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
       
    }

};