const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/proyectos - Obtener todos los proyectos
router.get('/', (req, res) => {
    const query = 'SELECT * FROM projects ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener los proyectos:", err.message);
            console.error("Detalles del error:", err);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error al obtener los proyectos', 
                details: err.message 
            });
        }
        
        // Parsear campos JSON
        const parsedResults = results.map(project => ({
            ...project,
            services: project.services ? JSON.parse(project.services) : [],
            results: project.results ? JSON.parse(project.results) : [],
            gallery: project.gallery ? JSON.parse(project.gallery) : [],
            tools: project.tools ? JSON.parse(project.tools) : [],
            process: project.process ? JSON.parse(project.process) : [],
            tags: project.tags ? JSON.parse(project.tags) : [],
            team: project.team ? JSON.parse(project.team) : [],
            liveUrl: project.live_url,
            githubUrl: project.github_url,
            behanceUrl: project.behance_url
        }));
        
        res.json({ 
            status: 'success', 
            data: parsedResults,
            total: parsedResults.length 
        });
    });
});

// GET /api/proyectos/:id - Obtener un proyecto específico
router.get('/:id', (req, res) => {
    const projectId = req.params.id;
    
    if (!projectId || isNaN(projectId)) {
        return res.status(400).json({
            status: 'error',
            message: 'ID de proyecto inválido'
        });
    }
    
    const query = 'SELECT * FROM projects WHERE id = ?';
    
    db.query(query, [projectId], (err, results) => {
        if (err) {
            console.error("Error al obtener el proyecto:", err.message);
            console.error("Detalles del error:", err);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error al obtener el proyecto', 
                details: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Proyecto no encontrado'
            });
        }
        
        // Parsear campos JSON
        const project = results[0];
        const parsedProject = {
            ...project,
            services: project.services ? JSON.parse(project.services) : [],
            results: project.results ? JSON.parse(project.results) : [],
            gallery: project.gallery ? JSON.parse(project.gallery) : [],
            tools: project.tools ? JSON.parse(project.tools) : [],
            process: project.process ? JSON.parse(project.process) : [],
            tags: project.tags ? JSON.parse(project.tags) : [],
            team: project.team ? JSON.parse(project.team) : [],
            liveUrl: project.live_url,
            githubUrl: project.github_url,
            behanceUrl: project.behance_url
        };
        
        res.json({ 
            status: 'success', 
            data: parsedProject 
        });
    });
});

// POST /api/proyectos - Crear un nuevo proyecto (PROTEGIDA)
router.post('/', authenticateToken, (req, res) => {
    const {
        title,
        category,
        description,
        image,
        year,
        client,
        services = [],
        layout,
        challenge,
        solution,
        results = [],
        gallery = [],
        tools = [],
        process = [],
        tags = [],
        duration,
        team = [],
        liveUrl,
        githubUrl,
        behanceUrl,
        featured = false
    } = req.body;
    
    // Validar campos requeridos
    if (!title || !category || !description) {
        return res.status(400).json({
            status: 'error',
            message: 'Faltan campos requeridos: title, category, description'
        });
    }
    
    const query = `
        INSERT INTO projects (
            title, category, description, image, year, client, services, layout, 
            challenge, solution, results, gallery, tools, process, tags, 
            duration, team, live_url, github_url, behance_url, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        title,
        category,
        description,
        image,
        year,
        client,
        JSON.stringify(services),
        layout,
        challenge,
        solution,
        JSON.stringify(results),
        JSON.stringify(gallery),
        JSON.stringify(tools),
        JSON.stringify(process),
        JSON.stringify(tags),
        duration,
        JSON.stringify(team),
        liveUrl,
        githubUrl,
        behanceUrl,
        featured
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al crear el proyecto:", err.message);
            console.error("Detalles del error:", err);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error al crear el proyecto', 
                details: err.message 
            });
        }
        
        res.status(201).json({ 
            status: 'success', 
            message: 'Proyecto creado exitosamente',
            data: {
                id: result.insertId,
                title,
                category,
                description
            }
        });
    });
});

// PUT /api/proyectos/:id - Actualizar un proyecto existente (PROTEGIDA)
router.put('/:id', authenticateToken, (req, res) => {
    const projectId = req.params.id;
    
    if (!projectId || isNaN(projectId)) {
        return res.status(400).json({
            status: 'error',
            message: 'ID de proyecto inválido'
        });
    }
    
    const {
        title,
        category,
        description,
        image,
        year,
        client,
        services = [],
        layout,
        challenge,
        solution,
        results = [],
        gallery = [],
        tools = [],
        process = [],
        tags = [],
        duration,
        team = [],
        liveUrl,
        githubUrl,
        behanceUrl,
        featured = false
    } = req.body;
    
    // Validar que el proyecto existe
    const checkQuery = 'SELECT id FROM projects WHERE id = ?';
    
    db.query(checkQuery, [projectId], (err, results) => {
        if (err) {
            console.error("Error al verificar el proyecto:", err.message);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error al verificar el proyecto', 
                details: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Proyecto no encontrado'
            });
        }
        
        const updateQuery = `
            UPDATE projects SET 
                title = ?, category = ?, description = ?, image = ?, year = ?, 
                client = ?, services = ?, layout = ?, challenge = ?, solution = ?, 
                results = ?, gallery = ?, tools = ?, process = ?, tags = ?, 
                duration = ?, team = ?, live_url = ?, github_url = ?, behance_url = ?, featured = ?
            WHERE id = ?
        `;
        
        const values = [
            title,
            category,
            description,
            image,
            year,
            client,
            JSON.stringify(services),
            layout,
            challenge,
            solution,
            JSON.stringify(results),
            JSON.stringify(gallery),
            JSON.stringify(tools),
            JSON.stringify(process),
            JSON.stringify(tags),
            duration,
            JSON.stringify(team),
            liveUrl,
            githubUrl,
            behanceUrl,
            featured,
            projectId
        ];
        
        db.query(updateQuery, values, (err, result) => {
            if (err) {
                console.error("Error al actualizar el proyecto:", err.message);
                console.error("Detalles del error:", err);
                return res.status(500).json({ 
                    status: 'error', 
                    message: 'Error al actualizar el proyecto', 
                    details: err.message 
                });
            }
            
            res.json({ 
                status: 'success', 
                message: 'Proyecto actualizado exitosamente',
                data: {
                    id: projectId,
                    affectedRows: result.affectedRows
                }
            });
        });
    });
});

// DELETE /api/proyectos/:id - Eliminar un proyecto (PROTEGIDA)
router.delete('/:id', authenticateToken, (req, res) => {
    const projectId = req.params.id;
    
    if (!projectId || isNaN(projectId)) {
        return res.status(400).json({
            status: 'error',
            message: 'ID de proyecto inválido'
        });
    }
    
    // Verificar que el proyecto existe
    const checkQuery = 'SELECT id, title FROM projects WHERE id = ?';
    
    db.query(checkQuery, [projectId], (err, results) => {
        if (err) {
            console.error("Error al verificar el proyecto:", err.message);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error al verificar el proyecto', 
                details: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Proyecto no encontrado'
            });
        }
        
        const deleteQuery = 'DELETE FROM projects WHERE id = ?';
        
        db.query(deleteQuery, [projectId], (err, result) => {
            if (err) {
                console.error("Error al eliminar el proyecto:", err.message);
                console.error("Detalles del error:", err);
                return res.status(500).json({ 
                    status: 'error', 
                    message: 'Error al eliminar el proyecto', 
                    details: err.message 
                });
            }
            
            res.json({ 
                status: 'success', 
                message: `Proyecto "${results[0].title}" eliminado exitosamente`,
                data: {
                    id: projectId,
                    affectedRows: result.affectedRows
                }
            });
        });
    });
});

module.exports = router;