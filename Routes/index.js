module.exports = [
    require('./forum/forumRoutes'),
    {
        method: 'GET',
        path: '/',
        config: {
            auth: false,
            handler: function (req, res) {
                res.view('index');
            }
        }

    }

];
