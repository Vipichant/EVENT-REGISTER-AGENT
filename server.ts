import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Resolve paths
const uploadsDir = path.join(process.cwd(), 'uploads');
const studentsDir = path.join(uploadsDir, 'students');
const paymentsDir = path.join(uploadsDir, 'payments');
const databaseDir = path.join(process.cwd(), 'database');
const dbFilePath = path.join(databaseDir, 'db.json');
const configFilePath = path.join(databaseDir, 'events_config.json');

// Ensure required directories exist
fs.mkdirSync(studentsDir, { recursive: true });
fs.mkdirSync(paymentsDir, { recursive: true });
fs.mkdirSync(databaseDir, { recursive: true });

// Initialize database file if it doesn't exist
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify([], null, 2));
}

// Initialize configuration file if it doesn't exist
if (!fs.existsSync(configFilePath)) {
  const defaultSettings = {
    eventDate: "2026-10-24T09:00:00",
    events: [
      { id: "WEBC", name: "WebCraft (Web Design & Development)", fee: 150, prizePool: 1000, description: "Build beautiful, modular, highly-performant static or full-stack web layouts within a compressed 3-hour sandbox environment." },
      { id: "CODE", name: "CodeForge (Speed Competitive Coding)", fee: 200, prizePool: 1200, description: "Solve algorithms, optimization vectors, and clean logic structures across standard hacker platforms. Strict runtime limits." },
      { id: "QUIZ", name: "TechQuiz (General & IT Quiz)", fee: 100, prizePool: 600, description: "Showcase deep tech memory, computer architecture facts, trivia, historical computer sciences, and current industry trends." },
      { id: "PAPR", name: "Paper Presentation (Research Paper)", fee: 250, prizePool: 1500, description: "Present your innovative engineering ideas, machine learning architectures, or mechanical prototypes before standard PhD judges." },
      { id: "UIUX", name: "UI/UX Odyssey (Interface Design)", fee: 150, prizePool: 800, description: "Wireframe, layout, color, and map dynamic components in Figma. Show design mastery over responsive screens and usability." },
      { id: "ROBO", name: "RoboWars (Sumo Robotics)", fee: 300, prizePool: 2000, description: "Unleash custom fabricated wired or wireless robots inside the ring. Engage in standard destructive sumo robotics rounds." }
    ]
  };
  fs.writeFileSync(configFilePath, JSON.stringify(defaultSettings, null, 2));
}

// Read configuration helper
function readConfig() {
  try {
    const data = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading config file:', err);
    return null;
  }
}

// Write configuration helper
function writeConfig(data: any) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing config file:', err);
    return false;
  }
}

// Read database helper
function readDB() {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
}

// Write database helper
function writeDB(data: any) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'student_photo') {
      cb(null, studentsDir);
    } else if (file.fieldname === 'payment_screenshot') {
      cb(null, paymentsDir);
    } else {
      cb(new Error('Invalid fieldname'), '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'student_photo') {
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Student photo must be JPG, JPEG, or PNG'), false);
    }
  } else if (file.fieldname === 'payment_screenshot') {
    if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Payment screenshot must be JPG, JPEG, PNG, or PDF'), false);
    }
  } else {
    cb(new Error('Unknown field upload'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Handled individually in routes
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// API: Register Student (with file uploads and validation)
app.post('/api/register', (req, res) => {
  upload.fields([
    { name: 'student_photo', maxCount: 1 },
    { name: 'payment_screenshot', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const {
        student_name,
        year,
        department,
        college_name,
        register_number,
        mobile_number,
        email,
        event_name,
        amount_paid,
        payment_method,
        transaction_id,
      } = req.body;

      // 1. All fields required validation
      if (
        !student_name ||
        !year ||
        !department ||
        !college_name ||
        !register_number ||
        !mobile_number ||
        !email ||
        !event_name ||
        !amount_paid ||
        !payment_method ||
        !transaction_id
      ) {
        return res.status(400).json({ error: 'All text fields are required.' });
      }

      // 2. Validate student photo
      if (!files || !files['student_photo'] || files['student_photo'].length === 0) {
        return res.status(400).json({ error: 'Student photo is required.' });
      }
      const photoFile = files['student_photo'][0];
      if (photoFile.size > 2 * 1024 * 1024) {
        // Remove uploaded file if validation fails
        fs.unlinkSync(photoFile.path);
        if (files['payment_screenshot'] && files['payment_screenshot'][0]) {
          fs.unlinkSync(files['payment_screenshot'][0].path);
        }
        return res.status(400).json({ error: 'Student photo must be less than 2 MB.' });
      }

      // 3. Validate payment screenshot
      if (!files || !files['payment_screenshot'] || files['payment_screenshot'].length === 0) {
        fs.unlinkSync(photoFile.path);
        return res.status(400).json({ error: 'Payment screenshot is required.' });
      }
      const paymentFile = files['payment_screenshot'][0];
      if (paymentFile.size > 5 * 1024 * 1024) {
        fs.unlinkSync(photoFile.path);
        fs.unlinkSync(paymentFile.path);
        return res.status(400).json({ error: 'Payment screenshot must be less than 5 MB.' });
      }

      // 4. Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        fs.unlinkSync(photoFile.path);
        fs.unlinkSync(paymentFile.path);
        return res.status(400).json({ error: 'Invalid email address format.' });
      }

      // 5. Validate mobile number
      if (mobile_number.replace(/\D/g, '').length !== 10) {
        fs.unlinkSync(photoFile.path);
        fs.unlinkSync(paymentFile.path);
        return res.status(400).json({ error: 'Mobile number must contain exactly 10 digits.' });
      }

      // 6. Validate unique register number
      const db = readDB();
      const existing = db.find((r: any) => r.register_number.toLowerCase() === register_number.toLowerCase());
      if (existing) {
        fs.unlinkSync(photoFile.path);
        fs.unlinkSync(paymentFile.path);
        return res.status(400).json({ error: `Registration with register number '${register_number}' already exists.` });
      }

      // 7. Validate amount paid is numeric
      const numericAmount = parseFloat(amount_paid);
      if (isNaN(numericAmount) || numericAmount < 0) {
        fs.unlinkSync(photoFile.path);
        fs.unlinkSync(paymentFile.path);
        return res.status(400).json({ error: 'Amount paid must be a valid positive number.' });
      }

      // Save to database
      const relativePhotoPath = '/uploads/students/' + photoFile.filename;
      const relativePaymentPath = '/uploads/payments/' + paymentFile.filename;

      // Auto-generate Registration ID
      const newId = db.length > 0 ? Math.max(...db.map((r: any) => r.registration_id)) + 1 : 1001;

      const newRecord = {
        registration_id: newId,
        student_name,
        student_photo: relativePhotoPath,
        year,
        department,
        college_name,
        register_number,
        mobile_number,
        email,
        event_name,
        amount_paid: numericAmount,
        payment_method,
        transaction_id,
        payment_screenshot: relativePaymentPath,
        registration_date: new Date().toISOString(),
      };

      db.push(newRecord);
      writeDB(db);

      res.status(201).json({
        success: true,
        registration_id: newId,
        message: 'Registration successful!',
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
  });
});

// API: Get All Registrations (with Search & Filters)
app.get('/api/registrations', (req, res) => {
  try {
    const db = readDB();
    const { search, event, college, department, year } = req.query;

    let filtered = [...db];

    // Search filter (searches across Register Number, Student Name, and College Name)
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.register_number.toLowerCase().includes(q) ||
          r.student_name.toLowerCase().includes(q) ||
          r.college_name.toLowerCase().includes(q)
      );
    }

    // Dropdown filters
    if (event) {
      filtered = filtered.filter((r) => r.event_name === event);
    }
    if (college) {
      filtered = filtered.filter((r) => r.college_name === college);
    }
    if (department) {
      filtered = filtered.filter((r) => r.department === department);
    }
    if (year) {
      filtered = filtered.filter((r) => r.year === year);
    }

    // Sort by registration date descending by default
    filtered.sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime());

    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
});

// API: Get Single Registration
app.get('/api/registrations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const db = readDB();
    const item = db.find((r: any) => r.registration_id === id);

    if (!item) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(item);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch registration.' });
  }
});

// API: Update Registration (Secure Edit)
app.put('/api/registrations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const db = readDB();
    const index = db.findIndex((r: any) => r.registration_id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const current = db[index];
    const {
      student_name,
      year,
      department,
      college_name,
      register_number,
      mobile_number,
      email,
      event_name,
      amount_paid,
      payment_method,
      transaction_id,
    } = req.body;

    // Basic required validation
    if (
      !student_name ||
      !year ||
      !department ||
      !college_name ||
      !register_number ||
      !mobile_number ||
      !email ||
      !event_name ||
      !amount_paid ||
      !payment_method ||
      !transaction_id
    ) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Register number unique validation (exclude current record)
    const duplicate = db.find(
      (r: any) =>
        r.registration_id !== id &&
        r.register_number.toLowerCase() === register_number.toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ error: 'Register number already exists on another record.' });
    }

    // Update fields
    db[index] = {
      ...current,
      student_name,
      year,
      department,
      college_name,
      register_number,
      mobile_number,
      email,
      event_name,
      amount_paid: parseFloat(amount_paid),
      payment_method,
      transaction_id,
    };

    writeDB(db);
    res.json({ success: true, message: 'Registration updated successfully!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update registration.' });
  }
});

// API: Delete Registration
app.delete('/api/registrations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let db = readDB();
    const index = db.findIndex((r: any) => r.registration_id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const current = db[index];

    // Attempt to delete associated files physically
    try {
      const studentPhotoPath = path.join(process.cwd(), current.student_photo);
      const paymentScreenshotPath = path.join(process.cwd(), current.payment_screenshot);
      if (fs.existsSync(studentPhotoPath)) fs.unlinkSync(studentPhotoPath);
      if (fs.existsSync(paymentScreenshotPath)) fs.unlinkSync(paymentScreenshotPath);
    } catch (err) {
      console.error('Error deleting files during database record removal:', err);
    }

    // Filter out record
    db = db.filter((r: any) => r.registration_id !== id);
    writeDB(db);

    res.json({ success: true, message: 'Registration and files deleted successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete registration.' });
  }
});

// API: Get Configuration (Events, Countdown)
app.get('/api/config', (req, res) => {
  const config = readConfig();
  if (config) {
    res.json(config);
  } else {
    res.status(500).json({ error: 'Failed to read configuration.' });
  }
});

// API: Update Configuration (Events, Countdown, etc.)
app.put('/api/config', (req, res) => {
  const { eventDate, events } = req.body;
  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Events list is required and must be an array.' });
  }
  
  const currentConfig = readConfig() || {};
  const updatedConfig = {
    ...currentConfig,
    eventDate: eventDate || currentConfig.eventDate,
    events
  };
  
  if (writeConfig(updatedConfig)) {
    res.json({ success: true, message: 'Configuration updated successfully!', config: updatedConfig });
  } else {
    res.status(500).json({ error: 'Failed to write configuration.' });
  }
});

// API: Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'admin-secret-session-token' });
  } else {
    res.status(401).json({ error: 'Invalid admin username or password.' });
  }
});

// Vite Middleware for client rendering in development or serving static build in production
if (process.env.NODE_ENV !== 'production') {
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  }).then((vite) => {
    app.use(vite.middlewares);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Development server running on port ${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on port ${PORT}`);
  });
}
