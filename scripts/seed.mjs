/**
 * Seed do Back4App para o app Sangue Solidário.
 *
 * Cria (ou reaproveita, se já existirem):
 *   - 2 usuários de teste (_User), cada um com o seu Doador e algumas Doacoes;
 *   - alguns doadores de exemplo sem dono (como os registros antigos do site).
 *
 * Uso: preencha o .env e rode  `npm run seed`  (ou `node scripts/seed.mjs`).
 * Usa só a API REST do Parse com fetch (Node 18 ou mais novo), sem dependências.
 */
import fs from 'node:fs';
import path from 'node:path';

// ------------------------------------------------------------ lê o .env
function lerEnv() {
  const arquivo = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(arquivo)) return;
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
lerEnv();

const APP_ID = process.env.EXPO_PUBLIC_BACK4APP_APP_ID;
const JS_KEY = process.env.EXPO_PUBLIC_BACK4APP_JAVASCRIPT_KEY;
if (!APP_ID || !JS_KEY || APP_ID.includes('SEU_')) {
  console.error('✖ Preencha EXPO_PUBLIC_BACK4APP_APP_ID e EXPO_PUBLIC_BACK4APP_JAVASCRIPT_KEY no arquivo .env (copie do .env.example).');
  process.exit(1);
}

const URL_BASE = 'https://parseapi.back4app.com';

async function api(metodo, caminho, { corpo, params, token } = {}) {
  let url = URL_BASE + caminho;
  if (params) {
    url +=
      '?' +
      Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`)
        .join('&');
  }
  const headers = {
    'X-Parse-Application-Id': APP_ID,
    'X-Parse-JavaScript-Key': JS_KEY,
    'Content-Type': 'application/json',
  };
  if (token) headers['X-Parse-Session-Token'] = token;
  const r = await fetch(url, { method: metodo, headers, body: corpo ? JSON.stringify(corpo) : undefined });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok || dados.error) {
    const erro = new Error(`${metodo} ${caminho}: [${dados.code}] ${dados.error}`);
    erro.codigo = dados.code;
    throw erro;
  }
  return dados;
}

const ponteiro = (classe, id) => ({ __type: 'Pointer', className: classe, objectId: id });
const data = (iso) => ({ __type: 'Date', iso: `${iso}T12:00:00.000Z` });
const acl = (id) => ({ '*': { read: true }, [id]: { read: true, write: true } });

// Datas relativas a hoje, para a carência funcionar no dia da apresentação.
function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ------------------------------------------------------------ dados de teste
const USUARIOS = [
  {
    nome: 'Ana Teste',
    email: 'ana.teste@sanguesolidario.app',
    senha: 'Sangue@2026',
    doador: { tipoSanguineo: 'O-', sexo: 'feminino', cep: '50030-230', cidade: 'Recife', bairro: 'Santo Antônio', uf: 'PE', disponivel: true },
    // Última doação há 120 dias: passou a carência de 90 dias, aparece na busca.
    doacoes: [
      { dias: 120, local: 'Hemope - Recife', observacao: 'Doação de sangue total.' },
      { dias: 260, local: 'Hemope - Recife', observacao: '' },
    ],
  },
  {
    nome: 'Bruno Teste',
    email: 'bruno.teste@sanguesolidario.app',
    senha: 'Sangue@2026',
    doador: { tipoSanguineo: 'A+', sexo: 'masculino', cep: '51020-000', cidade: 'Recife', bairro: 'Boa Viagem', uf: 'PE', disponivel: true },
    // Última doação há 20 dias: está em carência (60 dias), NÃO aparece na busca.
    doacoes: [
      { dias: 20, local: 'Hemope - Recife', observacao: 'Campanha da Unicap.' },
      { dias: 150, local: 'Hospital da Restauração', observacao: '' },
      { dias: 300, local: 'Hemope - Recife', observacao: '' },
    ],
  },
];

const EXEMPLOS = [
  { nome: 'Maria Exemplo', tipoSanguineo: 'O+', sexo: 'feminino', cep: '50050-000', cidade: 'Recife', bairro: 'Boa Vista', uf: 'PE', email: 'maria.exemplo@exemplo.com', ultimaDoacao: null, disponivel: true },
  { nome: 'Carlos Exemplo', tipoSanguineo: 'B+', sexo: 'masculino', cep: '53020-000', cidade: 'Olinda', bairro: 'Carmo', uf: 'PE', email: 'carlos.exemplo@exemplo.com', ultimaDoacao: diasAtras(90), disponivel: true },
  { nome: 'Joana Exemplo', tipoSanguineo: 'AB-', sexo: '', cep: '54410-000', cidade: 'Jaboatão dos Guararapes', bairro: 'Piedade', uf: 'PE', email: 'joana.exemplo@exemplo.com', ultimaDoacao: null, disponivel: false },
  { nome: 'Pedro Exemplo', tipoSanguineo: 'A-', sexo: 'masculino', cep: '01001-000', cidade: 'São Paulo', bairro: 'Sé', uf: 'SP', email: 'pedro.exemplo@exemplo.com', ultimaDoacao: diasAtras(200), disponivel: true },
];

// ------------------------------------------------------------ execução
async function entrarOuCriar(u) {
  try {
    // Sem campo "nome": o _User deste Back4App não aceita colunas novas. O nome fica no Doador.
    const criado = await api('POST', '/users', { corpo: { username: u.email, email: u.email, password: u.senha } });
    console.log(`✔ Usuário criado: ${u.email}`);
    return { id: criado.objectId, token: criado.sessionToken };
  } catch (e) {
    if (e.codigo !== 202 && e.codigo !== 203) throw e;
    const logado = await api('POST', '/login', { corpo: { username: u.email, password: u.senha } });
    console.log(`• Usuário já existia: ${u.email}`);
    return { id: logado.objectId, token: logado.sessionToken };
  }
}

async function semearUsuario(u) {
  const { id, token } = await entrarOuCriar(u);

  const { results } = await api('GET', '/classes/Doador', { params: { where: { usuario: ponteiro('_User', id) } }, token });
  if (results.length) {
    console.log(`  • ${u.nome} já tem cadastro de doador (pulado)`);
    return;
  }

  const datas = u.doacoes.map((d) => diasAtras(d.dias)).sort();
  const ultima = datas[datas.length - 1];
  const doador = await api('POST', '/classes/Doador', {
    token,
    corpo: {
      nome: u.nome,
      email: u.email,
      ...u.doador,
      ultimaDoacao: data(ultima),
      usuario: ponteiro('_User', id),
      ACL: acl(id),
    },
  });
  console.log(`  ✔ Doador criado: ${u.nome} (${u.doador.tipoSanguineo})`);

  for (const d of u.doacoes) {
    await api('POST', '/classes/Doacao', {
      token,
      corpo: {
        data: data(diasAtras(d.dias)),
        local: d.local,
        observacao: d.observacao,
        doador: ponteiro('Doador', doador.objectId),
        usuario: ponteiro('_User', id),
        ACL: acl(id),
      },
    });
  }
  console.log(`  ✔ ${u.doacoes.length} doações registradas`);
  await api('POST', '/logout', { token }).catch(() => {});
}

async function semearExemplos() {
  for (const ex of EXEMPLOS) {
    const { results } = await api('GET', '/classes/Doador', { params: { where: { email: ex.email }, limit: 1 } });
    if (results.length) {
      console.log(`• Exemplo já existia: ${ex.nome}`);
      continue;
    }
    // Sem "usuario": funciona como os cadastros antigos do site (aparece, mas ninguém edita pelo app).
    // ACL só de leitura pública: ninguém consegue alterar pela chave JavaScript.
    await api('POST', '/classes/Doador', {
      corpo: { ...ex, ultimaDoacao: ex.ultimaDoacao ? data(ex.ultimaDoacao) : null, ACL: { '*': { read: true } } },
    });
    console.log(`✔ Exemplo criado: ${ex.nome} (${ex.tipoSanguineo})`);
  }
}

try {
  for (const u of USUARIOS) await semearUsuario(u);
  await semearExemplos();
  console.log('\nPronto! Logins de teste:');
  for (const u of USUARIOS) console.log(`  ${u.email}  /  ${u.senha}`);
} catch (e) {
  console.error('✖ Erro no seed:', e.message);
  process.exit(1);
}
