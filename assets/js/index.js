const {html, render} = require('htm/preact');
/* global Terminal */
const jsYaml = require('js-yaml');
const pty = require('node-pty');
const fs = require('node:fs');
const {$} = require('zx');

const boolToEmjoi = (bool) => (bool && '✅') || '❌';

function Deployments() {
  const {stdout} = $.sync`rpm-ostree status --json`;
  const ostreeStatus = JSON.parse(stdout);
  return html`
    <table>
      <thead>
        <tr>
          <th scope="col">Index</th>
          <th scope="col">Edition</th>
          <th scope="col">Version</th>
          <th scope="col">Pinned?</th>
          <th scope="col">Booted?</th>
          <th scope="col">Staged?</th>
          <th scope="col">Layered Packages</th>
        </tr>
      </thead>
      <tbody>
        ${ostreeStatus.deployments.map(
          (deploy) =>
            html` <tr key=${ostreeStatus.deployments.indexOf(deploy)}>
              <th scope="row">${ostreeStatus.deployments.indexOf(deploy)}</th>
              <td>${deploy['container-image-reference'].split('/').pop()}</td>
              <td>${deploy.version}</td>
              <td>${boolToEmjoi(deploy.pinned)}</td>
              <td>${boolToEmjoi(deploy.booted)}</td>
              <td>${boolToEmjoi(deploy.staged)}</td>
              <td>
                <details>
                  <summary>
                    ${deploy.packages.length + deploy['requested-local-packages'].length}
                  </summary>
                  <ul>
                    ${[
                      ...deploy.packages,
                      ...deploy['requested-local-packages'],
                    ].map(
                      (package_) => html`<li key=${package_}>${package_}</li>`
                    )}
                  </ul>
                </details>
              </td>
            </tr>`
        )}
      </tbody>
    </table>
  `;
}

function terminal() {
  const ptyShell = pty.spawn('bash', ['--noprofile', '--norc', '-l'], {
    cols: 142,
    cwd: process.env.HOME,
    env: process.env,
    name: 'xterm-color',
    rows: 26,
  });
  const term = new Terminal({
    cols: 142,
    cursorBlink: true,
    fontSize: 10,
    rows: 26,
  });
  term.open(document.querySelector('#terminal'));
  ptyShell.onData((data) => term.write(data));
  term.onData((data) => ptyShell.write(data));
  ptyShell.write(
    'clear && /usr/bin/fastfetch --color $(/usr/libexec/bazzite-bling-fastfetch) -c /usr/share/ublue-os/bazzite/fastfetch.jsonc\n'
  );
}

function yaftiYaml() {
  try {
    const source = fs.readFileSync('/usr/share/yafti/yafti.yml', 'utf8');
    const yafti = jsYaml.load(source, {filename: 'yafti.yml'});
    return yafti;
  } catch (error) {
    console.error(error.message ?? error);
  }
}

const titleToId = (string_) =>
  string_.toLowerCase().replaceAll(' ', '-').replace('!', '');

let activePanel = 'div-welcome';

function setActivePanel(activeId) {
  activePanel = activeId;
  for (const panel of document.querySelectorAll('.actionPanel')) {
    panel.style =
      panel.id === activePanel ? 'display: block;' : 'display: none;';
  }
}

const NavBar = ({yafti}) =>
  html`<nav>
    <ul>
      ${yafti.screens.map((screen) => {
        const anchorId = `a-${titleToId(screen.title)}`;
        const panelId = `div-${titleToId(screen.title)}`;
        return html`<li>
          <a
            href="#"
            id="${anchorId}"
            onClick="${() => setActivePanel(panelId)}"
          >
            ${screen.title}
          </a>
        </li>`;
      })}
    </ul>
  </nav> `;

function doAction(actionId) {
  console.log(`I should do: ${actionId}`);
  const action = yafti.screens
    .find((screen) => `div-${titleToId(screen.title)}` === activePanel)
    .actions.find((action) => action.id === actionId);
  console.log(`Command is: "${action.script}"`);
}

const ActionPanels = ({yafti}) =>
  yafti.screens.map(
    (screen) => html`
      <div id="div-${titleToId(screen.title)}" class="actionPanel">
        <ul>
          ${screen.actions.map(
            (action) =>
              html`<li id="li-${action.id}">
                <a href="#" id=${action.id} onClick=${() => doAction(action.id)}
                  >${action.title}</a
                >
              </li>`
          )}
        </ul>
      </div>
    `
  );

const yafti = yaftiYaml();
const App = html`
  <header>
    <${NavBar} yafti=${yafti} />
  </header>
  <section id="actions">
    <${ActionPanels} yafti=${yafti} />
  </section>
  <section id="terminal"></section>
  <section id="ostree">
    <h2>OSTree deployments:</h2>
    <${Deployments} />
  </section>
`;

render(App, document.body);
terminal();
setActivePanel(activePanel);
console.debug('Hello, sailor!');
