import * as THREE from 'three';

export function useStadiumPitch(scene: THREE.Scene) {
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });

  const drawLine = (points: THREE.Vector3[]) => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, lineMat);
    line.position.y = 0.62;
    scene.add(line);
  };

  const drawArc = (cx: number, cz: number, r: number, startAngle: number, endAngle: number, segments = 32) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = startAngle + (endAngle - startAngle) * (i / segments);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r));
    }
    drawLine(pts);
  };

  const drawRect = (x1: number, z1: number, x2: number, z2: number) => {
    drawLine([
      new THREE.Vector3(x1, 0, z1),
      new THREE.Vector3(x2, 0, z1),
      new THREE.Vector3(x2, 0, z2),
      new THREE.Vector3(x1, 0, z2),
      new THREE.Vector3(x1, 0, z1),
    ]);
  };

  const initPitch = () => {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(800, 800),
      new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.95, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(800, 200, 0x151530, 0x0d0d20);
    grid.position.y = 0.05;
    scene.add(grid);

    const pitchW = 105, pitchH = 68;
    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(pitchW, pitchH),
      new THREE.MeshStandardMaterial({ color: 0x1e7a40, roughness: 0.65, metalness: 0.0 })
    );
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.5;
    pitch.receiveShadow = true;
    scene.add(pitch);

    const stripeCount = 10;
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 0) continue;
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(pitchW / stripeCount, pitchH),
        new THREE.MeshStandardMaterial({ color: 0x228b4a, roughness: 0.7, transparent: true, opacity: 0.55 })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(-pitchW / 2 + (i + 0.5) * (pitchW / stripeCount), 0.55, 0);
      scene.add(stripe);
    }

    const hw = pitchW / 2, hh = pitchH / 2;
    drawRect(-hw, -hh, hw, hh);
    drawLine([new THREE.Vector3(0, 0, -hh), new THREE.Vector3(0, 0, hh)]);
    drawArc(0, 0, 9.15, 0, Math.PI * 2, 48);

    const centerSpot = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
    centerSpot.rotation.x = -Math.PI / 2;
    centerSpot.position.y = 0.62;
    scene.add(centerSpot);

    drawRect(-hw, -20.16, -hw + 16.5, 20.16);
    drawRect(hw - 16.5, -20.16, hw, 20.16);
    drawRect(-hw, -9.15, -hw + 5.5, 9.15);
    drawRect(hw - 5.5, -9.15, hw, 9.15);

    const penSpot1 = centerSpot.clone();
    penSpot1.position.set(-hw + 11, 0.62, 0);
    scene.add(penSpot1);
    const penSpot2 = centerSpot.clone();
    penSpot2.position.set(hw - 11, 0.62, 0);
    scene.add(penSpot2);

    drawArc(-hw + 11, 0, 9.15, -0.93, 0.93, 24);
    drawArc(hw - 11, 0, 9.15, Math.PI - 0.93, Math.PI + 0.93, 24);
    drawArc(-hw, -hh, 1, 0, Math.PI / 2, 8);
    drawArc(hw, -hh, 1, Math.PI / 2, Math.PI, 8);
    drawArc(hw, hh, 1, Math.PI, 3 * Math.PI / 2, 8);
    drawArc(-hw, hh, 1, 3 * Math.PI / 2, 2 * Math.PI, 8);

    const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.15, metalness: 0.8, roughness: 0.2 });
    const postRadius = 0.12;
    const goalWidth = 7.32;
    const goalHeight = 2.44;
    const goalDepth = 2;

    const createGoal = (xPos: number) => {
      const lp = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 8), goalMat);
      lp.position.set(xPos, goalHeight / 2 + 0.5, -goalWidth / 2);
      scene.add(lp);
      const rp = lp.clone();
      rp.position.set(xPos, goalHeight / 2 + 0.5, goalWidth / 2);
      scene.add(rp);
      const cb = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 8), goalMat);
      cb.rotation.x = Math.PI / 2;
      cb.position.set(xPos, goalHeight + 0.5, 0);
      scene.add(cb);
      const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide, wireframe: true });
      const backNet = new THREE.Mesh(new THREE.PlaneGeometry(goalWidth, goalHeight, 8, 4), netMat);
      const sign = xPos > 0 ? 1 : -1;
      backNet.position.set(xPos + sign * goalDepth, goalHeight / 2 + 0.5, 0);
      scene.add(backNet);
    };
    createGoal(-hw);
    createGoal(hw);

    const createFloodlight = (x: number, z: number) => {
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.4, metalness: 0.8 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 55, 8), poleMat);
      pole.position.set(x, 27.5, z);
      pole.castShadow = true;
      scene.add(pole);

      const lightHead = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2, 4),
        new THREE.MeshStandardMaterial({
          color: 0x444455,
          emissive: 0xfff4cc,
          emissiveIntensity: 1.5,
          roughness: 0.1,
          metalness: 0.5
        })
      );
      lightHead.position.set(x, 56, z);
      scene.add(lightHead);

      // Main flood spot — bright, wide cone pointing at pitch centre
      const floodSpot = new THREE.SpotLight(0xfff8e7, 8, 400, Math.PI / 3.5, 0.5, 1.2);
      floodSpot.position.set(x, 56, z);
      floodSpot.target.position.set(0, 0, 0);
      floodSpot.castShadow = false; // skip shadow for perf, ambient lights fill it
      scene.add(floodSpot);
      scene.add(floodSpot.target);

      // Soft point-light corona so light bleeds naturally onto nearby stands
      const corona = new THREE.PointLight(0xfff0cc, 3.0, 120, 2);
      corona.position.set(x, 54, z);
      scene.add(corona);
    };

    createFloodlight(-75, -55);
    createFloodlight(75, -55);
    createFloodlight(-75, 55);
    createFloodlight(75, 55);
  };

  return { initPitch };
}
