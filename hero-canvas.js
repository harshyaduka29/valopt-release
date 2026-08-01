/* =================================================================
   VALORANT OPTIMIZER — REALISTIC 3D GEOMETRIC ENGINE (v4.0 DEPLOYED)
   Features:
   - True 3D Polygon Wireframe & Lit Solid Faces (Cubes, Pyramids, Octahedrons)
   - Real-Time 3D Light Source Shading & Metallic Rim Glows
   - Dynamic Mobile Viewport Scale & Mobile Touch Parallax Support
   - Fluid 60FPS Bezier Motion (Roam -> Magnetic Convergence -> Supernova Blast)
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    // Clean up old canvas
    const oldCanvas = document.getElementById('hero-tactical-canvas-v4') || document.getElementById('hero-tactical-canvas-v3') || document.getElementById('hero-tactical-canvas-v2') || document.getElementById('hero-tactical-canvas') || document.getElementById('hero-grid-canvas');
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'hero-tactical-canvas-v4';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.88';

    heroSection.insertBefore(canvas, heroSection.firstChild);

    const ctx = canvas.getContext('2d');
    let width, height, dpr;
    let time = 0;
    let mouseX = 0, mouseY = 0;
    let isMobile = false;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for high-DPI mobile screens
        width = heroSection.offsetWidth;
        height = heroSection.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        isMobile = window.innerWidth <= 768;
    }
    window.addEventListener('resize', resize);
    resize();

    // MOUSE & MOBILE TOUCH PARALLAX SUPPORT
    function handlePointerMove(clientX, clientY) {
        const rect = heroSection.getBoundingClientRect();
        mouseX = (clientX - rect.left) / width - 0.5;
        mouseY = (clientY - rect.top) / height - 0.5;
    }

    window.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    // 3D SHAPE GEOMETRY DEFINITIONS (True 3D Vertices & Faces)
    const SHAPE_TYPES = [
        // 1. Pyramid (Tetrahedron)
        {
            vertices: [
                [0, -1.1, 0], [1.1, 1, 1], [-1.1, 1, 1], [0, 1, -1.1]
            ],
            faces: [
                [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]
            ]
        },
        // 2. Cube (Hexahedron)
        {
            vertices: [
                [-0.85, -0.85, -0.85], [0.85, -0.85, -0.85], [0.85, 0.85, -0.85], [-0.85, 0.85, -0.85],
                [-0.85, -0.85, 0.85], [0.85, -0.85, 0.85], [0.85, 0.85, 0.85], [-0.85, 0.85, 0.85]
            ],
            faces: [
                [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]
            ]
        },
        // 3. Octahedron (Diamond Crystal)
        {
            vertices: [
                [0, -1.3, 0], [1.3, 0, 0], [0, 0, 1.3], [-1.3, 0, 0], [0, 0, -1.3], [0, 1.3, 0]
            ],
            faces: [
                [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
                [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
            ]
        }
    ];

    // GENERATE 42 REALISTIC 3D OBJECTS
    const numObjects = 42;
    const shapeObjects = Array.from({ length: numObjects }, (_, i) => {
        const shapeDef = SHAPE_TYPES[i % SHAPE_TYPES.length];
        return {
            id: i,
            shape: shapeDef,
            roamX: (Math.random() - 0.5) * 2.8,
            roamY: (Math.random() - 0.5) * 2.2,
            roamZ: Math.random() * 650 + 150,
            scale: Math.random() * 20 + 14,
            rotX: Math.random() * Math.PI * 2,
            rotY: Math.random() * Math.PI * 2,
            rotZ: Math.random() * Math.PI * 2,
            rotSpeedX: (Math.random() - 0.5) * 0.012,
            rotSpeedY: (Math.random() - 0.5) * 0.012,
            rotSpeedZ: (Math.random() - 0.5) * 0.012,
            blastVx: 0,
            blastVy: 0
        };
    });

    // BLAST PARTICLES & SHOCKWAVES
    let blastSparks = [];
    let shockwaves = [];

    // COLOR MORPHER (Valorant Red #ff4655 <-> Radiant Teal #00ffaa)
    function getThemeRGB(t, alpha = 1) {
        const cycle = (Math.sin(t * 0.35) + 1) / 2;
        const r = Math.round(255 * (1 - cycle));
        const g = Math.round(70 * (1 - cycle) + 255 * cycle);
        const b = Math.round(85 * (1 - cycle) + 170 * cycle);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // 3D MATRIX ROTATION & PROJECTION
    function project3D(v, rotX, rotY, rotZ) {
        let x = v[0], y = v[1], z = v[2];

        // Rotate X
        let cos = Math.cos(rotX), sin = Math.sin(rotX);
        let y1 = y * cos - z * sin;
        let z1 = y * sin + z * cos;

        // Rotate Y
        cos = Math.cos(rotY); sin = Math.sin(rotY);
        let x2 = x * cos + z1 * sin;
        let z2 = -x * sin + z1 * cos;

        // Rotate Z
        cos = Math.cos(rotZ); sin = Math.sin(rotZ);
        let x3 = x2 * cos - y1 * sin;
        let y3 = x2 * sin + y1 * cos;

        return [x3, y3, z2];
    }

    // RENDER REALISTIC SHADED 3D GEOMETRIC OBJECT
    function drawReal3DShape(obj, cx, cy, t, phase, convergeProgress, blastProgress) {
        let currentNormX = obj.roamX;
        let currentNormY = obj.roamY;

        if (phase === 'CONVERGE') {
            const easeC = Math.pow(convergeProgress, 2.2);
            currentNormX = obj.roamX * (1 - easeC);
            currentNormY = obj.roamY * (1 - easeC);
        } else if (phase === 'BLAST' || phase === 'EXPAND') {
            const boost = (1 - Math.max(0, blastProgress)) * 1.2;
            currentNormX = obj.roamX + obj.blastVx * boost;
            currentNormY = obj.roamY + obj.blastVy * boost;
        }

        const perspectiveScale = 450 / (450 + obj.roamZ);
        // Mobile scaling adjustment
        const mobileMult = isMobile ? 0.75 : 1.0;
        const screenX = currentNormX * (width * 0.45 * mobileMult) + cx;
        const screenY = currentNormY * (height * 0.45 * mobileMult) + cy;
        const finalScale = obj.scale * perspectiveScale * mobileMult;

        // Transform vertices
        const transformedVerts = obj.shape.vertices.map(v => {
            const p = project3D(v, obj.rotX, obj.rotY, obj.rotZ);
            return [
                screenX + p[0] * finalScale,
                screenY + p[1] * finalScale,
                p[2] * finalScale
            ];
        });

        // Draw Faces with Real 3D Shading
        obj.shape.faces.forEach((face, fIdx) => {
            const p0 = transformedVerts[face[0]];
            const p1 = transformedVerts[face[1]];
            const p2 = transformedVerts[face[2]];

            const ax = p1[0] - p0[0], ay = p1[1] - p0[1];
            const bx = p2[0] - p0[0], by = p2[1] - p0[1];
            const nz = ax * by - ay * bx;

            if (nz <= 0) return; // Back-face culling

            const lightIntensity = Math.min(1.0, Math.max(0.25, Math.abs(nz) / (finalScale * finalScale * 3)));
            const baseColor = getThemeRGB(t + obj.id * 0.2 + fIdx * 0.1, 0.28 * lightIntensity);
            const strokeColor = getThemeRGB(t + obj.id * 0.2, 0.85 * perspectiveScale);

            ctx.save();
            ctx.beginPath();
            face.forEach((vIdx, i) => {
                const pt = transformedVerts[vIdx];
                if (i === 0) ctx.moveTo(pt[0], pt[1]);
                else ctx.lineTo(pt[0], pt[1]);
            });
            ctx.closePath();

            ctx.fillStyle = baseColor;
            ctx.fill();

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = isMobile ? 1.0 : 1.3;
            ctx.stroke();

            ctx.restore();
        });
    }

    const CYCLE_DURATION = 10.5;

    function draw() {
        time += 0.01;
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2 + mouseX * (isMobile ? 25 : 50);
        const centerY = height * 0.45 + mouseY * (isMobile ? 15 : 25);

        const cycleTime = time % CYCLE_DURATION;

        let phase = 'ROAM';
        let convergeProgress = 0;
        let blastProgress = 0;

        if (cycleTime >= 5.5 && cycleTime < 8.0) {
            phase = 'CONVERGE';
            convergeProgress = (cycleTime - 5.5) / 2.5;
        } else if (cycleTime >= 8.0 && cycleTime < 8.5) {
            phase = 'BLAST';
            blastProgress = (cycleTime - 8.0) / 0.5;
        } else if (cycleTime >= 8.5) {
            phase = 'EXPAND';
            blastProgress = 1.0 - (cycleTime - 8.5) / 2.0;
        }

        // Trigger Blast Shockwave Event at 8.0s
        if (Math.abs(cycleTime - 8.0) < 0.015 && shockwaves.length === 0) {
            shockwaves.push({
                x: centerX,
                y: centerY,
                radius: 10,
                maxRadius: Math.max(width, height) * 0.75,
                alpha: 1.0,
                color: '#00ffaa'
            });
            shockwaves.push({
                x: centerX,
                y: centerY,
                radius: 5,
                maxRadius: Math.max(width, height) * 0.5,
                alpha: 1.0,
                color: '#ff4655'
            });

            const sparkCount = isMobile ? 35 : 65;
            for (let k = 0; k < sparkCount; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 12 + 6;
                blastSparks.push({
                    x: centerX,
                    y: centerY,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    size: Math.random() * 3 + 1.2,
                    life: 1.0,
                    color: Math.random() > 0.4 ? '#ff4655' : '#00ffaa'
                });
            }

            shapeObjects.forEach(s => {
                const angle = Math.atan2(s.roamY, s.roamX) + (Math.random() - 0.5) * 0.6;
                s.blastVx = Math.cos(angle) * 1.8;
                s.blastVy = Math.sin(angle) * 1.8;
            });
        }

        // A. AMBIENT LIGHT CORE
        const coreAlpha = phase === 'CONVERGE' ? 0.35 + convergeProgress * 0.35 : 0.22;
        const aura = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, width * (isMobile ? 0.75 : 0.6));
        aura.addColorStop(0, getThemeRGB(time, coreAlpha));
        aura.addColorStop(0.65, getThemeRGB(time + Math.PI, 0.1));
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, width, height);

        // B. ROTATING TACTICAL HUD RETICLES
        ctx.save();
        ctx.translate(centerX, centerY);

        const reticleScale = (phase === 'CONVERGE' ? 1.0 - convergeProgress * 0.45 : 1.0) * (isMobile ? 0.7 : 1.0);
        ctx.scale(reticleScale, reticleScale);

        // Reticle Ring 1
        ctx.strokeStyle = getThemeRGB(time, 0.25);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 210, 0, Math.PI * 2);
        ctx.stroke();

        // Dashed Rotating Ring 2
        ctx.save();
        ctx.rotate(time * 0.12);
        ctx.strokeStyle = getThemeRGB(time + 1, 0.4);
        ctx.setLineDash([8, 16]);
        ctx.beginPath();
        ctx.arc(0, 0, 155, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Dashed Rotating Ring 3
        ctx.save();
        ctx.rotate(-time * 0.18);
        ctx.strokeStyle = getThemeRGB(time + 2, 0.45);
        ctx.setLineDash([4, 18, 10, 14]);
        ctx.beginPath();
        ctx.arc(0, 0, 95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Singularity Pulse
        if (phase === 'CONVERGE' || phase === 'BLAST') {
            const singRadius = 15 + Math.sin(time * 25) * 6 + (phase === 'CONVERGE' ? convergeProgress * 30 : 0);
            ctx.fillStyle = getThemeRGB(time * 3, 0.85);
            ctx.shadowColor = getThemeRGB(time * 3, 1.0);
            ctx.shadowBlur = 35;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(2, singRadius), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        // C. DRAW BLAST SHOCKWAVES
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            sw.radius += 12;
            sw.alpha -= 0.02;

            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                shockwaves.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.strokeStyle = sw.color;
            ctx.globalAlpha = sw.alpha;
            ctx.lineWidth = isMobile ? 2 : 3;
            ctx.shadowColor = sw.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // D. DRAW BLAST SPARKS & FRAGMENTS
        for (let i = blastSparks.length - 1; i >= 0; i--) {
            const sp = blastSparks[i];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vx *= 0.96;
            sp.vy *= 0.96;
            sp.life -= 0.024;

            if (sp.life <= 0) {
                blastSparks.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = sp.life;
            ctx.shadowColor = sp.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // E. DRAW REALISTIC SHADED 3D GEOMETRIC OBJECTS
        shapeObjects.forEach(obj => {
            obj.rotX += obj.rotSpeedX;
            obj.rotY += obj.rotSpeedY;
            obj.rotZ += obj.rotSpeedZ;

            drawReal3DShape(obj, centerX, centerY, time, phase, convergeProgress, blastProgress);
        });

        requestAnimationFrame(draw);
    }

    draw();
});
