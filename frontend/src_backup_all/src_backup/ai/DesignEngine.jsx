// src/ai/DesignEngine.js
import { designPresets } from "./designPresets";

function setVars(vars){
  const root = document.documentElement;
  Object.entries(vars || {}).forEach(([k,v]) => root.style.setProperty(k, v));
}

function setLayoutClasses(classes){
  const root = document.body;
  // strip previous layout-* classes
  root.className = root.className
    .split(" ")
    .filter(c => c && !c.startsWith("layout-"))
    .join(" ");
  // add new ones
  (classes || []).forEach(c => root.classList.add(c));
}

export function applyDesignPreset(key){
  const preset = designPresets[key];
  if(!preset) throw new Error(`Unknown preset: ${key}`);
  setVars(preset.vars);
  setLayoutClasses(preset.classes);
  localStorage.setItem("ps.designPreset", key);
  return preset.name;
}

export function restoreLastPreset(){
  const key = localStorage.getItem("ps.designPreset");
  if(key && designPresets[key]){
    applyDesignPreset(key);
  }
}

export function listPresets(){
  return Object.keys(designPresets);
}


