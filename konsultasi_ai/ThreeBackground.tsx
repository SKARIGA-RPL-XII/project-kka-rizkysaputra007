"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    // Gunakan fog untuk menyembunyikan partikel yang jauh (depth effect)
    scene.fog = new THREE.FogExp2(0x020617, 0.002); // Warna slate-950 (#020617)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimasi performa
    mountRef.current.appendChild(renderer.domElement);

    // --- Membuat Partikel ---
    const geometry = new THREE.IcosahedronGeometry(1, 0); 
    const material = new THREE.MeshPhongMaterial({
      color: 0x22d3ee, // Cyan
      transparent: true,
      opacity: 0.15,
      wireframe: true, 
      shininess: 100,
    });

    const particles: THREE.Mesh[] = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.x = (Math.random() - 0.5) * 80;
      mesh.position.y = (Math.random() - 0.5) * 80;
      mesh.position.z = (Math.random() - 0.5) * 50;

      const scale = Math.random() * 2 + 0.5;
      mesh.scale.set(scale, scale, scale);
      
      mesh.userData = {
        rotX: (Math.random() - 0.5) * 0.01,
        rotY: (Math.random() - 0.5) * 0.01,
        velY: (Math.random() * 0.02) + 0.005
      };

      scene.add(mesh);
      particles.push(mesh);
    }

    // --- Pencahayaan ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x22d3ee, 2, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xa855f7, 2, 100); 
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // --- Mouse Interaction ---
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
    };

    document.addEventListener("mousemove", handleMouseMove);

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth camera movement
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Animate particles
      particles.forEach((p) => {
        p.rotation.x += p.userData.rotX;
        p.rotation.y += p.userData.rotY;
        p.position.y += p.userData.velY;

        if (p.position.y > 40) {
          p.position.y = -40;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
}