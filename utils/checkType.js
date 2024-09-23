
function isFileSupported(fileType, supportTypes){
    return supportTypes.includes(fileType);
}

module.exports = isFileSupported;