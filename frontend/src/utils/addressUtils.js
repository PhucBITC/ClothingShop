/**
 * Localizes Vietnamese address names by removing diacritics and translating prefixes.
 * E.g., "Tỉnh Bắc Giang" -> "Bac Giang Province"
 */
export const anglicizeAddress = (name) => {
    if (!name) return "";
    let clean = name;

    // Remove diacritics
    clean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    clean = clean.replace(/đ/g, "d").replace(/Đ/g, "D");

    // Translate prefixes
    if (name.startsWith("Tỉnh")) {
        clean = clean.replace(/^Tinh\s+/i, "") + " Province";
    } else if (name.startsWith("Thành phố")) {
        clean = clean.replace(/^Thanh pho\s+/i, "") + " City";
    } else if (name.startsWith("Quận") || name.startsWith("Huyện")) {
        clean = clean.replace(/^(Quan|Huyen)\s+/i, "") + " District";
    } else if (name.startsWith("Thị xã")) {
        clean = clean.replace(/^Thi xa\s+/i, "") + " Town";
    } else if (name.startsWith("Phường")) {
        clean = clean.replace(/^Phuong\s+/i, "") + " Ward";
    } else if (name.startsWith("Xã")) {
        clean = clean.replace(/^Xa\s+/i, "") + " Commune";
    } else if (name.startsWith("Thị trấn")) {
        clean = clean.replace(/^Thi tran\s+/i, "") + " Town";
    }

    return clean.trim();
};
