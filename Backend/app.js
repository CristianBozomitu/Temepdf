const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors({
    origin: 'https://courageous-souffle-e8533d.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../front/build')));

// API route to send some data
app.get('/api/data', (req, res) => {
    res.json({ message: 'This is some data from the server.' });
});

// API route to generate and send a PDF file
app.get('/api/export', (req, res) => {
    const doc = new PDFDocument();
    let filename = 'TemePDF';
    // Set the file name
    filename = encodeURIComponent(filename) + '.pdf';

    // Set the response to send the file as an attachment
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text('TemePDF', 100, 100);

    // Finalize the PDF and end the stream
    doc.end();
});

app.get('/api/download', (req, res) => {
    const filename = req.query.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        const doc = new PDFDocument();
        doc.pipe(res);
        doc.fontSize(25).text('This is a dynamically generated PDF file.', 100, 100);
        doc.end();
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.get('/api/files', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            res.status(500).json({ error: 'Failed to fetch file list' });
            return;
        }
        res.json(files);
    });
});


// API route to handle file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Catch-all handler to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
