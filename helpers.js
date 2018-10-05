/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
exports.shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

//Test dans array1 il y a les elements de array2
exports.include = (array1, array2) => {
    if(array2.length == 0)
        return false;
        
    let include = true;
    for(let i = 0; i<array2.length ;i++){
        if(!array1.includes(array2[i])){
            include = false;
            break;
        }
    }
    return include;
}

exports.getRandomFiles = (path, nb_files = -1) => {
    let files  = fs.readdirSync(path);
    files      = helpers.shuffle(files);

    if(nb_files >= 0)
        files = files.slice(0, nb_files);
    
    return files;
}