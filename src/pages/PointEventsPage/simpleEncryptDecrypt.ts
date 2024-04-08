export default function simpleEncryptDecrypt(input: string, secret: string) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
    }
    return output;
}