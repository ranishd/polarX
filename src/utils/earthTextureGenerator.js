/**
 * Generates a high-definition equirectangular texture of planet Earth
 * with accurate geographic focus on Antarctica, the Southern Ocean,
 * surrounding continental landmasses, and sea-ice concentration contours.
 */
export function generateEarthTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Deep Abyssal Ocean Background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#020b18');
  oceanGrad.addColorStop(0.5, '#03142c');
  oceanGrad.addColorStop(0.85, '#041d3e'); // Southern Ocean deep navy
  oceanGrad.addColorStop(1, '#020b18');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper to map (lon, lat) to canvas (x, y)
  // lon: [-180, 180] -> x: [0, width]
  // lat: [90, -90]   -> y: [0, height]
  const toXY = (lon, lat) => [
    ((lon + 180) / 360) * width,
    ((90 - lat) / 180) * height,
  ];

  // 2. Continental Landmasses (Dark Tactical Slate)
  ctx.fillStyle = '#0a213a';
  ctx.strokeStyle = '#1e3a5f';
  ctx.lineWidth = 1.5;

  const drawPolygon = (coords, fill = true, stroke = true) => {
    if (coords.length < 2) return;
    ctx.beginPath();
    const [startX, startY] = toXY(coords[0][0], coords[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < coords.length; i++) {
      const [x, y] = toXY(coords[i][0], coords[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  // South America Tip (Patagonia & Tierra del Fuego)
  drawPolygon([
    [-75, -35], [-72, -42], [-74, -48], [-72, -54],
    [-68, -55.5], [-65, -55], [-66, -50], [-64, -40],
    [-58, -35], [-75, -35]
  ]);

  // Southern Africa
  drawPolygon([
    [15, -22], [14, -28], [18, -34.8], [26, -34],
    [32, -28], [35, -22], [15, -22]
  ]);

  // Australia & New Zealand
  drawPolygon([
    [115, -20], [115, -34], [130, -32], [138, -36],
    [148, -38], [153, -28], [140, -18], [115, -20]
  ]);
  // Tasmania
  drawPolygon([
    [144, -40.5], [148, -41], [147, -43.5], [144, -43], [144, -40.5]
  ]);
  // New Zealand (South & North Island)
  drawPolygon([
    [166, -46.5], [171, -43], [174, -41], [172, -44], [167, -47], [166, -46.5]
  ]);
  drawPolygon([
    [174, -41.5], [178, -38], [175, -35], [173, -39], [174, -41.5]
  ]);

  // 3. Sea-Ice Concentration (SIC) Field (Southern Ocean around Antarctica)
  // Extends between ~60°S and the Antarctic coastline
  const drawIceShelfZone = () => {
    // Outer Marginal Ice Zone (15-40% SIC - Translucent Cyan)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.beginPath();
    const iceEdgeCoords = [
      [-180, -60], [-150, -62], [-120, -63], [-90, -64],
      [-70, -61], [-50, -58], [-20, -59], [0, -61],
      [20, -60], [50, -61], [80, -60], [110, -62],
      [140, -61], [170, -60], [180, -60],
      [180, -90], [-180, -90]
    ];
    iceEdgeCoords.forEach(([lon, lat], i) => {
      const [x, y] = toXY(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();

    // Consolidated Pack Ice (40-70% SIC - Pale Frost White-Blue)
    ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.beginPath();
    const packIceCoords = [
      [-180, -65], [-140, -67], [-100, -68], [-70, -64],
      [-55, -62], [-30, -63], [0, -65], [30, -64],
      [70, -63], [100, -65], [130, -66], [160, -65], [180, -65],
      [180, -90], [-180, -90]
    ];
    packIceCoords.forEach(([lon, lat], i) => {
      const [x, y] = toXY(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  };
  drawIceShelfZone();

  // 4. Continent of Antarctica (Glacial White with Crisp Continental Relief)
  // Accurate coastal geometry
  const antarcticaCoast = [
    [0, -70],      // Queen Maud Land (Dronning Maud)
    [12, -70.8],   // Princess Astrid Coast (Near Maitri Station)
    [25, -70.2],   // Princess Ragnhild Coast
    [40, -68.5],   // Enderby Land
    [55, -67.2],   // Kemp Land
    [65, -67.5],   // Mac. Robertson Land
    [70, -69.0],   // Prydz Bay entrance
    [72, -73.5],   // Deep Amery Ice Shelf
    [76, -69.4],   // Larsemann Hills (Near Bharati Station)
    [85, -66.8],   // Queen Mary Land
    [100, -66.5],  // Wilkes Land
    [120, -66.2],  // Sabrina Coast
    [140, -67.0],  // Terre Adélie
    [155, -69.0],  // Oates Coast
    [165, -71.5],  // Cape Adare / Victoria Land
    [168, -78.0],  // Ross Ice Shelf West edge
    [180, -82.5],  // Ross Ice Shelf deep south
    [-170, -83.5],
    [-150, -78.5], // Ross Ice Shelf East edge
    [-140, -75.5], // Marie Byrd Land
    [-120, -74.0], // Walgreen Coast
    [-100, -73.0], // Ellsworth Land
    [-80, -73.5],  // Ronne Ice Shelf West
    [-70, -69.0],  // Antarctic Peninsula base
    [-66, -65.5],  // Antarctic Peninsula West Coast
    [-63, -63.3],  // Antarctic Peninsula Tip (Graham Land / Cape Dubouzet)
    [-57, -65.0],  // Antarctic Peninsula East Coast
    [-60, -75.0],  // Ronne-Filchner Ice Shelf deep indentation (Weddell Sea)
    [-50, -78.0],  // Filchner Ice Shelf
    [-35, -76.0],  // Coats Land
    [-20, -73.0],  // Caird Coast
    [-10, -71.5],  // Princess Martha Coast
    [0, -70.0],    // Back to origin
  ];

  ctx.fillStyle = '#f8fafc'; // Crisp polar ice white
  ctx.strokeStyle = '#93c5fd'; // Ice shelf blue edge
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const [aStartX, aStartY] = toXY(antarcticaCoast[0][0], antarcticaCoast[0][1]);
  ctx.moveTo(aStartX, aStartY);
  for (let i = 1; i < antarcticaCoast.length; i++) {
    const [x, y] = toXY(antarcticaCoast[i][0], antarcticaCoast[i][1]);
    ctx.lineTo(x, y);
  }
  // Fill all the way down to South Pole (-90°)
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Continental Ice Sheet Subtle Shading (East Antarctica Ice Dome)
  const iceDomeGrad = ctx.createRadialGradient(
    (90 / 360) * width, height - 80, 20,
    (90 / 360) * width, height - 80, 250
  );
  iceDomeGrad.addColorStop(0, '#ffffff');
  iceDomeGrad.addColorStop(0.7, '#f1f5f9');
  iceDomeGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = iceDomeGrad;
  ctx.beginPath();
  ctx.arc((90 / 360) * width, height - 80, 250, 0, Math.PI * 2);
  ctx.fill();

  // 5. Graticule Lines (Parallels and Meridians)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;

  // Latitude Parallels: 0°, -30°, -50°, -60°, -70°, -80°
  const parallels = [0, -30, -50, -60, -70, -80];
  parallels.forEach((lat) => {
    const [, y] = toXY(0, lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  });

  // Longitude Meridians every 30°
  for (let lon = -180; lon < 180; lon += 30) {
    const [x] = toXY(lon, 0);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 6. Highlight Operating Navigation Region (Weddell Sea -> Princess Astrid Coast)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;
  const [opX1, opY1] = toXY(5, -58);
  const [opX2, opY2] = toXY(35, -73);
  ctx.strokeRect(opX1, opY1, opX2 - opX1, opY2 - opY1);
  ctx.setLineDash([]); // Reset line dash

  return canvas;
}
