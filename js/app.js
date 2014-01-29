$(document).ready(function() {
    var $container = $('body'), debug = false;
    var scene, camera, controls, light, renderer;
    var cube;

    function initialize() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        $container.append(renderer.domElement);
        bindEvents();
    }

    function bindEvents() {
        $(window).resize(function() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        controls = new THREE.OrbitControls(camera, renderer.domElement);
    }

    function draw() {
        cube = new THREE.Mesh(
            new THREE.SphereGeometry(10, 30, 20),
            new THREE.MeshLambertMaterial({
                ambient: 0x00ff00,
                color: 0x00ff00,
                shading: THREE.FlatShading
            })
        );
        scene.add(cube);

        scene.add(new THREE.AmbientLight(0x404040));
        light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(15, 15, 20);
        scene.add(light);

        camera.position.z = 30;
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
    }

    var App = window.App = {
        init: function(options) {
            if (options && options.debug) debug = true; 
            initialize();
            draw();
            animate();
        }
    };

    return App.init({debug: true});
});
