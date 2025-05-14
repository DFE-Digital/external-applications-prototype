// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")
const data = require('../data/data-alpha-sprint-12');

module.exports = function (router) {

    var version = "alpha-sprint-12";

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
        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        if (application) {
            // Update the application status
            application.status = "Submitted";
            application.dateSubmitted = new Date().toLocaleDateString('en-GB');
            
            // Update the application details
            application.academies = req.session.data['academies-to-transfer'] || [];
            application.trustDetails = req.session.data['new-trust'] === 'yes' 
                ? { type: 'New trust', name: req.session.data['proposed-trust-name'] }
                : { type: 'Existing trust', details: req.session.data.selectedTrust };
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
        
        if (application) {
            // Store the current application data in session
            req.session.data.application = {
                reference: application.reference,
                leadApplicant: application.leadApplicant,
                contributors: application.contributors || []
            };
            req.session.data.taskOwners = application.taskOwners || {};
            req.session.data['contributors'] = application.contributors || [];
            req.session.data['academies-to-transfer-status'] = application['academies-to-transfer-status'] || false;
            req.session.data['incoming-trust-status'] = application['incoming-trust-status'] || false;
            req.session.data['finance-status'] = application['finance-status'] || false;
        }
        
        // Process task owners for each task
        const processTaskOwnerDisplay = (taskKey) => {
            // Map task keys to their corresponding task owner fields
            const taskOwnerMap = {
                'academies-to-transfer': 'academies',
                'incoming-trust': 'incomingTrust',
                'finance': 'finance'
            };
            
            const taskOwnerField = taskOwnerMap[taskKey];
            const taskOwners = application?.taskOwners?.[taskOwnerField];
            
            if (!taskOwners) {
                return 'Not assigned yet';
            }
            
            const owners = Array.isArray(taskOwners) ? taskOwners : [taskOwners];
            if (owners.length === 0 || owners.includes('_unchecked')) {
                return 'Not assigned yet';
            }
            
            const ownerNames = owners.map(owner => {
                const contributor = application.contributors.find(c => c.email === owner);
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
    
    // Handle starting a new application
    /*
    router.post('/' + version + '/start-new-application', function (req, res) {
        // Generate a new application reference
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        const refNumber = `${year}${month}${day}-${random}`;
        
        // Create application record with empty task owners
        const application = {
            refNumber: refNumber,
            dateStarted: now.toLocaleDateString('en-GB'),
            status: 'Not submitted',
            leadApplicant: 'Zara Laney',
            taskOwners: {
                academies: [],
                incomingTrust: [],
                finance: []
            },
            contributors: [
                {
                    name: "Zara Laney",
                    email: "zara.laney@education.gov.uk"
                }
            ]
        };

        // Initialize applications array if it doesn't exist
        if (!req.session.data['applications']) {
            req.session.data['applications'] = [];
        }

        // Add the new application
        req.session.data['applications'].unshift(application);
        
        // Store the current application data
        req.session.data['application-reference'] = refNumber;
        req.session.data['taskOwners'] = application.taskOwners;
        req.session.data['contributors'] = application.contributors;
        
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
    */

    // GET handler for dashboard
    router.get('/' + version + '/dashboard', function (req, res) {
        // Load applications data into session
        req.session.data['applications'] = data.applications;
        
        // Find the new application if new-application-started is true
        let newApplication = null;
        if (req.session.data['new-application-started']) {
            newApplication = data.applications.find(app => app.reference === '240315-ABC34');
        }
        
        res.render(version + '/dashboard', {
            data: req.session.data,
            newApplication: newApplication
        });
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
            // Update session data to match the data file
            req.session.data.application = {
                reference: application.reference,
                contributors: application.contributors || []
            };
            req.session.data['contributors'] = application.contributors || [];
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
            // Initialize contributors array if it doesn't exist
            if (!application.contributors) {
                application.contributors = [];
            }
            
            // Add the new contributor
            const newContributor = {
                email: email,
                name: email.split('@')[0].replace('.', ' ').replace(/([A-Z])/g, ' $1').trim() // Generate name from email
            };
            application.contributors.push(newContributor);
            
            // Update the session data to match the data file
            req.session.data.application = {
                reference: application.reference,
                contributors: application.contributors
            };
            req.session.data['contributors'] = application.contributors;
        }
        
        // Redirect back to contributors home
        res.redirect('contributors-home');
    });

    // Handle task owner update
    router.post('/' + version + '/task-owner-update-handler', function (req, res) {
        const task = req.query.task;
        const selectedOwners = req.body['task-owner'];
        const ref = req.session.data.application.reference;
        
        // Find the application in the data file
        const application = data.applications.find(app => app.reference === ref);
        
        if (application) {
            // Initialize taskOwners if it doesn't exist
            if (!application.taskOwners) {
                application.taskOwners = {};
            }
            
            // Store the selected owners as an array, filtering out any undefined or null values
            if (selectedOwners) {
                application.taskOwners[task] = Array.isArray(selectedOwners) 
                    ? selectedOwners.filter(owner => owner && owner !== '_unchecked')
                    : [selectedOwners];
            } else {
                application.taskOwners[task] = [];
            }
            
            // Update session data to match the data file
            req.session.data.taskOwners = application.taskOwners;
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
            default:
                redirectUrl = 'application-task-list?ref=' + ref;
        }
        
        res.redirect('/' + version + '/' + redirectUrl);
    });

    // GET handler for task owner update page
    router.get('/' + version + '/task-owner-update', function (req, res) {
        const task = req.query.task;
        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Update session data with application data from data file
        if (application) {
            req.session.data.application = {
                reference: application.reference,
                contributors: application.contributors || []
            };
            req.session.data.taskOwners = application.taskOwners || {};
            req.session.data['contributors'] = application.contributors || [];
        }
        
        // Get current task owners' emails
        let currentTaskOwnerEmails = [];
        if (application && application.taskOwners && application.taskOwners[task]) {
            currentTaskOwnerEmails = Array.isArray(application.taskOwners[task]) 
                ? application.taskOwners[task] 
                : [application.taskOwners[task]];
        }
        
        // Prepare checkbox items from contributors
        const checkboxItems = [];
        if (application && application.contributors) {
            checkboxItems.push(...application.contributors.map(contributor => ({
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
            application?.taskOwners?.[task],
            application?.contributors || []
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
        if (!taskOwners) return 'Not assigned yet';
        
        const owners = Array.isArray(taskOwners) ? taskOwners : [taskOwners];
        if (owners.length === 0) return 'Not assigned yet';
        
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
        let taskOwnerDisplay = 'Not assigned yet';
        if (application?.taskOwners?.academies) {
            const owners = Array.isArray(application.taskOwners.academies) 
                ? application.taskOwners.academies 
                : [application.taskOwners.academies];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = application.contributors.find(c => c.email === owner);
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
        let taskOwnerDisplay = 'Not assigned yet';
        if (application?.taskOwners?.incomingTrust) {
            const owners = Array.isArray(application.taskOwners.incomingTrust) 
                ? application.taskOwners.incomingTrust 
                : [application.taskOwners.incomingTrust];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = application.contributors.find(c => c.email === owner);
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
        let taskOwnerDisplay = 'Not assigned yet';
        if (application?.taskOwners?.finance) {
            const owners = Array.isArray(application.taskOwners.finance) 
                ? application.taskOwners.finance 
                : [application.taskOwners.finance];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = application.contributors.find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/finance-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay
        });
    });
}

