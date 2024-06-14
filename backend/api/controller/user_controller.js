const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtToken = require('../../core/token');
const password = require('../../core/password');

const UserModel = require('../model/user_model');
const UserAddressModel = require('../model/address_model');

const upload = require('../../core/upload');

const User = {};

User.signup = async (req, res) => {
    try {
        const reqdata = req.body;
        // password.cryptPassword(reqdata.password, (error, pass) => {
        //     console.log(`pass--> ${pass}`);
        //     password.comparePassword("1234567", pass, (e, v) => {
        //         console.log("Matched --> " + v);
        //     });
        // });
        if (reqdata.first_name && reqdata.last_name && reqdata.email && reqdata.password && reqdata.confirm_password && (reqdata.password === reqdata.confirm_password)) {
            const alradyRegistered = await UserModel.findOne({ email: reqdata.email });
            if (alradyRegistered) {
                res.status(400).json({
                    success: false,
                    message: "User alrady registered!",
                });
                return;
            }
            let cryptpassword = '';
            password.cryptPassword(reqdata.password, async (error, pass) => {
                cryptpassword = pass;
                const model = UserModel({
                    first_name: reqdata.first_name,
                    last_name: reqdata.last_name,
                    email: reqdata.email,
                    password: cryptpassword,
                    login_type: reqdata.login_type,
                    platform_type: reqdata.platform_type,
                    device_token: reqdata.device_token
                });
                const data = await UserModel.create(model);
                data.otp = 1111;

                const d = JSON.parse(JSON.stringify(data));
                delete d.password;
                let token = jwt.sign(d, process.env.AUTH_TOKEN_KEY);
                d.token = token;
                res.status(201).json({
                    success: true,
                    message: "OTP send successfully!",
                    body: d,
                });
            });

        } else {
            const msg = `${!reqdata.first_name ? "first_name" :
                !reqdata.last_name ? "last_name" :
                    !reqdata.email ? "email" :
                        !reqdata.password ? "password" :
                            !reqdata.confirm_password ? "confirm_password" :
                                ""}${reqdata.password !== reqdata.confirm_password ? "Password and confirm password should be same!" : " is missing!"}`;

            res.status(400).json({
                success: false,
                message: msg,
            });
        }

    } catch (error) {
        console.log("Error: " + error);
        res.status(400).json({
            success: false,
            message: 'Something went worng!',
        });
    }
}

User.verify = async (req, res) => {
    try {
        // Auth Token
        let requestedBy = req.get('authorization');
        jwtToken.tokenDecode(requestedBy.split(' ')[1], function (data) {
            requestedBy = data;
        });
        // ----------
        const reqdata = req.body;
        const userInfo = await UserModel.findOne({ _id: requestedBy._id });
        if (userInfo && reqdata.otp) {
            let msg = "";
            if (!userInfo) {
                msg = `${userInfo.email} is not exist!`;
            } else if (reqdata.otp !== 1111) {
                msg = "Otp doesn't matched!";
            } else {
                msg = "You have logedin successfully!"
            }
            if (userInfo && reqdata.otp === 1111) {
                const updatedUser = await UserModel.findByIdAndUpdate(userInfo._id, { email_verify: 1 });
                const body = JSON.parse(JSON.stringify(updatedUser));
                delete body.password;
                body.email_verify = 1;
                res.status(200).json({
                    success: true,
                    message: msg,
                    body: body,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: msg,
                });
            }
        } else {
            console.log("----kkk");
            var msg;
            var code;
            if (!userInfo) {
                msg = "Access denied! unautorized user!";
                code = 401;
            } else {
                msg = `otp is missing!`;
                code = 400;
            }
            res.status(code).json({
                success: false,
                message: msg,
            });
        }
    } catch (error) {
        console.log("Error: " + error);
        res.status(400).json({
            success: false,
            message: 'Something went worng!',
        });
    }
}

User.login = async (req, res) => {
    try {
        const reqdata = req.body;
        msg = ``;
        if (reqdata.email && reqdata.password) {
            const userExist = await UserModel.findOne({ email: reqdata.email });
            let body = {};
            if (userExist) {
                password.comparePassword(reqdata.password, userExist.password, async (e, v) => {
                    let logedin = false;
                    if (v) {
                        await UserModel.findByIdAndUpdate(userExist._id, {
                            login_type: reqdata.login_type,
                            platform_type: reqdata.platform_type,
                            device_token: reqdata.device_token
                        });
                        body = JSON.parse(JSON.stringify(userExist));
                        body.token = jwt.sign(JSON.stringify(userExist), process.env.AUTH_TOKEN_KEY);
                        const verified = body.email_verify === 1;
                        if (!verified) {
                            body.otp = 1111;
                            body.login_type = reqdata.login_type;
                            body.platform_type = reqdata.platform_type;
                            body.device_token = reqdata.device_token;
                        }
                        delete body.password;
                        logedin = true;
                        msg = `You are logedin successfully!`;
                    } else {
                        msg = `Invalied password!`;
                    }
                    res.status(logedin ? 200 : 400).json({
                        success: logedin,
                        message: msg,
                        body: body,
                    });
                });
            } else {
                msg = `${reqdata.email} is not exist!`;
                res.status(400).json({
                    success: false,
                    message: msg,
                    body: body,
                });
            }
        } else {
            console.log(`Email--> ${reqdata.email} | Pass--> ${reqdata.password}`);
            res.status(400);
            throw new Error("Somting went worng!");
        }
    } catch (error) {
        console.log(`Error(${res.statusCode}): ` + error);
        res.status(res.statusCode < 300 ? 400 : res.statusCode).json({
            success: false,
            message: error.message// 'Something went worng!',
        });
    }
}

User.getUserProfile = async (req, res) => {
    try {
        // Auth Token
        let requestedBy = req.get('authorization');
        jwtToken.tokenDecode(requestedBy.split(' ')[1], function (data) {
            requestedBy = data;
        });
        // ----------
        const userInfo = await UserModel.findOne({ _id: requestedBy._id }).populate('address');
        if (userInfo) {
            const msg = `Successfully fetched user profile!`;
            let body = JSON.parse(JSON.stringify(userInfo));
            delete body.password;
            res.status(200).json({
                success: true,
                message: msg,
                data: body,
            });
        } else {
            res.status(407);
            throw new Error("User not found!");
        }
    } catch (error) {
        console.log(`Error(${res.statusCode}): ` + error);
        res.status(res.statusCode < 300 ? 400 : res.statusCode).json({
            success: false,
            message: error.message// 'Something went worng!',
        });
    }
}

User.updateProfileInfo = async (req, res) => {
    try {
        const reqdata = req.body;
        const reqfile = req.file;
        // Auth Token---------------------
        let requestedBy = req.get('authorization');
        jwtToken.tokenDecode(requestedBy.split(' ')[1], function (data) {
            requestedBy = data;
        });
        //--------------------------------
        var current = await UserModel.findOne({ _id: requestedBy._id });
        if (!current) {
            res.status(401).json({
                success: true,
                message: "Access denied! unautorized user!",
                data: body
            });
            return;
        }
        var addressId;
        // Address Add/Update/Delete older
        if (reqdata.country && reqdata.state && reqdata.location && reqdata.latitude && reqdata.longitude) {
            if (current.address) {
                // await UserAddressModel.findByIdAndDelete(current.address);
                await UserAddressModel.findByIdAndUpdate(current.address, {
                    location: reqdata.location,
                    state: reqdata.state,
                    country: reqdata.country,
                    coordinates: {
                        latitude: reqdata.latitude,
                        longitude: reqdata.longitude,
                    },
                });
            } else {
                const address = UserAddressModel({
                    location: reqdata.location,
                    state: reqdata.state,
                    country: reqdata.country,
                    coordinates: {
                        latitude: reqdata.latitude,
                        longitude: reqdata.longitude,
                    },
                    user: requestedBy._id,
                });
                const added = await UserAddressModel.create(address);
                addressId = added._id;
            }
        }
        //--------------------------------
        // Delete older image-------------
        if (req.file) {
            const currentFile = current.profile_image;
            upload.deletefile(`uploads/images/profile/${currentFile}`);
        }
        // -------------------------------
        await UserModel.findByIdAndUpdate(requestedBy._id, {
            profile_image: reqfile.filename,
            first_name: reqdata.first_name,
            last_name: reqdata.last_name,
            country_code: reqdata.country_code,
            phone_number: reqdata.phone_number,
            address: addressId,
        });
        const userInfo = await UserModel.findOne({ _id: requestedBy._id }).populate('address');
        const msg = `Your profile updated successfully🙈!`;
        let body = JSON.parse(JSON.stringify(userInfo));
        delete body.password;
        res.status(200).json({
            success: true,
            message: msg,
            data: body
        });

    } catch (error) {
        console.log("Error: " + error);
        res.status(400).json({
            success: false,
            message: 'Something went worng!',
        });
    }
}

module.exports = User;