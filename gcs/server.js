/*eslint-env node*/
(function() {
    'use strict';

    const express = require('express');
    const compression = require('compression');
    const cors = require('cors');
    const fs = require('fs').promises;
    const path = require('path');

    const app = express();
    const port = 8484;
    app.use(cors());
    app.use('/cesium', express.static(path.join(__dirname, 'Cesium-1.130')));
    app.use(express.json());
    app.use(compression());
    app.use(express.static(__dirname));

    // Handle favicon to avoid 404
    app.get('/favicon.ico', (req, res) => res.status(204).end());

    app.get('/', (req, res) => {
        res.send('OSM/Google Maps Tile Server is running. Visit /index.html to view the map or use /osm/:z/:x/:y or /gsat/:z/:x/:y to request tiles, e.g., /osm/0/0/0');
    });

    async function downloadTile(z, x, y, type = 'osm') {
        try {
            const baseDir = type === 'osm' ? 'OSM' : 'gsat';
            const tilePath = path.join(__dirname, 'Tiles', baseDir, z.toString(), x.toString(), `${y}.png`);
            const tileUrl = type === 'osm' 
                ? `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`
                : `https://mt0.google.com/vt?lyrs=s&x=${x}&s=&y=${y}&z=${z}`;

            try {
                await fs.access(tilePath);
                console.log(`Tile already cached: ${tilePath}`);
                return;
            } catch (err) {
                console.log(`Tile not cached, downloading: ${tileUrl}`);
            }

            const dir = path.join(__dirname, 'Tiles', baseDir, z.toString(), x.toString());
            await fs.mkdir(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);

            const response = await fetch(tileUrl, {
                headers: { 'User-Agent': 'TileServer/1.0 (your.email@example.com)' }
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(tilePath, buffer);
            console.log(`Saved tile: ${tilePath}`);
        } catch (error) {
            console.error(`Error downloading tile z=${z}, x=${x}, y=${y} (${type}): ${error.message}`);
            throw error;
        }
    }

    async function preDownloadTiles(minZoom, maxZoom, minX, maxX, minY, maxY, type = 'osm') {
        try {
            for (let z = minZoom; z <= maxZoom; z++) {
                const numTiles = Math.pow(2, z);
                for (let x = minX; x <= maxX && x < numTiles; x++) {
                    for (let y = minY; y <= maxY && y < numTiles; y++) {
                        await downloadTile(z, x, y, type);
                    }
                }
            }
            console.log(`Pre-downloading tiles completed for ${type}`);
        } catch (error) {
            console.error(`Error in preDownloadTiles for ${type}: ${error.message}`);
        }
    }

    app.get('/osm/:z/:x/:y', async (req, res) => {
        try {
            const { z, x, y } = req.params;
            const yClean = y.replace('.png', '');
            const tilePath = path.join(__dirname, 'Tiles', 'OSM', z, x, `${yClean}.png`);

            if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(yClean)) {
                throw new Error('Invalid tile parameters');
            }

            try {
                await fs.access(tilePath);
                const contents = await fs.readFile(tilePath);
                res.set('Content-Type', 'image/png');
                res.send(contents);
                console.log(`Served cached tile: ${tilePath}`);
                return;
            } catch (err) {
                console.log(`Tile not cached, downloading: ${tilePath}`);
            }

            await downloadTile(parseInt(z), parseInt(x), parseInt(yClean), 'osm');
            const contents = await fs.readFile(tilePath);
            res.set('Content-Type', 'image/png');
            res.send(contents);
            console.log(`Served downloaded tile: ${tilePath}`);
        } catch (error) {
            console.error(`Error serving OSM tile z=${req.params.z}, x=${req.params.x}, y=${req.params.y}: ${error.message}`);
            res.status(500).send('Error fetching tile');
        }
    });

    app.get('/gsat/:z/:x/:y', async (req, res) => {
        try {
            const { z, x, y } = req.params;
            const yClean = y.replace('.png', '');
            const tilePath = path.join(__dirname, 'Tiles', 'gsat', z, x, `${yClean}.png`);

            if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(yClean)) {
                throw new Error('Invalid tile parameters');
            }

            try {
                await fs.access(tilePath);
                const contents = await fs.readFile(tilePath);
                res.set('Content-Type', 'image/png');
                res.send(contents);
                console.log(`Served cached Google Maps tile: ${tilePath}`);
                return;
            } catch (err) {
                console.log(`Tile not cached, downloading: ${tilePath}`);
            }

            await downloadTile(parseInt(z), parseInt(x), parseInt(yClean), 'gsat');
            const contents = await fs.readFile(tilePath);
            res.set('Content-Type', 'image/png');
            res.send(contents);
            console.log(`Served downloaded Google Maps tile: ${tilePath}`);
        } catch (error) {
            console.error(`Error serving Google Maps tile z=${req.params.z}, x=${req.params.x}, y=${req.params.y}: ${error.message}`);
            res.status(500).send('Error fetching tile');
        }
    });

    app.post('/save-mission', async (req, res) => {
        try {
            const { coordinates, imageryType, filename } = req.body;
            if (!Array.isArray(coordinates) || coordinates.length === 0) {
                throw new Error('Invalid or empty coordinates array');
            }

            for (const coord of coordinates) {
                if (typeof coord.latitude !== 'number' || typeof coord.longitude !== 'number' || typeof coord.altitude !== 'number') {
                    throw new Error('Invalid coordinate data');
                }
                if (coord.altitude !== 10) {
                    throw new Error('Altitude must be 10 meters');
                }
            }

            const missionsDir = path.join(__dirname, 'missions');
            await fs.mkdir(missionsDir, { recursive: true });
            const jsonPath = path.join(missionsDir, filename || `mission_coordinates_${imageryType || 'osm'}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

            // Read existing file if it exists, append new coordinates, and deduplicate
            let existingData = [];
            try {
                const existingContent = await fs.readFile(jsonPath, 'utf8');
                existingData = JSON.parse(existingContent);
                if (!Array.isArray(existingData)) {
                    existingData = [];
                }
                // Combine and remove duplicates based on latitude and longitude
                const uniqueCoords = [...new Map(
                    [...existingData, ...coordinates].map(coord => [JSON.stringify([coord.latitude, coord.longitude]), coord])
                ).values()];
                await fs.writeFile(jsonPath, JSON.stringify(uniqueCoords, null, 2));
            } catch (err) {
                // File doesn't exist or is invalid, write new data
                await fs.writeFile(jsonPath, JSON.stringify(coordinates, null, 2));
            }

            console.log(`Saved mission coordinates to ${jsonPath}`);

            res.json({ status: 'success', message: 'Mission coordinates saved', filename: path.basename(jsonPath) });
        } catch (error) {
            console.error(`Error saving mission coordinates: ${error.message}`);
            res.status(500).json({ status: 'error', message: 'Failed to save mission coordinates' });
        }
    });

    const server = app.listen(port, 'localhost', () => {
        console.log(`Tile server running at http://localhost:${port}/`);
        preDownloadTiles(0, 0, 0, 0, 0, 0, 'osm');
        preDownloadTiles(0, 0, 0, 0, 0, 0, 'gsat');
    });

    server.on('error', (e) => {
        console.error(`Server error: ${e.message}`);
        if (e.code === 'EADDRINUSE') {
            console.error(`Port ${port} is in use`);
        } else if (e.code === 'EACCES') {
            console.error(`Permission denied: ${port}`);
        }
        process.exit(1);
    });

    server.on('close', () => {
        console.log('Server stopped');
    });
})();