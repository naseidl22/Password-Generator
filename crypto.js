// OBVIOUSLY THIS IS NOT A REALISTIC MASTER KEY
// NEVER STORE KEY IN PLAINTEXT
// DEMO PURPOSES ONLY
// ASSUMING THAT THE USER HAS ALREADY LOGGED IN AND THIS KEY IS SECURELY STORED SOMEWHERE SAFE

const MASTER_KEY = "0yL^[fWUv~ts$L-WK!s*gzeb5e~@BHCj^e8Zvw/;zGgaf^2b;y";

async function getKey() {
    const enc = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(MASTER_KEY),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("demo-salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

async function encryptText(text) {
    const key = await getKey();
    const enc = new TextEncoder();

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(text)
    );

    return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

async function decryptText(cipher, iv) {
    const key = await getKey();

    const encryptedBytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        key,
        encryptedBytes
    );

    return new TextDecoder().decode(decrypted);
}