const express = require('express');

const viewRouter = express.Router();

const AdminController = require('../admin/controller/dashboard_controller');

viewRouter.get("/", AdminController.dashboard);
viewRouter.get("/users", AdminController.users);
viewRouter.get("/topics", AdminController.topics);
viewRouter.get("/requests", AdminController.requests);
viewRouter.get("/comments", AdminController.comments);
viewRouter.get("/table", (req, res) => {
    res.render('table_view');
});

module.exports = viewRouter;