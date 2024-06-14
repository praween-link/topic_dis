const mongoose = require('mongoose');

const jwtToken = require('../../core/token');

const TopicModel = require('../model/topic_model');

const Topic = {};

Topic.request = async (req, res) => {
    try {
        const reqdata = req.body;
        // Auth Token
        let requestedBy = req.get('authorization');
        jwtToken.tokenDecode(requestedBy.split(' ')[1], function (data) {
            requestedBy = data;
        });
        // ----------
        if (reqdata.title && reqdata.describe && reqdata.describe.length >= 20) {
            const topic = TopicModel({
                requested_by: requestedBy._id,
                title: reqdata.title,
                describe: reqdata.describe,
            });

            const data = await TopicModel.create(topic);
            res.status(201).json({
                success: true,
                message: "Topic request sent successfully!",
                body: data,
            });
        } else {
            const msg = `${!reqdata.title ? "title" :
                !reqdata.describe ? "describe" :
                    ""}${reqdata.describe.length < 20 ? "Please describe you topic at list in more then 20 letters!" : " is missing!"}`;

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
Topic.allRequests = async (req, res) => {
    try {
        // Auth Token
        let requestedBy = req.get('authorization');
        jwtToken.tokenDecode(requestedBy.split(' ')[1], function (data) {
            requestedBy = data;
        });
        // ----------
        const data = await TopicModel.find({ "requested_by": requestedBy._id }).populate(
            "requested_by",
            "first_name last_name email profile_image"
        );
        res.status(201).json({
            success: true,
            message: "Get all topic requests successfully!",
            body: data,
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(400).json({
            success: false,
            message: 'Something went worng!',
        });
    }
}

Topic.update = async (req, res) => {
    try {
        const reqdata = req.body;
        // Auth Token
        let requestedBy = req.get('authorization');
        jwtToken.tokenDecode(requestedBy.split(' ')[1], function (data) {
            requestedBy = data;
        });
        // ----------
        if (reqdata.topic_id && reqdata.title && reqdata.describe && reqdata.describe.length >= 20) {
            // Check user is eligible for modify or not
            var canModify = await TopicModel.findOne({ _id: reqdata.topic_id });
            if (canModify && (canModify.requested_by == requestedBy._id)) {
                const data = await TopicModel.findByIdAndUpdate(reqdata.topic_id, {
                    requested_by: requestedBy._id,
                    title: reqdata.title,
                    describe: reqdata.describe,
                });
                let body = JSON.parse(JSON.stringify(data));
                body.title = reqdata.title;
                body.describe = reqdata.describe;
                res.status(201).json({
                    success: true,
                    message: "Topic updated successfully!",
                    body: body,
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: canModify ? "You are not unautorized for update this topic!" : "Topic not found!",
                    body: {},
                });
            }
            // ------
        } else {
            const msg = `${!reqdata.title ? "title" :
                !reqdata.describe ? "describe" :
                    ""}${reqdata.describe.length < 20 ? "Please describe you topic at list in more then 20 letters!" : " is missing!"}`;

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
module.exports = Topic;