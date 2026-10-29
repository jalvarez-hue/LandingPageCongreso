import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('./countdown.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {}, Date, Intl };
runInNewContext(source, context);
const { formatEditionDates, getCountdownTarget } = context.exports;

test('usa la fecha de inicio a medianoche del horario central de México para el contador', () => {
  assert.equal(getCountdownTarget('2027-09-01'), Date.parse('2027-09-01T00:00:00-06:00'));
  assert.equal(getCountdownTarget(null), null);
});

test('rechaza fechas inexistentes o con formato incorrecto', () => {
  for (const date of ['2027-02-29', '2027-13-01', '01-09-2027', '2027-9-01']) {
    assert.equal(getCountdownTarget(date), null);
  }
});

test('formatea fechas consecutivas y un rango entre meses en español', () => {
  assert.equal(formatEditionDates('2027-09-01', '2027-09-04', 2027), 'del 1 al 4 de septiembre de 2027');
  assert.equal(formatEditionDates('2027-08-30', '2027-09-02', 2027), 'del 30 de agosto al 2 de septiembre de 2027');
});

test('indica que las fechas están por confirmar cuando faltan o no son válidas', () => {
  assert.equal(formatEditionDates(null, null, 2027), 'con fechas por confirmar en 2027');
  assert.equal(formatEditionDates('2027-09-05', '2027-09-01', 2027), 'con fechas por confirmar en 2027');
});
