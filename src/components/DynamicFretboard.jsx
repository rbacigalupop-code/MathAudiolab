import React, { useState, useEffect } from "react";
import { ResponsiveBassNeck } from "./ResponsiveBassNeck";
import { GuitarNeck } from "./GuitarNeck";
import { PianoKeyboard } from "./PianoKeyboard";

export function DynamicFretboard({ instrumento, activeNote, onFretClick }) {
  if (instrumento === "bass-electric") {
    return <ResponsiveBassNeck activeNote={activeNote} onFretClick={onFretClick} />;
  }

  if (instrumento === "guitar-acoustic") {
    return <GuitarNeck activeNote={activeNote} onFretClick={onFretClick} />;
  }

  if (instrumento === "piano") {
    return <PianoKeyboard activeNote={activeNote} onFretClick={onFretClick} />;
  }

  // Fallback a bajo por defecto
  return <ResponsiveBassNeck activeNote={activeNote} onFretClick={onFretClick} />;
}
