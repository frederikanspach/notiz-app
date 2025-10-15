"use strict";

const NOTE_STORAGE_KEY = "noteApp";
let noteArray = [];

function init() {
  const saveNote = document.getElementById("save-note");
  saveNote.addEventListener("click", () => {
    saveCurrentNote();
  });

  const deleteNote = document.getElementById("delete-note");
  deleteNote.addEventListener("click", () => {
    deleteCurrentNote();
  });

  const [newNoteButton] = document.getElementsByClassName("new-note-button");
  newNoteButton.addEventListener("click", () => {
    resetNoteEditMode();
  });

  noteArray = loadFromLocalStorage();
  appendNotesToHTML();
}

function loadFromLocalStorage() {
  return JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY)) || [];
}

function saveToLocalStorage() {
  localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(noteArray));
}

function appendNotesToHTML() {
  // Sortieren des Arrays absteigend
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
        resetNoteEditMode();
        saveToLocalStorage();
        return;
      }
    }
  } else if (currentNoteHeader.value && currentNoteBody.value) {
    // new Note
    noteArray.sort((elementA, elementB) => elementA.id - elementB.id);

    for (let element of noteArray) {
      if (nextId !== element.id) break;
      nextId++;
    }
  }

  const newNoteObject = {};
  newNoteObject.id = nextId ? nextId.id + 1 : 1;
  newNoteObject.title = currentNoteHeader.value;
  newNoteObject.content = currentNoteBody.value;
  newNoteObject.lastUpdated = Date.now();

  noteArray.push(newNoteObject);
  appendNotesToHTML();
  resetNoteEditMode();
  saveToLocalStorage();
}

function deleteCurrentNote() {
  const deleteId = Number(
    document.getElementById("input-note-header").dataset.noteId
  );

  if (deleteId) {
    const deleteElement = noteArray.findIndex(
      (object) => object.id === deleteId
    );
    noteArray.splice(deleteElement, 1);
    appendNotesToHTML();
    resetNoteEditMode();
    saveToLocalStorage();
  }
}

document.addEventListener("DOMContentLoaded", init);
