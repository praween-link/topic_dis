
const UserModel = require('../../api/model/user_model');

/// Dashboard
exports.dashboard = async (req, res) => {
    // res.send("Welcome!!!");
    res.render('index', { title: "Dashboard" });
}


/// Users --------------------------------------------
exports.users = async (req, res) => {
    try {
        console.log("------> " + req.body.activeDeactive + " ->" + JSON.stringify(req.body));
        const queries = req.query;
        /// Change status of active/inactive
        const userActiveInactiveUserId = queries.active_inactive_user_id

        if (userActiveInactiveUserId) {
            const u = await UserModel.findById(userActiveInactiveUserId);
            await UserModel.findByIdAndUpdate(userActiveInactiveUserId, {
                status: u.status != 1
            });
        }

        const page = Number(queries.page || 1);
        const limit = Number(queries.limit) || 5;
        const searchKey = queries.search || '';
        const skip = (page - 1) * limit;
        console.log(`page: ${page}, limit: ${limit}, skip: ${skip}, search: ${searchKey}`);
        const query = {};
        const options = {
            sort: { rating: -1 },
        }

        let orQuerySearch = [
            { first_name: { $regex: `.*${searchKey}.*`, $options: 'i' } },
            { last_name: { $regex: `.*${searchKey}.*`, $options: 'i' } },
            { email: { $regex: `.*${searchKey}.*`, $options: 'i' } },
            { phone_number: { $regex: `.*${searchKey}.*`, $options: 'i' } },
        ];

        const usersData = await UserModel.find({
            deleted: 0,
            $or: orQuerySearch
        }).skip(skip).limit(limit).populate(
            "address",
            "location country"
        );
        const totalRecords = (await UserModel.find({
            deleted: 0,
            $or: orQuerySearch
        })).length;
        // console.log("Users: " + JSON.stringify(usersData));
        var u = req.protocol + '://' + req.get('host') + req.originalUrl;

        console.log("Current Url: " + u);
        if (usersData) {
            res.render('users_page', { title: "Users", data: usersData, query: queries, total_records: totalRecords, skip: skip, limit: limit });
        } else {
            const msg = `User not found!`;
            res.render('users_page', { title: "Users Error!" });
        }
    } catch (error) {
        console.log("Error: " + error);
        res.render('users_page', { title: "Users Error" });
    }
}
// ----------------------------------------------------

/// Topics
exports.topics = (req, res) => {
    // res.send("Welcome!!!");
    res.render('topics_page', { title: "Topics" });
}

/// Requests
exports.requests = (req, res) => {
    // res.send("Welcome!!!");
    res.render('requests_page', { title: "Requests" });
}

/// Commensts
exports.comments = (req, res) => {
    // res.send("Welcome!!!");
    res.render('comments_page', { title: "Comments" });
}



// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function demo() {
//     for (let i = 0; i < 5; i++) {
//         console.log(`Waiting ${i} seconds...`);
//         await sleep(i * 1000);
//         if (i == 4) {
//             res.render('users_page', { title: "Users", data: usersData, query: queries });
//         }
//     }
//     console.log('Done');
// }

// demo();