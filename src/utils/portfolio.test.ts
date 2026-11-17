import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSpring2DState,
  stepSpring2D,
  applyDragDisplacement,
  applyFlickImpulse,
  formatJakartaTime,
} from './physics';
import { executeCliCommand } from './cliEngine';
import { PROJECTS_DATA, getProjectById } from '../data/projects';

test('spring physics: drag displacement sets offset and dragging flag', () => {
  const initial = createSpring2DState();
  const dragged = applyDragDisplacement(initial, 1.25, -0.8, 0.016);
  assert.equal(dragged.isDragging, true);
  assert.equal(dragged.x, 1.25);
  assert.equal(dragged.y, -0.8);
  assert.ok(dragged.rotY > 0);
  assert.ok(dragged.rotX > 0);
});

test('spring physics: released spring converges back toward rest origin (0,0)', () => {
  let state = createSpring2DState();
  state = applyDragDisplacement(state, 1.5, -1.2, 0.016);
  state = applyFlickImpulse(state, 2.0, -1.5, 3.5);
  assert.equal(state.isDragging, false);

  // Step forward 3 seconds (180 frames at 60Hz)
  for (let i = 0; i < 180; i++) {
    state = stepSpring2D(state, 1 / 60);
  }

  assert.ok(Math.abs(state.x) < 0.02, `Expected x near 0, got ${state.x}`);
  assert.ok(Math.abs(state.y) < 0.02, `Expected y near 0, got ${state.y}`);
});

test('formatJakartaTime returns GMT+7 formatted timestamp', () => {
  const sampleDate = new Date('2026-10-27T05:30:45.000Z');
  const formatted = formatJakartaTime(sampleDate);
  assert.ok(formatted.includes('12:30:45'), `Expected 12:30:45 in ${formatted}`);
  assert.ok(formatted.includes('GMT+7'), `Expected GMT+7 in ${formatted}`);
});

test('CLI engine executes whoami, projects, architecture, benchmark, and ask-ai commands', () => {
  const whoamiRes = executeCliCommand('whoami');
  assert.equal(whoamiRes.clear, undefined);
  assert.ok(whoamiRes.lines.some((l) => l.content.includes('Faturachman Alkahfi')));

  const projRes = executeCliCommand('projects');
  const actionLines = projRes.lines.filter((l) => l.type === 'project-action');
  assert.equal(actionLines.length, PROJECTS_DATA.length);

  const archRes = executeCliCommand('architecture upg');
  assert.ok(archRes.lines.some((l) => l.content.includes('Universitas Primagraha')));

  const ragRes = executeCliCommand('ask-ai How does the RAG pipeline avoid hallucinations?');
  assert.ok(ragRes.lines.some((l) => l.content.includes('Reciprocal Rank Fusion')));

  const clearRes = executeCliCommand('clear');
  assert.equal(clearRes.clear, true);
});

test('projects dataset contains complete engineering case studies', () => {
  assert.deepEqual(
    PROJECTS_DATA.map((p) => p.id),
    ['ting-ai', 'universitas-primagraha', 'opac-upg', 'lpm-upg', 'lppm-upg', 'perpus-upg', 'rajawali-prestige', 'central-emas'],
  );
  assert.equal(PROJECTS_DATA[7].index, '08 / 08');
  assert.equal(getProjectById('opac-upg')?.liveUrl, 'https://opac.upg.ac.id');
  assert.equal(getProjectById('lpm-upg')?.liveUrl, 'https://lpm.primagraha.ac.id');
  assert.equal(getProjectById('lppm-upg')?.liveUrl, 'https://lppm.primagraha.ac.id');
  assert.equal(getProjectById('perpus-upg')?.liveUrl, 'https://perpus.primagraha.ac.id');
  const ting = getProjectById('ting-ai');
  assert.ok(ting);
  assert.equal(ting.title, 'Ting AI');
  assert.ok(ting.architectureNodes.length >= 4);
  assert.ok(ting.engineeringDecisions.length >= 2);
});
