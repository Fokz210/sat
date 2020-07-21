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
import { loadBeams } from './BeamsPaths.js'
import { Beam } from './Beam.js';

//not used
//import { MTLLoader } from './three.js-master/examples/jsm/loaders/MTLLoader.js';

/**
 * @author fokz210 / https://github.com/Fokz210
 **/

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

        this.satData = JSON.parse(document.getElementById('sat-data').innerText);
        this.beamsData = JSON.parse(document.getElementById('beams-data').innerText);
        this.satViewChosen = undefined;
        this.earthViewChosen = undefined;

        console.log (this.beamsData);

        this.stlLoader = new STLLoader ();

        this.fragmentShader = document.getElementById ("2121").innerHTML;
        this.vertexShader = document.getElementById ("1212").innerHTML;

        this.VO = false;

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
            40,
            53,
            56,
            96.5,
            103,
            138,
            142,
            346,
            349
        ];

        this.geostatnames = 
        [
            'AMY1', // 0
            'Am7',  // 1
            'AM6',  // 2
            'AT1',  // 3
            'AM33', // 4
            'AM3',  // 5
            'AM5',  // 6
            'AT2',  // 7
            'AM8',  // 8
            'AM44'  // 9
        ];

        this.mode = 0;

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
        this.camera.position.z = -100;

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
        this.globeTexture = new TextureLoader ().load ("textures/_edges.png");
        this.globeTexture.minFilter = LinearFilter;
        var globeMaterial = new MeshBasicMaterial ({ map: this.globeTexture, shininess: 15 });
        this.globeMesh = new Mesh (globeGeometry, globeMaterial);

        var globeCoverGeometry = new SphereGeometry (10.01, 100, 100);
        var globeCoverTex = new TextureLoader ().load ("textures/globe_cover.png");
        var globeCoverPol = new TextureLoader ().load ("textures/_edges.png");

        globeCoverTex.minFilter = LinearFilter;
        globeCoverPol.minFilter = LinearFilter;
        
        var globeCoverMaterial = new MeshBasicMaterial ({ transparent: true, map: globeCoverTex });

        this.globeCoverMesh = new Mesh (globeCoverGeometry, globeCoverMaterial);

        var polMapGeometry = new SphereGeometry (10.01, 100, 100);
        var polMapMaterial = new MeshBasicMaterial ({ transparent: true, map: globeCoverPol });

        this.polMapMesh = new Mesh (polMapGeometry, polMapMaterial);

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

        this.diskImage = document.getElementById("disk");
        this.diskDegrees = document.getElementById("disk-degrees");

        this.beams = [];

        this.readBeams();

        this.bindBands ();
        this.bindEvSats ();
        this.bindBeams ();
        this.bindReset ();
        this.bindInfoBtn ();
        this.bindVO();
        this.focusGlobeAndSats ();


        this.animate();
    }

    initlMatrix ()
    {
        var angle = - Math.PI / 16 + Math.PI / 18;

        this.lmatrix.push (new Matrix4().makeRotationY(- Math.PI / 4 + angle));
        this.lmatrix[0].multiply (new Matrix4().makeRotationX (0.471239));
        this.lmatrix2 = [];
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[0].applyMatrix4 (this.lmatrix[0]);
        this.lmatrix[0].setPosition (this.lshift[0]);

        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI / 2 - Math.PI / 4 + angle));
        this.lmatrix[1].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[1].applyMatrix4 (this.lmatrix[1]);
        this.lmatrix[1].setPosition (this.lshift[1]);

        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI - Math.PI / 4 + angle));
        this.lmatrix[2].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[2].applyMatrix4 (this.lmatrix[2]);
        this.lmatrix[2].setPosition (this.lshift[2]);
        
        this.lmatrix.push (new Matrix4().makeRotationY(Math.PI / 2 * 3 - Math.PI / 4 + angle));
        this.lmatrix[3].multiply (new Matrix4().makeRotationX (0.471239));
        this.lshift.push (new Vector3 (0, 35, 0));
        this.lshift[3].applyMatrix4 (this.lmatrix[3]);
        this.lmatrix[3].setPosition (this.lshift[3]);

        this.lmatrix2.push (new Matrix4().makeRotationY(- Math.PI / 4 + angle));
        this.lmatrix2[0].multiply (new Matrix4().makeRotationX (0.471239));
        
        this.lmatrix2.push (new Matrix4().makeRotationY(Math.PI / 2 - Math.PI / 4 + angle));
        this.lmatrix2[1].multiply (new Matrix4().makeRotationX (0.471239));
        
        this.lmatrix2.push (new Matrix4().makeRotationY(Math.PI - Math.PI / 4 + angle));
        this.lmatrix2[2].multiply (new Matrix4().makeRotationX (0.471239));
        
        this.lmatrix2.push (new Matrix4().makeRotationY(Math.PI / 2 * 3 - Math.PI / 4 + angle));
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

            this.light.position.x = this.camera.position.x;
            this.light.position.z = this.camera.position.z;
        
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

        function toNumberString(num) 
        { 
            if (Number.isInteger(num)) 
            { 
              return num + ".0"
            } 
            else 
            {
              return num.toString(); 
            }
          }

        if (angle < 0)
            text = toNumberString((-angle).toFixed(1)) + "° в.д.";
        else 
            text = toNumberString((angle).toFixed(1)) + "° з.д.";

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
            var material = new MeshPhongMaterial ({ color: 0x00005c });
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
        //for (let i = 0; i < 11; i++)
        //    this.beams[i].setVisible(false);

        this.mode = 1;
        if (this.VO)
            return;

        if (!this.satsLoaded)
            return;

        this.globeCoverMesh.visible = false;

        if (satMesh == undefined)
            satMesh = this.geostat[this.satViewChosen];

        if (this.satViewChosen == undefined)
            return;

            
        this.showAllSats (false);
        this.showAllOrbit (false);

        //this.controls.target = this.geostat[4].position;
        //this.controls.setDistance (20);

        this.camera.position.x = Math.cos (this.degToRad (this.gAngles[this.satViewChosen] - 0.3)) * 74;
        this.camera.position.z = Math.sin (this.degToRad (this.gAngles[this.satViewChosen] - 0.3)) * -74;
        this.camera.position.y = 0;

        this.controls.update();
        
        this.geostat[this.satViewChosen].visible = true;
        this.lnames[this.satViewChosen].visible = true;
        this.geoStatOrbitSmall.visible = true;

        this.light.position.x = this.camera.position.x;
        this.light.position.z = this.camera.position.z;

        
        this.ambientLight.intensity = 0.5;
        this.light.intensity = 0.5;
        

    }

    focusVO ()
    {
        this.camera.position.x = Math.cos (Math.PI / 2) * 150;
        this.camera.position.z = -Math.sin (Math.PI / 2) * 150;
        this.camera.position.y = 200;

        this.VO = true;

        this.beams[10].Ku.visible = true;

        this.controls.update();
    }

    focusGlobeAndSats ()
    {
        //for (let i = 0; i < 11; i++)
        //    this.beams[i].setVisible(false);

        this.globeCoverMesh.visible = false;
        
        this.ambientLight.intensity = 0.5;
        this.light.intensity = 0.5;

        
        this.showAllSats (true);
        this.showAllOrbit (true);

        this.mode = 0;
        if (this.VO)
            return;

            
       
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (110);


    }

    focusGlobe ()
    {
        this.mode = 2;

        
        this.showAllSats (false);
        this.showAllOrbit (false);


        this.globeCoverMesh.visible = true;

        this.ambientLight.intensity = 1;
        this.light.intensity = 0;
        if (this.VO)
            return;


        this.controls.target = this.globeMesh.position;
        
        this.controls.setDistance (40);
        if (this.earthViewChosen == undefined || this.earthViewChosen == 10)
            return;
        
        var angle = this.gAngles[this.earthViewChosen];

        if (angle == 138 || angle == 142) angle = 140;

        this.camera.position.x = Math.cos (this.degToRad (angle)) * 40
        this.camera.position.z = -Math.sin (this.degToRad (angle)) * 40;
        this.controls.update();
        
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

            var stle = function (a)
            {
                if (a == undefined)
                    return "display: none";
                else
                    return "";
            }

            document.getElementById("svdtb").style = stle (b);
            document.getElementById("svdtc").style = stle (c);
            document.getElementById("svdtf").style = stle (f);
            document.getElementById("svdtg").style = stle (g);
            document.getElementById("svdth").style = stle (h);
            document.getElementById("svdti").style = stle (i);
            document.getElementById("svdtj").style = stle (j);
            document.getElementById("svdtk").style = stle (k);

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
                             
    loadBeams = loadBeams.bind(this);

    bindBand (name, i)
    {
        document.getElementById(name + "c").onclick = function ()
        {
            if (this.beams[i].c != undefined) this.beams[i].c.visible = !this.beams[i].c.visible;
        }.bind (this);

        if (this.beams[i].c == undefined)
        {
            document.getElementById (name + "c").className = "empty-range w-inline-block";
            document.getElementById (name + "c").innerHTML = "";
        }

        document.getElementById(name + "ku").onclick = function ()
        {
            if (this.beams[i].Ku != undefined) this.beams[i].Ku.visible = !this.beams[i].Ku.visible;
        }.bind (this);

        if (this.beams[i].Ku == undefined)
        {
            document.getElementById (name + "ku").className = "empty-range w-inline-block";
            document.getElementById (name + "ku").innerHTML = "";
        }
        
        document.getElementById(name + "ka").onclick = function ()
        {
            if (this.beams[i].Ka != undefined) this.beams[i].Ka.visible = !this.beams[i].Ka.visible;
        }.bind (this);

        if (this.beams[i].Ka == undefined)
        {
            document.getElementById (name + "ka").className = "empty-range w-inline-block";
            document.getElementById (name + "ka").innerHTML = "";
        }
    }

    bindBands ()
    {
        this.bindBand ("amu1", 0);
        this.bindBand ("am7",  1);
        this.bindBand ("am6",  2);
        this.bindBand ("at1",  3);
        this.bindBand ("am33", 4);
        this.bindBand ("am3",  5);
        this.bindBand ("am5",  6);
        this.bindBand ("at2",  7);
        this.bindBand ("am8",  8);
        this.bindBand ("am44", 9);
        this.bindBand ("rv",   10);
    }

    bindEvSat (index)
    {
        document.getElementById ("ev" + index).onclick = function ()
        {
            if (this.earthViewChosen)
                 for (let i = 0; i < 11; i++) 
                    this.beams[i].setVisible (false);

            this.earthViewChosen = index;

            this.focusGlobe();

            if (index == 10)
            {
                a = "Экспресс-РВ";
                e = "";
            }
            else 
            {
                var a = this.satData[this.satDataRows[index]].a;
                var e = this.satData[this.satDataRows[index]].e;
            }

            if (index == 10)
                document.getElementById ("orbitname").innerHTML = "космический аппарат <br>на эллиптической орбите"
            else
                document.getElementById ("orbitname").innerHTML = "космический аппарат <br>на геостационарной орбите"

            document.getElementById ("evda").innerHTML = a;
            document.getElementById ("evde").innerHTML = e;

            if (this.beams[index].CFixed1 == undefined)
                document.getElementById ("fixedc1").style = "display: none";
            else
                document.getElementById ("fixedc1").style = "display: flex";
            
            if (this.beams[index].CFixed2 == undefined)
                document.getElementById ("fixedc2").style = "display: none";
            else
                document.getElementById ("fixedc2").style = "display: flex"; 
            
            if (this.beams[index].CReaim1 == undefined)
                document.getElementById ("reaimc1").style = "display: none";
            else
                document.getElementById ("reaimc1").style = "display: flex";

            if (this.beams[index].CReaim2 == undefined)
                document.getElementById ("reaimc2").style = "display: none";
            else
                document.getElementById ("reaimc2").style = "display: flex";

            if (this.beams[index].KUFixed1 == undefined)
                document.getElementById ("fixedku1").style = "display: none";
            else
                document.getElementById ("fixedku1").style = "display: flex";

            if (this.beams[index].KUFixed2 == undefined)
                document.getElementById ("fixedku2").style = "display: none";
            else
                document.getElementById ("fixedku2").style = "display: flex";

            if (this.beams[index].KUFixed3 == undefined)
                document.getElementById ("fixedku3").style = "display: none";
            else
                document.getElementById ("fixedku3").style = "display: flex";

            if (this.beams[index].KUReaim1 == undefined)
                document.getElementById ("reaimku1").style = "display: none";
            else
                document.getElementById ("reaimku1").style = "display: flex";

            if (this.beams[index].KUReaim2 == undefined)
                document.getElementById ("reaimku2").style = "display: none";
            else
                document.getElementById ("reaimku2").style = "display: flex";

            if (this.beams[index].KAReaim == undefined)
                document.getElementById ("fixedka").style = "display: none";
            else
                document.getElementById ("fixedka").style = "display: flex";

            if (this.beams[this.earthViewChosen].CFixed1 == undefined && this.beams[this.earthViewChosen].CFixed2 == undefined && this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                 document.getElementById ("chead").style = "display: none;";
             }
            else if (this.beams[this.earthViewChosen].CFixed1 == undefined && this.beams[this.earthViewChosen].CFixed2 == undefined)
             {
                document.getElementById ("cfix").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                document.getElementById ("cre").style = "display: none;";
            }
            else
            {
                document.getElementById ("chead").style = "";
                document.getElementById ("cfix").style = "";
                document.getElementById ("cre").style = "";
            }
        
            if (this.beams[this.earthViewChosen].KUFixed1 == undefined && this.beams[this.earthViewChosen].KUFixed2 == undefined && this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("kuhead").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].KUFixed1 == undefined && this.beams[this.earthViewChosen].KUFixed2 == undefined)
            {
                document.getElementById ("kufix").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("kure").style = "display: none;";
            }
            else
            {
                document.getElementById ("kuhead").style = "";
                document.getElementById ("kufix").style = "";
                document.getElementById ("kure").style = "";
            }
        
            if (this.beams[this.earthViewChosen].KAReaim == undefined)
                document.getElementById ("kahead").style = "display: none;";
            else
                document.getElementById ("kahead").style = "";

                var text = function (tex)
                {
                    return "<div class=\"text-block\">" + tex + "</div>";
                }

                document.getElementById ("fixedc1").innerHTML = text(this.beams[this.earthViewChosen].CFixed1n);
                document.getElementById ("fixedc2").innerHTML = text(this.beams[this.earthViewChosen].CFixed2n);
                document.getElementById ("reaimc1").innerHTML = text(this.beams[this.earthViewChosen].CReaim1n);
                document.getElementById ("reaimc2").innerHTML = text(this.beams[this.earthViewChosen].CReaim2n);
                document.getElementById ("fixedku1").innerHTML = text(this.beams[this.earthViewChosen].KUFixed1n);
                document.getElementById ("fixedku2").innerHTML = text(this.beams[this.earthViewChosen].KUFixed2n);
                document.getElementById ("fixedku3").innerHTML = text(this.beams[this.earthViewChosen].KUFixed3n);
                document.getElementById ("reaimku1").innerHTML = text(this.beams[this.earthViewChosen].KUReaim1n);
                document.getElementById ("reaimku2").innerHTML = text(this.beams[this.earthViewChosen].KUReaim2n);
                document.getElementById ("fixedka").innerHTML = text(this.beams[this.earthViewChosen].KAReaimn);
            
        }.bind (this);
    }

    bindEvSats ()
    {
        this.bindEvSat (0);
        this.bindEvSat (1);
        this.bindEvSat (2);
        this.bindEvSat (3);
        this.bindEvSat (4);
        this.bindEvSat (5);
        this.bindEvSat (6);
        this.bindEvSat (7);
        this.bindEvSat (8);
        this.bindEvSat (9);
        this.bindEvSat (10);
    }

    bindBeams ()
    {
        document.getElementById ("fixedc1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CFixed1 != undefined) this.beams[this.earthViewChosen].CFixed1.visible = !this.beams[this.earthViewChosen].CFixed1.visible; 
        }.bind (this);

        document.getElementById ("fixedc2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CFixed2 != undefined) this.beams[this.earthViewChosen].CFixed2.visible = !this.beams[this.earthViewChosen].CFixed2.visible; 
        }.bind (this);

        document.getElementById ("reaimc1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CReaim1 != undefined) this.beams[this.earthViewChosen].CReaim1.visible = !this.beams[this.earthViewChosen].CReaim1.visible; 
        }.bind (this);

        document.getElementById ("reaimc2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CReaim2 != undefined) this.beams[this.earthViewChosen].CReaim2.visible = !this.beams[this.earthViewChosen].CReaim2.visible; 
        }.bind (this);

        document.getElementById ("fixedku1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed1 != undefined) this.beams[this.earthViewChosen].KUFixed1.visible = !this.beams[this.earthViewChosen].KUFixed1.visible; 
        }.bind (this);

        document.getElementById ("fixedku2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed2 != undefined) this.beams[this.earthViewChosen].KUFixed2.visible = !this.beams[this.earthViewChosen].KUFixed2.visible; 
        }.bind (this);

        document.getElementById ("fixedku3").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed3 != undefined) this.beams[this.earthViewChosen].KUFixed3.visible = !this.beams[this.earthViewChosen].KUFixed3.visible; 
        }.bind (this);


        document.getElementById ("reaimku1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUReaim1 != undefined) this.beams[this.earthViewChosen].KUReaim1.visible = !this.beams[this.earthViewChosen].KUReaim1.visible; 
        }.bind (this);

        document.getElementById ("reaimku2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUReaim2 != undefined) this.beams[this.earthViewChosen].KUReaim2.visible = !this.beams[this.earthViewChosen].KUReaim2.visible; 
        }.bind (this);

        document.getElementById ("fixedka").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KAReaim != undefined) this.beams[this.earthViewChosen].KAReaim.visible = !this.beams[this.earthViewChosen].KAReaim.visible; 
        }.bind (this);

        if (this.earthViewChosen == undefined)
            return;

       
    }

    reset ()
    {
        if (this.earthViewChosen)
                 for (let i = 0; i < 11; i++) 
                    this.beams[i].setVisible (false);

        this.earthViewChosen = undefined;

        if (this.mode == 1 || this.mode == 0)
        {
            for (let i = 0; i < 11; i++) 
                    this.beams[i].setVisible (false);

            this.satViewChosen = undefined;
            this.focusSat ();
        }
        
    }

    bindReset ()
    {
        document.getElementById ("resetbtn").onclick = function () { this.reset() }.bind (this);
    }

    bindInfoBtn ()
    {
        document.getElementById ("zonesbtn").onclick = function () 
        {
            var index = this.satViewChosen;
            this.reset();
            this.earthViewChosen = index;

            if (this.earthViewChosen)
                 for (let i = 0; i < 11; i++) 
                    this.beams[i].setVisible (false);


            if (index == 10)
            {
                a = "Экспресс-РВ";
                e = "";
            }
            else 
            {
                var a = this.satData[this.satDataRows[index]].a;
                var e = this.satData[this.satDataRows[index]].e;
            }

            if (index == 10)
                document.getElementById ("orbitname").innerHTML = "космический аппарат <br>на эллиптической орбите"
            else
                document.getElementById ("orbitname").innerHTML = "космический аппарат <br>на геостационарной орбите"

            document.getElementById ("evda").innerHTML = a;
            document.getElementById ("evde").innerHTML = e;

            if (this.beams[index].CFixed1 == undefined)
                document.getElementById ("fixedc1").style = "display: none";
            else
                document.getElementById ("fixedc1").style = "display: flex";
            
            if (this.beams[index].CFixed2 == undefined)
                document.getElementById ("fixedc2").style = "display: none";
            else
                document.getElementById ("fixedc2").style = "display: flex"; 
            
            if (this.beams[index].CReaim1 == undefined)
                document.getElementById ("reaimc1").style = "display: none";
            else
                document.getElementById ("reaimc1").style = "display: flex";

            if (this.beams[index].CReaim2 == undefined)
                document.getElementById ("reaimc2").style = "display: none";
            else
                document.getElementById ("reaimc2").style = "display: flex";

            if (this.beams[index].KUFixed1 == undefined)
                document.getElementById ("fixedku1").style = "display: none";
            else
                document.getElementById ("fixedku1").style = "display: flex";

            if (this.beams[index].KUFixed2 == undefined)
                document.getElementById ("fixedku2").style = "display: none";
            else
                document.getElementById ("fixedku2").style = "display: flex";

            if (this.beams[index].KUFixed3 == undefined)
                document.getElementById ("fixedku3").style = "display: none";
            else
                document.getElementById ("fixedku3").style = "display: flex";

            if (this.beams[index].KUReaim1 == undefined)
                document.getElementById ("reaimku1").style = "display: none";
            else
                document.getElementById ("reaimku1").style = "display: flex";

            if (this.beams[index].KUReaim2 == undefined)
                document.getElementById ("reaimku2").style = "display: none";
            else
                document.getElementById ("reaimku2").style = "display: flex";

            if (this.beams[index].KAReaim == undefined)
                document.getElementById ("fixedka").style = "display: none";
            else
                document.getElementById ("fixedka").style = "display: flex";

            this.focusGlobe();

        }.bind(this);
        
        document.getElementById ("infobtn").onclick = function ()
        {   
            var index = this.earthViewChosen;
            this.earthViewChosen = undefined; 
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

            var stle = function (a)
            {
                if (a == undefined)
                    return "display: none";
                else
                    return "";
            }

            document.getElementById("svdtb").style = stle (b);
            document.getElementById("svdtc").style = stle (c);
            document.getElementById("svdtf").style = stle (f);
            document.getElementById("svdtg").style = stle (g);
            document.getElementById("svdth").style = stle (h);
            document.getElementById("svdti").style = stle (i);
            document.getElementById("svdtj").style = stle (j);
            document.getElementById("svdtk").style = stle (k);

            this.focusSat();

        }.bind (this);
    }

    bindVO ()
    {
        document.getElementById ("VOON").onclick = function ()
        {
            this.focusVO();
        }.bind (this);

        document.getElementById ("VOOFF").onclick = function () 
        {
            this.VO = false;
            if (this.mode == 0)
                this.focusGlobeAndSats();
            if (this.mode == 1)
                this.focusSat();
            if (this.mode == 2)
                this.focusGlobe();

            this.beams[10].Ku.visible = false;
        }.bind (this);
    }

    readBeams ()
    {
        for (let i = 0; i < 11; i++)
        {
            var CFixed1 = this.beamsData[i + 1].c;
            var CFixed2 = this.beamsData[i + 1].e;
            var CReaim1 = this.beamsData[i + 1].g;
            var CReaim2 = this.beamsData[i + 1].i;
            var KUFixed1 = this.beamsData[i + 1].k;
            var KUFixed2 = this.beamsData[i + 1].m;
            var KUFixed3 = this.beamsData[i + 1].o;
            var KUReaim1 = this.beamsData[i + 1].q;
            var KUReaim2 = this.beamsData[i + 1].s;
            var KAReaim = this.beamsData[i + 1].u;

            var C = this.beamsData[i + 1].v;
            var Ku = this.beamsData[i + 1].w;
            var Ka = this.beamsData[i + 1].x; 

            this.beams.push (new Beam(CFixed1, CFixed2, CReaim1, CReaim2, KUFixed1, KUFixed2, KUFixed3, KUReaim1, KUReaim2, KAReaim, C, Ku, Ka));

            this.beams[i].CFixed1n = this.beamsData[i + 1].b;
            this.beams[i].CFixed2n = this.beamsData[i + 1].d;
            this.beams[i].CReaim1n = this.beamsData[i + 1].f;
            this.beams[i].CReaim2n = this.beamsData[i + 1].h;
            this.beams[i].KUFixed1n = this.beamsData[i + 1].j;
            this.beams[i].KUFixed2n = this.beamsData[i + 1].l;
            this.beams[i].KUFixed3n = this.beamsData[i + 1].n;
            this.beams[i].KUReaim1n = this.beamsData[i + 1].p;
            this.beams[i].KUReaim2n = this.beamsData[i + 1].r;
            this.beams[i].KAReaimn = this.beamsData[i + 1].t;

            this.beams[i].addToScene(this.scene);
        }

    }

};