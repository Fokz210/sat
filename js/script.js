import * as THREE from './three.module.js';

    var node = document.getElementById ('container');

    var textureLoader = new THREE.TextureLoader();

    const scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);

    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor( 0x000000, 0 ); 
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1000, 1000 ); 

    var geometry = new THREE.SphereGeometry (10, 100, 100);

    var texture = new THREE.TextureLoader().load ("textures/_map1.png");

    var material = new THREE.MeshBasicMaterial({map: texture});


    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 50;

    var animate = function () {
        requestAnimationFrame(animate);


        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    };

    node.appendChild (renderer.domElement);
    animate();