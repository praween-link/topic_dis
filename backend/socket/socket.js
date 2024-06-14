const socketIO = require('socket.io');
const CommentModel = require('../api/model/comment_model');
const UserModel = require('../api/model/user_model');
const ReportModel = require('../api/model/comment_report_model');
const mongoose = require('mongoose');

const jwtToken = require('../core/token');

let io;

const SocketIO = {};

SocketIO.init = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:3000/",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    });
    console.log("Socket init called ");

    io.on('connection', (socket) => {
        console.log(`Socket connection successfully! socket_id: ${socket.id}`);
        // Handle socket events
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
        // ====== Comment ======
        socket.on('comment', async (data) => {
            // Required: comment(comment), topic(topic_id), comment_by(auth_token)
            // Optional: reply_on, grand_parent_comment, parent_comment, type (0 for main comment, 1 for reply)
            if (data.comment && data.auth_token && data.topic_id) {
                // Auth Token--
                let requestedBy = data.auth_token;
                jwtToken.tokenDecode(requestedBy, function (data) {
                    requestedBy = data;
                });
                //-------------
                if (!requestedBy) {
                    let msg = "Access denied! unautorized user!";
                    socket.emit("comment", { "message": msg });
                } else {
                    const dataReq = {
                        comment: data.comment,
                        topic: data.topic_id,
                        comment_by: requestedBy._id,
                        type: data.reply_on ? 1 : 0,
                    };
                    if (data.grand_parent_comment) {
                        dataReq.grand_parent_comment = data.grand_parent_comment;
                    }
                    if (data.parent_comment) {
                        dataReq.parent_comment = data.parent_comment;
                    }
                    if (data.reply_on) {
                        dataReq.reply_on = data.reply_on;
                    }
                    const model = CommentModel(dataReq);
                    const addedComment = await CommentModel.create(model);
                    const commenter = await UserModel.findById(requestedBy._id);
                    const resdata = JSON.parse(JSON.stringify(addedComment));
                    delete resdata.likes;
                    delete resdata.replies;
                    delete resdata.seen;
                    delete resdata.reports;
                    delete resdata.deleted;
                    resdata.comment_by_info = commenter;
                    // --- reply array ---
                    if (data.reply_on) {
                        const repliedOn = await CommentModel.findById(data.reply_on);
                        repliedOn.replies.push(requestedBy._id);
                        await CommentModel.findByIdAndUpdate(data.reply_on, { replies: repliedOn.replies });
                    }

                    io.emit("comment", resdata);
                }
            } else {
                let msg;
                if (data.auth_token) {
                    msg = `${!data.comment ? 'comment' : !data.topic_id ? 'topic_id' : 'Someting'} is missing!`;
                } else {
                    msg = "Access denied! unautorized user!";
                }
                socket.emit("comment", { "message": msg });
            }
        });
        // ====== Like ======
        socket.on('comment_like', async (data) => {
            // Required: comment_id, auth_token
            // Optional: 
            if (data.comment_id && data.auth_token) {
                // Auth Token--
                let requestedBy = data.auth_token;
                jwtToken.tokenDecode(requestedBy, function (data) {
                    requestedBy = data;
                });
                //-------------
                if (!requestedBy) {
                    let msg = "Access denied! unautorized user!";
                    socket.emit("comment_like", { "message": msg });
                } else {
                    const commentData = await CommentModel.findById(data.comment_id);
                    let isLiked;
                    if (commentData.likes.includes(requestedBy._id)) {
                        commentData.likes.pop(requestedBy._id);
                        isLiked = false;
                    } else {
                        commentData.likes.push(requestedBy._id);
                        isLiked = true;
                    }

                    const resdata = JSON.parse(JSON.stringify(data));
                    await CommentModel.findByIdAndUpdate(data.comment_id, { likes: commentData.likes });

                    delete resdata.auth_token;
                    resdata.user_id = requestedBy._id;
                    resdata.is_liked = isLiked;
                    io.emit("comment_like", resdata);
                }
            } else {
                let msg;
                if (data.auth_token) {
                    msg = `${!data.comment_id ? 'comment_id' : 'Something'} is missing!`;
                } else {
                    msg = "Access denied! unautorized user!";
                }
                socket.emit("comment_like", { "message": msg });
            }
        });
        // ====== Get Comments ======
        socket.on('get_comments', async (data) => {
            // Required: auth_token, topic_id
            // Optional: page, limit
            if (data.auth_token && data.topic_id) {
                // Auth Token--
                let requestedBy = data.auth_token;
                jwtToken.tokenDecode(requestedBy, function (data) {
                    requestedBy = data;
                });
                //-------------
                if (!requestedBy) {
                    let msg = "Access denied! unautorized user!";
                    socket.emit("get_comments", { "message": msg });
                } else {
                    const comments =
                        // await CommentModel
                        // .find({ "topic": data.topic_id })
                        // .populate([
                        //     {
                        //         path: "comment_by",
                        //         select: "first_name last_name email profile_image",
                        //     }
                        // ]);
                        // await CommentModel
                        //     .aggregate([
                        //         { $lookup: { from: "users", localField: "comment_by", foreignField: "_id", as: "user" } },
                        //     ]);
                        await CommentModel
                            .aggregate([
                                {
                                    $match: { deleted: 0 }
                                },
                                // Populate userId field
                                {
                                    $lookup: {
                                        from: 'users', // Assuming the name of your users collection is 'users'
                                        localField: 'comment_by',
                                        foreignField: '_id',
                                        as: 'user'
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        type: 1,
                                        topic: 1,
                                        comment: 1,
                                        comment_by: 1,
                                        comment_by_info: { $arrayElemAt: ['$user', 0] }, // Get the first element of the 'user' array
                                        reply_on: 1,
                                        parent_comment: 1,
                                        grand_parent_comment: 1,
                                        total_likes: { $size: '$likes' },
                                        total_replies: { $size: '$replies' },
                                        total_views: { $size: '$seen' },
                                        total_reports: { $size: '$reports' },
                                        liked_by_me: { $in: [new mongoose.Types.ObjectId(requestedBy._id), '$likes'] },
                                        report_by_me: { $in: [new mongoose.Types.ObjectId(requestedBy._id), '$reports.user'] },
                                        reply_by_me: { $in: [new mongoose.Types.ObjectId(requestedBy._id), '$replies'] },
                                        createdAt: 1,
                                    }
                                },
                                // {
                                //     $group: {
                                //         _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                //         comments: { $push: "$$ROOT" }
                                //     }
                                // }
                            ]);
                    console.log(`Request User Id: ` + requestedBy._id);
                    io.emit("get_comments", comments);
                }
            } else {
                let msg;
                if (data.auth_token) {
                    msg = `${!data.comment ? 'comment' : !data.topic_id ? 'topic_id' : 'Someting'} is missing!`;
                } else {
                    msg = "Access denied! unautorized user!";
                }
                socket.emit("get_comments", { "message": msg });
            }
        });
        // ====== Get Replies ======
        socket.on('get_replies', async (data) => {
            // Required: auth_token, grand_parent_comment_id, parent_comment_id
            // Optional: 
            if (data.auth_token && data.grand_parent_comment_id && data.parent_comment_id) {
                // Auth Token--
                let requestedBy = data.auth_token;
                jwtToken.tokenDecode(requestedBy, function (data) {
                    requestedBy = data;
                });
                //-------------
                if (!requestedBy) {
                    let msg = "Access denied! unautorized user!";
                    socket.emit("get_replies", { "message": msg });
                } else {

                    const replies = await CommentModel
                        //     .find({
                        //     $and: [
                        //         { "grand_parent_comment": data.grand_parent_comment_id },
                        //         { "parent_comment": data.parent_comment_id },
                        //         { "type": 1 }
                        //     ]
                        // })
                        // .populate([
                        //     {
                        //         path: "comment_by",
                        //         select: "first_name last_name email profile_image",
                        //     }
                        // ]);
                        .aggregate([
                            {
                                $match: {
                                    deleted: 0,
                                    grand_parent_comment: new mongoose.Types.ObjectId(data.grand_parent_comment_id),
                                    parent_comment: new mongoose.Types.ObjectId(data.parent_comment_id),
                                    type: 1
                                }
                            },
                            // Populate userId field
                            {
                                $lookup: {
                                    from: 'users', // Assuming the name of your users collection is 'users'
                                    localField: 'comment_by',
                                    foreignField: '_id',
                                    as: 'user'
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    type: 1,
                                    topic: 1,
                                    comment: 1,
                                    comment_by: 1,
                                    comment_by_info: { $arrayElemAt: ['$user', 0] }, // Get the first element of the 'user' array
                                    reply_on: 1,
                                    parent_comment: 1,
                                    grand_parent_comment: 1,
                                    total_likes: { $size: '$likes' },
                                    total_replies: { $size: '$replies' },
                                    total_views: { $size: '$seen' },
                                    total_reports: { $size: '$reports' },
                                    liked_by_me: { $in: [new mongoose.Types.ObjectId(requestedBy._id), '$likes'] },
                                    report_by_me: { $in: [new mongoose.Types.ObjectId(requestedBy._id), '$reports.user'] },
                                    reply_by_me: { $in: [new mongoose.Types.ObjectId(requestedBy._id), '$replies'] },
                                    createdAt: 1,
                                }
                            }
                        ]);
                    io.emit("get_replies", {
                        "repy_type": data.grand_parent_comment_id == data.parent_comment_id ? 0 : 1, // 0 for Outer replies and 1 for Inner replies
                        "replies": replies
                    });
                    // First comment replies list (0 for Outer replies)
                    // Nested comment replies list (1 for Inner replies)

                }
            } else {
                let msg;
                if (data.auth_token) {
                    msg = `${!data.grand_parent_comment_id ? 'grand_parent_comment_id' : !data.parent_comment_id ? 'parent_comment_id' : 'Someting'} is missing!`;
                } else {
                    msg = "Access denied! unautorized user!";
                }
                socket.emit("get_replies", { "message": msg });
            }
        });
        // ====== Report ======
        socket.on('report_comment', async (data) => {
            // Required: message, report_by(auth_token), comment(comment_id)
            // Optional: 
            if (data.message && data.auth_token && data.comment_id) {
                // Auth Token--
                let requestedBy = data.auth_token;
                jwtToken.tokenDecode(requestedBy, function (data) {
                    requestedBy = data;
                });
                //-------------
                if (!requestedBy) {
                    let msg = "Access denied! unautorized user!";
                    socket.emit("report_comment", { "message": msg });
                } else {
                    const model = ReportModel({
                        message: data.message,
                        report_by: requestedBy._id,
                        comment: data.comment_id
                    });
                    const addedReport = await ReportModel.create(model);
                    // --- Report array ---
                    const reportedOn = await CommentModel.findById(data.comment_id);
                    reportedOn.reports.push({ user: requestedBy._id, report: addedReport._id });
                    await CommentModel.findByIdAndUpdate(data.comment_id, { reports: reportedOn.reports });

                    io.emit("report_comment", addedReport);
                }
            } else {
                let msg;
                if (data.auth_token) {
                    msg = `${!data.message ? 'message' : !data.comment_id ? 'comment_id' : 'Someting'} is missing!`;
                } else {
                    msg = "Access denied! unautorized user!";
                }
                socket.emit("report_comment", { "message": msg });
            }
        });
    });

    return io;
}

SocketIO.instance = () => {
    if (!io) {
        throw new Error('Socket has not been initialized.');
    }
    return io;
}

module.exports = SocketIO;