const cloudinary = require('cloudinary').v2;

async function mediaUpload(file, folder, tags, height, width, resource_type, quality) {
    try {
        const options = {
            folder,
            quality: quality || 'auto',
            resource_type: resource_type || 'auto',
            public_id: file.name.split('.')[0],
            transformations: [],
            tags: tags || []
        }

        if (height && width) {
            options.transformations.push({
                height: height,
                width: width,
                crop: 'fit'
            });
        }

        return await cloudinary.uploader.upload(file.tempFilePath, options);
    }
    catch (error) {
        console.log('Error in uploading to cloudinary');
        return null;
    }
}

module.exports = mediaUpload;