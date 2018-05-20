/**
 * Cleans the odd bits off of an ip
 * 
 * @param {string} ip The IP to clean
 */
exports.cleanIP = ip => {
    if (!ip) return ip;
    if (ip.startsWith('::ffff:')) ip = ip.substr(7);
    if (ip === '::1') ip = '127.0.0.1';
    return ip;
};

exports.compactString = object => {
    const output = [];
    for (const key in object) {
        if (!object[key]) continue;
        output.push(`${key}: ${typeof object[key] === 'string' ? '"' + object[key] + '"' : object[key]}`);
    }
    return output.join(', ');
};