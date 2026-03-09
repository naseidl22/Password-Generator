// Derive AES key from master password
async function getMasterKey(password) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("my_salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt text
async function encryptText(key, plaintext) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(plaintext)
    );
    return { encrypted: arrayBufferToBase64(encrypted), iv: arrayBufferToBase64(iv) };
}

// Decrypt text
async function decryptText(key, ciphertext, iv) {
    const dec = new TextDecoder();
    const encryptedArray = base64ToArrayBuffer(ciphertext);
    const ivArray = base64ToArrayBuffer(iv);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivArray },
        key,
        encryptedArray
    );
    return dec.decode(decrypted);
}

// Helpers
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
}