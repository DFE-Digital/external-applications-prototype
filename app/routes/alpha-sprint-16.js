// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")
const data = require('../data/data-alpha-sprint-16');

module.exports = function (router) {

    var version = "alpha-sprint-16";

    versionMiddleware(router, version);


    // Handle academy search results page
    router.get('/' + version + '/academies-to-transfer-search-results', function (req, res) {
        const radioItems = data.academies.map(academy => ({
            value: academy.name + "|||" + academy.urn + "|||" + academy.postcode,
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
        const selectedAcademy = req.body['selected-academy'];
        const [name, urn] = selectedAcademy.split('|||');
        
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
        const ref = req.query.ref;
        const application = data.applications.find(app => app.reference === ref);
        
        // Reset new-application-started flag when users arrive at application task list
        // This indicates they have left the upfront question (contributors-home)
        if (req.session.data['new-application-started']) {
            req.session.data['new-application-started'] = false;
        }
        
        if (application) {
            // Only initialize application data if it doesn't exist in session
            if (!req.session.data.application) {
            req.session.data.application = {
                reference: application.reference,
                leadApplicant: application.leadApplicant,
                contributors: application.contributors || []
            };
            }
            
            // Only initialize task owners if they don't exist in session
            if (!req.session.data.taskOwners) {
            req.session.data.taskOwners = application.taskOwners || {};
            }
            
            // Only initialize contributors if they don't exist in session
            if (!req.session.data['contributors']) {
            req.session.data['contributors'] = application.contributors || [];
            }
            
            // Only initialize status flags if they don't exist in session
            if (req.session.data['academies-to-transfer-status'] === undefined) {
            req.session.data['academies-to-transfer-status'] = application['academies-to-transfer-status'] || false;
            }
            if (req.session.data['incoming-trust-status'] === undefined) {
            req.session.data['incoming-trust-status'] = application['incoming-trust-status'] || false;
            }
            if (req.session.data['finance-status'] === undefined) {
            req.session.data['finance-status'] = application['finance-status'] || false;
            }
        }
        
        // Process task owners for each task
        const processTaskOwnerDisplay = (taskKey) => {
            // Map task keys to their corresponding task owner fields
            const taskOwnerMap = {
                'academies-to-transfer': 'academies',
                'incoming-trust': 'incomingTrust',
                'finance': 'finance',
                'declaration': 'declaration'
            };
            
            const taskOwnerField = taskOwnerMap[taskKey];
            const taskOwners = req.session.data.taskOwners?.[taskOwnerField];
            
            if (!taskOwners) {
                return 'Task owner: not assigned';
            }
            
            const owners = Array.isArray(taskOwners) ? taskOwners : [taskOwners];
            if (owners.length === 0 || owners.includes('_unchecked')) {
                return 'Task owner: not assigned';
            }
            
            const ownerNames = owners.map(owner => {
                const contributor = req.session.data['contributors'].find(c => c.email === owner);
                return contributor ? contributor.name : owner;
            });
            
            return 'Assigned to: ' + ownerNames.join(', ');
        };
        
        res.render(version + '/application-task-list', {
            data: req.session.data,
            application: application,
            processTaskOwners: processTaskOwnerDisplay
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

    // Handle task owner update
    router.post('/' + version + '/task-owner-update-handler', function (req, res) {
        const task = req.query.task;
        const selectedOwners = req.body['task-owner'];
        
        // Initialize taskOwners in session if it doesn't exist
        if (!req.session.data.taskOwners) {
            req.session.data.taskOwners = {};
            }
            
            // Store the selected owners as an array, filtering out any undefined or null values
            if (selectedOwners) {
            req.session.data.taskOwners[task] = Array.isArray(selectedOwners) 
                    ? selectedOwners.filter(owner => owner && owner !== '_unchecked')
                    : [selectedOwners];
            } else {
            req.session.data.taskOwners[task] = [];
        }
        
        // Redirect to the appropriate summary page based on the task
        let redirectUrl;
        switch (task) {
            case 'academies':
                redirectUrl = 'academies-to-transfer-summary';
                break;
            case 'incomingTrust':
                redirectUrl = 'incoming-trust-summary';
                break;
            case 'finance':
                redirectUrl = 'finance-summary';
                break;
            case 'declaration':
                redirectUrl = 'declaration-summary';
                break;
            default:
                redirectUrl = 'application-task-list?ref=' + req.session.data.application.reference;
        }
        
        res.redirect('/' + version + '/' + redirectUrl);
    });

    // GET handler for task owner update page
    router.get('/' + version + '/task-owner-update', function (req, res) {
        const task = req.query.task;
        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Get current task owners' emails
        let currentTaskOwnerEmails = [];
        if (req.session.data.taskOwners && req.session.data.taskOwners[task]) {
            currentTaskOwnerEmails = Array.isArray(req.session.data.taskOwners[task]) 
                ? req.session.data.taskOwners[task] 
                : [req.session.data.taskOwners[task]];
        }
        
        // Prepare checkbox items from session contributors
        const checkboxItems = [];
        if (req.session.data['contributors']) {
            checkboxItems.push(...req.session.data['contributors'].map(contributor => ({
                value: contributor.email,
                text: contributor.name,
                hint: {
                    text: contributor.email
                },
                checked: currentTaskOwnerEmails.includes(contributor.email)
            })));
        }

        // Get current task owners' names for display
        const currentTaskOwners = processTaskOwners(
            req.session.data.taskOwners?.[task],
            req.session.data['contributors'] || []
        );
        
        res.render(version + '/task-owner-update', {
            data: req.session.data,
            task: task,
            checkboxItems: checkboxItems,
            currentTaskOwners: currentTaskOwners,
            currentTaskOwnerEmails: currentTaskOwnerEmails
        });
    });

    // Helper function to process task owners
    function processTaskOwners(taskOwners, contributors) {
        if (!taskOwners) return 'Task owner: not assigned';
        
        const owners = Array.isArray(taskOwners) ? taskOwners : [taskOwners];
        if (owners.length === 0) return 'Task owner: not assigned';
        
        return owners.map(owner => {
            const contributor = contributors.find(c => c.email === owner);
            return contributor ? contributor.name : owner;
        }).join(', ');
    }

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

        // If the application has pre-populated academies in the data file, look up their full details
        if (application && application['academies-to-transfer']) {
            req.session.data['academies-to-transfer'] = application['academies-to-transfer'].map(urn => {
                const academy = data.academies.find(a => a.urn === urn);
                return academy || { urn }; // Return full academy details if found, or just URN if not found
            });
        }
        
        res.render(version + '/academies-to-transfer-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay
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
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.incomingTrust) {
            const owners = Array.isArray(req.session.data.taskOwners.incomingTrust) 
                ? req.session.data.taskOwners.incomingTrust 
                : [req.session.data.taskOwners.incomingTrust];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/incoming-trust-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay
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
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.finance) {
            const owners = Array.isArray(req.session.data.taskOwners.finance) 
                ? req.session.data.taskOwners.finance 
                : [req.session.data.taskOwners.finance];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/finance-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay
        });
    });

    // GET handler for check your answers
    router.get('/' + version + '/check-your-answers', function (req, res) {
        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // If the application has pre-populated academies in the data file, look up their full details
        if (application && application['academies-to-transfer']) {
            req.session.data['academies-to-transfer'] = application['academies-to-transfer'].map(urn => {
                const academy = data.academies.find(a => a.urn === urn);
                return academy || { urn }; // Return full academy details if found, or just URN if not found
            });
        }
        
        res.render(version + '/check-your-answers', {
            data: req.session.data,
            application: application
        });
    });

    // Handle declaration trust search results selection
    router.post('/' + version + '/declaration-trust-confirmation', function (req, res) {
        // Get the selected trust value from the form data
        const selectedDeclarationTrustValue = req.body['selected-trust'];
        
        if (selectedDeclarationTrustValue) {
            try {
                // Parse the JSON string and store temporarily
                const selectedDeclarationTrust = JSON.parse(selectedDeclarationTrustValue);
                req.session.data['temp-selected-declaration-trust'] = selectedDeclarationTrustValue;
                req.session.data.tempSelectedDeclarationTrust = selectedDeclarationTrust;
                
                // Prepare the hint HTML in JavaScript to avoid Nunjucks parsing issues
                const hintHtml = selectedDeclarationTrust ? 
                    `<div class="govuk-inset-text">
                        <h2 class="govuk-heading-m">${selectedDeclarationTrust.name}</h2>
                        <p class="govuk-body">TRN: ${selectedDeclarationTrust.ref}</p>
                        <p class="govuk-body">UKPRN: ${selectedDeclarationTrust.companies}</p>
                    </div>` : '';
                
                // Render with the parsed trust data and prepared hint HTML
                res.render(version + '/declaration-trust-confirmation', {
                    selectedDeclarationTrust: selectedDeclarationTrust,
                    hintHtml: hintHtml
                });
            } catch (error) {
                console.error('Error parsing selected declaration trust:', error);
                res.render(version + '/declaration-trust-confirmation', {
                    selectedDeclarationTrust: null,
                    hintHtml: ''
                });
            }
        } else {
            res.render(version + '/declaration-trust-confirmation', {
                selectedDeclarationTrust: null,
                hintHtml: ''
            });
        }
    });

    // Handle declaration trust confirmation
    router.post('/' + version + '/declaration-trust-confirmation-handler', function (req, res) {
        const confirmTrust = req.body['confirm-trust'];
        
        if (confirmTrust === 'yes') {
            // Only save the trust selection permanently if user confirms with "Yes"
            req.session.data['selected-declaration-trust'] = req.session.data['temp-selected-declaration-trust'];
            req.session.data.selectedDeclarationTrust = req.session.data.tempSelectedDeclarationTrust;
            
            // Clear the temporary data
            delete req.session.data['temp-selected-declaration-trust'];
            delete req.session.data.tempSelectedDeclarationTrust;
            
            // Redirect to declaration form when user confirms
            res.redirect('declaration-form');
        } else {
            // Clear the temporary data
            delete req.session.data['temp-selected-declaration-trust'];
            delete req.session.data.tempSelectedDeclarationTrust;
            
            // Redirect to declaration summary when user says no
            res.redirect('declaration-summary');
        }
    });

    // Handle declaration form submission
    router.post('/' + version + '/declaration-form-handler', function (req, res) {
        // Initialize declarations array if it doesn't exist
        if (!req.session.data['declarations']) {
            req.session.data['declarations'] = [];
        }
        
        // Create declaration object with complete trust information
        const declarationData = {
            trust: {
                name: req.session.data.selectedDeclarationTrust?.name || '',
                ref: req.session.data.selectedDeclarationTrust?.ref || '',
                companies: req.session.data.selectedDeclarationTrust?.companies || ''
            },
            chairOfTrustees: req.body['declarationFormChairOfTrustees'] || '',
            dateOfDeclaration: {
                day: req.body['passport-issued-day'] || '',
                month: req.body['passport-issued-month'] || '',
                year: req.body['passport-issued-year'] || ''
            }
        };
        
        // Check if we're updating an existing declaration
        const declarationIndex = req.body['declaration-index'];
        if (declarationIndex !== undefined && req.session.data['declarations'][declarationIndex]) {
            // Update existing declaration
            req.session.data['declarations'][declarationIndex] = declarationData;
        } else {
            // Add new declaration to the array
            req.session.data['declarations'].push(declarationData);
        }
        
        // Redirect to declaration summary
        res.redirect('declaration-summary');
    });

    // GET handler for declaration form (for viewing existing declarations)
    router.get('/' + version + '/declaration-form', function (req, res) {
        const declarationIndex = req.query.index;
        let existingDeclaration = null;
        
        if (declarationIndex !== undefined && req.session.data['declarations'] && req.session.data['declarations'][declarationIndex]) {
            existingDeclaration = req.session.data['declarations'][declarationIndex];
        }
        
        res.render(version + '/declaration-form', {
            data: req.session.data,
            existingDeclaration: existingDeclaration,
            declarationIndex: declarationIndex
        });
    });

    // GET handler for declaration summary
    router.get('/' + version + '/declaration-summary', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Load contributors from application data if not already in session
        if (application && application.contributors && (!req.session.data['contributors'] || req.session.data['contributors'].length === 0)) {
            req.session.data['contributors'] = application.contributors;
        }
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.declaration) {
            const owners = Array.isArray(req.session.data.taskOwners.declaration) 
                ? req.session.data.taskOwners.declaration 
                : [req.session.data.taskOwners.declaration];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/declaration-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay
        });
    });

    // Handle declaration deletion
    router.post('/' + version + '/delete-declaration-handler', function (req, res) {
        const declarationIndex = req.body['declaration-index'];
        const confirmDelete = req.body['confirm-delete'];
        
        if (confirmDelete === 'yes' && declarationIndex !== undefined && req.session.data['declarations'] && req.session.data['declarations'][declarationIndex]) {
            // Remove the declaration at the specified index
            req.session.data['declarations'].splice(declarationIndex, 1);
        }
        
        // Redirect to declaration summary
        res.redirect('declaration-summary');
    });

    // GET handler for confirm delete declaration page
    router.get('/' + version + '/confirm-delete-declaration', function (req, res) {
        req.session.data['index'] = req.query.index;
        res.render(version + '/confirm-delete-declaration');
    });

}

