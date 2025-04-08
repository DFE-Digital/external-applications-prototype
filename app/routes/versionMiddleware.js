module.exports = function (router, version) {
    const versionData = require('../data/data-' + version);
    router.use('/' + version + '/*', (req, res, next) => {
        var currentVersion = req.session.data['version']
        if(currentVersion !== version)
        {
            console.log('Loading data for ' + version)
            req.session.data['school-list'] = versionData['school-list']
            req.session.data['version'] = version
        }
        next()
       }
    )
}