
export async function fetchAccount(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Account file not found.");
    return res.json();
}

export async function fetchFileContent(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("File not found.");
    return res.text();
}

export async function checkAccountExists(path) {
    const check = await fetch(path, { method: 'HEAD' });
    if (!check.ok) throw new Error(`The account path could not be verified.`);
    return true;
}