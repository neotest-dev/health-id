import {
  createCipheriv,
  createDecipheriv,
  createHash,
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
} from 'node:crypto'

export function generateRSAKeyPair() {
  return generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
}

export function generateAESKey() {
  return randomBytes(32)
}

export function encryptJsonPayload(payload, aesKey) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', aesKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return {
    datosCifrados: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  }
}

export function decryptJsonPayload({ datosCifrados, iv, authTag }, aesKey) {
  const decipher = createDecipheriv('aes-256-gcm', aesKey, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))

  const plain = Buffer.concat([
    decipher.update(Buffer.from(datosCifrados, 'base64')),
    decipher.final(),
  ])

  return JSON.parse(plain.toString('utf8'))
}

export function encryptAESKeyWithRSA(aesKey, publicKey) {
  return publicEncrypt(
    {
      key: publicKey,
      oaepHash: 'sha256',
    },
    aesKey,
  ).toString('base64')
}

export function decryptAESKeyWithRSA(cipherText, privateKey) {
  return privateDecrypt(
    {
      key: privateKey,
      oaepHash: 'sha256',
    },
    Buffer.from(cipherText, 'base64'),
  )
}

export function hashLookupValue(value) {
  return createHash('sha256').update(String(value).trim()).digest('hex')
}

export function descriptorDistance(descriptorA = [], descriptorB = []) {
  if (descriptorA.length !== descriptorB.length || !descriptorA.length) {
    return Number.POSITIVE_INFINITY
  }

  let total = 0

  for (let index = 0; index < descriptorA.length; index += 1) {
    total += (descriptorA[index] - descriptorB[index]) ** 2
  }

  return Math.sqrt(total)
}
