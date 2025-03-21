// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")

module.exports = function (router) {

    var version = "alpha-sprint-8";

    versionMiddleware(router, version);

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
        
        // Always go to summary1 first
        return res.redirect('summary1');
    });

    // Handle summary1 confirmation
    router.post('/' + version + '/summary1-handler', function (req, res) {
        const fromCheckAnswers = req.session.data['from-check-answers'];
        
        // Check if any academies are selected
        if (!req.session.data['selected-academies'] || req.session.data['selected-academies'].length === 0) {
            // Render summary1 with error
            return res.render(version + '/summary1', {
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
            res.redirect('check-your-answers');
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
        
        if (confirmTrust === 'yes') {
            res.redirect('check-your-answers');
        } else {
            res.redirect('incoming-trust-search');
        }
    });

    // Handle proposed trust name submission
    router.post('/' + version + '/proposed-trust-name-handler', function (req, res) {
        res.redirect('check-your-answers');
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
            // Remove the academy at the specified index
            req.session.data['selected-academies'].splice(academyIndex, 1);
        }

        res.redirect('summary1');
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

}

