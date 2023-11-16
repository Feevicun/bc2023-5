const express = require("express");
const multer = require('multer');
const bodyParser = require("body-parser");
const fs = require("fs/promises");
const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: 'text/plain' }));
app.use(multer().any());
app.use("/", express.static(__dirname + '/static'));

const notesFilePath = __dirname + '/notes.json';

// Load notes from the file
let notes = [];

async function loadNotes() {
  try {
    const data = await fs.readFile(notesFilePath, 'utf-8');
    notes = JSON.parse(data);
  } catch (err) {
    console.error('Error reading notes file:', err);
  }
}

app.get("/notes", async (req, res) => {
  await loadNotes();
  res.json(notes);
});

app.post("/upload", async (req, res) => {
  const noteName = req.body.note_name;

  if (notes.some((a) => a.note_name === noteName)) {
    res.sendStatus(400);
  } else {
    notes.push(req.body);
    await saveNotes();
    res.sendStatus(201);
  }
});

app.put("/notes", async (req, res) => {
  const noteName = req.body.note_name;

  const noteIndex = notes.findIndex((a) => a.note_name === noteName);

  if (noteIndex !== -1) {
    notes[noteIndex].note = req.body.note;
    await saveNotes();
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get("/notes/:noteName", async (req, res) => {
  await loadNotes();
  const note = req.params.noteName;
  const noteIndex = notes.findIndex((a) => a.note_name === note);

  if (noteIndex !== -1) {
    res.send(notes[noteIndex].note);
  } else {
    res.sendStatus(404);
  }
});

app.delete("/notes/:noteName", async (req, res) => {
  const note = req.params.noteName;
  const noteIndex = notes.findIndex((a) => a.note_name === note);

  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    await saveNotes();
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Save notes to the file
async function saveNotes() {
  try {
    await fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing notes file:', err);
  }
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/static/UploadForm.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
