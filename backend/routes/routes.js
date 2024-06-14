const express = require('express');

const router = express.Router();
const checktoken = require('../core/token');
// console.log(`checktoken: ${checktoken.checkToken}`);
const UserController = require('../api/controller/user_controller');
const TopicController = require('../api/controller/topic_controller');
//------------ Multer -----------
const upload = require('../core/upload');
//-------------------------------
router.get('/api', (req, res) => {
    res.send("Hello Lifeizz");
});
router.post('/api/user/signup', UserController.signup);
router.post('/api/user/verify', checktoken.checkToken, UserController.verify);
router.post('/api/user/login', UserController.login);
router.get('/api/user/profile', checktoken.checkToken, UserController.getUserProfile);
router.put('/api/user/profile', checktoken.checkToken, upload.profileImage.single('profile_image'), UserController.updateProfileInfo);

router.post('/api/topic/request', checktoken.checkToken, TopicController.request);
router.put('/api/topic/update', checktoken.checkToken, TopicController.update);
router.get('/api/topic/requests', checktoken.checkToken, TopicController.allRequests);

module.exports = router;

/**
 * ***** Http Response Status Code: *****
 * Link: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * **************************************
 */