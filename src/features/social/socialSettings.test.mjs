import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
function load(filename, imports = {}) {
  const context = {
    exports: {}, URL, TypeError,
    require: (name) => Object.hasOwn(imports, name) ? imports[name] : require(name),
  };
  const source = ts.transpileModule(readFileSync(new URL(filename, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(source, context);
  return context.exports;
}
const { parseSocialSettings, isWhatsAppUrl, isSocialUrl } = load('./socialSettings.ts');
const settings = {
  id: 'link-1', network: 'whatsapp', url: 'https://api.whatsapp.com/send?phone=525512345678',
  label: 'Contactar por WhatsApp', is_active: true, open_in_new_tab: true, display_order: 0,
};

test('admite enlaces de WhatsApp con número internacional y texto opcional', () => {
  for (const url of [settings.url, `${settings.url}&text=Hola`, 'https://wa.me/525512345678', 'https://wa.me/525512345678?text=Hola']) {
    assert.equal(isWhatsAppUrl(url), true);
    assert.equal(parseSocialSettings({ ...settings, url }).url, url);
  }
});

test('rechaza números de ejemplo, esquemas inseguros y destinos ajenos', () => {
  for (const url of [
    'https://api.whatsapp.com/send?phone=XXXXXXXXXXX', 'javascript:alert(1)',
    'http://wa.me/525512345678', 'https://wa.me.evil.test/525512345678',
    'https://user@wa.me/525512345678', 'https://wa.me/123',
    'https://wa.me/0525512345678', 'https://wa.me/525512345678#fragment',
    'https://api.whatsapp.com/send?phone=%2B525512345678',
    'https://example.com', 'not a URL',
  ]) {
    assert.equal(isWhatsAppUrl(url), false, url);
    assert.throws(() => parseSocialSettings({ ...settings, url }));
  }
});

test('permite guardar el marcador solo mientras la burbuja está desactivada', () => {
  assert.equal(parseSocialSettings({ ...settings, is_active: false, url: 'https://api.whatsapp.com/send?phone=XXXXXXXXXXX' }).is_active, false);
  for (const invalid of [null, {}, { ...settings, label: ' ' }, { ...settings, is_active: 'true' }, { ...settings, network: 'unknown' }]) {
    assert.throws(() => parseSocialSettings(invalid));
  }
});

test('admite enlaces de Telegram y Facebook solo en sus dominios oficiales', () => {
  const valid = [
    ['telegram', 'https://t.me/congreso'],
    ['telegram', 'https://telegram.me/congreso'],
    ['telegram', 'https://t.me/+InviteCode'],
    ['facebook', 'https://www.facebook.com/congreso'],
    ['facebook', 'https://m.facebook.com/congreso'],
    ['facebook', 'https://fb.com/congreso'],
  ];
  for (const [network, url] of valid) {
    assert.equal(isSocialUrl(network, url), true);
    assert.equal(parseSocialSettings({ ...settings, network, url }).url, url);
  }
});

test('rechaza URLs inseguras o con dominios similares para Telegram y Facebook', () => {
  const invalid = [
    ['telegram', 'http://t.me/congreso'],
    ['telegram', 'https://t.me.evil.test/congreso'],
    ['telegram', 'https://user@t.me/congreso'],
    ['telegram', 'https://t.me/'],
    ['telegram', 'https://t.me/congreso#fragment'],
    ['telegram', ' https://t.me/congreso'],
    ['facebook', 'https://facebook.com.evil.test/congreso'],
    ['facebook', 'https://evil-facebook.com/congreso'],
    ['facebook', 'https://facebook.com/'],
    ['facebook', 'https://user@facebook.com/congreso'],
    ['facebook', 'https://facebook.com/congreso#fragment'],
  ];
  for (const [network, url] of invalid) {
    assert.equal(isSocialUrl(network, url), false, url);
    assert.throws(() => parseSocialSettings({ ...settings, network, url }));
  }
});

function render(value) {
  const { SocialBubble } = load('./SocialBubble.tsx', {
    react: {
      ...React,
      useEffect: () => {},
      useState: (() => {
        let call = 0;
        return (initial) => [call++ === 0 ? value : initial, () => {}];
      })(),
    },
    '../../lib/supabaseClient': { supabase: null },
    '../../lib/errorReporter': {},
    './socialSettings': { parseSocialSettings },
    './SocialBubble.module.css': { default: new Proxy({}, { get: (_, key) => key }) },
  });
  return renderToStaticMarkup(React.createElement(SocialBubble));
}

test('el botón expande las redes en una lista apilada y accesible', () => {
  const links = [
    settings,
    { ...settings, id: 'link-2', network: 'telegram', url: 'https://t.me/congreso', label: 'Telegram', display_order: 1 },
    { ...settings, id: 'link-3', network: 'facebook', url: 'https://facebook.com/congreso', label: 'Facebook', display_order: 2 },
  ];
  const html = render(links);
  assert.match(html, /aria-label="Abrir redes sociales"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /id="cn-social-links"[^>]*hidden=""/);
  const open = renderOpen(links);
  assert.match(open, /aria-label="Cerrar redes sociales"/);
  assert.match(open, /aria-expanded="true"/);
  assert.match(open, /aria-label="Redes sociales"/);
  assert.match(open, /href="https:\/\/api\.whatsapp\.com\/send\?phone=525512345678"/);
  assert.match(open, /href="https:\/\/t\.me\/congreso"/);
  assert.match(open, /href="https:\/\/facebook\.com\/congreso"/);
  assert.match(open, /target="_blank"/);
  assert.match(open, /rel="noopener noreferrer"/);
  assert.match(open, /aria-label="Contactar por WhatsApp \(abre en una pestaña nueva\)"/);
  assert.match(open, /aria-hidden="true"/);
});

test('no muestra burbuja desactivada ni sin configuración; respeta la misma pestaña', () => {
  assert.equal(render([]), '');
  assert.equal(render([]), '');
  const html = renderOpen([{ ...settings, open_in_new_tab: false }]);
  assert.doesNotMatch(html, /target=|rel=|pestaña nueva/);
});

function renderOpen(value) {
  const { SocialBubble } = load('./SocialBubble.tsx', {
    react: {
      ...React,
      useEffect: () => {},
      useState: (() => {
        let call = 0;
        return (initial) => [call++ === 0 ? value : true, () => {}];
      })(),
    },
    '../../lib/supabaseClient': { supabase: null },
    '../../lib/errorReporter': {},
    './socialSettings': { parseSocialSettings },
    './SocialBubble.module.css': { default: new Proxy({}, { get: (_, key) => key }) },
  });
  return renderToStaticMarkup(React.createElement(SocialBubble));
}

test('muestra iconos de Telegram y Facebook en los enlaces apilados', () => {
  for (const [network, url] of [
    ['telegram', 'https://t.me/congreso'],
    ['facebook', 'https://facebook.com/congreso'],
  ]) {
    const networkLabel = network === 'telegram' ? 'Telegram' : 'Facebook';
    const html = renderOpen([{ ...settings, network, url, label: `Contactar por ${networkLabel}` }]);
    assert.match(html, new RegExp(`href="${url}"`));
    assert.match(html, /<svg/);
    assert.match(html, new RegExp(`aria-label="Contactar por ${networkLabel}`));
  }
});
