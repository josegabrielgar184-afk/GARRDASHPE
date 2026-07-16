// Generate a JKS-format keystore with a self-signed RSA key pair
// using node-forge. This replaces keytool when Java is not available.
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STOREPASS = 'JOSEGARRI01.GH1.2';
const KEYPASS = 'JOSEGARRI01.GH1.2';
const ALIAS = 'upload';
const DISTINGUISHED_NAME = [
  { shortName: 'CN', value: 'GarrdashpeYT' },
  { shortName: 'OU', value: 'Mobile' },
  { shortName: 'O',  value: 'Garrdashpe' },
  { shortName: 'L',  value: 'Madrid' },
  { shortName: 'ST', value: 'Madrid' },
  { shortName: 'C',  value: 'ES' },
];

// Generate RSA key pair (2048-bit)
console.log('Generating 2048-bit RSA key pair...');
const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

// Create self-signed certificate (valid 10000 days ≈ 27 years)
console.log('Creating self-signed certificate...');
const cert = forge.pki.createCertificate();
cert.publicKey = keyPair.publicKey;
cert.serialNumber = '01';
const notBefore = new Date();
const notAfter = new Date();
notAfter.setFullYear(notBefore.getFullYear() + 27);
cert.validity.notBefore = notBefore;
cert.validity.notAfter = notAfter;
cert.setSubject(DISTINGUISHED_NAME);
cert.setIssuer(DISTINGUISHED_NAME);
// Extensions
cert.setExtensions([
  { name: 'basicConstraints', cA: false },
  { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
  { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
]);
// Sign the certificate
cert.sign(keyPair.privateKey, forge.md.sha256.create());

// Build a JKS (Java KeyStore) binary file
// JKS format: magic number 0xfeedfeed, version 2
console.log('Building JKS binary...');

function writeU4BE(buf, offset, val) {
  buf[offset]     = (val >>> 24) & 0xff;
  buf[offset + 1] = (val >>> 16) & 0xff;
  buf[offset + 2] = (val >>> 8) & 0xff;
  buf[offset + 3] = val & 0xff;
  return offset + 4;
}

function writeStr(buf, offset, str) {
  const bytes = Buffer.from(str, 'utf8');
  offset = writeU4BE(buf, offset, bytes.length);
  bytes.copy(buf, offset);
  return offset + bytes.length;
}

// We need to compute the password hash for the JKS file
// JKS uses a proprietary hash: SHA-1 of (password + "Mighty Aphrodite")
const passwordHash = crypto.createHash('sha1').update(STOREPASS + 'Mighty Aphrodite').digest();

// Serialize the certificate in DER format
const certDer = Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes(), 'binary');
// Serialize the private key in PKCS#8 DER format
const keyDer = Buffer.from(forge.asn1.toDer(forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(keyPair.privateKey))).getBytes(), 'binary');

// Build the JKS structure
// Header: magic (4) + version (4) + count (4)
// For each entry: tag (4) + alias (str) + timestamp (8) + key-type (str) + key-len (4) + key bytes + cert chain
// Footer: hash magic (4) + hash (20)

const aliasBytes = Buffer.from(ALIAS, 'utf8');
// Calculate total size
let totalSize = 4 + 4 + 4; // magic + version + count
totalSize += 4; // tag (1 = private key)
totalSize += 4 + aliasBytes.length; // alias length + alias
totalSize += 8; // timestamp
totalSize += 4 + 3; // key type string "key" (length 3)
totalSize += 4 + keyDer.length; // key length + key
totalSize += 4; // cert chain length (1)
totalSize += 4 + 3; // cert type "cert" (length 4) -- wait, "cert" is 4 chars
totalSize += 4 + certDer.length; // cert length + cert
totalSize += 4 + 20; // hash magic + hash

// Correct: "key" is 3 chars, "cert" is 4 chars
totalSize = 4 + 4 + 4; // magic + version + count
totalSize += 4; // tag
totalSize += 4 + aliasBytes.length; // alias
totalSize += 8; // timestamp
totalSize += 4 + 3; // "key" type
totalSize += 4 + keyDer.length; // key
totalSize += 4; // chain count (1)
totalSize += 4 + 4; // "cert" type
totalSize += 4 + certDer.length; // cert
totalSize += 4 + 20; // hash magic + hash

const buf = Buffer.alloc(totalSize);
let off = 0;

// Magic
off = writeU4BE(buf, off, 0xfeedfeed);
// Version
off = writeU4BE(buf, off, 2);
// Count
off = writeU4BE(buf, off, 1);
// Tag (1 = private key entry)
off = writeU4BE(buf, off, 1);
// Alias
off = writeStr(buf, off, ALIAS);
// Timestamp (milliseconds since epoch, 8 bytes big-endian)
const now = Date.now();
// Write 8 bytes: high 4 and low 4
off = writeU4BE(buf, off, Math.floor(now / 0x100000000));
off = writeU4BE(buf, off, now & 0xffffffff);
// Key type "key"
off = writeStr(buf, off, 'key');
// Key length + key bytes
off = writeU4BE(buf, off, keyDer.length);
keyDer.copy(buf, off);
off += keyDer.length;
// Certificate chain length (1 cert)
off = writeU4BE(buf, off, 1);
// Cert type "cert"
off = writeStr(buf, off, 'cert');
// Cert length + cert bytes
off = writeU4BE(buf, off, certDer.length);
certDer.copy(buf, off);
off += certDer.length;
// Hash magic
off = writeU4BE(buf, off, 0xfeedfeed);
// Hash (20 bytes)
Buffer.from(passwordHash).copy(buf, off);
off += 20;

const outPath = path.join(__dirname, '..', 'keystore.jks');
fs.writeFileSync(outPath, buf);
console.log(`Keystore written to: ${outPath} (${buf.length} bytes)`);
console.log(`Alias: ${ALIAS}`);
console.log(`Storepass: ${STOREPASS}`);
console.log(`Keypass: ${KEYPASS}`);
