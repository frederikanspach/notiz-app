"use strict";

const NOTE_STORAGE_KEY = "noteApp";
let noteArray = [];

function init() {
  const saveNoteListener = document.getElementById("save-note");
  saveNoteListener.addEventListener("click", () => {
    saveCurrentNote();
  });

  const deleteNoteListener = document.getElementById("delete-note");
  deleteNoteListener.addEventListener("click", () => {
    deleteCurrentNote();
  });

  const deleteAllNotesListener = document.getElementById("delete-all");
  deleteAllNotesListener.addEventListener("click", () => {
    deleteAllNotes();
  });

  const [newNoteButtonListener] =
    document.getElementsByClassName("new-note-button");
  newNoteButtonListener.addEventListener("click", () => {
    resetNoteEditMode();
  });

  const rot13ButtonListener = document.getElementById("rot13");
  rot13ButtonListener.addEventListener("click", () => {
    rot13();
  });

  const themeToggleListener = document.getElementById("theme-toggle");
  themeToggleListener.addEventListener("click", () => {
    const body = document.body;
    const currentMode = body.getAttribute("data-theme");
    body.setAttribute("data-theme", currentMode === "light" ? "dark" : "light");
  });

  noteArray = loadFromLocalStorage();

  if (noteArray.length === 0) {
    noteArray = setInfoNote();
    saveToLocalStorage();
  }

  appendNotesToHTML();
}

function loadFromLocalStorage() {
  return JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY)) || [];
}

function saveToLocalStorage() {
  localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(noteArray));
}

function setInfoNote() {
  const infoNote = [
    {
      id: 1,
      title: "Willkommen in der Notiz-App",
      content:
        "Funktionen\nOben links kann eine neue Notiz erstellt werden.\n\nOben rechts kann die Notiz gespeichert oder gelöscht werden.\n\nLinks in der Notiz-Sidebar können die Notizen über das kleine Lösch-Icon ebenfalls gelöscht werden.\n\nUnten rechts kann der Dark- und Light-Mode ausgewählt werden. Die App versucht sich erst einmal automatisch anzupassen.\n\nUnten rechts kann die Notiz mit dem Vorhängeschloss-Icon (Funktion Rot13) unleserlich gemacht werden. Die Notiz muss danach nochmal gespeichert werden, damit die Unleserlichkeit gültig bleibt.\n\nUnten rechts können über das rote Mülleimer-Icon ALLE Notizen auf einmal gelöscht werden!",
      lastUpdated: Date.now(),
    },
  ];

  return infoNote;
}

function appendNotesToHTML() {
  // Sortieren des Arrays nach Datum absteigend
  const sortedNoteArray = noteArray.sort(
    (a, b) => b.lastUpdated - a.lastUpdated
  );

  const newSideList = document.createElement("div");
  newSideList.classList.add("side-list");

  sortedNoteArray.forEach((note) => {
    const newNoteSection = document.createElement("section");
    newNoteSection.classList.add("side-card");
    newNoteSection.id = note.id;

    const newNoteHeader = document.createElement("h2");
    newNoteHeader.textContent = note.title;

    const newNoteParagraph = document.createElement("p");
    newNoteParagraph.textContent = note.content;

    const newNoteLastUpdate = document.createElement("div");
    newNoteLastUpdate.classList.add("time");
    newNoteLastUpdate.textContent = formatDate(note.lastUpdated);

    const newNoteDeleteButton = document.createElement("button");
    newNoteDeleteButton.classList.add("button-mini");
    newNoteDeleteButton.setAttribute("data-note-id", note.id);
    newNoteDeleteButton.setAttribute("id", `delete-note-${note.id}`);
    newNoteDeleteButton.innerHTML = `<svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10 11V17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 11V17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>`;
    newNoteDeleteButton.addEventListener("click", (e) => {
      // Stopped the higher listener
      e.stopPropagation();
      deleteCurrentNote(note.id);
    });

    newNoteLastUpdate.appendChild(newNoteDeleteButton);

    newNoteSection.appendChild(newNoteHeader);
    newNoteSection.appendChild(newNoteParagraph);
    newNoteSection.appendChild(newNoteLastUpdate);

    newNoteSection.addEventListener("click", () => {
      showNoteInEditMode(note.id);
    });

    newSideList.appendChild(newNoteSection);
  });

  const oldSideList = document.getElementsByClassName("side-list");
  oldSideList[0].replaceWith(newSideList);
}

function formatDate(date) {
  const dateObject = new Date(date);

  // Formatieren mit toLocaleString() für deutsche Darstellung
  const formattedDate = dateObject.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return formattedDate;
}

function showNoteInEditMode(noteId) {
  let editNoteArray = noteArray.find((item) => item.id === noteId);
  if (!editNoteArray) return;

  const inputNoteHeader = document.getElementById("input-note-header");
  inputNoteHeader.dataset.noteId = noteId;
  inputNoteHeader.value = editNoteArray.title;

  const inputBody = document.getElementById("input-note-body");
  inputBody.value = editNoteArray.content;

  const oldActiveNote = document.querySelector(".side-card-active");
  if (oldActiveNote) {
    oldActiveNote.classList.remove("side-card-active");
  }

  const activeNote = document.getElementById(noteId);
  activeNote.classList.add("side-card-active");
}

function resetNoteEditMode() {
  const inputNoteHeader = document.getElementById("input-note-header");
  inputNoteHeader.value = "";
  delete inputNoteHeader.dataset.noteId;

  const inputNoteBody = document.getElementById("input-note-body");
  inputNoteBody.value = "";

  const oldActiveNote = document.querySelector(".side-card-active");
  if (oldActiveNote) {
    oldActiveNote.classList.remove("side-card-active");
  }
}

function saveCurrentNote() {
  const currentNoteHeader = document.getElementById("input-note-header");
  const currentNoteBody = document.getElementById("input-note-body");
  let nextId = 1;

  if (currentNoteHeader.dataset.noteId) {
    // Note update
    for (let item of noteArray) {
      if (Number(currentNoteHeader.dataset.noteId) === item.id) {
        item.title = currentNoteHeader.value;
        item.content = currentNoteBody.value;
        item.lastUpdated = Date.now();
        appendNotesToHTML();
        saveToLocalStorage();

        const activeNote = document.getElementById(
          currentNoteHeader.dataset.noteId
        );
        activeNote.classList.add("side-card-active");
        return;
      }
    }
  } else if (currentNoteHeader.value && currentNoteBody.value) {
    // New Note
    const sortedNoteArray = [...noteArray].sort(
      (elementA, elementB) => elementA.id - elementB.id
    );

    for (let element of sortedNoteArray) {
      if (nextId < element.id) break;
      nextId++;
    }

    const newNoteObject = {};
    newNoteObject.id = nextId;
    newNoteObject.title = currentNoteHeader.value;
    newNoteObject.content = currentNoteBody.value;
    newNoteObject.lastUpdated = Date.now();

    noteArray.push(newNoteObject);
    appendNotesToHTML();
    saveToLocalStorage();

    currentNoteHeader.dataset.noteId = newNoteObject.id;

    const activeNote = document.getElementById(newNoteObject.id);
    activeNote.classList.add("side-card-active");
  }
}

function deleteCurrentNote(deleteId = false) {
  if (!deleteId) {
    deleteId = Number(
      document.getElementById("input-note-header").dataset.noteId
    );
  }

  const isConfirmed = confirm("Die Notiz wirklich löschen?");
  if (!isConfirmed) {
    return;
  }

  if (deleteId) {
    const deleteElement = noteArray.findIndex(
      (object) => object.id === deleteId
    );
    noteArray.splice(deleteElement, 1);
    appendNotesToHTML();
    saveToLocalStorage();

    const inputNoteHeader = document.getElementById("input-note-header");
    inputNoteHeader.value = "";
  }
  resetNoteEditMode();
}

function deleteAllNotes() {
  if (noteArray.length === 0) {
    return;
  }

  noteArray = [];

  const isConfirmed = confirm(
    "Bist du sicher, dass du ALLE Notizen löschen möchtest?"
  );
  if (!isConfirmed) {
    return;
  }

  appendNotesToHTML();
  saveToLocalStorage();
  const inputNoteHeader = document.getElementById("input-note-header");
  inputNoteHeader.value = "";
  resetNoteEditMode();
}

function rot13() {
  const inputBody = document.getElementById("input-note-body");

  if (!inputBody.value) {
    return;
  }

  // rot13 von stackoverflow
  inputBody.value = inputBody.value.replace(
    /[a-z]/gi,
    (c) =>
      "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"[
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c)
      ]
  );
}

document.addEventListener("DOMContentLoaded", init);
