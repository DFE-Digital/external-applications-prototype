//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

//********************************************
//* route files for different sprints
//********************************************
require('./routes/alpha-sprint-1.js')(router);
require('./routes/alpha-sprint-7.js')(router);
require('./routes/alpha-sprint-10.js')(router);
require('./routes/alpha-sprint-10b.js')(router);
require('./routes/alpha-sprint-11.js')(router);
require('./routes/alpha-sprint-12.js')(router);
require('./routes/alpha-sprint-14.js')(router);
require('./routes/alpha-sprint-16.js')(router);
require('./routes/alpha-sprint-18.js')(router);
require('./routes/alpha-sprint-19.js')(router);