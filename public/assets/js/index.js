let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelectorAll('.list-container .list-group');
}

if (window.location.pathname === '/notes') {
  handleRenderBtns();
  noteTitle.addEventListener('input', handleRenderBtns);
  noteText.addEventListener('input', handleRenderBtns);
}

// Show an element
const show = (elem) => {
  elem.classList.add('visible');
};
// Hide an element
const hide = (elem) => {
  elem.classList.remove('visible');
};
// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: note.id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const renderActiveNote = () => {
  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
    show(newNoteBtn);
    hide(saveNoteBtn);
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
    hide(newNoteBtn);
    show(saveNoteBtn);
  }
  handleRenderBtns();
};
const handleNoteSave = () => {
  const note = {
    title: noteTitle.value,
    text: noteText.value,
  };

  if (activeNote.id) {
    note.id = activeNote.id;
    saveNote(note).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  } else {
    saveNote(note).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  }
};
// Delete the clicked note
const handleNoteDelete = (e) => {
  if (e.target.classList.contains('delete-note')) {
    e.stopPropagation();
    const note = e.target.closest('.list-group-item');
    const noteId = JSON.parse(note.getAttribute('data-note')).id;

    deleteNote(noteId).then(() => {
      if (activeNote.id === noteId) {
        activeNote = {};
      }
      getAndRenderNotes();
      renderActiveNote();
    });
  }
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
  show(newNoteBtn); // Show "New Note" button to allow creating a new note
  show(saveNoteBtn); // Show "Save Note" button to allow saving edits
  noteTitle.removeAttribute('readonly');
  noteText.removeAttribute('readonly');
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
  handleRenderBtns();
};

// Renders the appropriate buttons based on the state of the form
const handleRenderBtns = () => {
  console.log('Title:', noteTitle.value.trim());
  console.log('Text:', noteText.value.trim());
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    console.log('Hiding save and clear buttons');
    hide(saveNoteBtn);
    hide(clearBtn);
    show(newNoteBtn);
  } else {
    console.log('Showing save and clear buttons');
    show(saveNoteBtn);
    show(clearBtn);
    hide(newNoteBtn);
  }
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};



// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  // noteForm.addEventListener('input', handleRenderBtns);
  noteTitle.addEventListener('input', handleRenderBtns);
  noteText.addEventListener('input', handleRenderBtns);
  document.addEventListener('click', handleNoteDelete);
  document.addEventListener('click', handleNoteView);
  handleRenderBtns();
}

getAndRenderNotes();
