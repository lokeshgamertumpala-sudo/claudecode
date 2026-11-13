export class SketchCanvas {
  constructor(canvasId, onChangeCallback) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.onChange = onChangeCallback;

    this.tool = 'pen';
    this.color = '#ffffff';
    this.size = 3;
    this.layers = {
      structure: true,
      power: true,
      comms: true,
      thermal: true,
      payload: true
    };
    this.currentLayer = 'structure';

    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;

    this.isDrawing = false;
    this.lastPoint = null;

    this.layerColors = {
      structure: '#b0bec5',
      power: '#4fc3f7',
      comms: '#ffd54f',
      thermal: '#ef5350',
      payload: '#66bb6a'
    };

    this.toolShapes = {
      pen: 'freehand',
      eraser: 'freehand',
      rect: 'rectangle',
      circle: 'circle',
      solar: 'solar-panel',
      antenna: 'antenna',
      radiator: 'radiator',
      payload: 'payload'
    };

    this.shapeStart = null;
    this.previewCanvas = document.createElement('canvas');
    this.previewCtx = this.previewCanvas.getContext('2d');

    this.dpr = window.devicePixelRatio || 1;
    this.resizeCanvas();

    this.layerCanvases = {};
    this.initLayerCanvases();

    this.drawGrid();
    this.setupEventListeners();
    this.saveState();
  }

  initLayerCanvases() {
    const layers = ['structure', 'power', 'comms', 'thermal', 'payload'];
    layers.forEach(layer => {
      const canvas = document.createElement('canvas');
      canvas.width = this.canvas.width;
      canvas.height = this.canvas.height;
      this.layerCanvases[layer] = {
        canvas,
        ctx: canvas.getContext('2d')
      };
    });
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);

    Object.values(this.layerCanvases).forEach(lc => {
      lc.canvas.width = this.canvas.width;
      lc.canvas.height = this.canvas.height;
      lc.ctx.scale(this.dpr, this.dpr);
    });
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * this.dpr;
    const y = (e.clientY - rect.top) * this.dpr;

    this.isDrawing = true;
    this.lastPoint = { x, y };
    this.shapeStart = { x, y };

    if (this.tool === 'pen' || this.tool === 'eraser') {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }

    this.hideDropZone();
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * this.dpr;
    const y = (e.clientY - rect.top) * this.dpr;

    if (this.tool === 'pen' || this.tool === 'eraser') {
      this.ctx.strokeStyle = this.tool === 'eraser' ? 'rgba(0,0,0,1)' : this.color;
      this.ctx.lineWidth = this.size;
      this.ctx.globalCompositeOperation = this.tool === 'eraser' ? 'destination-out' : 'source-over';
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.lastPoint = { x, y };
    } else {
      this.redrawWithPreview(x, y);
    }
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;

    if (this.tool !== 'pen' && this.tool !== 'eraser' && this.shapeStart) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * this.dpr;
      const y = (e.clientY - rect.top) * this.dpr;
      this.drawShape(this.shapeStart.x, this.shapeStart.y, x, y);
    }

    this.isDrawing = false;
    this.lastPoint = null;
    this.shapeStart = null;
    this.saveState();
    if (this.onChange) this.onChange();
  }

  onDoubleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * this.dpr;
    const y = (e.clientY - rect.top) * this.dpr;
    this.drawShape(x, y, x + 20 * this.dpr, y + 20 * this.dpr);
    this.saveState();
    if (this.onChange) this.onChange();
  }

  redrawWithPreview(endX, endY) {
    const startX = this.shapeStart.x;
    const startY = this.shapeStart.y;

    this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    this.drawGrid();
    this.redrawAllLayers();
    this.drawShape(startX, startY, endX, endY, true);
  }

  drawShape(x1, y1, x2, y2, isPreview = false) {
    const ctx = isPreview ? this.ctx : this.getLayerContext();
    ctx.strokeStyle = isPreview ? 'rgba(255,255,255,0.5)' : this.color;
    ctx.lineWidth = this.size;
    ctx.setLineDash(isPreview ? [5, 5] : []);
    ctx.globalCompositeOperation = 'source-over';

    const shapeType = this.toolShapes[this.tool];
    const width = x2 - x1;
    const height = y2 - y1;

    ctx.beginPath();

    switch (shapeType) {
      case 'rectangle': {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const w = Math.abs(width);
        const h = Math.abs(height);
        ctx.rect(left, top, w, h);
        break;
      }
      case 'circle': {
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const radius = Math.sqrt(width * width + height * height) / 2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        break;
      }
      case 'solar-panel': {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const w = Math.abs(width);
        const h = Math.abs(height);
        ctx.rect(left, top, w, h);
        for (let i = 1; i < 4; i++) {
          ctx.moveTo(left + i * w / 4, top);
          ctx.lineTo(left + i * w / 4, top + h);
        }
        break;
      }
      case 'antenna': {
        ctx.moveTo((x1 + x2) / 2, Math.min(y1, y2));
        ctx.lineTo((x1 + x2) / 2, Math.max(y1, y2));
        ctx.moveTo(Math.min(x1, x2), (y1 + y2) / 2);
        ctx.lineTo(Math.max(x1, x2), (y1 + y2) / 2);
        break;
      }
      case 'radiator': {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const w = Math.abs(width);
        const h = Math.abs(height);
        ctx.rect(left, top, w, h);
        for (let i = 1; i < 5; i++) {
          ctx.moveTo(left, top + i * h / 5);
          ctx.lineTo(left + w, top + i * h / 5);
        }
        break;
      }
      case 'payload': {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const w = Math.abs(width);
        const h = Math.abs(height);
        ctx.rect(left, top, w, h);
        ctx.moveTo(left + w / 2, top);
        ctx.lineTo(left + w / 2, top + h);
        ctx.moveTo(left, top + h / 2);
        ctx.lineTo(left + w, top + h / 2);
        break;
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);
  }

  getLayerContext() {
    const lc = this.layerCanvases[this.currentLayer];
    if (!lc) return this.ctx;
    lc.ctx.strokeStyle = this.color;
    lc.ctx.lineWidth = this.size;
    lc.ctx.lineCap = 'round';
    lc.ctx.lineJoin = 'round';
    lc.ctx.globalCompositeOperation = 'source-over';
    return lc.ctx;
  }

  redrawAllLayers() {
    this.drawGrid();
    const layerOrder = ['structure', 'power', 'comms', 'thermal', 'payload'];
    layerOrder.forEach(layer => {
      if (this.layers[layer]) {
        this.ctx.drawImage(this.layerCanvases[layer].canvas, 0, 0);
      }
    });
  }

  drawGrid() {
    this.ctx.fillStyle = '#0b0d12';
    this.ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

    this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    this.ctx.lineWidth = 1;
    const gridSize = 20;

    for (let x = 0; x <= this.canvas.width / this.dpr; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height / this.dpr);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height / this.dpr; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width / this.dpr, y);
      this.ctx.stroke();
    }
  }

  setTool(tool) {
    this.tool = tool;
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  }

  setColor(color) {
    this.color = color;
  }

  setSize(size) {
    this.size = parseInt(size);
  }

  toggleLayer(layer, visible) {
    this.layers[layer] = visible;
    this.redrawAllLayers();
    this.saveState();
    if (this.onChange) this.onChange();
  }

  saveState() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(imageData);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  restoreLastState() {
    if (this.historyIndex >= 0) {
      const imageData = this.history[this.historyIndex];
      this.ctx.putImageData(imageData, 0, 0);
      this.syncLayerCanvasesFromMain();
    }
  }

  syncLayerCanvasesFromMain() {
    Object.values(this.layerCanvases).forEach(lc => {
      lc.ctx.putImageData(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), 0, 0);
    });
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreLastState();
      if (this.onChange) this.onChange();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreLastState();
      if (this.onChange) this.onChange();
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.values(this.layerCanvases).forEach(lc => {
      lc.ctx.clearRect(0, 0, lc.canvas.width, lc.canvas.height);
    });
    this.drawGrid();
    this.history = [];
    this.historyIndex = -1;
    this.saveState();
    if (this.onChange) this.onChange();
    this.showDropZone();
  }

  isEmpty() {
    const blankCanvas = document.createElement('canvas');
    blankCanvas.width = this.canvas.width;
    blankCanvas.height = this.canvas.height;
    const blankCtx = blankCanvas.getContext('2d');
    blankCtx.fillStyle = '#0b0d12';
    blankCtx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);
    blankCtx.strokeStyle = 'rgba(255,255,255,0.03)';
    blankCtx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x <= blankCanvas.width; x += gridSize) {
      blankCtx.beginPath();
      blankCtx.moveTo(x, 0);
      blankCtx.lineTo(x, blankCanvas.height);
      blankCtx.stroke();
    }
    for (let y = 0; y <= blankCanvas.height; y += gridSize) {
      blankCtx.beginPath();
      blankCtx.moveTo(0, y);
      blankCtx.lineTo(blankCanvas.width, y);
      blankCtx.stroke();
    }

    const currentData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    const blankData = blankCtx.getImageData(0, 0, blankCanvas.width, blankCanvas.height).data;

    for (let i = 0; i < currentData.length; i += 4) {
      if (currentData[i] !== blankData[i] ||
          currentData[i+1] !== blankData[i+1] ||
          currentData[i+2] !== blankData[i+2]) {
        return false;
      }
    }
    return true;
  }

  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }

  loadImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
      this.syncLayerCanvasesFromMain();
      this.saveState();
      if (this.onChange) this.onChange();
      this.hideDropZone();
    };
    img.src = dataUrl;
  }

  getMetadata() {
    return {
      tool: this.tool,
      layer: this.currentLayer,
      layers: this.layers,
      timestamp: new Date().toISOString()
    };
  }

  hideDropZone() {
    const dropZone = document.getElementById('canvas-overlay');
    if (dropZone) dropZone.style.display = 'none';
  }

  showDropZone() {
    const dropZone = document.getElementById('canvas-overlay');
    if (dropZone && this.isEmpty()) dropZone.style.display = 'flex';
  }
}