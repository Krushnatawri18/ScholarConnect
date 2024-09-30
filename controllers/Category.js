const Category = require('../models/Category');
const File = require('../models/File');

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const categoryDetails = await Category.create({ name: name });

        return res.status(200).json({
            success: true,
            message: 'Category created successfully',
            categoryDetails
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in creating an category'
        });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const { categoryId, name } = req.body;

        if (!categoryId || !name) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const categoryExist = await Category.findById({ _id: categoryId });

        if (!categoryExist) {
            return res.status(403).json({
                success: false,
                message: 'Category not found'
            });
        }

        const category = await Category.findByIdAndUpdate({ _id: categoryId }, {
            name: name
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Updated category successfully',
            category: category
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in updating a category'
        });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const associatedFiles = await File.find({ category: categoryId });
        if (associatedFiles.length > 0) {
            await File.deleteMany({ category: categoryId });
        }

        await Category.findByIdAndDelete({ _id: categoryId });

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in deleting a category'
        });
    }
}

exports.showAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}, { name: true, files: true });

        if (!categories) {
            return res.status(403).json({
                success: false,
                message: 'No category found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'All categories fetched successfully',
            categories: categories
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in fetching all categories'
        });
    }
}