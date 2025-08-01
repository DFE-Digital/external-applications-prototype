// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")
const data = require('../data/data-alpha-sprint-18');

module.exports = function (router) {

    var version = "alpha-sprint-18";

    versionMiddleware(router, version);

    // Add file upload middleware for governance structure
    router.use('/' + version + '/governance-structure-model-handler', (req, res, next) => {
        // For this prototype, we'll simulate file upload handling
        // In a real application, you would use multer or similar middleware
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            // Simulate file upload processing
            req.files = {
                'governance-structure-file': {
                    name: 'governance-structure-document.pdf',
                    size: 1024000, // 1MB
                    mimetype: 'application/pdf'
                }
            };
        }
        next();
    });


    // Handle academy search results page
    router.get('/' + version + '/academies-to-transfer-search-results', function (req, res) {
        const radioItems = data.academies.map(academy => ({
            value: academy.name + "|||" + academy.urn + "|||" + academy.postcode + "|||" + academy.academyTrust,
            text: academy.name,
            hint: {
                html: `URN: ${academy.urn} | Postcode: ${academy.postcode}<br>Trust: ${academy.academyTrust}`
            }
        }));

        res.render(version + '/academies-to-transfer-search-results', {
            radioItems: radioItems
        });
    });

    // Handle academy selection
    router.post('/' + version + '/academies-to-transfer-confirmation', function (req, res) {
        // Store the selected academy in session
        const selectedAcademy = req.body['selected-academy'];
        const [name, urn, postcode, academyTrust] = selectedAcademy.split('|||');
        
        // Find the full academy details from the data file
        const academy = data.academies.find(a => a.urn === urn);
        
        // Store the full academy details in session
        req.session.data['selected-academy'] = selectedAcademy;
        req.session.data['selected-academy-details'] = academy;
        
        res.render(version + '/academies-to-transfer-confirmation', {
            data: req.session.data,
            academy: academy
        });
    });

    // Handle academy confirmation
    router.post('/' + version + '/add-more-academies-handler', function (req, res) {
        const confirmAcademy = req.session.data['confirm-academy'];
        
        if (confirmAcademy === 'yes') {
            // Get the selected academy details
            const selectedAcademy = req.session.data['selected-academy'];
            const [name, urn, postcode, academyTrust] = selectedAcademy.split('|||');

            // Initialize academies-to-transfer array if it doesn't exist
            if (!req.session.data['academies-to-transfer']) {
                req.session.data['academies-to-transfer'] = [];
            }

            // Add the new academy to the list
            req.session.data['academies-to-transfer'].push({
                name: name,
                urn: urn,
                postcode: postcode,
                academyTrust: academyTrust
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
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.academies) {
            const owners = Array.isArray(req.session.data.taskOwners.academies) 
                ? req.session.data.taskOwners.academies 
                : [req.session.data.taskOwners.academies];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/academies-to-transfer-summary', {
            success: !!removedAcademy,
            removedAcademy: removedAcademy,
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay
        });
    });

    router.get('/' + version + '/s-p', function (req, res) {
        var school = req.session.data['school-list'].find(x => x.schoolID == req.query.id)
        req.session.data.currentSchool = school;
        res.redirect('school-portal-single');
    })

    // Handle application submission
    router.post('/' + version + '/application-complete', function (req, res) {
        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        if (application) {
            // Update the application status in both data file and session
            application.status = "Submitted";
            application.dateSubmitted = new Date().toLocaleDateString('en-GB');
            
            // Update the application details
            application.academies = req.session.data['academies-to-transfer'] || [];
            application.trustDetails = req.session.data['new-trust'] === 'yes' 
                ? { type: 'New trust', name: req.session.data['proposed-trust-name'] }
                : { type: 'Existing trust', details: req.session.data.selectedTrust };
            
            // Update the application in session data
            if (req.session.data['applications']) {
                const sessionApp = req.session.data['applications'].find(app => app.reference === ref);
                if (sessionApp) {
                    sessionApp.status = "Submitted";
                    sessionApp.dateSubmitted = application.dateSubmitted;
                    sessionApp.academies = application.academies;
                    sessionApp.trustDetails = application.trustDetails;
                }
            }

            // Update the main application object in session
            req.session.data.application.status = "Submitted";
            req.session.data.application.dateSubmitted = application.dateSubmitted;
        }
        
        res.render(version + '/application-complete', {
            refNumber: ref
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
        // Find the application in session or data file
        let application = null;
        if (req.session.data['applications']) {
            application = req.session.data['applications'].find(app => app.reference === '240315-ABC34');
        }
        // If not in session, check data file only if there's an active application session
        if (!application && req.session.data.application && req.session.data.application.reference === '240315-ABC34') {
            application = data.applications.find(app => app.reference === '240315-ABC34');
        }
        
        // Initialize taskOwners in session if it doesn't exist
        if (!req.session.data.taskOwners) {
            req.session.data.taskOwners = application.taskOwners || {};
        }
        
        res.render(version + '/application-task-list', {
            data: req.session.data,
            application: application
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
    

    // GET handler for dashboard
    router.get('/' + version + '/dashboard', function (req, res) {
        // Find the new application if it exists in session or data file
        let newApplication = null;
        if (req.session.data['applications']) {
            newApplication = req.session.data['applications'].find(app => app.reference === '240315-ABC34');
        }
        // If not in session, check data file only if there's an active application session
        if (!newApplication && req.session.data.application && req.session.data.application.reference === '240315-ABC34') {
            newApplication = data.applications.find(app => app.reference === '240315-ABC34');
        }
        
        // Find the contributor application
        let contributorApplication = null;
        if (req.session.data['applications']) {
            contributorApplication = req.session.data['applications'].find(app => app.reference === '240315-XYZ45');
        }
        // If not in session, check data file
        if (!contributorApplication) {
            contributorApplication = data.applications.find(app => app.reference === '240315-XYZ45');
        }
        
        res.render(version + '/dashboard', {
            data: req.session.data,
            newApplication: newApplication,
            contributorApplication: contributorApplication
        });
    });

    // POST handler for new application creation
    router.post('/' + version + '/application-task-list', function (req, res) {
        const ref = req.query.ref;
        const application = data.applications.find(app => app.reference === ref);
        
        if (application) {
            // Reset the application status in data file
            application.status = "Not submitted yet";
            delete application.dateSubmitted;
            
            // Set new-application-started flag
            req.session.data['new-application-started'] = true;
            
            // Initialize application data with reset status
            req.session.data.application = {
                reference: application.reference,
                leadApplicant: application.leadApplicant,
                contributors: application.contributors || []
            };
            
            // Initialize task owners
            req.session.data.taskOwners = application.taskOwners || {};
            
            // Initialize contributors
            req.session.data['contributors'] = application.contributors || [];
            
            // Initialize status flags
            req.session.data['academies-to-transfer-status'] = application['academies-to-transfer-status'] || false;
            req.session.data['incoming-trust-status'] = application['incoming-trust-status'] || false;
            req.session.data['finance-status'] = application['finance-status'] || false;
            
            // Initialize applications array in session if it doesn't exist
            if (!req.session.data['applications']) {
                req.session.data['applications'] = [];
            }
            
            // Add the application to session applications immediately
            req.session.data['applications'].push({
                ...application,
                status: "Not submitted yet"
            });
        }
        
        // Redirect based on whether this is a new application or a form submission
        if (req.session.data['new-application-started']) {
            res.redirect('contributors-home');
        } else {
            res.redirect('application-task-list?ref=' + ref);
        }
    });

    // GET handler for contributors-home
    router.get('/' + version + '/contributors-home', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        if (application) {
            // Only initialize contributors from data file if they don't exist in session
            if (!req.session.data['contributors']) {
                req.session.data['contributors'] = [...(application.contributors || [])];
            }
            
            // Update application reference and lead applicant in session
            req.session.data.application = {
                reference: application.reference,
                leadApplicant: application.leadApplicant,
                contributors: req.session.data['contributors']
            };
            
            // Initialize applications array in session if it doesn't exist
            if (!req.session.data['applications']) {
                req.session.data['applications'] = [];
            }
            
            // Add application to session applications if it doesn't exist
            const sessionApp = req.session.data['applications'].find(app => app.reference === ref);
            if (!sessionApp) {
                req.session.data['applications'].push({
                    ...application,
                    status: "Not submitted yet"
                });
            }
        }
        
        res.render(version + '/contributors-home', {
            data: req.session.data
        });
    });

    // GET handler for contributor invite page
    router.get('/' + version + '/contributor-invite', function (req, res) {
        res.render(version + '/contributor-invite', {
            data: req.session.data
        });
    });

    // POST handler for contributor invite form
    router.post('/' + version + '/contributor-invite-handler', function (req, res) {
        const email = req.body['contributor-email'];
        const ref = req.session.data.application.reference;
        
        // Find the application in the data file
        const application = data.applications.find(app => app.reference === ref);
        
        if (application) {
            // Initialize contributors array in session if it doesn't exist
            if (!req.session.data['contributors']) {
                // Start with the pre-existing contributors from the data file
                req.session.data['contributors'] = [...(application.contributors || [])];
            }
            
            // Add the new contributor to session data only
            const newContributor = {
                email: email,
                name: email.split('@')[0].replace('.', ' ').replace(/([A-Z])/g, ' $1').trim() // Generate name from email
            };
            req.session.data['contributors'].push(newContributor);
            
            // Update the application data in session
            req.session.data.application = {
                reference: application.reference,
                contributors: req.session.data['contributors']
            };
        }
        
        // Redirect back to contributors home
        res.redirect('contributors-home');
    });

    // GET handler for trustee summary
    router.get('/' + version + '/trustee-summary', function (req, res) {
        res.render(version + '/trustee-summary', {
            data: req.session.data
        });
    });

    // GET handler for member add
    router.get('/' + version + '/member-add', function (req, res) {
        res.render(version + '/member-add', {
            data: req.session.data
        });
    });

    // GET handler for academies to transfer summary
    router.get('/' + version + '/academies-to-transfer-summary', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);

        // If the application has pre-populated academies in the data file, look up their full details
        if (application && application['academies-to-transfer']) {
            req.session.data['academies-to-transfer'] = application['academies-to-transfer'].map(urn => {
                const academy = data.academies.find(a => a.urn === urn);
                return academy || { urn }; // Return full academy details if found, or just URN if not found
            });
        }
        
        res.render(version + '/academies-to-transfer-summary', {
            data: req.session.data
        });
    });

    // GET handler for incoming trust summary
    router.get('/' + version + '/incoming-trust-summary', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        res.render(version + '/incoming-trust-summary', {
            data: req.session.data
        });
    });

    // GET handler for finance summary
    router.get('/' + version + '/finance-summary', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        res.render(version + '/finance-summary', {
            data: req.session.data
        });
    });

    // GET handler for risks summary
    router.get('/' + version + '/risks-summary', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        res.render(version + '/risks-summary', {
            data: req.session.data
        });
    });

    // POST handler for risks summary
    // GET handler for trustee summary
    router.get('/' + version + '/trustee-summary', function (req, res) {
        res.render(version + '/trustee-summary', {
            data: req.session.data
        });
    });

    // GET handler for member-add - clear previous member data
    router.get('/' + version + '/member-add', function (req, res) {
        // Clear all member-related session data to prevent showing previous member's information
        delete req.session.data['member-full-name'];
        delete req.session.data['member-current-responsibilities'];
        delete req.session.data['member-future-role'];
        delete req.session.data['member-confirmed'];
        res.render(version + '/member-add');
    });

    // Handle members summary form submission
    router.post('/' + version + '/members-summary', function (req, res) {
        // Handle completion status
        if (req.body['members-status'] !== undefined) {
            req.session.data['members-status'] = req.body['members-status'] === 'Complete';
        }

        // Handle member deletion
        if (req.body['delete-member'] !== undefined) {
            const memberIndex = parseInt(req.body['delete-member']);
            if (req.session.data['members-to-add'] && req.session.data['members-to-add'][memberIndex]) {
                req.session.data['members-to-add'].splice(memberIndex, 1);
            }
        }

        // Handle member to remove deletion
        if (req.body['delete-member-to-remove'] !== undefined) {
            const memberIndex = parseInt(req.body['delete-member-to-remove']);
            if (req.session.data['members-to-remove'] && req.session.data['members-to-remove'][memberIndex]) {
                req.session.data['members-to-remove'].splice(memberIndex, 1);
            }
        }

        // Handle member to remove add form submission
        if (req.body['member-to-remove-full-name'] !== undefined) {
            const fullName = req.body['member-to-remove-full-name'];

            // Initialize members-to-remove array if it doesn't exist
            if (!req.session.data['members-to-remove']) {
                req.session.data['members-to-remove'] = [];
            }

            // Add the member to the array
            req.session.data['members-to-remove'].push({
                name: fullName
            });
        }

        // Handle member future role and save complete member data
        if (req.body['member-future-role'] !== undefined) {
            const futureRole = req.body['member-future-role'];
            const fullName = req.session.data['member-full-name'];

            // Find the member in the array and update their data
            if (req.session.data['members-to-add']) {
                const memberIndex = req.session.data['members-to-add'].findIndex(m => m.name === fullName);
                if (memberIndex !== -1) {
                    req.session.data['members-to-add'][memberIndex].currentResponsibilities = req.session.data['member-current-responsibilities'];
                    req.session.data['members-to-add'][memberIndex].futureRole = futureRole;
                }
            }

            // Clear temporary session data
            delete req.session.data['member-full-name'];
            delete req.session.data['member-current-responsibilities'];
            delete req.session.data['member-future-role'];
        }

        // Redirect based on the action
        if (req.body['members-status'] !== undefined) {
            res.redirect('application-task-list');
        } else {
            res.redirect('members-summary');
        }
    });

    // Handle member add form
    router.post('/' + version + '/member-confirmation', function (req, res) {
        const fullName = req.body['member-full-name'];

        res.render(version + '/member-confirmation', {
            'member-full-name': fullName,
            'member-name': fullName
        });
    });

    // Handle member confirmation and save member
    router.post('/' + version + '/member-current-responsibilities', function (req, res) {
        const confirmed = req.body['member-confirmed'];
        
        if (confirmed === 'Yes') {
            const fullName = req.session.data['member-full-name'];

            // Initialize members-to-add array if it doesn't exist
            if (!req.session.data['members-to-add']) {
                req.session.data['members-to-add'] = [];
            }

            // Add the member to the array with confirmation status
            req.session.data['members-to-add'].push({
                name: fullName,
                isExistingMember: true
            });
            
            res.render(version + '/member-current-responsibilities');
        } else if (confirmed === 'No') {
            // If user selects "No", still continue to current responsibilities
            // This means they're adding a new member, not an existing one
            const fullName = req.session.data['member-full-name'];

            // Initialize members-to-add array if it doesn't exist
            if (!req.session.data['members-to-add']) {
                req.session.data['members-to-add'] = [];
            }

            // Add the member to the array with confirmation status
            req.session.data['members-to-add'].push({
                name: fullName,
                isExistingMember: false
            });
            
            res.render(version + '/member-current-responsibilities');
        } else {
            // Default fallback
            res.redirect('members-summary');
        }
    });

    // Handle member future role
    router.post('/' + version + '/member-future-role', function (req, res) {
        const currentResponsibilities = req.body['member-current-responsibilities'];
        
        // Save to session for the current member being added
        req.session.data['member-current-responsibilities'] = currentResponsibilities;

        res.render(version + '/member-future-role');
    });

    // Handle member deletion confirmation
    router.get('/' + version + '/confirm-delete-member', function (req, res) {
        const memberIndex = parseInt(req.query.index);
        req.session.data['delete-member-index'] = memberIndex;

        res.render(version + '/confirm-delete-member', {
            index: memberIndex
        });
    });

    // Handle member to remove deletion confirmation
    router.get('/' + version + '/confirm-delete-member-to-remove', function (req, res) {
        const memberIndex = parseInt(req.query.index);
        req.session.data['delete-member-to-remove-index'] = memberIndex;

        res.render(version + '/confirm-delete-member-to-remove', {
            index: memberIndex
        });
    });

    // GET handler for trustee summary
    router.get('/' + version + '/trustee-summary', function (req, res) {
        res.render(version + '/trustee-summary', {
            data: req.session.data
        });
    });

    // GET handler for trustee-add - clear previous trustee data
    router.get('/' + version + '/trustee-add', function (req, res) {
        // Clear all trustee-related session data to prevent showing previous trustee's information
        delete req.session.data['trustee-full-name'];
        delete req.session.data['trustee-current-responsibilities'];
        delete req.session.data['trustee-future-role'];
        delete req.session.data['trustee-confirmed'];
        res.render(version + '/trustee-add', {
            data: req.session.data
        });
    });

    // Handle trustees summary form submission
    router.post('/' + version + '/trustee-summary', function (req, res) {
        // Handle completion status
        if (req.body['trustee-status'] !== undefined) {
            req.session.data['trustee-status'] = req.body['trustee-status'] === 'Complete';
        }

        // Handle trustee deletion
        if (req.body['delete-trustee'] !== undefined) {
            const trusteeIndex = parseInt(req.body['delete-trustee']);
            if (req.session.data['trustees-to-add'] && req.session.data['trustees-to-add'][trusteeIndex]) {
                req.session.data['trustees-to-add'].splice(trusteeIndex, 1);
            }
        }

        // Handle trustee to remove deletion
        if (req.body['delete-trustee-to-remove'] !== undefined) {
            const trusteeIndex = parseInt(req.body['delete-trustee-to-remove']);
            if (req.session.data['trustees-to-remove'] && req.session.data['trustees-to-remove'][trusteeIndex]) {
                req.session.data['trustees-to-remove'].splice(trusteeIndex, 1);
            }
        }

        // Handle trustee to remove add form submission
        if (req.body['trustee-to-remove-full-name'] !== undefined) {
            const fullName = req.body['trustee-to-remove-full-name'];

            // Initialize trustees-to-remove array if it doesn't exist
            if (!req.session.data['trustees-to-remove']) {
                req.session.data['trustees-to-remove'] = [];
            }

            // Add the trustee to the array
            req.session.data['trustees-to-remove'].push({
                name: fullName
            });
        }

        // Handle trustee future role and save complete trustee data
        if (req.body['trustee-future-role'] !== undefined) {
            const futureRole = req.body['trustee-future-role'];
            const fullName = req.session.data['trustee-full-name'];

            // Find the trustee in the array and update their data
            if (req.session.data['trustees-to-add']) {
                const trusteeIndex = req.session.data['trustees-to-add'].findIndex(t => t.name === fullName);
                if (trusteeIndex !== -1) {
                    req.session.data['trustees-to-add'][trusteeIndex].currentResponsibilities = req.session.data['trustee-current-responsibilities'];
                    req.session.data['trustees-to-add'][trusteeIndex].futureRole = futureRole;
                }
            }

            // Clear temporary session data
            delete req.session.data['trustee-full-name'];
            delete req.session.data['trustee-current-responsibilities'];
            delete req.session.data['trustee-future-role'];
        }

        // Handle trustee local governing body and save complete trustee data
        if (req.body['trustee-local-governing-body'] !== undefined) {
            const localGoverningBody = req.body['trustee-local-governing-body'];
            const fullName = req.session.data['trustee-full-name'];

            // Find the trustee in the array and update their data
            if (req.session.data['trustees-to-add']) {
                const trusteeIndex = req.session.data['trustees-to-add'].findIndex(t => t.name === fullName);
                if (trusteeIndex !== -1) {
                    req.session.data['trustees-to-add'][trusteeIndex].currentResponsibilities = req.session.data['trustee-current-responsibilities'];
                    req.session.data['trustees-to-add'][trusteeIndex].futureRole = req.session.data['trustee-future-role'];
                    req.session.data['trustees-to-add'][trusteeIndex].localGoverningBody = localGoverningBody;
                }
            }

            // Clear temporary session data
            delete req.session.data['trustee-full-name'];
            delete req.session.data['trustee-current-responsibilities'];
            delete req.session.data['trustee-future-role'];
            delete req.session.data['trustee-local-governing-body'];
        }

        // Redirect based on the action
        if (req.body['trustee-status'] !== undefined) {
            res.redirect('application-task-list');
        } else {
            res.redirect('trustee-summary');
        }
    });

    // Handle trustee add form
    router.post('/' + version + '/trustee-confirmation', function (req, res) {
        const fullName = req.body['trustee-full-name'];
        req.session.data['trustee-full-name'] = fullName;

        res.render(version + '/trustee-confirmation', {
            data: req.session.data
        });
    });

    // Handle trustee confirmation and save trustee
    router.post('/' + version + '/trustee-current-responsibilities', function (req, res) {
        const confirmed = req.body['trustee-confirmed'];
        
        if (confirmed === 'Yes') {
            const fullName = req.session.data['trustee-full-name'];

            // Initialize trustees-to-add array if it doesn't exist
            if (!req.session.data['trustees-to-add']) {
                req.session.data['trustees-to-add'] = [];
            }

            // Add the trustee to the array with confirmation status
            req.session.data['trustees-to-add'].push({
                name: fullName,
                isExistingTrustee: true
            });
            
            res.render(version + '/trustee-current-responsibilities', {
                data: req.session.data
            });
        } else if (confirmed === 'No') {
            // If user selects "No", still continue to current responsibilities
            // This means they're adding a new trustee, not an existing one
            const fullName = req.session.data['trustee-full-name'];

            // Initialize trustees-to-add array if it doesn't exist
            if (!req.session.data['trustees-to-add']) {
                req.session.data['trustees-to-add'] = [];
            }

            // Add the trustee to the array with confirmation status
            req.session.data['trustees-to-add'].push({
                name: fullName,
                isExistingTrustee: false
            });
            
            res.render(version + '/trustee-current-responsibilities', {
                data: req.session.data
            });
        } else {
            // Default fallback
            res.redirect('trustee-summary');
        }
    });

    // Handle trustee future role
    router.post('/' + version + '/trustee-future-role', function (req, res) {
        const currentResponsibilities = req.body['trustee-current-responsibilities'];
        
        // Save to session for the current trustee being added
        req.session.data['trustee-current-responsibilities'] = currentResponsibilities;

        res.render(version + '/trustee-future-role', {
            data: req.session.data
        });
    });

    // Handle trustee local governing body question
    router.post('/' + version + '/trustee-local-governing-body', function (req, res) {
        const futureRole = req.body['trustee-future-role'];
        const localGoverningBody = req.body['trustee-local-governing-body'];
        
        // Save to session for the current trustee being added
        req.session.data['trustee-future-role'] = futureRole;
        req.session.data['trustee-local-governing-body'] = localGoverningBody;

        res.render(version + '/trustee-local-governing-body', {
            data: req.session.data
        });
    });

    // Handle trustee deletion confirmation
    router.get('/' + version + '/confirm-delete-trustee', function (req, res) {
        const trusteeIndex = parseInt(req.query.index);
        req.session.data['delete-trustee-index'] = trusteeIndex;

        res.render(version + '/confirm-delete-trustee', {
            index: trusteeIndex
        });
    });

    // Handle trustee to remove deletion confirmation
    router.get('/' + version + '/confirm-delete-trustee-to-remove', function (req, res) {
        const trusteeIndex = parseInt(req.query.index);
        req.session.data['delete-trustee-to-remove-index'] = trusteeIndex;

        res.render(version + '/confirm-delete-trustee-to-remove', {
            index: trusteeIndex
        });
    });

}