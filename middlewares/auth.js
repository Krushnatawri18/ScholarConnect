const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.auth = async(req, res, next) => {
    try{
        const token = req.body.token || req.cookies.token || req.header('Authorization').replace('Bearer ','');

        if(!token){
            return res.status(403).json({
                success: false,
                message: 'Token is missing'
            }); 
        }

        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        }
        catch(error){
            return res.status(403).json({
                success: false,
                message: 'Token is invalid'
            });
        }

        next();
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in authenticating an user'
        });
    }
}

exports.isStudent = async(req, res, next) => {
    try{
        if(req.user.accountType !== 'Student'){
            return res.status(403).json({
                success: false,
                message: 'Authorized route for the students'
            })
        }
        next();
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in authorizing a student'
        });
    }
}

exports.isAdmin = async(req, res, next) => {
    try{
        if(req.user.accountType !== 'Admin'){
            return res.status(403).json({
                success: false,
                message: 'Authorized route for the admin'
            })
        }
        next();
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in authorizing an admin'
        });
    }
}