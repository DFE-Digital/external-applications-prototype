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