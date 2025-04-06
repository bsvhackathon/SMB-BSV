/* eslint-disable @typescript-eslint/no-unused-vars */
import * as dotenv from 'dotenv'
import { CertifierServer, CertifierServerOptions } from './CertifierServer'
import { Setup } from '@bsv/wallet-toolbox'
import { Chain } from '@bsv/wallet-toolbox/out/src/sdk'
import { Database } from 'sqlite3'

dotenv.config()

// Load environment variables
const {
  NODE_ENV = 'development',
  BSV_NETWORK = 'main',
  PORT:HTTP_PORT = 8080,
  SERVER_PRIVATE_KEY,
  WALLET_STORAGE_URL
} = process.env


function setupDatabase(): Database {
  const db = new Database('./products.db', (err) => {
    if (err) {
      console.error('Error opening database:', err)
      throw err
    }
    console.log('Connected to the SQLite database.')

    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error('Error creating table:', err)
          throw err
        }
        console.log('Products table is ready.')
      }
    )
  })

  db.serialize(() => {
    const insertStmt = db.prepare(
      `INSERT OR IGNORE INTO products (product_id, name, price, stock) VALUES (?, ?, ?, ?)`
    )

    const products = [
      {
        product_id: 1,
        name: 'Bike',
        price: 250.0,
        stock: 100,
      },
      {
        product_id: 2,
        name: 'E-Bike',
        price: 1000.0,
        stock: 50,
      },
    ]

    products.forEach((product) => {
      insertStmt.run(product.product_id, product.name, product.price, product.stock, (err: any) => {
        if (err) {
          console.error('Error inserting product:', err)
        }
      })
    })

    insertStmt.finalize()
  })

  return db
}


async function setupCertifierServer(db : Database): Promise<{
  server: CertifierServer
}> {
  try {
    if (SERVER_PRIVATE_KEY === undefined) {
      throw new Error('SERVER_PRIVATE_KEY must be set')
    }

    const wallet = await Setup.createWalletClientNoEnv({
      chain: BSV_NETWORK as Chain,
      rootKeyHex: SERVER_PRIVATE_KEY,
      storageUrl: WALLET_STORAGE_URL
    })

    // Set up server options
    const serverOptions: CertifierServerOptions = {
      port: Number(HTTP_PORT),
      wallet,
      monetize: false,
      calculateRequestPrice: async () => {
        return 0 // Monetize your server here! Price is in satoshis.
      }
    }
    const server = new CertifierServer({}, serverOptions, db)

    return {
      server
    }
  } catch (error) {
    console.error('Error setting up Wallet Storage and Monitor:', error)
    throw error
  }
}

// Main function to start the server
(async () => {
  try {
    const db = setupDatabase()
    const context = await setupCertifierServer(db)
    context.server.start()
  } catch (error) {
    console.error('Error starting server:', error)
  }
})().catch(e => console.error(e))
