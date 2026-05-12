import dataSource from "../../typeorm.datasource"

async function runMigrations(): Promise<void> {
  await dataSource.initialize()

  try {
    const migrations = await dataSource.runMigrations({ transaction: "each" })
    if (migrations.length === 0) {
      process.stdout.write("No pending migrations\n")
      return
    }

    process.stdout.write(
      `Executed migrations: ${migrations.map((migration) => migration.name).join(", ")}`
    )
  } finally {
    await dataSource.destroy()
  }
}

void runMigrations().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`)
  process.exit(1)
})
