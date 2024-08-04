const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function getAllNotes() {
    const data = fs.readFileSync(path.join(__dirname, './db/db.json'), 'utf8');
    return JSON.parse(data) || [];
}

function saveAllNotes(notes) {
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notes, null, 2)
    );
}

app.get('/api/notes', (req, res) => {
    const notes = getAllNotes();
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    const notes = getAllNotes();
    const newNote = {
        id: Date.now().toString(), // Use timestamp as a simple unique id
        title: req.body.title,
        text: req.body.text
    };
    notes.push(newNote);
    saveAllNotes(notes);
    res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
    let notes = getAllNotes();
    notes = notes.filter(note => note.id !== req.params.id);
    saveAllNotes(notes);
    res.json({ success: true });
});

app.put('/api/notes/:id', (req, res) => {
    let notes = getAllNotes();
    const updatedNoteIndex = notes.findIndex(note => note.id === req.params.id);
    if (updatedNoteIndex > -1) {
        notes[updatedNoteIndex] = { ...notes[updatedNoteIndex], ...req.body };
        saveAllNotes(notes);
        res.json(notes[updatedNoteIndex]);
    } else {
        res.status(404).json({ error: "Note not found" });
    }
});

// HTML routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});