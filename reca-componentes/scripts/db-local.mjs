// PostgreSQL embutido (portátil) — alternativa ao Docker para rodar local.
// Mantém esta janela aberta enquanto a loja estiver no ar.
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dir = resolve(process.cwd(), process.env.DB_LOCAL_DIR || '.pgdata-local')
// "Já inicializado" = existe o cluster (arquivo PG_VERSION), não só a pasta.
const inicializado = existsSync(resolve(dir, 'PG_VERSION'))

const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: 'user',
  password: 'password',
  port: 5432,
  persistent: true,
})

async function main() {
  if (!inicializado) {
    console.log('• Inicializando o banco embutido (primeira vez, pode baixar ~30MB)...')
    await pg.initialise()
  }
  await pg.start()
  try {
    await pg.createDatabase('reca_ecommerce')
  } catch {
    // banco já existe — ok
  }
  console.log('✅ PostgreSQL embutido pronto em localhost:5432 (db: reca_ecommerce).')
  console.log('   Deixe esta janela ABERTA. Feche para parar o banco.')

  const parar = async () => {
    try {
      await pg.stop()
    } catch {}
    process.exit(0)
  }
  process.on('SIGINT', parar)
  process.on('SIGTERM', parar)
  // mantém o processo vivo
  await new Promise(() => {})
}

main().catch((e) => {
  console.error('Erro ao iniciar o banco embutido:', e)
  process.exit(1)
})
