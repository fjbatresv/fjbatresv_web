import { copyFileSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

const root = 'dist/javier-batres-site/browser';
function stripUnusedEventReplayScript(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) stripUnusedEventReplayScript(path);
    else if (entry.name.endsWith('.html')) {
      const html = readFileSync(path, 'utf8')
        .replace(/<script\b[^>]*id="ng-event-dispatch-contract"[^>]*>[\s\S]*?<\/script>/, '')
        .replace(/<script>window\.__jsaction_bootstrap\([\s\S]*?<\/script>/, '');
      writeFileSync(path, html);
    }
  }
}

stripUnusedEventReplayScript(root);
copyFileSync(`${root}/404/index.html`, `${root}/404.html`);
rmSync(`${root}/index.csr.html`, { force: true });
