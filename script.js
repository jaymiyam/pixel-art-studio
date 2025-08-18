class PixelArtGenerator {
    constructor() {
        this.canvasSize = 32;
        this.cellSize = 16;
        this.canvas = document.getElementById('pixel-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.grid = document.getElementById('canvas-grid');
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.isDrawing = false;
        this.pixelData = Array(this.canvasSize).fill().map(() => Array(this.canvasSize).fill(null));
        
        this.initializeCanvas();
        this.createColorPalette();
        this.setupEventListeners();
        this.setupTools();
    }
    
    initializeCanvas() {
        // Set canvas size
        this.canvas.width = this.canvasSize * this.cellSize;
        this.canvas.height = this.canvasSize * this.cellSize;
        
        // Clear canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create grid cells
        this.createGrid();
    }
    
    createGrid() {
        this.grid.innerHTML = '';
        
        for (let row = 0; row < this.canvasSize; row++) {
            for (let col = 0; col < this.canvasSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.left = (col * this.cellSize) + 'px';
                cell.style.top = (row * this.cellSize) + 'px';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add event listeners for drawing
                cell.addEventListener('mousedown', (e) => this.startDrawing(e, row, col));
                cell.addEventListener('mouseover', (e) => this.draw(e, row, col));
                cell.addEventListener('mouseup', () => this.stopDrawing());
                
                this.grid.appendChild(cell);
            }
        }
    }
    
    createColorPalette() {
        const palette = document.getElementById('color-palette');
        const colors = [
            '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
            '#FFA500', '#800080', '#008000', '#800000', '#000080', '#808080', '#C0C0C0', '#FFC0CB'
        ];
        
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            
            swatch.addEventListener('click', () => this.selectColor(color));
            palette.appendChild(swatch);
        });
        
        // Select first color by default
        this.selectColor(colors[0]);
    }
    
    selectColor(color) {
        this.currentColor = color;
        
        // Update selected color in palette
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
        
        // Update custom color input
        document.getElementById('custom-color').value = color;
    }
    
    setupEventListeners() {
        // Custom color input
        document.getElementById('custom-color').addEventListener('change', (e) => {
            this.selectColor(e.target.value);
        });
        
        // Clear canvas button
        document.getElementById('clear-canvas').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        // Export button
        document.getElementById('export-canvas').addEventListener('click', () => {
            this.exportCanvas();
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.grid.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Stop drawing when mouse leaves canvas
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        this.grid.addEventListener('mouseleave', () => this.stopDrawing());
    }
    
    setupTools() {
        const penTool = document.getElementById('pen-tool');
        const eraserTool = document.getElementById('eraser-tool');
        const bucketTool = document.getElementById('bucket-tool');
        
        penTool.addEventListener('click', () => {
            this.currentTool = 'pen';
            this.updateToolButtons();
        });
        
        eraserTool.addEventListener('click', () => {
            this.currentTool = 'eraser';
            this.updateToolButtons();
        });
        
        bucketTool.addEventListener('click', () => {
            this.currentTool = 'bucket';
            this.updateToolButtons();
        });
    }
    
    updateToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (this.currentTool === 'pen') {
            document.getElementById('pen-tool').classList.add('active');
        } else if (this.currentTool === 'eraser') {
            document.getElementById('eraser-tool').classList.add('active');
        } else if (this.currentTool === 'bucket') {
            document.getElementById('bucket-tool').classList.add('active');
        }
    }
    
    startDrawing(e, row, col) {
        this.isDrawing = true;
        this.draw(e, row, col);
    }
    
    draw(e, row, col) {
        if (!this.isDrawing) return;
        
        if (this.currentTool === 'pen') {
            this.pixelData[row][col] = this.currentColor;
            this.drawPixel(row, col, this.currentColor);
        } else if (this.currentTool === 'eraser') {
            this.pixelData[row][col] = null;
            this.erasePixel(row, col);
        } else if (this.currentTool === 'bucket') {
            this.fillCanvas();
        }
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    drawPixel(row, col, color) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }
    
    erasePixel(row, col) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }
    
    clearCanvas() {
        // Clear pixel data
        this.pixelData = Array(this.canvasSize).fill().map(() => Array(this.canvasSize).fill(null));
        
        // Clear canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    fillCanvas() {
        // Fill entire canvas with selected color
        this.ctx.fillStyle = this.currentColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update pixel data
        for (let row = 0; row < this.canvasSize; row++) {
            for (let col = 0; col < this.canvasSize; col++) {
                this.pixelData[row][col] = this.currentColor;
            }
        }
    }
    
    exportCanvas() {
        try {
            // Create a temporary canvas for export
            const exportCanvas = document.createElement('canvas');
            const exportCtx = exportCanvas.getContext('2d');
            
            // Set export size (you can adjust this for different resolutions)
            const exportSize = 512;
            exportCanvas.width = exportSize;
            exportCanvas.height = exportSize;
            
            // Scale the context to match the export size
            const scale = exportSize / this.canvas.width;
            exportCtx.scale(scale, scale);
            
            // Draw the current canvas onto the export canvas
            exportCtx.drawImage(this.canvas, 0, 0);
            
            // Convert to blob and download
            exportCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pixel-art-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.9);
            
        } catch (error) {
            console.error('Error exporting canvas:', error);
            alert('Error exporting canvas. Please try again.');
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PixelArtGenerator();
});
