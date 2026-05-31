const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Swagger Kütüphaneleri
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const logger = require('./utils/logger');
const aiService = require('./utils/aiService');
const notificationService = require('./utils/notificationService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// SQLite Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    logger.error('Database connection error:', err);
  } else {
    logger.info('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Database Tables
function initializeDatabase() {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Departments Table
      db.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          logger.error('Error creating departments table:', err);
        } else {
          const defaultDepartments = [
            { name: 'BİLİŞİM BÖLÜMÜ', description: 'Bilişim ve Teknoloji Desteği' },
            { name: 'İNSAN KAYNAKLARI', description: 'İnsan Kaynakları Departmanı' },
            { name: 'KÜTÜPHANEHİZMETLERİ', description: 'Kütüphane ve Dokümantasyon' },
            { name: 'REKTÖRLÜK', description: 'Rektörlük Ofisi' },
            { name: 'ÖĞRENCİ İŞLERİ', description: 'Öğrenci İşleri Daire Başkanlığı' },
            { name: 'MUHASEBE', description: 'Muhasebe ve Mali İşler' }
          ];
          
          let insertedCount = 0;
          defaultDepartments.forEach((dept) => {
            db.run(
              `INSERT OR IGNORE INTO departments (name, description) VALUES (?, ?)`,
              [dept.name, dept.description],
              function(err) {
                if (err) {
                  logger.error('Error inserting department:', err);
                }
                insertedCount++;
                if (insertedCount === defaultDepartments.length) {
                  logger.info('Default departments loaded');
                }
              }
            );
          });
        }
      });

      // Users Table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          student_id TEXT,
          role TEXT CHECK(role IN ('student', 'support', 'department', 'admin')),
          department_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (department_id) REFERENCES departments(id)
        )
      `, (err) => {
        if (err) logger.error('Error creating users table:', err);
      });

      // Tickets Table
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT,
          ai_suggested_category TEXT,
          category_confidence REAL DEFAULT 0,
          priority TEXT CHECK(priority IN ('low', 'medium', 'high')),
          ai_suggested_priority TEXT,
          priority_confidence REAL DEFAULT 0,
          status TEXT CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
          department_id INTEGER,
          assigned_to INTEGER,
          ai_summary TEXT,
          response_draft TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (department_id) REFERENCES departments(id),
          FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
      `, (err) => {
        if (err) logger.error('Error creating tickets table:', err);
      });

      // Comments Table
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          comment_text TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) logger.error('Error creating comments table:', err);
      });

      // Logs Table
      db.run(`
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT,
          message TEXT,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) logger.error('Error creating logs table:', err);
        else {
          logger.info('Database tables initialized successfully');
          resolve();
        }
      });
    });
  });
}

// ==================== SWAGGER DOCUMENTATION ====================

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'CampuSupport API',
    version: '2.0.0',
    description: 'Kampüs Destek Sistemi API Dokümantasyonu (Hafta 2)'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local server' }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Kullanıcı girişi',
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Giriş başarılı' } }
      }
    },
    '/api/tickets': {
      get: {
        summary: 'Tüm ticketları listeler',
        tags: ['Tickets'],
        responses: { '200': { description: 'Başarılı' } }
      },
      post: {
        summary: 'Yeni ticket oluşturur',
        description: 'AI önerileri ile birlikte yeni bir destek talebi oluşturur.',
        tags: ['Tickets'],
        responses: { '201': { description: 'Ticket oluşturuldu' } }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==================== AUTHENTICATION ROUTES ====================

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { email, password, student_id, role, department_id } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const query = `INSERT INTO users (email, password, student_id, role, department_id) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [email, password, student_id, role || 'student', department_id || null], function(err) {
    if (err) {
      logger.error('Registration error:', { email, error: err.message });
      return res.status(400).json({ error: 'User already exists' });
    }
    logger.info('User registered', { userId: this.lastID, email, role: role || 'student' });
    res.status(201).json({ id: this.lastID, email, role: role || 'student' });
  });
});

// User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.get(query, [email, password], (err, user) => {
    if (err) {
      logger.error('Login database error:', { email, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      logger.warn('Failed login attempt:', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    logger.info('User logged in', { userId: user.id, email });
    res.json({ id: user.id, email: user.email, role: user.role, department_id: user.department_id });
  });
});

// ==================== TICKET ROUTES ====================

// Get All Tickets
app.get('/api/tickets', (req, res) => {
  const { status, priority, department_id } = req.query;
  let query = `SELECT * FROM tickets WHERE 1=1`;
  const params = [];

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (priority) {
    query += ` AND priority = ?`;
    params.push(priority);
  }
  if (department_id) {
    query += ` AND department_id = ?`;
    params.push(department_id);
  }

  query += ` ORDER BY created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      logger.error('Error fetching tickets:', { error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get Tickets by User
app.get('/api/tickets/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  const query = `SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC`;
  db.all(query, [user_id], (err, rows) => {
    if (err) {
      logger.error('Error fetching user tickets:', { userId: user_id, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Create Ticket - Hafta 2: AI önerileri ile
app.post('/api/tickets', async (req, res) => {
  const { user_id, title, description, category, priority, department_id } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: 'User ID and title required' });
  }

  try {
    // AI önerileri al
    const aiCategory = await aiService.suggestCategory(description);
    const aiPriority = await aiService.suggestPriority(description);
    const summary = await aiService.generateSummary(description);

    logger.logAICall('category_suggestion', true, { 
      suggestedCategory: aiCategory.category, 
      confidence: aiCategory.confidence 
    });
    logger.logAICall('priority_suggestion', true, { 
      suggestedPriority: aiPriority.priority, 
      confidence: aiPriority.confidence 
    });

    const query = `
      INSERT INTO tickets (
        user_id, title, description, category, priority, department_id, status,
        ai_suggested_category, category_confidence, ai_suggested_priority, 
        priority_confidence, ai_summary
      )
      VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      user_id, 
      title, 
      description, 
      category || aiCategory.category, 
      priority || aiPriority.priority, 
      department_id || null,
      aiCategory.category,
      aiCategory.confidence,
      aiPriority.priority,
      aiPriority.confidence,
      summary
    ], function(err) {
      if (err) {
        logger.error('Error creating ticket:', { error: err.message });
        return res.status(500).json({ error: 'Database error' });
      }
      logger.logTicketCreation(this.lastID, user_id, title);
      res.status(201).json({ 
        id: this.lastID, 
        status: 'open',
        ai_suggested_category: aiCategory.category,
        ai_suggested_priority: aiPriority.priority
      });
    });
  } catch (error) {
    logger.error('Error in ticket creation:', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Ticket Status - Hafta 2: Bildirim gönderimi ile
app.put('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priority, assigned_to } = req.body;

  try {
    // Ticket bilgilerini al
    db.get(`SELECT * FROM tickets WHERE id = ?`, [id], async (err, ticket) => {
      if (err || !ticket) {
        logger.error('Error fetching ticket:', { ticketId: id, error: err?.message });
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const oldStatus = ticket.status;
      let query = `UPDATE tickets SET updated_at = CURRENT_TIMESTAMP`;
      const params = [];

      if (status) {
        query += `, status = ?`;
        params.push(status);
        if (status === 'resolved') {
          query += `, resolved_at = CURRENT_TIMESTAMP`;
        }
      }
      if (priority) {
        query += `, priority = ?`;
        params.push(priority);
      }
      if (assigned_to) {
        query += `, assigned_to = ?`;
        params.push(assigned_to);
      }

      query += ` WHERE id = ?`;
      params.push(id);

      db.run(query, params, async function(err) {
        if (err) {
          logger.error('Error updating ticket:', { ticketId: id, error: err.message });
          return res.status(500).json({ error: 'Database error' });
        }

        logger.logTicketStatusChange(id, oldStatus, status, req.body.updated_by || 'unknown');

        // Ticket çözüldüyse bildirim gönder
        if (status === 'resolved') {
          db.get(`SELECT * FROM users WHERE id = ?`, [ticket.user_id], async (err, user) => {
            if (user) {
              await notificationService.notifyTicketResolved(ticket, user);
            }
          });
        }

        res.json({ success: true, message: 'Ticket updated' });
      });
    });
  } catch (error) {
    logger.error('Error in ticket update:', { ticketId: id, error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Ticket by ID
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM tickets WHERE id = ?`;
  db.get(query, [id], (err, ticket) => {
    if (err) {
      logger.error('Error fetching ticket:', { ticketId: id, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  });
});

// Get AI Suggestions for Ticket - Hafta 2: Yeni endpoint
app.post('/api/tickets/:id/ai-suggestions', async (req, res) => {
  const { id } = req.params;

  try {
    db.get(`SELECT * FROM tickets WHERE id = ?`, [id], async (err, ticket) => {
      if (err || !ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const responseDraft = await aiService.generateResponseDraft(
        ticket.description, 
        ticket.category
      );

      logger.info('AI suggestions retrieved', { ticketId: id });

      res.json({
        summary: ticket.ai_summary,
        response_draft: responseDraft,
        suggested_category: ticket.ai_suggested_category,
        suggested_priority: ticket.ai_suggested_priority
      });
    });
  } catch (error) {
    logger.error('Error getting AI suggestions:', { ticketId: id, error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== COMMENT ROUTES ====================

// Add Comment to Ticket
app.post('/api/tickets/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { user_id, comment_text } = req.body;

  if (!user_id || !comment_text) {
    return res.status(400).json({ error: 'User ID and comment text required' });
  }

  const query = `INSERT INTO comments (ticket_id, user_id, comment_text) VALUES (?, ?, ?)`;
  db.run(query, [id, user_id, comment_text], async function(err) {
    if (err) {
      logger.error('Error adding comment:', { ticketId: id, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }

    // Ticket sahibine bildirim gönder
    db.get(`SELECT * FROM tickets WHERE id = ?`, [id], (err, ticket) => {
      if (ticket) {
        db.get(`SELECT * FROM users WHERE id = ?`, [ticket.user_id], (err, user) => {
          if (user) {
            db.get(`SELECT * FROM users WHERE id = ?`, [user_id], (err, commenter) => {
              if (commenter) {
                notificationService.notifyCommentAdded(ticket, user, comment_text);
              }
            });
          }
        });
      }
    });

    logger.info('Comment added', { ticketId: id, userId: user_id });
    res.status(201).json({ id: this.lastID, comment_text });
  });
});

// Get Comments for Ticket
app.get('/api/tickets/:id/comments', (req, res) => {
  const { id } = req.params;
  const query = `SELECT c.*, u.email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.ticket_id = ? ORDER BY c.created_at ASC`;
  db.all(query, [id], (err, rows) => {
    if (err) {
      logger.error('Error fetching comments:', { ticketId: id, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// ==================== DEPARTMENT ROUTES ====================

// Get All Departments
app.get('/api/departments', (req, res) => {
  const query = `SELECT * FROM departments ORDER BY name ASC`;
  db.all(query, (err, rows) => {
    if (err) {
      logger.error('Error fetching departments:', { error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Create Department
app.post('/api/departments', (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Department name required' });
  }

  const query = `INSERT INTO departments (name, description) VALUES (?, ?)`;
  db.run(query, [name, description], function(err) {
    if (err) {
      logger.error('Error creating department:', { name, error: err.message });
      return res.status(400).json({ error: 'Department already exists' });
    }
    logger.info('Department created', { departmentId: this.lastID, name });
    res.status(201).json({ id: this.lastID, name, description });
  });
});

// Get Department Tickets - Hafta 2: Departman raporları için
app.get('/api/departments/:id/tickets', (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM tickets WHERE department_id = ? ORDER BY created_at DESC`;
  db.all(query, [id], (err, rows) => {
    if (err) {
      logger.error('Error fetching department tickets:', { departmentId: id, error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get Department Analytics - Hafta 2: Yeni endpoint
app.get('/api/departments/:id/analytics', (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tickets,
        AVG(CASE WHEN resolved_at IS NOT NULL THEN julianday(resolved_at) - julianday(created_at) ELSE NULL END) as avg_resolution_time
      FROM tickets 
      WHERE department_id = ?
    `;

    db.get(query, [id], (err, stats) => {
      if (err) {
        logger.error('Error fetching analytics:', { departmentId: id, error: err.message });
        return res.status(500).json({ error: 'Database error' });
      }
      logger.info('Analytics retrieved', { departmentId: id });
      res.json(stats || {});
    });
  } catch (error) {
    logger.error('Error in analytics:', { departmentId: id, error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ERROR HANDLING ====================

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  console.log(`\n🚀 CampuSupport Server Started`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📝 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`📊 Database: ./database.db`);
  console.log(`📋 Logs: ./logs/app.log\n`);
});

module.exports = app;