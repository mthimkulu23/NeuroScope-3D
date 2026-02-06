// NeuroScope 3D - Advanced Medical Visualization Engine

let scene, camera, renderer, brainGroup, mriOverlay;
let tractographyLoaded = true;
let isSurgicalMode = false;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('viewport-3d').appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f2ff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x0055ff, 1);
    backLight.position.set(-10, -10, -10);
    scene.add(backLight);

    // Brain Group
    brainGroup = new THREE.Group();
    scene.add(brainGroup);

    createTractography();

    // Animation Loop
    animate();

    // Resize handler
    window.addEventListener('resize', onWindowResize, false);

    // UI Listeners
    setupUIListeners();
}

function createTractography() {
    // Clear existing
    while (brainGroup.children.length > 0) {
        brainGroup.remove(brainGroup.children[0]);
    }

    // Procedural Brain Tracts (Realistic Fiber-style)
    const numTracts = 200;
    const colors = [0x00f2ff, 0x0055ff, 0x00ff88, 0xff00ff];

    for (let i = 0; i < numTracts; i++) {
        const points = [];
        const baseRadius = 3;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 5;

        // Create bezier-like curves for "real" look
        const start = new THREE.Vector3(
            Math.cos(angle) * baseRadius * (0.5 + Math.random()),
            height,
            Math.sin(angle) * baseRadius * (0.5 + Math.random())
        );

        const end = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );

        const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
        mid.x += (Math.random() - 0.5) * 3;
        mid.y += (Math.random() - 0.5) * 3;
        mid.z += (Math.random() - 0.5) * 3;

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const curvePoints = curve.getPoints(20);

        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const material = new THREE.LineBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.4
        });

        const line = new THREE.Line(geometry, material);
        brainGroup.add(line);
    }

    // Add a ghost core for volume reference
    const coreGeom = new THREE.IcosahedronGeometry(2.5, 4);
    const coreMat = new THREE.MeshPhongMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });
    brainGroup.add(new THREE.Mesh(coreGeom, coreMat));
}

function setupUIListeners() {
    // Toggle Tractography
    document.getElementById('toggle-tracts')?.addEventListener('click', () => {
        tractographyLoaded = !tractographyLoaded;
        gsap.to(brainGroup.scale, {
            x: tractographyLoaded ? 1 : 0,
            y: tractographyLoaded ? 1 : 0,
            z: tractographyLoaded ? 1 : 0,
            duration: 0.5,
            ease: "power2.inOut"
        });
    });

    // Toggle MRI
    document.getElementById('toggle-mri')?.addEventListener('click', () => {
        const mri = document.getElementById('mri-container');
        if (mri.style.display === 'block') {
            gsap.to(mri, { opacity: 0, x: 50, duration: 0.3, onComplete: () => mri.style.display = 'none' });
        } else {
            mri.style.display = 'block';
            gsap.fromTo(mri, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.3 });
        }
    });

    // Start Surgical AR
    document.getElementById('start-surgical')?.addEventListener('click', (e) => {
        isSurgicalMode = !isSurgicalMode;
        const body = document.body;
        const btn = e.target;

        if (isSurgicalMode) {
            body.classList.add('surgical-mode');
            btn.innerHTML = 'STOP SURGICAL AR';
            btn.classList.replace('btn-primary', 'btn-danger');

            // Effect: Intense glow and rotation speed up
            gsap.to(brainGroup.rotation, { y: "+=10", duration: 1, ease: "power2.in" });
        } else {
            body.classList.remove('surgical-mode');
            btn.innerHTML = 'START SURGICAL AR';
            btn.classList.replace('btn-danger', 'btn-primary');
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const rotationSpeed = isSurgicalMode ? 0.02 : 0.005;
    brainGroup.rotation.y += rotationSpeed;
    brainGroup.rotation.x += rotationSpeed * 0.4;

    renderer.render(scene, camera);
}

// Start visualization
document.addEventListener('DOMContentLoaded', init);
