// IMPORTS
import * as THREE from './three.js-master/build/three.module.js'; 

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
    ObjectSpaceNormalMap,
    Clock,
    ObjectLoader,
    Raycaster,
    Vector2    
} from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from './three.js-master/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './three.js-master/examples/jsm/loaders/MTLLoader.js';
import { loadBeams } from './BeamsPaths.js'
import { Beam } from './Beam.js';

import CameraControls from './camera-controls/dist/camera-controls.module.js'

CameraControls.install( { THREE: THREE } );

//not used
//import { MTLLoader } from './three.js-master/examples/jsm/loaders/MTLLoader.js';

/**
 * @author fokz210 / https://github.com/Fokz210
 **/

// APP
class newSat 
{
    constructor (name, year)
    {
        this.name = name;
        this.year = year;

        this.params = [];
    }
}

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

function coneLookAt (mesh, target, up)
{
    var pos = new Vector3 ().copy (mesh.position);
    var rot = new Matrix4 ().lookAt (mesh.position, target.position, up);

    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;

    mesh.rotation.set (0, 0, 0);

    mesh.applyMatrix4 (new Matrix4().makeRotationY (Math.PI / 2));

    mesh.applyMatrix4 (rot);
    

    mesh.position.x = pos.x;
    mesh.position.y = pos.y;
    mesh.position.z = pos.z;
}

class beamSave
{
    constructor (mesh, button, color)
    {
        this.mesh = mesh;
        this.buttonName = button;
        this.color = color;
    }

    release ()
    {
        this.mesh.visible = true;
        this.bindButtonState (this.mesh, this.buttonName, this.color);
    }

    bindButtonState (mesh, elementId, color)
    {
        if (mesh == undefined)
            return;

        var btnColor;
        
        if (color == "p")
            btnColor = "169, 108, 238";
        else if (color == "o")
            btnColor = "243, 129, 63";
        else
            btnColor = "57, 185, 119";

        if (mesh.visible == true)
            document.getElementById (elementId).style = "background-color: rgba(" + btnColor + ", 1);";
        else 
            document.getElementById (elementId).style = "background-color: rgba(" + btnColor + ", 0.15);";
    }
}

class savedBeams 
{
    constructor ()
    { 
        this.locked = false;
        this.beams = [];
    }

    release ()
    {
        for (let i = 0; i < this.beams.length; i++)
            this.beams[i].release();

        this.beams = [];
    }

    lock ()
    {
        if (this.beams.length != 0)
        {
            this.locked = true;
        }
    }

    unlock ()
    {
        this.locked = false;
    }

    add (beam)
    {
        if (this.locked != true)
        {
            this.beams.push (beam);
        }
    }
}

class bandprop 
{
    constructor (C, Ka, Ku)
    {
        this.C = C;
        this.Ka = Ka;
        this.Ku = Ku;
    }

    empty ()
    {
        return !this.C && !this.Ka && !this.Ku;
    }
}

class country
{
    constructor ()
    {
        this.map = undefined;
        this.name = "";
        this.continent = "";

        this.alpha = 0;
        this.beta = 0;

        this.bandProps = [];

        for (let i = 0; i < 13; i++)
            this.bandProps.push (new bandprop(false, false, false));

        this.countryCode = "";
    }
}

class delayedFunction
{
    constructor (time, func, duration)
    {
        this.time = time;
        this.func = func;
        this.duration = duration;
    }
}

class delayedFunctionManager
{
    constructor () 
    {
        this.funcs = [];

        this.clock = new Clock();
        this.clock.start();
    }

    add (func, duration)
    {
        this.funcs.push (new delayedFunction(this.clock.getElapsedTime(), func, duration));
    }

    check (dFunc)
    {
        if (this.clock.getElapsedTime() - dFunc.time >= dFunc.duration)
        {
            dFunc.func();
            return true;
        }

        return false;
    }

    checkAll ()
    {
        for (let i = 0; i < this.funcs.length; i++)
        {
            if (this.check (this.funcs[i]))
            {
                this.swapArray (this.funcs, i, this.funcs.length - 1);
                this.funcs.pop();
            }
        }
    }

    swapArray (list, x, y)
    {
        var b = list[y];
        list[y] = list[x];
        list[x] = b;
    }

}

export class SatteliteVisualizer
{
    constructor (sizeX, sizeY)
    {
        this.mouseClicked = false;
        this.mouseDragged = false;

        this.loadGlobe();

        document.getElementById("logo-img").onclick = () =>
        {
            location.reload (true);
        };

        this.clock = new Clock ();

        this.loaderClock = new Clock ();

        this.mouse = new Vector2(0, 0);

        this.satData = JSON.parse(document.getElementById('sat-data').innerText);
        this.beamsData = JSON.parse(document.getElementById('beams-data').innerText);
        this.countriesData = JSON.parse(document.getElementById('countries-data').innerText);
        this.satViewChosen = undefined;
        this.earthViewChosen = undefined;

        this.newSats = [];

        this.fullcountry = new country ();
        
        for (let i = 0; i < 13; i++)
            this.fullcountry.bandProps[i] = new bandprop (true, true, true);

        this.savedBeams = new savedBeams();

        this.stlLoader = new STLLoader ();

        this.fragmentShader = document.getElementById ("2121").innerHTML;
        this.vertexShader = document.getElementById ("1212").innerHTML;

        this.VO = false;

        this.timeline = [];
        for (let i = 0; i < 11; i++)
            this.timeline.push([]);

        this.canvasSizeX = sizeX;
        this.canvasSizeY = sizeY;

        this.axis = new Mesh (new CylinderGeometry (0.05, 0.05, 1000, 128, 64), new MeshPhongMaterial ({ color: 0xc9c9c9}));
        
        this.geostat = [];

        this.loaded1 = 0;
        this.loaded2 = 0;

        this.raycastUpdate = false;

        for (let i = 0; i < 12; i++)
            this.geostat.push (undefined);

        this.geostatnames = 
        [
            'AMY1',  // 0
            'Am7',   // 1
            'AM6',   // 2
            'AT1',   // 3
            'AM33',  // 4
            'AM3',   // 5
            'AM5',   // 6
            'AT2',   // 7
            'AM8',   // 8
            'AM44',  // 9
            'E-80',  // 10
            'E-103',  // 11
        ];

        this.newSatYears =
        [
            2021,
            2023,
            2024,

        ]

        this.newSatNames = 
        [
            'AMY3',
            'AMY3',
            'AMY3',
            'AMY3',
            'AMY3',
            'AMY3',
            'AMY3',
            'AMY3',
            'AMY3',
            'AMY3',
        ]
        
        this.mode = 0;

        this.dfuncm = new delayedFunctionManager();

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
            1,
            11,
            12,
        ];

        for (let i = 14; i < 25; i++)
            this.satDataRows.push (i);

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
        for (let i = 0; i < 12; i++)
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

        this.showCones = false;

        this.newSatMeshes = [];

        this.intersected = null;

        this.lmatrix = [];
        this.lshift = [];

        this.initlMatrix();

        this.lPath = new Ellipse (20, 50);
       
        this.node = document.getElementById ('container');
        this.node.style.top = "20%";

        this.scene = new Scene ();

        this.camera = new PerspectiveCamera (75, this.canvasSizeX / this.canvasSizeY, 0.1, 1000);
        this.camera.position.x = 100;
        this.camera.position.y = 2;

        this.renderer = new WebGLRenderer ({ alpha: true, antialias: true });
        this.renderer.setClearColor (0x000000, 0);
        this.renderer.setPixelRatio (window.devicePixelRatio);
        this.renderer.setSize (this.canvasSizeX, this.canvasSizeY);

        this.controls = new CameraControls (this.camera, this.renderer.domElement);
        this.controls.autoRotate = false;
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 150;
        this.controls.minDistance = 15;
        this.controls.truckSpeed = 0.0;

        this.controls.setDistance = function (distance) 
        {
            this.dollyTo (distance, true);
        }

        this.raycaster = new Raycaster();

        this.cones = [];

        //this.scene.add (this.innerGlobeMesh);
        //this.scene.add (this.globeMesh);
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
        this.bindRvInfo ();
        //this.bindVO();
        this.bindSysInfo();
        this.bindSelectCountry ();
        this.focusGlobeAndSats ();
        this.loadCones();
        this.loadCones();
        this.loadCones();
        this.loadCones();

        document.getElementById ("country-heading").style.display = "none";
        document.getElementById ("midSwitch").style = "pointer-events: none;";

        var onMouseMove = function (event)
        {
            if (this.mouseClicked)
                this.mouseDragged = true;

            event.preventDefault();

            const delta = window.innerHeight / window.innerWidth;

            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (event.clientY / window.innerWidth) * 2 + delta * 1.2;

            this.raycastUpdate = true;
            //this.mouse.x = 0;
            //this.mouse.y = 0;
        }.bind(this);

        var onclick = function ()
        {
            this.mouseClicked = false;
            if (this.mouseDragged)
            {
                this.mouseDragged = false;
                return;
            }

            if (this.intersected) 
            {
                for (let i = 0; i < this.countries.length; i++)
                {
                    if (this.countries[i].map.name == this.intersected.name)
                    {
                        
                        this.reset();
                        var index = i;

                        this.resetCountriesVisibility();

                        if (this.countries[index].map) this.countries[index].map.material.color.setHex(0x003472);
                        if (this.intersected) this.intersected.currentHex = 0x003472;

                        this.selectedCountry = this.countries[index];

                        this.filterSats (this.countries[index]);

                        document.getElementById ("ctrname").innerText = this.countries[index].name;
                        document.getElementById ("country-heading").style.display = "flex";

                        document.getElementById ("cfilter").style = 'display: none;';
                        document.getElementById ("mbuttons").style = 'display: none;';
                        document.getElementById ("blur").style = 'display: none;';

                        document.getElementById ("filter-reset").style.display = "flex";

                        this.focusGlobe ();

                        this.menuState = 0;

                        this.setCamPosPolarDeg (this.countries[index].alpha, this.countries[index].beta, 20);
                    }
                }
            }
        }.bind (this);

        var mdn = function ()
        {
            this.mouseClicked = true;
        }.bind (this);

        document.addEventListener ("mousemove", onMouseMove);
        this.renderer.domElement.addEventListener ("mouseup", onclick);
        this.renderer.domElement.addEventListener ("mousedown", mdn);
        
        document.addEventListener ("touchmove", onMouseMove);
        this.renderer.domElement.addEventListener ("touchstart", onclick);
        this.renderer.domElement.addEventListener ("touchend", mdn);
        this.renderer.domElement.addEventListener ("touchcancel", mdn);

        this.readTimeline();

        this.loaderClock.start();

        this.loadNewSats();

        this.animate();
    }

    loadCones ()
    {
        var mtll = new MTLLoader();
        mtll.setPath ("3d/cone/");
        mtll.load ("cone.mtl", function (materials)
        {
            var objl = new OBJLoader ();

            materials.preload();
            materials.materials.Mat.map.minFilter = LinearFilter;
            materials.materials.Mat.alphaMap.minFilter = LinearFilter;

            objl.setPath ("3d/cone/");
            objl.setMaterials (materials);

            objl.load ("cone.obj", function (mesh)
            { 
                mesh.scale.x = 0.4;
                mesh.scale.y = 0.4;
                mesh.scale.z = 0.4;

                this.cones.push (mesh);
                this.scene.add (mesh);
            }.bind (this))
        }.bind(this));

    }

    initlMatrix ()
    {
        var angle = - Math.PI / 16 + Math.PI / 18 + Math.PI / 160;

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
                if (this.cones.length == 4)
                {
                    if (pt.y >= 31.17)
                        this.cones[i].visible = this.VO && this.lstat[i].visible;
                    else
                        this.cones[i].visible = false;

                    this.cones[i].position.set (pt.x, pt.y, pt.z);
                    coneLookAt (this.cones[i], this.globeMesh, up);
                }

            }

            if (this.raycastUpdate)
            {
                this.raycast();
                this.raycastUpdate = false;
            }

            this.light.position.x = this.camera.position.x;
            this.light.position.z = this.camera.position.z;

            if (this.globeLoaded) 
            {
                document.getElementById ("loading-screen").classList.add("fade-out");
                document.getElementById ("container").classList.add("fade-in");
                document.body.style.pointerEvents = "all";
            }

            this.t += 0.001;

            this.dfuncm.checkAll();
        }

        this.checkVisibles();

        this.renderer.render (this.scene, this.camera);
        this.controls.update (this.clock.getDelta() * 2);  

        this.updateDisk();
    }

    raycast ()
    {
        this.raycaster.setFromCamera (this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.globeMesh.children);

        if (intersects.length != 0 && intersects[0].object != this.globeMesh.children[0] )
        {
            if (this.selectedCountry && intersects[0].object == this.selectedCountry.map)
            {
                if (this.intersected) this.intersected.material.color.setHex(this.intersected.currentHex);
                this.intersected = null;

                return;
            }
                
            if (this.intersected != intersects[0].object)
            {
                if (this.intersected) this.intersected.material.color.setHex (this.intersected.currentHex);

                this.intersected = intersects[0].object;
                this.intersected.currentHex = this.intersected.material.color.getHex();
                this.intersected.material.color.setHex(0x85b6f8);
            }
        }
        else
        {
            if (this.intersected) this.intersected.material.color.setHex(this.intersected.currentHex);
            this.intersected = null;
        }
        

    }

    readTimeline ()
    {
        for (let i = 1; i < this.satData.length; i++)
        {
            if (this.satData[i].m != undefined)
            {
                this.timeline[parseInt(this.satData[i].m) - 2020].push (this.satData[i].a);
            }
        }

        this.displayTimeline ();
    }

    displayTimeline ()
    {
        for (let i = 0; i < this.timeline.length; i++)
        {
            var inner = "";


            for (let j = 0; j < (this.timeline[i]).length; j++)
            {
                inner += "<h1 class=\"sat-name\">" + this.timeline[i][j] + "</h1>";
            }

            document.getElementById ("tl" + i).innerHTML = inner;
        }
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

        //this.bindSatsChooser();

    }

    loadSatsMeshes ()
    {
        for (let i = 0; i < this.lstatnames.length; i++)
        {
            var that = this;


            this.stlLoader.load ('3d/' + this.lstatnames[i] + '.stl', 
                function (geometry)
                {
                    var material = new MeshPhongMaterial ({ color: 0xE5E5E5 });
                    var mesh = new Mesh (geometry, material);

                    that.lstat.push(mesh);

                    that.loaded1++;

                    if (that.loaded2 == 12 && that.loaded1 == 4)
                        that.initSats();
                });
        }
              
        this.loadSat (0);
        this.loadSat (1);
        this.loadSat (2);
        this.loadSat (3);
        this.loadSat (4);
        this.loadSat (5);
        this.loadSat (6);
        this.loadSat (7);
        this.loadSat (8);
        this.loadSat (9);
        this.loadSat (10);
        this.loadSat (11);
    }

    loadSat (index)
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

            var angle = parseFloat(that.satData[that.satDataRows[index]].n);

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

            if (that.loaded2 == 12 && that.loaded1 == 4)
                     that.initSats();
        });
    }

    degToRad (angle)
    {
        return angle / 180 * Math.PI;
    }

    focusSat (satMesh)
    {  
        this.interfaceScreen2 ();

        document.getElementById ("resetbtn").style.display = "none";
        document.getElementById ("evsat").style = "display: none;";

        
        this.dfuncm.add (() => { document.getElementById("diskanim").classList.add ("hidden"); }, 0.01);

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

        this.showAllOrbit (false);
        this.showAllSats (false);

        var angle = parseFloat (this.satData[this.satDataRows[this.satViewChosen]].n);

        //this.camera.position.x = Math.cos (this.degToRad (angle + 0.8)) * 74;
        //this.camera.position.z = Math.sin (this.degToRad (angle + 0.8)) * -74;
        //this.camera.position.y = 0;

        this.controls.setPosition (Math.cos (this.degToRad (angle + 0.8)) * 74, 0, Math.sin (this.degToRad (angle + 0.8)) * -74, true);

        this.controls.enableRotate = true;

        this.hideAllNewSats();

        if (this.satViewChosen < 13)
            this.geostat[this.satViewChosen].visible = true;
        else
        {
            this.newSatMeshes[this.satViewChosen - 13].visible = true;
        }

        this.geoStatOrbitSmall.visible = true;

        this.light.position.x = this.camera.position.x;
        this.light.position.z = this.camera.position.z;

        
        this.ambientLight.intensity = 0.7;
        this.light.intensity = 0.3;
        

    }

    focusVO ()
    {
        this.disableAllBeams ();
        this.disableAllBands ();
        this.savedBeams.beams = [];
        
        document.getElementById ("infoRV").style.display = "none";

        //this.camera.position.x = Math.cos (Math.PI / 2) * 48;
        //this.camera.position.z = -Math.sin (Math.PI / 2) * 48;
        //this.camera.position.y = 86;

        this.controls.setPosition (Math.cos (Math.PI / 2) * 48, 86, -Math.sin (Math.PI / 2) * 48,  true);

        this.VO = true;

        this.beams[12].Ku.visible = true;

        this.earthViewChosen = 12;

        this.controls.enableRotate = true;
    }

    focusGlobeAndSats ()
    {
        this.interfaceScreen1 ();

        this.reset();

        this.hideAllNewSats();

        document.getElementById ("resetbtn").style.display = "none";
        document.getElementById ("infoRV").style.display = "flex";

        this.dfuncm.add (() => { document.getElementById("timelinebox").classList.remove ("hidden"); }, 0.3);
        this.dfuncm.add (() => { document.getElementById("diskanim").classList.add ("hidden"); }, 0.01);

        this.globeCoverMesh.visible = false;
        
        this.ambientLight.intensity = 0.7;
        this.light.intensity = 0.3;

        this.showAllSats (true);
        this.showAllOrbit (true);

        this.mode = 0;
        if (this.VO)
        {
            this.beams[12].Ku.visible = false;
            this.VO = false;
        }
       
        this.controls.target = this.globeMesh.position;
        this.controls.setDistance (150);

        this.controls.enableRotate = true;
        this.controls.minDistance = 80;
        this.controls.maxDistance = 300;
    }

    focusGlobe ()
    {
        this.interfaceScreen3 ();

        this.hideAllNewSats();

        document.getElementById ("resetbtn").style.display = "flex";

        this.dfuncm.add (() => { document.getElementById("timelinebox").classList.add ("hidden"); }, 0.01);
        this.dfuncm.add (() => { document.getElementById("diskanim").classList.remove ("hidden"); }, 0.3);

        if (this.mode != 2) 
        {
            this.controls.setDistance (40);
            this.controls.minDistance = 18;
            this.controls.maxDistance = 80;
        }
        
        document.getElementById("syszones").style.display = "flex";

        document.getElementById ("infoRV").style.display = "none";

        document.getElementById ("evsat").style.display = "flex";

        this.mode = 2;

        this.showAllSats (false);
        this.showAllOrbit (false);

        this.globeCoverMesh.visible = true;

        this.ambientLight.intensity = 0.7;
        this.light.intensity = 0.3;
        if (this.VO)
        {
            this.beams[12].Ku.visible = false;
            this.VO = false;
        }

        this.controls.target = this.globeMesh.position;
        

        if (this.earthViewChosen == undefined || this.earthViewChosen == 12)
            return;
        
        var angle = parseFloat (this.satData[this.satDataRows[this.earthViewChosen]].o);

        this.controls.setPosition (Math.cos (this.degToRad (angle)) * 40,  0, -Math.sin (this.degToRad (angle)) * 40, true);
        
        this.controls.enableRotate = true;

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
                new MeshPhongMaterial ({ color: 0xf3813f, shininess: 0 })
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

    showAllLabels (state)
    {
        if (!this.satsLoaded)
            return;

        for (let i = 0; i < this.lnames.length; i++)
            this.lnames[i].visible = state;
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
        this.bindSvSat (10);  
        this.bindSvSat (11);  
    }                        
                             
    loadBeams ()
    {
        loadBeams().bind(this);
    }

    bindBand (name, i)
    {
        document.getElementById(name + "c").onclick = function ()
        {
            if (this.beams[i].c != undefined) this.beams[i].c.visible = !this.beams[i].c.visible;
            this.bindButtonState (this.beams[i].c, name + "c", "p");
            
            document.getElementById("resetbtn").style.display = "flex";

            if (this.beams[i].c != undefined) this.disableAllBeams();
        }.bind (this);

        if (this.beams[i].c == undefined)
        {
            document.getElementById (name + "c").className = "empty-range w-inline-block";
            document.getElementById (name + "c").innerHTML = "";
            
        }

        document.getElementById(name + "ku").onclick = function ()
        {
            if (this.beams[i].Ku != undefined) this.beams[i].Ku.visible = !this.beams[i].Ku.visible;
            this.bindButtonState (this.beams[i].Ku, name + "ku", "o");
            
            document.getElementById("resetbtn").style.display = "flex";

            
            if (this.beams[i].Ku != undefined) this.disableAllBeams();
        }.bind (this);

        if (this.beams[i].Ku == undefined)
        {
            document.getElementById (name + "ku").className = "empty-range w-inline-block";
            document.getElementById (name + "ku").innerHTML = "";
        }
        
        document.getElementById(name + "ka").onclick = function ()
        {
            if (this.beams[i].Ka != undefined) this.beams[i].Ka.visible = !this.beams[i].Ka.visible;
            this.bindButtonState (this.beams[i].Ka, name + "ka", "g");
            
            document.getElementById("resetbtn").style.display = "flex";
            
            if (this.beams[i].Ka != undefined) this.disableAllBeams();
        }.bind (this);

        if (this.beams[i].Ka == undefined)
        {
            document.getElementById (name + "ka").className = "empty-range w-inline-block";
            document.getElementById (name + "ka").innerHTML = "";
        }
    }

    checkVisibles ()
    {
        for (let i = 0; i < this.beams.length; i++)
        {
            var b = this.beams[i];

            var check = function (el)
            {
                return el && el.visible;
            }

            if ( check(b.CFixed1) || check(b.CFixed2) || check(b.CReaim1) ||check(b.CReaim2) || check(b.KUFixed1) ||check(b.KUFixed2) ||   check(b.KUFixed3) ||  check(b.KUReaim1) ||  check(b.KUReaim2) || check(b.KAReaim) )
            {
                this.disableAllBands();
                return;
            }
        }

        this.savedBeams.release();
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
        this.bindBand ("e80",  10);
        this.bindBand ("e103", 11);
        this.bindBand ("rv",   12);
        this.bindBand ("ns1",  13);
        this.bindBand ("ns2",  14);
        this.bindBand ("ns3",  15);
        this.bindBand ("ns4",  16);
        this.bindBand ("ns5",  17);
        this.bindBand ("ns6",  18);
        this.bindBand ("ns7",  19);
        this.bindBand ("ns8",  20);
        this.bindBand ("ns9",  21);
        this.bindBand ("ns10", 22);
    }

    disableAllBands ()
    {
        var disableBand = function (name, index)
        {
            if (this.beams[index].c)
            {
                
                if (this.beams[index].c.visible)
                    this.savedBeams.add (new beamSave(this.beams[index].c, name + "c", "p"));

                if (this.beams[index].c.visible)   
                    this.beams[index].c.visible = false;
                document.getElementById (name + "c").style = "background-color: rgba(169, 108, 238, 0.15);"

            }

            if (this.beams[index].Ku)
            {
                if (this.beams[index].Ku.visible)
                    this.savedBeams.add (new beamSave(this.beams[index].Ku, name + "ku", "o"));

                if (this.beams[index].Ku.visible)   
                    this.beams[index].Ku.visible = false;
                document.getElementById (name + "ku").style = "background-color: rgba(243, 129, 63, 0.15);"
            }

            if (this.beams[index].Ka)
            {

                if (this.beams[index].Ka.visible)
                    this.savedBeams.add (new beamSave(this.beams[index].Ka, name + "ka", "g"));

                if (this.beams[index].Ka.visible)   
                    this.beams[index].Ka.visible = false;
                document.getElementById (name + "ka").style = "background-color: rgba(57, 185, 119, 0.15);"

            }
        }.bind (this)

        this.savedBeams.lock();

        disableBand ("amu1", 0);
        disableBand ("am7",  1);
        disableBand ("am6",  2);
        disableBand ("at1",  3);
        disableBand ("am33", 4);
        disableBand ("am3",  5);
        disableBand ("am5",  6);
        disableBand ("at2",  7);
        disableBand ("am8",  8);
        disableBand ("am44", 9);
        disableBand ("e80",  10);
        disableBand ("e103", 11);
        disableBand ("rv",   12);
        disableBand ("ns1",  13);
        disableBand ("ns2",  14);
        disableBand ("ns3",  15);
        disableBand ("ns4",  16);
        disableBand ("ns5",  17);
        disableBand ("ns6",  18);
        disableBand ("ns7",  19);
        disableBand ("ns8",  20);
        disableBand ("ns9",  21);
        disableBand ("ns10", 22);

        this.savedBeams.unlock();
    }

    disableAllBeams ()
    {
        for (let i = 0; i < this.beams.length; i++)
            this.beams[i].setVisibleBeams (false);

        if (!this.earthViewChosen) return;7

        this.bindButtonState (this.beams[this.earthViewChosen].CFixed1, "fixedc1", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].CFixed2, "fixedc2", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].CReaim1, "reaimc1", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].CReaim2, "reaimc2", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].KUFixed1, "fixedku1", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUFixed2, "fixedku2", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUFixed3, "fixedku3", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUReaim1, "reaimku1", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUReaim2, "reaimku2", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KAReaim, "fixedka", "g");

        this.bindButtonState (this.beams[this.earthViewChosen].CFixed1, "rvcfixed1", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].CFixed2, "rvcfixed2", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].CReaim1, "rvcreaim1", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].CReaim2, "rvcreaim2", "p");
        this.bindButtonState (this.beams[this.earthViewChosen].KUFixed1, "rvkufixed1", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUFixed2, "rvkufixed2", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUFixed3, "rvkufixed3", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUReaim1, "rvkureaim1", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KUReaim2, "rvkureaim2", "o");
        this.bindButtonState (this.beams[this.earthViewChosen].KAReaim, "rvkafixed", "g");
    }

    bindRv (index)
    {
        document.getElementById ("ev" + index).onclick = function ()
        {
            document.getElementsByClassName ("satellite-ranges-info")[0].style.display = "none";
            document.getElementsByClassName ("xrw-ranges-info")[0].style.display = "flex";
            document.getElementById("ranges").style.display = "flex";
            document.getElementById("xrw-fucken-shit").style.display = "flex";

            if (this.earthViewChosen)
                 for (let i = 0; i < 13; i++) 
                    this.beams[i].setVisibleBeams (false);

            this.earthViewChosen = index;

            for (let i = 0; i < 13; i++)
            {
                document.getElementById ("ev" + i).style.opacity = 0.3;
            }

            document.getElementById ("ev" + index).style.opacity = 1;

            this.focusGlobe();

            if (this.beams[index].CFixed1 == undefined)
                document.getElementById ("rvcfixed1").style = "display: none";
            else
                document.getElementById ("rvcfixed1").style = "display: flex";
            
            if (this.beams[index].CFixed2 == undefined)
                document.getElementById ("rvcfixed2").style = "display: none";
            else
                document.getElementById ("rvcfixed2").style = "display: flex"; 
            
            if (this.beams[index].CReaim1 == undefined)
                document.getElementById ("rvcreaim1").style = "display: none";
            else
                document.getElementById ("rvcreaim1").style = "display: flex";

            if (this.beams[index].CReaim2 == undefined)
                document.getElementById ("rvcreaim2").style = "display: none";
            else
                document.getElementById ("rvcreaim2").style = "display: flex";

            if (this.beams[index].KUFixed1 == undefined)
                document.getElementById ("rvkufixed1").style = "display: none";
            else
                document.getElementById ("rvkufixed1").style = "display: flex";

            if (this.beams[index].KUFixed2 == undefined)
                document.getElementById ("rvkufixed2").style = "display: none";
            else
                document.getElementById ("rvkufixed2").style = "display: flex";

            if (this.beams[index].KUFixed3 == undefined)
                document.getElementById ("rvkufixed3").style = "display: none";
            else
                document.getElementById ("rvkufixed3").style = "display: flex";

            if (this.beams[index].KUReaim1 == undefined)
                document.getElementById ("rvkureaim1").style = "display: none";
            else
                document.getElementById ("rvkureaim1").style = "display: flex";

            if (this.beams[index].KUReaim2 == undefined)
                document.getElementById ("rvkureaim2").style = "display: none";
            else
                document.getElementById ("rvkureaim2").style = "display: flex";

            if (this.beams[index].KAReaim == undefined)
                document.getElementById ("rvkafixed").style = "display: none";
            else
                document.getElementById ("rvkafixed").style = "display: flex";

            if (this.beams[this.earthViewChosen].CFixed1 == undefined && this.beams[this.earthViewChosen].CFixed2 == undefined && this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                 document.getElementById ("rvchead").style = "display: none;";
             }
            else if (this.beams[this.earthViewChosen].CFixed1 == undefined && this.beams[this.earthViewChosen].CFixed2 == undefined)
             {
                document.getElementById ("rvcfix").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                document.getElementById ("rvcre").style = "display: none;";
            }
            else
            {
                document.getElementById ("rvchead").style = "";
                document.getElementById ("rvcfix").style = "";
                document.getElementById ("rvcre").style = "";
            }
        
            if (this.beams[this.earthViewChosen].KUFixed1 == undefined && this.beams[this.earthViewChosen].KUFixed2 == undefined && this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("rvkuhead").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].KUFixed1 == undefined && this.beams[this.earthViewChosen].KUFixed2 == undefined)
            {
                document.getElementById ("rvkufix").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("rvkure").style = "display: none;";
            }
            else
            {
                document.getElementById ("rvkuhead").style = "";
                document.getElementById ("rvkufix").style = "";
                document.getElementById ("rvkure").style = "";
            }
        
            if (this.beams[this.earthViewChosen].KAReaim == undefined)
                document.getElementById ("rvkahead").style = "display: none;";
            else
                document.getElementById ("rvkahead").style = "";

                var text = function (tex)
                {
                    return "<div class=\"text-block\">" + tex + "</div>";
                }

                document.getElementById ("rvcfixed1").innerHTML  = text(this.beams[this.earthViewChosen].CFixed1n );
                document.getElementById ("rvcfixed2").innerHTML  = text(this.beams[this.earthViewChosen].CFixed2n );
                document.getElementById ("rvcreaim1").innerHTML  = text(this.beams[this.earthViewChosen].CReaim1n );
                document.getElementById ("rvcreaim2").innerHTML  = text(this.beams[this.earthViewChosen].CReaim2n );
                document.getElementById ("rvkufixed1").innerHTML = text(this.beams[this.earthViewChosen].KUFixed1n);
                document.getElementById ("rvkufixed2").innerHTML = text(this.beams[this.earthViewChosen].KUFixed2n);
                document.getElementById ("rvkufixed3").innerHTML = text(this.beams[this.earthViewChosen].KUFixed3n);
                document.getElementById ("rvkureaim1").innerHTML = text(this.beams[this.earthViewChosen].KUReaim1n);
                document.getElementById ("rvkureaim2").innerHTML = text(this.beams[this.earthViewChosen].KUReaim2n);
                document.getElementById ("rvkafixed").innerHTML  = text(this.beams[this.earthViewChosen].KAReaimn );

                
                document.getElementById ("ranges").style.display = "flex";

                this.controls.setPosition (0, 30, -18, true);

        }.bind (this);
    }

    bindEvSat (index)
    {
        document.getElementById ("ev" + index).onclick = function ()
        {
            document.getElementsByClassName ("satellite-ranges-info")[0].style.display = "flex";
            document.getElementById("ranges").style.display = "flex";
            document.getElementsByClassName ("xrw-ranges-info")[0].style.display = "none";

            if (this.earthViewChosen)
                 for (let i = 0; i < 13; i++) 
                    this.beams[i].setVisibleBeams (false);

            this.earthViewChosen = index;

            for (let i = 0; i < 13; i++)
            {
                document.getElementById ("ev" + i).style.opacity = 0.3;
            }

            document.getElementById ("ev" + index).style.opacity = 1;

            this.focusGlobe();

            if (index == 12)
            {
                a = "Экспресс-РВ";
                e = "";
            }
            else 
            {
                var a = this.satData[this.satDataRows[index]].a;
                var e = this.satData[this.satDataRows[index]].e;
            }

            if (index == 12)
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
                document.getElementById ("chead").style = "";
                document.getElementById ("cfix").style = "display: none;";
                document.getElementById ("cre").style = "";
            }
            else if (this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                document.getElementById ("chead").style = "";
                document.getElementById ("cre").style = "display: none;";
                document.getElementById ("cfix").style = "";
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
                document.getElementById ("kuhead").style = "";
                document.getElementById ("kure").style = "";
            }
            else if (this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("kure").style = "display: none;";
                document.getElementById ("kuhead").style = "";
                document.getElementById ("kufix").style = "";
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

                document.getElementById ("fixedc1").innerHTML  = text(this.beams[this.earthViewChosen].CFixed1n );
                document.getElementById ("fixedc2").innerHTML  = text(this.beams[this.earthViewChosen].CFixed2n );
                document.getElementById ("reaimc1").innerHTML  = text(this.beams[this.earthViewChosen].CReaim1n );
                document.getElementById ("reaimc2").innerHTML  = text(this.beams[this.earthViewChosen].CReaim2n );
                document.getElementById ("fixedku1").innerHTML = text(this.beams[this.earthViewChosen].KUFixed1n);
                document.getElementById ("fixedku2").innerHTML = text(this.beams[this.earthViewChosen].KUFixed2n);
                document.getElementById ("fixedku3").innerHTML = text(this.beams[this.earthViewChosen].KUFixed3n);
                document.getElementById ("reaimku1").innerHTML = text(this.beams[this.earthViewChosen].KUReaim1n);
                document.getElementById ("reaimku2").innerHTML = text(this.beams[this.earthViewChosen].KUReaim2n);
                document.getElementById ("fixedka").innerHTML  = text(this.beams[this.earthViewChosen].KAReaimn );

                if (this.earthViewChosen == 12)
                    document.getElementById ("infobtn").innerHTML = "<h1 class=\"button-text\">информация о системе</h1>";
                else
                    document.getElementById ("infobtn").innerHTML = "<h1 class=\"button-text\">информация о спутнике</h1>";

        }.bind (this);
    }

    bindNsSat (index2)
    {
        document.getElementById ("ns" + index2).onclick = function ()
        {
            document.getElementsByClassName ("satellite-ranges-info")[0].style.display = "flex";
            document.getElementById ("ranges").style.display = "flex";
            document.getElementsByClassName ("xrw-ranges-info")[0].style.display = "none";

            if (this.earthViewChosen)
                 for (let i = 12; i < 23; i++) 
                    this.beams[i].setVisibleBeams (false);

            for (let i = 1; i < 11; i++)
            {
                document.getElementById ("ns" + i).style.opacity = 0.3;
            }

            document.getElementById ("ns" + index2).style.opacity = 1;

            var index = index2 + 12;

            this.earthViewChosen = index;

            if (index == 12)
            {
                a = "Экспресс-РВ";
                e = "";
            }
            else 
            {
                var a = this.satData[this.satDataRows[index]].a;
                var e = this.satData[this.satDataRows[index]].e;
            }

            if (index == 12)
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
                document.getElementById ("chead").style = "";
                document.getElementById ("cfix").style = "display: none;";
                document.getElementById ("cre").style = "";
            }
            else if (this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                document.getElementById ("chead").style = "";
                document.getElementById ("cre").style = "display: none;";
                document.getElementById ("cfix").style = "";
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
                document.getElementById ("kuhead").style = "";
                document.getElementById ("kure").style = "";
            }
            else if (this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("kure").style = "display: none;";
                document.getElementById ("kuhead").style = "";
                document.getElementById ("kufix").style = "";
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

                document.getElementById ("fixedc1").innerHTML  = text(this.beams[this.earthViewChosen].CFixed1n );
                document.getElementById ("fixedc2").innerHTML  = text(this.beams[this.earthViewChosen].CFixed2n );
                document.getElementById ("reaimc1").innerHTML  = text(this.beams[this.earthViewChosen].CReaim1n );
                document.getElementById ("reaimc2").innerHTML  = text(this.beams[this.earthViewChosen].CReaim2n );
                document.getElementById ("fixedku1").innerHTML = text(this.beams[this.earthViewChosen].KUFixed1n);
                document.getElementById ("fixedku2").innerHTML = text(this.beams[this.earthViewChosen].KUFixed2n);
                document.getElementById ("fixedku3").innerHTML = text(this.beams[this.earthViewChosen].KUFixed3n);
                document.getElementById ("reaimku1").innerHTML = text(this.beams[this.earthViewChosen].KUReaim1n);
                document.getElementById ("reaimku2").innerHTML = text(this.beams[this.earthViewChosen].KUReaim2n);
                document.getElementById ("fixedka").innerHTML  = text(this.beams[this.earthViewChosen].KAReaimn );
                
                document.getElementById ("infobtn").innerHTML = "<h1 class=\"button-text\">информация о спутнике</h1>";


                document.getElementById ("evsat").style.display = "none";
                document.getElementById ("select-country").style.display = "none";

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
        this.bindEvSat (11);
        this.bindRv (12);
        this.bindNsSat (1);
        this.bindNsSat (2);
        this.bindNsSat (3);
        this.bindNsSat (4);
        this.bindNsSat (5);
        this.bindNsSat (6);
        this.bindNsSat (7);
        this.bindNsSat (8);
        this.bindNsSat (9);
        this.bindNsSat (10);
    }

    bindButtonState (mesh, elementId, color)
    {
        if (mesh == undefined)
            return;

        var btnColor;
        
        if (color == "p")
            btnColor = "169, 108, 238";
        else if (color == "o")
            btnColor = "243, 129, 63";
        else
            btnColor = "57, 185, 119";

        if (mesh.visible == true)
            document.getElementById (elementId).style = "background-color: rgba(" + btnColor + ", 1);";
        else 
            document.getElementById (elementId).style = "background-color: rgba(" + btnColor + ", 0.15);";
    }

    bindBeams ()
    {
        document.getElementById ("fixedc1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CFixed1 != undefined) this.beams[this.earthViewChosen].CFixed1.visible = !this.beams[this.earthViewChosen].CFixed1.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CFixed1, "fixedc1", "p");
        }.bind (this);

        document.getElementById ("fixedc2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CFixed2 != undefined) this.beams[this.earthViewChosen].CFixed2.visible = !this.beams[this.earthViewChosen].CFixed2.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CFixed2, "fixedc2", "p");
        }.bind (this);

        document.getElementById ("reaimc1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CReaim1 != undefined) this.beams[this.earthViewChosen].CReaim1.visible = !this.beams[this.earthViewChosen].CReaim1.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CReaim1, "reaimc1", "p");
        }.bind (this);

        document.getElementById ("reaimc2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CReaim2 != undefined) this.beams[this.earthViewChosen].CReaim2.visible = !this.beams[this.earthViewChosen].CReaim2.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CReaim2, "reaimc2", "p");
        }.bind (this);

        document.getElementById ("fixedku1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed1 != undefined)
             this.beams[this.earthViewChosen].KUFixed1.visible = !this.beams[this.earthViewChosen].KUFixed1.visible;  
             this.bindButtonState (this.beams[this.earthViewChosen].KUFixed1, "fixedku1", "o");
        }.bind (this);

        document.getElementById ("fixedku2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed2 != undefined) this.beams[this.earthViewChosen].KUFixed2.visible = !this.beams[this.earthViewChosen].KUFixed2.visible;   
            this.bindButtonState (this.beams[this.earthViewChosen].KUFixed2, "fixedku2", "o");
        }.bind (this);

        document.getElementById ("fixedku3").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed3 != undefined) this.beams[this.earthViewChosen].KUFixed3.visible = !this.beams[this.earthViewChosen].KUFixed3.visible;   
            this.bindButtonState (this.beams[this.earthViewChosen].KUFixed3, "fixedku3", "o");
        }.bind (this);


        document.getElementById ("reaimku1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUReaim1 != undefined) this.beams[this.earthViewChosen].KUReaim1.visible = !this.beams[this.earthViewChosen].KUReaim1.visible;    
            this.bindButtonState (this.beams[this.earthViewChosen].KUReaim1, "reaimku1", "o");
        }.bind (this);

        document.getElementById ("reaimku2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUReaim2 != undefined) this.beams[this.earthViewChosen].KUReaim2.visible = !this.beams[this.earthViewChosen].KUReaim2.visible;
            this.bindButtonState (this.beams[this.earthViewChosen].KUReaim2, "reaimku2", "o");
        }.bind (this);

        document.getElementById ("fixedka").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KAReaim != undefined) this.beams[this.earthViewChosen].KAReaim.visible = !this.beams[this.earthViewChosen].KAReaim.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].KAReaim, "fixedka", "g");
        }.bind (this);

        this.bindBeamsRv();

        if (this.earthViewChosen == undefined)
            return;
    }

    bindBeamsRv ()
    {
        document.getElementById ("rvcfixed1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CFixed1 != undefined) this.beams[this.earthViewChosen].CFixed1.visible = !this.beams[this.earthViewChosen].CFixed1.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CFixed1, "rvcfixed1", "p");
        }.bind (this);

        document.getElementById ("rvcfixed2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CFixed2 != undefined) this.beams[this.earthViewChosen].CFixed2.visible = !this.beams[this.earthViewChosen].CFixed2.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CFixed2, "rvcfixed2", "p");
        }.bind (this);

        document.getElementById ("rvcreaim1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CReaim1 != undefined) this.beams[this.earthViewChosen].CReaim1.visible = !this.beams[this.earthViewChosen].CReaim1.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CReaim1, "rvcreaim1", "p");
        }.bind (this);

        document.getElementById ("rvcreaim2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].CReaim2 != undefined) this.beams[this.earthViewChosen].CReaim2.visible = !this.beams[this.earthViewChosen].CReaim2.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].CReaim2, "rvcreaim2", "p");
        }.bind (this);

        document.getElementById ("rvkufixed1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed1 != undefined)
             this.beams[this.earthViewChosen].KUFixed1.visible = !this.beams[this.earthViewChosen].KUFixed1.visible;  
             this.bindButtonState (this.beams[this.earthViewChosen].KUFixed1, "rvkufixed1", "o");
        }.bind (this);

        document.getElementById ("rvkufixed2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed2 != undefined) this.beams[this.earthViewChosen].KUFixed2.visible = !this.beams[this.earthViewChosen].KUFixed2.visible;   
            this.bindButtonState (this.beams[this.earthViewChosen].KUFixed2, "rvkufixed2", "o");
        }.bind (this);

        document.getElementById ("rvkufixed3").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUFixed3 != undefined) this.beams[this.earthViewChosen].KUFixed3.visible = !this.beams[this.earthViewChosen].KUFixed3.visible;   
            this.bindButtonState (this.beams[this.earthViewChosen].KUFixed3, "rvkufixed3", "o");
        }.bind (this);


        document.getElementById ("rvkureaim1").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUReaim1 != undefined) this.beams[this.earthViewChosen].KUReaim1.visible = !this.beams[this.earthViewChosen].KUReaim1.visible;    
            this.bindButtonState (this.beams[this.earthViewChosen].KUReaim1, "rvkureaim1", "o");
        }.bind (this);

        document.getElementById ("rvkureaim2").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KUReaim2 != undefined) this.beams[this.earthViewChosen].KUReaim2.visible = !this.beams[this.earthViewChosen].KUReaim2.visible;
            this.bindButtonState (this.beams[this.earthViewChosen].KUReaim1, "rvkureaim2", "o");
        }.bind (this);

        document.getElementById ("rvkafixed").onclick = function ()
        {
            if (this.beams[this.earthViewChosen].KAReaim != undefined) this.beams[this.earthViewChosen].KAReaim.visible = !this.beams[this.earthViewChosen].KAReaim.visible; 
            this.bindButtonState (this.beams[this.earthViewChosen].KAReaim, "rvkafixed", "g");
        }.bind (this);

    }

    reset ()
    {
        for (let i = 0; i < 13; i++)
        {
            document.getElementById ("ev" + i).style.opacity = 0.3;
        }

        for (let i = 1; i < 11; i++)
        {
            document.getElementById ("ns" + i).style.opacity = 0.3;
        }

        for (let i = 0; i < 23; i++) 
            this.beams[i].setVisible (false);
        this.earthViewChosen = undefined;
        this.satViewChosen = undefined;

        document.getElementById ("ranges").style.display = "none";

        this.disableAllBands();
    }

    bindReset ()
    {
        document.getElementById ("resetbtn").onclick = function () { this.reset() }.bind (this);
    }

    bindInfoBtn ()
    {
        document.getElementById ("zonesbtn").onclick = function () 
        {
            this.interfaceScreen3();

            var index = this.satViewChosen;
            this.earthViewChosen = index;

            this.focusGlobe();

            if (index > 12)
            {
                for (let i = 1; i < 11; i++)
                {
                    document.getElementById ("ns" + i).style.opacity = 0.3;
                }

                document.getElementById ("ns" + (index - 12)).style.opacity = 1;


            }
            else
            {   
                for (let i = 0; i < 13; i++)
                {
                    document.getElementById ("ev" + i).style.opacity = 0.3;
                }

                document.getElementById ("ev" + index).style.opacity = 1;
            }   
            

            this.focusGlobe();

            if (index == 12)
            {
                a = "Экспресс-РВ";
                e = "";
            }
            else 
            {
                var a = this.satData[this.satDataRows[index]].a;
                var e = this.satData[this.satDataRows[index]].e;
            }

            if (index == 12)
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
                document.getElementById ("chead").style = "";
                document.getElementById ("cfix").style = "display: none;";
                document.getElementById ("cre").style = "";
            }
            else if (this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                document.getElementById ("chead").style = "";
                document.getElementById ("cre").style = "display: none;";
                document.getElementById ("cfix").style = "";
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
                document.getElementById ("kure").style = "";
                document.getElementById ("kuhead").style = "";
            }
            else if (this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("kure").style = "display: none;";
                document.getElementById ("kufix").style = "";
                document.getElementById ("kuhead").style = "";
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

                document.getElementById ("fixedc1").innerHTML  = text(this.beams[this.earthViewChosen].CFixed1n );
                document.getElementById ("fixedc2").innerHTML  = text(this.beams[this.earthViewChosen].CFixed2n );
                document.getElementById ("reaimc1").innerHTML  = text(this.beams[this.earthViewChosen].CReaim1n );
                document.getElementById ("reaimc2").innerHTML  = text(this.beams[this.earthViewChosen].CReaim2n );
                document.getElementById ("fixedku1").innerHTML = text(this.beams[this.earthViewChosen].KUFixed1n);
                document.getElementById ("fixedku2").innerHTML = text(this.beams[this.earthViewChosen].KUFixed2n);
                document.getElementById ("fixedku3").innerHTML = text(this.beams[this.earthViewChosen].KUFixed3n);
                document.getElementById ("reaimku1").innerHTML = text(this.beams[this.earthViewChosen].KUReaim1n);
                document.getElementById ("reaimku2").innerHTML = text(this.beams[this.earthViewChosen].KUReaim2n);
                document.getElementById ("fixedka").innerHTML  = text(this.beams[this.earthViewChosen].KAReaimn );

                if (this.earthViewChosen == 12)
                    document.getElementById ("infobtn").innerHTML = "<h1 class=\"button-text\">информация о системе</h1>";
                else
                    document.getElementById ("infobtn").innerHTML = "<h1 class=\"button-text\">информация о спутнике</h1>";
                

                    
            document.getElementsByClassName ("xrw-ranges-info")[0].style.display = "none";
            document.getElementsByClassName ("satellite-ranges-info")[0].style.display = "flex";
            document.getElementById("ranges").style.display = "flex";

            if (this.earthViewChosen > 12)
            {
                document.getElementById ("evsat").style.display = "none";
                document.getElementById ("select-country").style.display = "none";
                document.getElementById ("newsat").style.display = "flex";
                this.hideAllNewSats();
            }
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
            var l = this.satData[this.satDataRows[index]].l;

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
            document.getElementById("svdl").innerHTML = def(l);

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
            document.getElementById("svdtl").style = stle (l);

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

            this.controls.setPosition (100, 5, 0, true);

            if (this.mode == 0)
                this.focusGlobeAndSats();
            if (this.mode == 1)
                this.focusSat();
            if (this.mode == 2)
                this.focusGlobe();

            this.beams[12].Ku.visible = false;
        }.bind (this);
    }

    readBeams ()
    {
        for (let i = 0; i < 23; i++)
        {
            var CFixed1  = this.beamsData[i + 1].c;
            var CFixed2  = this.beamsData[i + 1].e;
            var CReaim1  = this.beamsData[i + 1].g;
            var CReaim2  = this.beamsData[i + 1].i;
            var KUFixed1 = this.beamsData[i + 1].k;
            var KUFixed2 = this.beamsData[i + 1].m;
            var KUFixed3 = this.beamsData[i + 1].o;
            var KUReaim1 = this.beamsData[i + 1].q;
            var KUReaim2 = this.beamsData[i + 1].s;
            var KAReaim  = this.beamsData[i + 1].u;

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

    bindSysInfo ()
    {
        document.getElementById ("sysinfo").onclick = function ()
        {
            document.getElementById ("rvib").innerText = this.satData[13].b;
            document.getElementById ("rvic").innerText = this.satData[13].c;
            document.getElementById ("rvif").innerText = this.satData[13].f;
            document.getElementById ("rvig").innerText = this.satData[13].g;
            document.getElementById ("rvih").innerText = this.satData[13].h;
            document.getElementById ("rvid").innerText = this.satData[13].d;
            document.getElementById ("rvij").innerText = this.satData[13].j;

            this.focusGlobeAndSats();
            this.focusVO();

            document.getElementById ("syszones").display = "flex";
            document.getElementsByClassName ("xrw-info-container")[0].style.display = "flex";

        }.bind (this);

        document.getElementById ("syszones").onclick = function ()
        {

            document.getElementsByClassName ("xrw-info-container")[0].style.display = "none";
            document.getElementById ("syszones").style.display = "none";
            document.getElementsByClassName ("xrw-ranges-info")[0].style.display = "flex";
            document.getElementById ("infobtn").style.display = "flex";

            this.VO = false;
            var index = 12;

            this.earthViewChosen = index;

            for (let i = 0; i < 13; i++)
            {
                document.getElementById ("ev" + i).style.opacity = 0.3;
            }

            document.getElementById ("ev" + index).style.opacity = 1;

            this.focusGlobe();

            if (this.beams[index].CFixed1 == undefined)
                document.getElementById ("rvcfixed1").style = "display: none";
            else
                document.getElementById ("rvcfixed1").style = "display: flex";
            
            if (this.beams[index].CFixed2 == undefined)
                document.getElementById ("rvcfixed2").style = "display: none";
            else
                document.getElementById ("rvcfixed2").style = "display: flex"; 
            
            if (this.beams[index].CReaim1 == undefined)
                document.getElementById ("rvcreaim1").style = "display: none";
            else
                document.getElementById ("rvcreaim1").style = "display: flex";

            if (this.beams[index].CReaim2 == undefined)
                document.getElementById ("rvcreaim2").style = "display: none";
            else
                document.getElementById ("rvcreaim2").style = "display: flex";

            if (this.beams[index].KUFixed1 == undefined)
                document.getElementById ("rvkufixed1").style = "display: none";
            else
                document.getElementById ("rvkufixed1").style = "display: flex";

            if (this.beams[index].KUFixed2 == undefined)
                document.getElementById ("rvkufixed2").style = "display: none";
            else
                document.getElementById ("rvkufixed2").style = "display: flex";

            if (this.beams[index].KUFixed3 == undefined)
                document.getElementById ("rvkufixed3").style = "display: none";
            else
                document.getElementById ("rvkufixed3").style = "display: flex";

            if (this.beams[index].KUReaim1 == undefined)
                document.getElementById ("rvkureaim1").style = "display: none";
            else
                document.getElementById ("rvkureaim1").style = "display: flex";

            if (this.beams[index].KUReaim2 == undefined)
                document.getElementById ("rvkureaim2").style = "display: none";
            else
                document.getElementById ("rvkureaim2").style = "display: flex";

            if (this.beams[index].KAReaim == undefined)
                document.getElementById ("rvkafixed").style = "display: none";
            else
                document.getElementById ("rvkafixed").style = "display: flex";

            if (this.beams[this.earthViewChosen].CFixed1 == undefined && this.beams[this.earthViewChosen].CFixed2 == undefined && this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                    document.getElementById ("rvchead").style = "display: none;";
                }
            else if (this.beams[this.earthViewChosen].CFixed1 == undefined && this.beams[this.earthViewChosen].CFixed2 == undefined)
                {
                document.getElementById ("rvcfix").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].CReaim1 == undefined && this.beams[this.earthViewChosen].CReaim2 == undefined)
            {
                document.getElementById ("rvcre").style = "display: none;";
            }
            else
            {
                document.getElementById ("rvchead").style = "";
                document.getElementById ("rvcfix").style = "";
                document.getElementById ("rvcre").style = "";
            }
        
            if (this.beams[this.earthViewChosen].KUFixed1 == undefined && this.beams[this.earthViewChosen].KUFixed2 == undefined && this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("rvkuhead").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].KUFixed1 == undefined && this.beams[this.earthViewChosen].KUFixed2 == undefined)
            {
                document.getElementById ("rvkufix").style = "display: none;";
            }
            else if (this.beams[this.earthViewChosen].KUReaim1 == undefined && this.beams[this.earthViewChosen].KUReaim2 == undefined)
            {
                document.getElementById ("rvkure").style = "display: none;";
            }
            else
            {
                document.getElementById ("rvkuhead").style = "";
                document.getElementById ("rvkufix").style = "";
                document.getElementById ("rvkure").style = "";
            }
        
            if (this.beams[this.earthViewChosen].KAReaim == undefined)
                document.getElementById ("rvkahead").style = "display: none;";
            else
                document.getElementById ("rvkahead").style = "";

                var text = function (tex)
                {
                    return "<div class=\"text-block\">" + tex + "</div>";
                }

                document.getElementById ("rvcfixed1").innerHTML  = text(this.beams[this.earthViewChosen].CFixed1n );
                document.getElementById ("rvcfixed2").innerHTML  = text(this.beams[this.earthViewChosen].CFixed2n );
                document.getElementById ("rvcreaim1").innerHTML  = text(this.beams[this.earthViewChosen].CReaim1n );
                document.getElementById ("rvcreaim2").innerHTML  = text(this.beams[this.earthViewChosen].CReaim2n );
                document.getElementById ("rvkufixed1").innerHTML = text(this.beams[this.earthViewChosen].KUFixed1n);
                document.getElementById ("rvkufixed2").innerHTML = text(this.beams[this.earthViewChosen].KUFixed2n);
                document.getElementById ("rvkufixed3").innerHTML = text(this.beams[this.earthViewChosen].KUFixed3n);
                document.getElementById ("rvkureaim1").innerHTML = text(this.beams[this.earthViewChosen].KUReaim1n);
                document.getElementById ("rvkureaim2").innerHTML = text(this.beams[this.earthViewChosen].KUReaim2n);
                document.getElementById ("rvkafixed").innerHTML  = text(this.beams[this.earthViewChosen].KAReaimn );
            
                this.focusGlobe();

            this.beams[12].Ku.visible = false;
        }.bind (this);
    }

    bindRvInfo ()
    {
        document.getElementById ("infoRV").onclick = function () {

            document.getElementById("rvinfocon").style.display = "flex";
            document.getElementById("rvtext").style.display = "flex";
            document.getElementById("syszones").style.display = "none";
            this.focusVO();
        }.bind(this);
    }

    setCamPosPolarRad (alpha, beta, radius)
    {
        var pos = new Vector3 (1.0, 0, 0);


        pos.applyMatrix4 (new Matrix4 ().makeRotationZ (beta));

        pos.applyMatrix4 (new Matrix4 ().makeRotationY (alpha));


        //this.camera.position.x = pos.x * radius;
        //this.camera.position.y = pos.y * radius;
        //this.camera.position.z = pos.z * radius;

        this.controls.setPosition (pos.x * radius, pos.y * radius, pos.z * radius, true);
    }

    setCamPosPolarDeg (alpha, beta, radius)
    {
        this.setCamPosPolarRad (this.degToRad(alpha), this.degToRad(beta), radius);
    }

    findCountry (name)
    {
        for (let i = 0; i < this.globeMesh.children.length; i++)
        {
            if (this.globeMesh.children[i].name == name)
                return this.globeMesh.children[i];
        }

        return undefined;
    }

    loadCountries ()
    {
        this.countries = [];

        for (let i = 2; i < this.countriesData.length; i++)
        {
            var con = new country();
            var conData = this.countriesData[i];

            con.name = conData.b;
            con.continent = conData.a;

            
            if (conData.c) 
                con.map = this.findCountry (conData.c);

            if (!con.map)
                continue;

            con.alpha = parseFloat(conData.d);
            con.beta = parseFloat(conData.e);

            var toBool = (string) => 
            {
                return string === '1';
            }

            con.countryCode = conData.ag;

            con.bandProps[5].C   = toBool(conData.f);
            con.bandProps[5].Ku  = toBool(conData.g);
            con.bandProps[6].C   = toBool(conData.h);
            con.bandProps[6].Ku  = toBool(conData.i);
            con.bandProps[6].Ka  = toBool(conData.j);
            con.bandProps[2].C   = toBool(conData.k);
            con.bandProps[2].Ku  = toBool(conData.l);
            con.bandProps[1].C   = toBool(conData.m);
            con.bandProps[1].Ku  = toBool(conData.n);
            con.bandProps[4].C   = toBool(conData.o);
            con.bandProps[4].Ku  = toBool(conData.p);
            con.bandProps[9].C   = toBool(conData.q);
            con.bandProps[9].Ku  = toBool(conData.r);
            con.bandProps[10].C  = toBool(conData.s);
            con.bandProps[10].Ku = toBool(conData.t);
            con.bandProps[11].C  = toBool(conData.u);
            con.bandProps[11].Ku = toBool(conData.v);
            con.bandProps[0].Ku  = toBool(conData.w);
            con.bandProps[0].Ka  = toBool(conData.x);
            con.bandProps[3].Ku  = toBool(conData.y);
            con.bandProps[7].Ku  = toBool(conData.z);
            con.bandProps[8].C   = toBool(conData.aa);
            con.bandProps[8].Ku  = toBool(conData.ab);
            con.bandProps[12].Ku = toBool(conData.ac);


            this.countries.push (con);
        }

        this.fillCountries ('Африка');
        this.bindContinents();
    }

    resetCountriesVisibility ()
    {
        for (let i = 0; i < this.countries.length; i++)
        {
            if (this.countries[i].map)
                this.countries[i].map.material.color.setHex(0xc4ddff);
        }
    }

    fillCountries (continent)
    {
        var inner = '';

        for (let i = 0; i < this.countries.length; i++)
        {
            var element = this.countries[i];

            if (element.continent != continent)
                continue;

            if (element.countryCode == "ab" || element.countryCode == "os" || element.countryCode == "sy")
            {
                inner += '<a href="#" class="countries w-inline-block" id="country-' + i + '"> <div class="div-block-45 w-clearfix"> <div class="country-flag"><img src="flags/' + element.countryCode + '.svg"></div> <h1 class="country-name">' + element.name + '</h1> </div> </a>';
            }
            else
                inner += '<a href="#" class="countries w-inline-block" id="country-' + i + '"> <div class="div-block-45 w-clearfix"> <div class="country-flag"><img src="https://hatscripts.github.io/circle-flags/flags/' + element.countryCode + '.svg"></div> <h1 class="country-name">' + element.name + '</h1> </div> </a>';

        }

        document.getElementById ('c-container').innerHTML = inner;

        for (let i = 0; i < this.countries.length; i++)
        {
            var element = this.countries[i];

            if (element.continent != continent)
                continue;

            document.getElementById ("country-" + i).onclick = function ()
            {
                var index = i;

                this.reset();
                this.resetCountriesVisibility();

                if (this.countries[index].map) this.countries[index].map.material.color.setHex(0x003472);

                this.selectedCountry = this.countries[index];

                this.filterSats (this.countries[index]);

                var countryname = element.name;
                document.getElementById ("ctrname").innerText = this.countries[index].name;
                document.getElementById ("country-heading").style.display = "flex";

                document.getElementById ("cfilter").style = 'display: none;';
                document.getElementById ("mbuttons").style = 'display: none;';
                document.getElementById ("blur").style = 'display: none;';

                document.getElementById ("filter-reset").style.display = "flex";

                this.focusGlobe ();

                this.menuState = 0;

                this.setCamPosPolarDeg (this.countries[index].alpha, this.countries[index].beta, 20);
            }.bind(this);
        }
    }

    resetContinents ()
    {
        document.getElementById ('europe').className        = 'left-side-header';
        document.getElementById ('asia').className          = 'left-side-header';
        document.getElementById ('north-america').className = 'left-side-header';
        document.getElementById ('south-america').className = 'left-side-header';
        document.getElementById ('africa').className        = 'left-side-header';
        document.getElementById ('australia').className     = 'left-side-header';
    }

    bindContinents ()
    {
        document.getElementById ('europe').onclick = function () 
        {
            this.fillCountries ('Европа');
            this.resetContinents ();
            document.getElementById ('europe').className = 'left-side-header current';
        }.bind (this);

        document.getElementById ('asia').onclick = function () 
        {
            this.fillCountries ('Азия');
            this.resetContinents ();
            document.getElementById ('asia').className = 'left-side-header current';
        }.bind (this);

        document.getElementById ('north-america').onclick = function () 
        {
            this.fillCountries ('Северная Америка');
            this.resetContinents ();
            document.getElementById ('north-america').className = 'left-side-header current';
        }.bind (this);

        document.getElementById ('south-america').onclick = function () 
        {
            this.fillCountries ('Южная Америка');
            this.resetContinents ();
            document.getElementById ('south-america').className = 'left-side-header current';
        }.bind (this);

        document.getElementById ('africa').onclick = function () 
        {
            this.fillCountries ('Африка');
            this.resetContinents ();
            document.getElementById ('africa').className = 'left-side-header current';
        }.bind (this);

        document.getElementById ('australia').onclick = function () 
        {
            this.fillCountries ('Австралия и Океания');
            this.resetContinents ();
            document.getElementById ('australia').className = 'left-side-header current';
        }.bind (this);
    }

    filterSat (index, country)
    {
        if (country.bandProps[index].empty())
        {
            document.getElementById ("ev" + index).parentElement.style.display = "none";
        }
        else
            document.getElementById ("ev" + index).parentElement.style.display = "flex";
    }

    filterSats (country)
    {
        for (let i = 0; i < country.bandProps.length; i++)
            this.filterSat (i, country);

        this.filterBands(country);
    }

    filterBand (country, name, index)
    {
        if (!country.bandProps[index].C)
        {
            if (document.getElementById (name + "c").hasChildNodes());

            document.getElementById (name + "c").className = "empty-range w-inline-block";
            if (document.getElementById (name + "c").hasChildNodes()) document.getElementById (name + "c").children[0].style.display = "none";
        }
        else
        {

            document.getElementById (name + "c").className = "c-range-2 w-inline-block";
            if (document.getElementById (name + "c").hasChildNodes())
            {
                document.getElementById (name + "c").children[0].style = "";
            } 
        }

        if (!country.bandProps[index].Ka)
        {
            document.getElementById (name + "ka").className = "empty-range w-inline-block";
            if (document.getElementById (name + "ka").hasChildNodes()) document.getElementById (name + "ka").children[0].style = "none";
        }
        else
        {
            document.getElementById (name + "ka").className = "ka-range-2 w-inline-block";
            if (document.getElementById (name + "ka").hasChildNodes()) document.getElementById (name + "ka").children[0].style = "";
        }

        if (!country.bandProps[index].Ku)
        {
            document.getElementById (name + "ku").className = "empty-range w-inline-block";
            if (document.getElementById (name + "ku").hasChildNodes()) document.getElementById (name + "ku").children[0].style.display = "none";
        }
        else
        {
            document.getElementById (name + "ku").className = "ku-range-2 w-inline-block";
            if (document.getElementById (name + "ku").hasChildNodes()) document.getElementById (name + "ku").children[0].style = "";
        }
    }

    filterBands(country)
    {
        this.filterBand (country, "amu1", 0);
        this.filterBand (country, "am7",  1);
        this.filterBand (country, "am6",  2);
        this.filterBand (country, "at1",  3);
        this.filterBand (country, "am33", 4);
        this.filterBand (country, "am3",  5);
        this.filterBand (country, "am5",  6);
        this.filterBand (country, "at2",  7);
        this.filterBand (country, "am8",  8);
        this.filterBand (country, "am44", 9);
        this.filterBand (country, "e80",  10);
        this.filterBand (country, "e103", 11);
        this.filterBand (country, "rv",   12);
    }

    bindSelectCountry ()
    {
        document.getElementById ("select-country").onclick = function ()
        {
            document.getElementById ("cfilter").style.display = "flex";
            document.getElementById ("blur").style.display = "flex";
            this.menuState = 1;
        }.bind (this);

        this.bindResetFilter ()
    }

    resetFilter ()
    {
        this.filterSats (this.fullcountry);
        this.bindBands ();
        document.getElementById ("country-heading").style.display = "none";
        document.getElementById ("filter-reset").style.display = "none";

        if (this.selectedCountry)
        {
            this.selectedCountry.map.material.color.setHex(0xc4ddff);
            this.selectedCountry = null;
        }
        if (this.earthViewChosen == undefined || this.earthViewChosen == 12)
        return;
    }

    
    bindResetFilter ()
    {
        document.getElementById ("filter-reset").onclick = function () 
        {
            this.reset();
            this.filterSats (this.fullcountry);
            this.bindBands ();
            document.getElementById ("country-heading").style.display = "none";
            document.getElementById ("filter-reset").style.display = "none";

            if (this.selectedCountry)
            {
                this.selectedCountry.map.material.color.setHex(0xc4ddff);
                this.selectedCountry = null;
            }
            if (this.earthViewChosen == undefined || this.earthViewChosen == 12)
            return;
        
            var angle = parseFloat (this.satData[this.satDataRows[this.earthViewChosen]].o);

            this.controls.setPosition (Math.cos (this.degToRad (angle)) * 40,  0, -Math.sin (this.degToRad (angle)) * 40, true);
        }.bind(this);

        this.menuState = 0;

        document.getElementById ("menu-open").onclick = function ()
        {
            if (this.menuState == 0) 
            {
                document.getElementById ("blur").style.display = "flex";
                document.getElementById ("mbuttons").style.display = "flex";
                this.menuState = 1;
            }
            else
            {
                document.getElementById ("blur").style.display = "none";
                document.getElementById ("mbuttons").style.display = "none";
                document.getElementById ("cfilter").style.display = "none";
                document.getElementsByClassName ("about-company")[0].style.display = "none";
                this.menuState = 0;
            }
        }.bind(this);

        document.getElementsByClassName ("right-big-button w-inline-block")[0].onclick = function ()
        {
            document.getElementById ("cfilter").style.display = "flex";
            document.getElementById ("mbuttons").style.display = "none";
        }

        document.getElementsByClassName ("left-big-button w-inline-block")[0].onclick = function ()
        {
            document.getElementsByClassName ("about-company")[0].style.display = "flex";
            document.getElementById ("mbuttons").style.display = "none";
        }

    }

    interfaceScreen1 ()
    {

        document.getElementById ("leftSwitch").children[0].style.display = "none";
        document.getElementById ("midSwitch").children[0].style.display = "none";
        document.getElementById ("rightSwitch").children[0].style.display = "none";

        document.getElementById ("leftSwitch").children[1].style.display = "none";
        document.getElementById ("midSwitch").children[1].style.display = "none";
        document.getElementById ("rightSwitch").children[1].style.display = "none";

        document.getElementById ("leftSwitch").children[1].style.display = "block";
        document.getElementById ("midSwitch").children[0].style.display = "block";
        document.getElementById ("rightSwitch").children[0].style.display = "block";

        document.getElementById("button-background").style="transform: translate3d(0%, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;";

        //document.getElementsByClassName ("earthview-satpoints-disc")[0].style.display = "none";
        document.getElementsByClassName ("timeline-box")[0].style.display = "block";
        document.getElementsByClassName ("earthview-satellite-list")[0].style.display = "none";

        
        document.getElementsByClassName ("satellite-ranges-info")[0].style.display = "none";
        document.getElementById("ranges").style.display = "flex";
        
        document.getElementsByClassName ("xrw-ranges-info")[0].style.display = "none";

        
        document.getElementsByClassName ("satellite-info-container")[0].style.display = "none";
        document.getElementsByClassName ("xrw-info-container")[0].style.display = "none";
        document.getElementById ("syszones").display = "none";

        this.resetFilter();
    }

    interfaceScreen2 ()
    {
        document.getElementById ("leftSwitch").children[0].style.display = "none";
        document.getElementById ("midSwitch").children[0].style.display = "none";
        document.getElementById ("rightSwitch").children[0].style.display = "none";

        document.getElementById ("leftSwitch").children[1].style.display = "none";
        document.getElementById ("midSwitch").children[1].style.display = "none";
        document.getElementById ("rightSwitch").children[1].style.display = "none";

        document.getElementById ("leftSwitch").children[0].style.display = "block";
        document.getElementById ("midSwitch").children[1].style.display = "block";
        document.getElementById ("rightSwitch").children[0].style.display = "block";

        document.getElementById("button-background").style="transform: translate3d(74px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;";
        document.getElementsByClassName ("earthview-satellite-list")[0].style.display = "none";

        document.getElementsByClassName ("satellite-ranges-info")[0].style.display = "none";
        document.getElementsByClassName ("xrw-ranges-info")[0].style.display = "none";
        document.getElementById("ranges").style.display = "flex";

        document.getElementsByClassName ("satellite-info-container")[0].style.display = "flex";
        document.getElementsByClassName ("xrw-info-container")[0].style.display = "none";
        document.getElementById ("syszones").display = "none";
    }

    interfaceScreen3 ()
    {
        document.getElementById ("leftSwitch").children[0].style.display = "none";
        document.getElementById ("midSwitch").children[0].style.display = "none";
        document.getElementById ("rightSwitch").children[0].style.display = "none";

        document.getElementById ("leftSwitch").children[1].style.display = "none";
        document.getElementById ("midSwitch").children[1].style.display = "none";
        document.getElementById ("rightSwitch").children[1].style.display = "none";

        document.getElementById ("leftSwitch").children[0].style.display = "block";
        document.getElementById ("midSwitch").children[0].style.display = "block";
        document.getElementById ("rightSwitch").children[1].style.display = "block";
        

        
        document.getElementById("button-background").style="transform: translate3d(140px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;";

        
        document.getElementsByClassName ("earthview-satpoints-disc")[0].style.display = "flex";
        //document.getElementsByClassName ("timeline-box")[0].style.display = "none";
        document.getElementsByClassName ("earthview-satellite-list")[0].style.display = "flex";

        document.getElementsByClassName ("satellite-info-container")[0].style.display = "none";
        
        document.getElementsByClassName ("xrw-info-container")[0].style.display = "none";
        document.getElementById ("syszones").display = "none";

        document.getElementById ("newsat").style.display = "none";
    
    }
    
    loadNewSats ()
    {
        for (let i = 1; i < 11; i++)
        {
            document.getElementById ("tl" + i).parentElement.children[1].onclick = function ()
            {        
                this.focusGlobe();
                document.getElementById ("evsat").style.display = "none";
                document.getElementById ("newsat").style.display = "flex";
                document.getElementById ("select-country").style.display = "none";
            }.bind (this);
        }

        this.newSatMeshes = Array(this.newSatNames.length);

        var loader = new STLLoader();

        this.newSatsLoaded = 0;

        for (let i = 0; i < this.newSatNames.length; i++)
        {
            loader.load ("3d/" + this.newSatNames[i] + '.stl', function (geometry) 
            {
                var index = i;

                this.newSatMeshes[index] = new Mesh (geometry, new MeshPhongMaterial ({ color: 0xE5E5E5 }));
                this.newSatMeshes[index].visible = false;

                this.newSatsLoaded++;

                if (this.newSatsLoaded == this.newSatMeshes.length) 
                    this.initNewSats();

            }.bind (this));
        }
    }

    initNewSats ()
    {
        for (let i = 0; i < this.newSatMeshes.length; i++)
        {
            var angle = parseFloat(this.satData[this.satDataRows[i + 13]].n);

            var mesh = this.newSatMeshes[i];
        
            mesh.position.x = Math.cos (this.degToRad (angle));
            mesh.position.z = Math.sin (this.degToRad (angle));

            mesh.position.x *=  70;
            mesh.position.z *= -70;

            mesh.scale.x = 0.1;
            mesh.scale.y = 0.1;
            mesh.scale.z = 0.1;
            
            meshLookAt (mesh, this.globeMesh, new Vector3 (0, 0, 1));

            this.scene.add (mesh);
        }
    }

    hideAllNewSats ()
    {
        if (this.newSatsLoaded != this.newSatMeshes.length)
            return;

        for (let i = 0; i < this.newSatMeshes.length; i++)
            this.newSatMeshes.visible = false;
    }

    loadGlobe ()
    {
        var innerGlobeGeometry = new SphereGeometry (9.9, 100, 100);
        var innerGlobeMaterial = new MeshBasicMaterial ({ color: 0xE8F1FD });
        this.innerGlobeMesh = new Mesh (innerGlobeGeometry, innerGlobeMaterial);

        var globeGeometry = new SphereGeometry (10, 100, 100);
        this.globeTexture = new TextureLoader ().load ("textures/_edges.png");
        this.globeTexture.minFilter = LinearFilter;
        var globeMaterial = new MeshBasicMaterial ({ map: this.globeTexture, transparent: true });
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

        /*var jLoader = new ObjectLoader();
        jLoader.load ("globe/globe.json", function (obj)
        {
            this.globeMesh = obj;
            
            obj.rotation.y = Math.PI/2;

            obj.scale.x = 0.97;
            obj.scale.y = 0.97;
            obj.scale.z = 0.97;

            this.scene.add (obj);

            this.loadCountries();
        }.bind (this));*/

        
        var mLoader = new MTLLoader ();

        mLoader.setPath ("globe/");
        mLoader.load ("globe.mtl", function (material) 
        {
            material.preload();

            var oLoader = new OBJLoader ();
            oLoader.setPath ("globe/");
            oLoader.load ("globe.obj", function (mesh) 
            {

                mesh.children[0].material = new MeshPhongMaterial ({color: 0xe8f1fd});

                for (let i = 1; i < mesh.children.length; i++)
                {
                    if (mesh.children[i].name == "RUS") mesh.children[i].material = new MeshPhongMaterial ({color: 0x0055ba});
                    else mesh.children[i].material = new MeshPhongMaterial ({color: 0xc4ddff});
                }

                mesh.rotation.y = Math.PI/2 + Math.PI/40;
                
                mesh.scale.x = 0.97;
                mesh.scale.y = 0.97;
                mesh.scale.z = 0.97;

                this.globeMesh = mesh;
                this.scene.add (mesh);
                
                this.loadCountries();

                this.globeLoaded = true;

                /*var json = JSON.stringify( mesh.toJSON());

                function download(content, fileName, contentType) {
                    var a = document.createElement("a");
                    var file = new Blob([content], {type: contentType});
                    a.href = URL.createObjectURL(file);
                    a.download = fileName;
                    a.click();
                }
                download(json, 'globe.json', 'text/plain');*/

            }.bind(this));
        }.bind (this));
    }
};
