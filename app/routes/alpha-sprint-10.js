// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")
const data = require('../data/data-alpha-sprint-10');

module.exports = function (router) {

    var version = "alpha-sprint-10";

    versionMiddleware(router, version);

    // Initialize from-check-answers to false for normal flow
    router.use('/' + version + '/*', (req, res, next) => {
        // Only set from-check-answers to true if it comes from a query parameter
        if (req.query['from-check-answers'] === 'true') {
            req.session.data['from-check-answers'] = true;
        } else if (req.session.data['from-check-answers'] === undefined) {
            req.session.data['from-check-answers'] = false;
        }
        next();
    });

    // Handle academy search results page
    router.get('/' + version + '/create-new-project-academy-search-results', function (req, res) {
        const radioItems = data.academies.map(academy => ({
            value: academy.name + "|||" + academy.urn,
            text: academy.name,
            hint: {
                text: `URN: ${academy.urn}`
            }
        }));

        res.render(version + '/create-new-project-academy-search-results', {
            radioItems: radioItems
        });
    });

    // Handle academy selection
    router.post('/' + version + '/academy-confirmation', function (req, res) {
        // Store the selected academy in session
        req.session.data['selected-academy'] = req.body['selected-academy'];
        res.render(version + '/academy-confirmation', {
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

            // Initialize selected-academies array if it doesn't exist
            if (!req.session.data['selected-academies']) {
                req.session.data['selected-academies'] = [];
            }

            // Add the new academy to the list
            req.session.data['selected-academies'].push({
                name: name,
                urn: urn
            });

            // Clear any existing errors since we now have an academy
            delete req.session.data.errors;
        }

        // Ensure from-check-answers is false when adding academies
        req.session.data['from-check-answers'] = false;
        
        // Always go to selected-academies first
        return res.redirect('selected-academies');
    });

    // Handle selected academies confirmation
    router.post('/' + version + '/selected-academies-handler', function (req, res) {
        const fromCheckAnswers = req.session.data['from-check-answers'];
        
        // Check if any academies are selected
        if (!req.session.data['selected-academies'] || req.session.data['selected-academies'].length === 0) {
            // Render selected-academies with error
            return res.render(version + '/selected-academies', {
                error: true
            });
        }
        
        // If user came from check answers, go back there
        if (fromCheckAnswers === 'true') {
            return res.redirect('check-your-answers');
        }
        
        // Otherwise go to new trust question
        return res.redirect('new-trust-question');
    });

    // Handle new trust question response
    router.post('/' + version + '/new-trust-handler', function (req, res) {
        const isNewTrust = req.session.data['new-trust'];
        
        if (isNewTrust === 'yes') {
            // Always go to proposed trust name if answer is yes
            res.redirect('proposed-trust-name');
        } else {
            // Always go to preferred trust question if answer is no
            res.redirect('preferred-trust-question');
        }
    });

    // Handle preferred trust question response
    router.post('/' + version + '/preferred-trust-handler', function (req, res) {
        const hasPreferredTrust = req.session.data['preferred-trust'];
        const fromCheckAnswers = req.session.data['from-check-answers'];

        if (hasPreferredTrust === 'yes') {
            res.redirect('incoming-trust-search');
        } else {
            // Set from-check-answers to false for normal flow
            req.session.data['from-check-answers'] = false;
            res.redirect('create-new-project-stage-3-finance-how-to-finance-trust');
        }
    });

    // Handle incoming trust search results selection
    router.post('/' + version + '/incoming-trust-confirmation', function (req, res) {
        // Get the selected trust value from the form data
        const selectedTrustValue = req.body['selected-trust'];
        
        if (selectedTrustValue) {
            try {
                // Parse the JSON string
                const selectedTrust = JSON.parse(selectedTrustValue);
                
                // Store both the raw JSON and parsed object
                req.session.data['selected-trust'] = selectedTrustValue;
                req.session.data.selectedTrust = selectedTrust;
                
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
        const confirmTrust = req.session.data['confirm-trust'];
        const fromCheckAnswers = req.session.data['from-check-answers'];
        
        if (confirmTrust === 'yes') {
            // If user came from check answers, go back there
            if (fromCheckAnswers === 'true') {
                return res.redirect('check-your-answers');
            }
            // Otherwise continue with normal flow
            res.redirect('create-new-project-stage-3-finance-how-to-finance-trust');
        } else {
            res.redirect('incoming-trust-search');
        }
    });

    // Handle proposed trust name submission
    router.post('/' + version + '/proposed-trust-name-handler', function (req, res) {
        const fromCheckAnswers = req.session.data['from-check-answers'];
        
        // Store the proposed trust name
        req.session.data['proposed-trust-name'] = req.body['proposed-trust-name'];
        
        /*
        // If user came from check answers, go back there
        if (fromCheckAnswers === 'true') {
            return res.redirect('check-your-answers');
        }
        */

        // Ensure from-check-answers stays false for normal flow
        res.redirect('create-new-project-stage-3-finance-how-to-finance-trust');

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

        if (confirmDelete === 'yes' && req.session.data['selected-academies']) {
            // Get academy name before removing it
            const academyName = req.session.data['selected-academies'][academyIndex].name;
            // Remove the academy at the specified index
            req.session.data['selected-academies'].splice(academyIndex, 1);
            // Store success message in session
            req.session.data['academy-removed'] = academyName;
            // Redirect to GET handler
            return res.redirect('selected-academies');
        }

        res.redirect('selected-academies');
    });

    // GET handler for selected-academies page
    router.get('/' + version + '/selected-academies', function (req, res) {
        // Check if we have a success message
        const removedAcademy = req.session.data['academy-removed'];
        // Clear it from session immediately
        delete req.session.data['academy-removed'];
        
        res.render(version + '/selected-academies', {
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
        // Generate a unique reference number (in a real app, this would be more sophisticated)
        const refNumber = 'HDJ' + Math.floor(1000 + Math.random() * 9000) + 'F';
        
        // Create application details
        const applicationDetails = {
            refNumber: refNumber,
            dateSubmitted: new Date().toLocaleDateString('en-GB'),
            status: 'In progress',
            academies: req.session.data['selected-academies'] || [],
            trustDetails: req.session.data['new-trust'] === 'yes' 
                ? { type: 'New trust', name: req.session.data['proposed-trust-name'] }
                : { type: 'Existing trust', details: req.session.data.selectedTrust }
        };

        // Initialize applications array if it doesn't exist
        if (!req.session.data['applications']) {
            req.session.data['applications'] = [];
        }

        // Add the new application
        req.session.data['applications'].unshift(applicationDetails);
        
        res.render(version + '/application-complete', {
            refNumber: refNumber
        });
    });

    // Handle finance trust page
    router.post('/' + version + '/create-new-project-stage-3-finance-how-to-finance-trust-handler', function (req, res) {
        const fromCheckAnswers = req.session.data['from-check-answers'];
        
        // Store the answer
        req.session.data['how-to-finance-trust'] = req.body['how-to-finance-trust'];
        
        // If user came from check answers, go back there
        if (req.session.data['from-check-answers'] == 'true') {
            return res.redirect('check-your-answers');
        }
        
        // Otherwise continue with normal flow
        res.redirect('create-new-project-stage-3-finance-approach');
    });

    // Handle finance approach page
    router.post('/' + version + '/create-new-project-stage-3-finance-how-to-finance-approach-handler', function (req, res) {
        const fromCheckAnswers = req.session.data['from-check-answers'];
        
        // Store the answer
        req.session.data['how-to-finance-approach'] = req.body['how-to-finance-approach'];
        
        // If user came from check answers, go back there
        if (req.session.data['from-check-answers'] == 'true') {
            return res.redirect('check-your-answers');
        }
        
        // Otherwise continue with normal flow
        res.redirect('create-new-project-stage-3-finance-steps');
    });
}

