define([
    'fly',
    'orbital'
], function(THREE) {
    return function() {
        var controls = {
            init: function() {
                this.setupOrbital();
            },

            setButtonText: function() {
                App.controlsButton.textContent = this.label === 'Orbital' ? 'Fly' : 'Orbital';
            },

            setupFly: function() {
                this.active = new THREE.FlyControls(App.three.camera, App.container);
                this.active.autoForward = false;
                this.active.domElement = App.container;
                this.active.dragToLook = true;
                this.active.movementSpeed = 1;
                this.active.rollSpeed = 0.03;
                this.label = 'Fly';
                this.setButtonText();
            },

            setupOrbital: function() {
                this.active = new THREE.OrbitControls(App.three.camera, App.container);
                this.active.zoomSpeed = 0.2;
                this.active.rotateSpeed = 0.5;
                this.active.noKeys = true;
                this.label = 'Orbital';
                this.setButtonText();
            },

            toggleControls: function() {
                var prevCamera = App.three.camera;
                App.three.camera = new THREE.PerspectiveCamera(
                    75, window.innerWidth / window.innerHeight, 0.1, 1000);
                App.three.camera.position.copy(prevCamera.position);
                App.three.camera.rotation.copy(prevCamera.rotation);

                return this.label === 'Fly' ?
                    this.setupOrbital() :
                    this.setupFly();
            },

            update: function(interval) {
                this.active.update(interval);
            }
        };
        controls.init();
        return controls;
    };
});
