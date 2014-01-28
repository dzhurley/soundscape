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
            new THREE.CubeGeometry(10, 10, 10),
            new THREE.MeshPhongMaterial({ color: 0x00ff00 })
        );
        scene.add(cube);

        light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
        light.position.set(15, 15, 15);
        scene.add(light);

        if (debug) {
            var lightDot = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 16, 8),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            lightDot.position = light.position;
            scene.add(lightDot);
        }

        camera.position.z = 5;
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
