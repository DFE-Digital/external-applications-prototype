// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")
const data = require('../data/data-alpha-sprint-10b');

module.exports = function (router) {

    var version = "alpha-sprint-10b";

    versionMiddleware(router, version);


    // Handle academy search results page
    router.get('/' + version + '/academies-to-transfer-search-results', function (req, res) {
        const radioItems = data.academies.map(academy => ({
            value: academy.name + "|||" + academy.urn,
            text: academy.name,
            hint: {
                text: `URN: ${academy.urn}`
            }
        }));

        res.render(version + '/academies-to-transfer-search-results', {
            radioItems: radioItems
        });
    });

    // Handle academy selection
    router.post('/' + version + '/academies-to-transfer-confirmation', function (req, res) {
        // Store the selected academy in session
        req.session.data['selected-academy'] = req.body['selected-academy'];
        res.render(version + '/academies-to-transfer-confirmation', {
            data: req.session.data
        });
    });

    // Handle academy confirmation
    router.post('/' + version + '/add-more-academies-handler', function (req, res) {
        const confirmAcademy = req.session.data['confirm-academy'];
        
        if (confirmAcademy === 'yes') {
            // Get the selected academy details
            const selectedAcademy = req.session.data['selected-academy'];
            const [name, urn] = selectedAcademy.split('|||');

            // Initialize academies-to-transfer array if it doesn't exist
            if (!req.session.data['academies-to-transfer']) {
                req.session.data['academies-to-transfer'] = [];
            }

            // Add the new academy to the list
            req.session.data['academies-to-transfer'].push({
                name: name,
                urn: urn
            });

            // Clear any existing errors since we now have an academy
            delete req.session.data.errors;
        }
        
        // Always go to academies-to-transfer first
        return res.redirect('academies-to-transfer');
    });
    
    // Handle new trust question response
    router.post('/' + version + '/new-trust-handler', function (req, res) {
        const isNewTrust = req.session.data['new-trust'];
        
        if (isNewTrust === 'yes') {
            // Always go to proposed trust name if answer is yes
            res.redirect('incoming-trust-proposed-trust-name');
        } else {
            // Always go to preferred trust question if answer is no
            res.redirect('incoming-trust-preferred-trust-question');
        }
    });

    // Handle preferred trust question response
    router.post('/' + version + '/preferred-trust-handler', function (req, res) {
        const hasPreferredTrust = req.session.data['preferred-trust'];

        if (hasPreferredTrust === 'yes') {
            res.redirect('incoming-trust-search');
        } else {
            res.redirect('incoming-trust-summary');
        }
    });

    // Handle incoming trust search results selection
    router.post('/' + version + '/incoming-trust-confirmation', function (req, res) {
        // Get the selected trust value from the form data
        const selectedTrustValue = req.body['selected-trust'];
        
        if (selectedTrustValue) {
            try {
                // Parse the JSON string and store temporarily
                const selectedTrust = JSON.parse(selectedTrustValue);
                req.session.data['temp-selected-trust'] = selectedTrustValue;
                req.session.data.tempSelectedTrust = selectedTrust;
                
                // Render with the parsed trust data
                res.render(version + '/incoming-trust-confirmation', {
                    selectedTrust: selectedTrust
                });
            } catch (error) {
                console.error('Error parsing selected trust:', error);
                res.render(version + '/incoming-trust-confirmation', {
                    selectedTrust: null
                });
            }
        } else {
            res.render(version + '/incoming-trust-confirmation', {
                selectedTrust: null
            });
        }
    });

    // Handle incoming trust confirmation
    router.post('/' + version + '/incoming-trust-confirmation-handler', function (req, res) {
        const confirmTrust = req.body['confirm-trust'];
        
        if (confirmTrust === 'yes') {
            // Only save the trust selection permanently if user confirms with "Yes"
            req.session.data['selected-trust'] = req.session.data['temp-selected-trust'];
            req.session.data.selectedTrust = req.session.data.tempSelectedTrust;
        }
        
        // Clear the temporary data
        delete req.session.data['temp-selected-trust'];
        delete req.session.data.tempSelectedTrust;
        
        res.redirect('incoming-trust-summary');
    });

    // Handle proposed trust name submission
    router.post('/' + version + '/proposed-trust-name-handler', function (req, res) {
        
        // Store the proposed trust name
        req.session.data['proposed-trust-name'] = req.body['proposed-trust-name'];

        res.redirect('incoming-trust-summary');

    });

    // Handle the confirm delete page parameters
    router.get('/' + version + '/confirm-delete-academy', function (req, res) {
        req.session.data['index'] = req.query.index;
        res.render(version + '/confirm-delete-academy');
    });

    // Handle academy deletion
    router.post('/' + version + '/delete-academy-handler', function (req, res) {
        const confirmDelete = req.session.data['confirm-delete'];
        const academyIndex = req.session.data['academy-index'];

        if (confirmDelete === 'yes' && req.session.data['academies-to-transfer']) {
            // Get academy name before removing it
            const academyName = req.session.data['academies-to-transfer'][academyIndex].name;
            // Remove the academy at the specified index
            req.session.data['academies-to-transfer'].splice(academyIndex, 1);
            // Store success message in session
            req.session.data['academy-removed'] = academyName;
            // Redirect to GET handler
            return res.redirect('academies-to-transfer');
        }

        res.redirect('academies-to-transfer');
    });

    // GET handler for academies-to-transfer page
    router.get('/' + version + '/academies-to-transfer', function (req, res) {
        // Check if we have a success message
        const removedAcademy = req.session.data['academy-removed'];
        // Clear it from session immediately
        delete req.session.data['academy-removed'];
        
        res.render(version + '/academies-to-transfer-summary', {
            success: !!removedAcademy,
            removedAcademy: removedAcademy,
            data: req.session.data
        });
    });

    router.get('/' + version + '/s-p', function (req, res) {
        var school = req.session.data['school-list'].find(x => x.schoolID == req.query.id)
        req.session.data.currentSchool = school;
        res.redirect('school-portal-single');
    })

    // Handle application submission
    router.post('/' + version + '/application-complete', function (req, res) {
        // Find the most recent application (which is the one we're working on)
        const applications = req.session.data['applications'] || [];
        const currentApplication = applications[0]; // Most recent application is at index 0
        
        if (currentApplication) {
            // Update the existing application
            currentApplication.status = 'Submitted';
            currentApplication.dateSubmitted = new Date().toLocaleDateString('en-GB');
            
            // Update the application details
            currentApplication.academies = req.session.data['academies-to-transfer'] || [];
            currentApplication.trustDetails = req.session.data['new-trust'] === 'yes' 
                ? { type: 'New trust', name: req.session.data['proposed-trust-name'] }
                : { type: 'Existing trust', details: req.session.data.selectedTrust };
        }
        
        res.render(version + '/application-complete', {
            refNumber: currentApplication.refNumber
        });
    });

    // Handle finance trust page
    router.post('/' + version + '/create-new-project-stage-3-finance-how-to-finance-trust-handler', function (req, res) {
        
        // Store the answer
        req.session.data['how-to-finance-trust'] = req.body['how-to-finance-trust'];

        res.redirect('finance-summary');
    });

    // Handle finance approach page
    router.post('/' + version + '/create-new-project-stage-3-finance-how-to-finance-approach-handler', function (req, res) {
        
        // Store the answer
        req.session.data['how-to-finance-approach'] = req.body['how-to-finance-approach'];
        
        res.redirect('finance-summary');
    });

    // GET handler for application task list
    router.get('/' + version + '/application-task-list', function (req, res) {
        res.render(version + '/application-task-list', {
            data: req.session.data
        });
    });

    // GET handler for new trust question
    router.get('/' + version + '/incoming-trust-new-trust-question', function (req, res) {
        res.render(version + '/incoming-trust-new-trust-question', {
            data: req.session.data
        });
    });

    // GET handler for preferred trust question
    router.get('/' + version + '/incoming-trust-preferred-trust-question', function (req, res) {
        res.render(version + '/incoming-trust-preferred-trust-question', {
            data: req.session.data
        });
    });

    // Handle incoming trust summary
    router.post('/' + version + '/incoming-trust-summary-handler', function (req, res) {
        // Save the checkbox state - using 'Complete' to match the form value
        req.session.data['incoming-trust-status'] = req.body['incoming-trust-status'] === 'Complete';
        
        // Go to application task list
        return res.redirect('application-task-list');
    });

    // Handle starting a new application
    router.post('/' + version + '/start-new-application', function (req, res) {
        // Generate a reference number (format: YYMMDD-XXXXX)
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        const refNumber = `${year}${month}${day}-${random}`;
        
        // Store the reference number in session
        req.session.data['application-reference'] = refNumber;
        
        // Create application record
        const application = {
            refNumber: refNumber,
            dateStarted: now.toLocaleDateString('en-GB'),
            status: 'Not submitted yet'
        };

        // Initialize applications array if it doesn't exist
        if (!req.session.data['applications']) {
            req.session.data['applications'] = [];
        }

        // Add the new application
        req.session.data['applications'].unshift(application);
        
        // Clear any existing application data
        req.session.data['academies-to-transfer'] = [];
        req.session.data['new-trust'] = null;
        req.session.data['preferred-trust'] = null;
        req.session.data['selected-trust'] = null;
        req.session.data['proposed-trust-name'] = null;
        req.session.data['academies-to-transfer-status'] = false;
        req.session.data['incoming-trust-status'] = false;
        
        res.redirect('application-task-list');
    });
}

