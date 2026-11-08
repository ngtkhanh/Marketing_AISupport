import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';

const SRC_DIR = path.resolve('src');

export async function resolve(specifier, context, nextResolve) {
  let url = specifier;

  if (specifier.startsWith('@/')) {
    const subPath = specifier.slice(2);
    let target = path.resolve(SRC_DIR, subPath);
    if (fs.existsSync(target + '.ts')) {
      target += '.ts';
    } else if (fs.existsSync(target + '.tsx')) {
      target += '.tsx';
    } else if (fs.existsSync(path.join(target, 'index.ts'))) {
      target = path.join(target, 'index.ts');
    }
    url = pathToFileURL(target).href;
  } else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL && !specifier.endsWith('.mjs') && !specifier.endsWith('.js')) {
    try {
      const parentFilePath = fileURLToPath(context.parentURL);
      const dir = path.dirname(parentFilePath);
      let target = path.resolve(dir, specifier);
      if (!fs.existsSync(target)) {
        if (fs.existsSync(target + '.ts')) {
          target += '.ts';
        } else if (fs.existsSync(target + '.tsx')) {
          target += '.tsx';
        } else if (fs.existsSync(path.join(target, 'index.ts'))) {
          target = path.join(target, 'index.ts');
        }
      }
      url = pathToFileURL(target).href;
    } catch {
      // fallback
    }
  }

  return nextResolve(url, context);
}
