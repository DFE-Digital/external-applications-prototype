// Add your routes here - above the module.exports line
var versionMiddleware = require("./versionMiddleware")
const data = require('../data/data-alpha-sprint-19');

module.exports = function (router) {

    var version = "alpha-sprint-19";

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

    // Add file upload middleware for board resolution
    router.use('/' + version + '/outgoing-trusts-board-resolution-handler', (req, res, next) => {
        // For this prototype, we'll simulate file upload handling
        // In a real application, you would use multer or similar middleware
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            // Simulate file upload processing
            req.files = {
                'board-resolution-file': {
                    name: 'board-resolution-document.pdf',
                    size: 1024000, // 1MB
                    mimetype: 'application/pdf'
                }
            };
        }
        next();
    });

    // Add file upload middleware for consultation results
    router.use('/' + version + '/outgoing-trusts-consultation-results-handler', (req, res, next) => {
        // For this prototype, we'll simulate file upload handling
        // In a real application, you would use multer or similar middleware
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            // Simulate file upload processing
            req.files = {
                'consultation-results-file': {
                    name: 'consultation-results-document.pdf',
                    size: 1024000, // 1MB
                    mimetype: 'application/pdf'
                }
            };
        }
        next();
    });

    // Add file upload middleware for consent upload
    router.use('/' + version + '/upload-consent-handler', (req, res, next) => {
        // For this prototype, we'll simulate file upload handling
        // In a real application, you would use multer or similar middleware
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            // Simulate file upload processing
            req.files = {
                'consent-file': {
                    name: 'diocesan-consent-document.pdf',
                    size: 2048000, // 2MB
                    mimetype: 'application/pdf'
                }
            };
        }
        next();
    });

    // Add file upload middleware for consent upload (progressive enhancement)
    router.use('/' + version + '/upload-consent-progressive-handler', (req, res, next) => {
        // For this prototype, we'll simulate file upload handling
        // In a real application, you would use multer or similar middleware
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            // Simulate file upload processing
            req.files = {
                'consent-file': {
                    name: 'diocesan-consent-document-progressive.pdf',
                    size: 2048000, // 2MB
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

            // Store the academy details temporarily for the flow
            req.session.data['temp-academy-details'] = {
                name: name,
                urn: urn,
                postcode: postcode,
                academyTrust: academyTrust
            };

            // Redirect to proposed transfer date page
            return res.redirect('proposed-transfer-date');
        } else {
            // If user selects No, go back to academies-to-transfer
            return res.redirect('academies-to-transfer');
        }
    });

    // Handle proposed transfer date
    router.post('/' + version + '/proposed-transfer-date-handler', function (req, res) {
        // Store the proposed transfer date
        const day = req.body['proposed-transfer-date-day'];
        const month = req.body['proposed-transfer-date-month'];
        const year = req.body['proposed-transfer-date-year'];
        
        req.session.data['proposed-transfer-date'] = {
            day: day,
            month: month,
            year: year
        };

        // Redirect to academy funding agreement page
        return res.redirect('academy-funding-agreement');
    });

    // Handle academy funding agreement
    router.post('/' + version + '/academy-funding-agreement-handler', function (req, res) {
        const fundingAgreement = req.body['academy-funding-agreement'];
        
        // Store the funding agreement response
        req.session.data['academy-funding-agreement'] = fundingAgreement;

        if (fundingAgreement === 'yes') {
            // If Yes, go to diocesan consent page
            return res.redirect('diocesan-consent');
        } else {
            // If No, go to academy operating differently page
            return res.redirect('academy-operating-differently');
        }
    });

    // Handle diocesan consent
    router.post('/' + version + '/diocesan-consent-handler', function (req, res) {
        const diocesanConsent = req.body['diocesan-consent'];
        
        // Store the diocesan consent response
        req.session.data['diocesan-consent'] = diocesanConsent;

        if (diocesanConsent === 'yes') {
            // If Yes, go to upload consent page
            return res.redirect('upload-consent');
        } else {
            // If No, add academy to list and go to summary
            addAcademyToTransferList(req);
            return res.redirect('academies-to-transfer');
        }
    });

    // Handle upload consent
    router.post('/' + version + '/upload-consent-handler', function (req, res) {
        // Handle file upload for consent
        if (req.files && req.files['consent-file']) {
            const uploadedFile = req.files['consent-file'];
            
            // Initialize consent files array if it doesn't exist
            if (!req.session.data['consent-files']) {
                req.session.data['consent-files'] = [];
            }
            
            // Add the new file to the array
            req.session.data['consent-files'].push({
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.mimetype
            });
            
            // Set success flag for banner
            req.session.data['file-upload-success'] = true;
            
            // Clear deletion success flag
            req.session.data['file-delete-success'] = false;
            delete req.session.data['deleted-file-name'];
            
            // In a real application, you would save the file to a secure location
            // For this prototype, we'll just store the file information
        }
        
        // Redirect back to the upload consent page to show the file table
        res.redirect('upload-consent');
    });

    // POST handler for deleting consent files
    router.post('/' + version + '/delete-consent-file', function (req, res) {
        const fileIndex = parseInt(req.body['file-index']);
        
        if (req.session.data['consent-files'] && req.session.data['consent-files'][fileIndex]) {
            // Get the file name before removing it for the success message
            const deletedFileName = req.session.data['consent-files'][fileIndex].name;
            
            // Remove the file at the specified index
            req.session.data['consent-files'].splice(fileIndex, 1);
            
            // Set success flag for deletion banner
            req.session.data['file-delete-success'] = true;
            req.session.data['deleted-file-name'] = deletedFileName;
            
            // Clear upload success flag
            req.session.data['file-upload-success'] = false;
        }
        
        // Redirect back to the upload consent page
        res.redirect('upload-consent');
    });

    // GET handler for downloading consent files
    router.get('/' + version + '/download-consent-file/:index', function (req, res) {
        const fileIndex = parseInt(req.params.index);
        
        if (req.session.data['consent-files'] && req.session.data['consent-files'][fileIndex]) {
            const file = req.session.data['consent-files'][fileIndex];
            
            // Set headers for file download
            res.setHeader('Content-Type', file.type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            
            // For prototype purposes, create a simple text response
            // In a real application, this would serve the actual file from storage
            res.send(`This is a prototype file download for: ${file.name}\n\nFile size: ${(file.size / 1024 / 1024).toFixed(2)} MB\nFile type: ${file.type}\n\nThis is a simulated file download for demonstration purposes.`);
        } else {
            res.status(404).send('File not found');
        }
    });

    // POST handler for continuing from upload consent page
    router.post('/' + version + '/upload-consent-continue', function (req, res) {
        // Add academy to list and go to summary
        addAcademyToTransferList(req);
        return res.redirect('academies-to-transfer');
    });

    // Handle academy operating differently
    router.post('/' + version + '/academy-operating-differently-handler', function (req, res) {
        // Store the operating differently explanation
        req.session.data['academy-operating-differently'] = req.body['academy-operating-differently'];
        
        // Add academy to list and go to summary
        addAcademyToTransferList(req);
        return res.redirect('academies-to-transfer');
    });

    // Helper function to add academy to transfer list
    function addAcademyToTransferList(req) {
        const tempAcademy = req.session.data['temp-academy-details'];
        
        if (tempAcademy) {
            // Initialize academies-to-transfer array if it doesn't exist
            if (!req.session.data['academies-to-transfer']) {
                req.session.data['academies-to-transfer'] = [];
            }

            // Get consent files for this academy (if any)
            const consentFiles = req.session.data['consent-files'] || [];

            // Add the academy with all the collected information
            const academyWithDetails = {
                ...tempAcademy,
                proposedTransferDate: req.session.data['proposed-transfer-date'],
                fundingAgreement: req.session.data['academy-funding-agreement'],
                diocesanConsent: req.session.data['diocesan-consent'],
                operatingDifferently: req.session.data['academy-operating-differently'],
                consentFiles: consentFiles
            };



            // Add the new academy to the list
            req.session.data['academies-to-transfer'].push(academyWithDetails);

            // Set outgoing trusts status to true since we now have academies
            req.session.data['outgoing-trusts-status'] = true;

            // Store the academy name for success message
            req.session.data['academy-added'] = tempAcademy.name;

            // Clear any existing errors since we now have an academy
            delete req.session.data.errors;

            // Clear temporary data for this academy only
            delete req.session.data['temp-academy-details'];
            delete req.session.data['proposed-transfer-date'];
            delete req.session.data['academy-funding-agreement'];
            delete req.session.data['diocesan-consent'];
            delete req.session.data['academy-operating-differently'];
            delete req.session.data['consent-files'];
        }
    }
    
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
        // Check if we have a success message for removed academy
        const removedAcademy = req.session.data['academy-removed'];
        // Clear it from session immediately
        delete req.session.data['academy-removed'];
        
        // Check if we have a success message for added academy
        const addedAcademy = req.session.data['academy-added'];
        // Clear it from session immediately
        delete req.session.data['academy-added'];
        
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
            success: !!(removedAcademy || addedAcademy),
            removedAcademy: removedAcademy,
            addedAcademy: addedAcademy,
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
            if (req.session.data['outgoing-trusts-status'] === undefined) {
            req.session.data['outgoing-trusts-status'] = application['outgoing-trusts-status'] || false;
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
                'outgoing-trusts': 'outgoingTrusts',
                'finance': 'finance',
                'declaration': 'declaration',
                'risks': 'risks',
                'reason-and-benefits-academies': 'reason-and-benefits-academies',
                'reason-and-benefits-trust': 'reason-and-benefits-trust',
                'risks-status': 'risks',
                'reason-and-benefits-academies-status': 'reason-and-benefits-academies',
                'reason-and-benefits-trust-status': 'reason-and-benefits-trust',
                'school-improvement': 'school-improvement',
                'school-improvement-status': 'school-improvement',
                'high-quality-and-inclusive-education-status': 'high-quality-and-inclusive-education',
                'trustee-status': 'trustee'
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

    // GET handler for outgoing trusts search
    router.get('/' + version + '/outgoing-trusts-search', function (req, res) {
        console.log('Outgoing trusts search route - trusts data:', data.trusts);
        res.render(version + '/outgoing-trusts-search', {
            data: req.session.data,
            trusts: data.trusts
        });
    });



    // GET handler for outgoing trusts search
    router.get('/' + version + '/outgoing-trusts-search', function (req, res) {
        const editIndex = req.query.edit;
        
        res.render(version + '/outgoing-trusts-search', {
            data: req.session.data,
            trusts: data.trusts,
            editIndex: editIndex
        });
    });

        // POST handler for outgoing trusts confirmation
    router.post('/' + version + '/outgoing-trusts-confirmation', function (req, res) {
        const selectedTrustName = req.body['outgoing-trust-search'];
        const editIndex = req.query.edit; // Get from query parameter instead of body
        

        
        // Find the selected trust details from the data
        const selectedTrust = data.trusts.find(trust => trust.name === selectedTrustName);
        
        if (selectedTrust) {
            // Store the selected trust details in session for the confirmation page
            req.session.data['selected-outgoing-trust-name'] = selectedTrust.name;
            req.session.data['selected-outgoing-trust-ukprn'] = selectedTrust.ukprn;
            req.session.data['selected-outgoing-trust-company-house'] = selectedTrust.companyHouseNumber;
            
            res.render(version + '/outgoing-trusts-confirmation', {
                data: req.session.data,
                trustName: selectedTrust.name,
                trustUkprn: selectedTrust.ukprn,
                trustCompanyHouse: selectedTrust.companyHouseNumber,
                editIndex: editIndex // Pass edit index directly to template
            });
        } else {
            // If trust not found, redirect back to search
            return res.redirect('outgoing-trusts-search');
        }
    });

    // GET handler for confirm delete outgoing trust
    router.get('/' + version + '/confirm-delete-outgoing-trust', function (req, res) {
        const index = parseInt(req.query.index);
        
        res.render(version + '/confirm-delete-outgoing-trust', {
            data: req.session.data,
            index: index
        });
    });

    // GET handler for outgoing trusts summary
    router.get('/' + version + '/outgoing-trusts-summary', function (req, res) {
        // Check if we have success messages
        const trustAdded = req.session.data['outgoing-trust-added'];
        const trustRemoved = req.session.data['outgoing-trust-removed'];
        
        // Clear success flags from session immediately
        delete req.session.data['outgoing-trust-added'];
        delete req.session.data['outgoing-trust-removed'];
        
        res.render(version + '/outgoing-trusts-summary', {
            data: req.session.data,
            trustAdded: trustAdded,
            trustRemoved: trustRemoved
        });
    });

    // POST handler for outgoing trusts summary (handles deletions)
    router.post('/' + version + '/outgoing-trusts-summary', function (req, res) {
        const deleteOutgoingTrust = req.body['delete-outgoing-trust'];
        const confirmDeleteOutgoingTrust = req.body['confirm-delete-outgoing-trust'];
        
        if (deleteOutgoingTrust !== undefined) {
            if (confirmDeleteOutgoingTrust === 'yes') {
                // Remove the trust from the array
                const index = parseInt(deleteOutgoingTrust);
                if (req.session.data['outgoing-trusts'] && req.session.data['outgoing-trusts'][index]) {
                    // Get the trust name before removing it for the success message
                    const trustName = req.session.data['outgoing-trusts'][index].name;
                    req.session.data['outgoing-trusts'].splice(index, 1);
                    
                    // Set success flag for banner
                    req.session.data['outgoing-trust-removed'] = trustName;
                    
                    if (req.session.data['outgoing-trusts'].length === 0) {
                        req.session.data['outgoing-trusts-status'] = false;
                    }
                }
            }
            // Always redirect back to the summary page (whether deleted or kept)
            return res.redirect('outgoing-trusts-summary');
        }
        
        // Check if this is the completion checkbox form submission
        if (req.body['outgoing-trusts-status']) {
            // Save the checkbox state - using 'Complete' to match the form value
            req.session.data['outgoing-trusts-status'] = req.body['outgoing-trusts-status'] === 'Complete';
            
            // Go to application task list
        return res.redirect('application-task-list');
        }
        
        // Default fallback
        return res.redirect('outgoing-trusts-summary');
    });

    // POST handler for outgoing trusts confirmation
    router.post('/' + version + '/outgoing-trusts-confirmation-handler', function (req, res) {
        const trustConfirmed = req.body['trust-confirmed'];
        const editIndex = req.body['edit-index'];
        

        
        if (trustConfirmed === 'Yes') {
            // Initialize outgoing-trusts array if it doesn't exist
            if (!req.session.data['outgoing-trusts']) {
                req.session.data['outgoing-trusts'] = [];
            }
            
            const newTrust = {
                name: req.session.data['selected-outgoing-trust-name'],
                ukprn: req.session.data['selected-outgoing-trust-ukprn'],
                companyHouseNumber: req.session.data['selected-outgoing-trust-company-house']
            };
            
            // Check if we're editing an existing trust
            if (editIndex !== undefined) {
                const actualEditIndex = parseInt(editIndex);
                
                // Replace the existing trust at the specified index
                if (req.session.data['outgoing-trusts'][actualEditIndex]) {
                    req.session.data['outgoing-trusts'][actualEditIndex] = newTrust;
                }
            } else {
                // Add a new trust to the array
                req.session.data['outgoing-trusts'].push(newTrust);
                
                // Set success flag for banner when trust is added
                req.session.data['outgoing-trust-added'] = newTrust.name;
            }
            
            // Set outgoing trusts status to true
            req.session.data['outgoing-trusts-status'] = true;
            
            // Redirect to contact details page instead of summary
            return res.redirect('outgoing-trusts-contact-details');
        } else {
            // If not confirmed, go back to search
            return res.redirect('outgoing-trusts-search');
        }
    });

    // GET handler for outgoing trusts contact details
    router.get('/' + version + '/outgoing-trusts-contact-details', function (req, res) {
        const editIndex = req.query.edit;
        
        // Initialize default values
        let contactName = '';
        let role = '';
        let contactNumber = '';
        let emailAddress = '';
        
        // If editing, get existing values from the trust
        if (editIndex !== undefined && req.session.data['outgoing-trusts']) {
            const trust = req.session.data['outgoing-trusts'][parseInt(editIndex)];
            if (trust) {
                contactName = trust.contactName || '';
                role = trust.role || '';
                contactNumber = trust.contactNumber || '';
                emailAddress = trust.emailAddress || '';
            }
        }
        
        res.render(version + '/outgoing-trusts-contact-details', {
            data: req.session.data,
            editIndex: editIndex,
            contactName: contactName,
            role: role,
            contactNumber: contactNumber,
            emailAddress: emailAddress
        });
    });

    // POST handler for outgoing trusts contact details
    router.post('/' + version + '/outgoing-trusts-contact-details-handler', function (req, res) {
        const editIndex = req.body['edit-index'];
        const trustName = req.body['trust-name'];
        const trustUkprn = req.body['trust-ukprn'];
        const trustCompanyHouse = req.body['trust-company-house'];
        
        // Store contact details
        const contactDetails = {
            contactName: req.body['contact-name'],
            role: req.body['role'],
            contactNumber: req.body['contact-number'],
            emailAddress: req.body['email-address']
        };
        
        // Check if we're editing an existing trust
        if (editIndex !== undefined) {
            const actualEditIndex = parseInt(editIndex);
            
            // Update the existing trust with contact details
            if (req.session.data['outgoing-trusts'][actualEditIndex]) {
                req.session.data['outgoing-trusts'][actualEditIndex] = {
                    ...req.session.data['outgoing-trusts'][actualEditIndex],
                    ...contactDetails
                };
            }
        } else {
            // Find the trust by name and update it with contact details
            const trustIndex = req.session.data['outgoing-trusts'].findIndex(trust => 
                trust.name === trustName && 
                trust.ukprn === trustUkprn && 
                trust.companyHouseNumber === trustCompanyHouse
            );
            
            if (trustIndex !== -1) {
                req.session.data['outgoing-trusts'][trustIndex] = {
                    ...req.session.data['outgoing-trusts'][trustIndex],
                    ...contactDetails
                };
            }
        }
        
        // Redirect to trust closure page instead of summary
        return res.redirect('outgoing-trusts-closure');
    });

    // GET handler for outgoing trusts closure
    router.get('/' + version + '/outgoing-trusts-closure', function (req, res) {
        const editIndex = req.query.edit;
        
        // Initialize default value
        let trustWillClose = '';
        
        // If editing, get existing value from the trust
        if (editIndex !== undefined && req.session.data['outgoing-trusts']) {
            const trust = req.session.data['outgoing-trusts'][parseInt(editIndex)];
            if (trust) {
                trustWillClose = trust.trustWillClose || '';
            }
        }
        
        res.render(version + '/outgoing-trusts-closure', {
            data: {
                ...req.session.data,
            'trust-will-close': trustWillClose
            },
            editIndex: editIndex
        });
    });

    // POST handler for outgoing trusts closure
    router.post('/' + version + '/outgoing-trusts-closure-handler', function (req, res) {
        const editIndex = req.body['edit-index'];
        const trustName = req.body['trust-name'];
        const trustUkprn = req.body['trust-ukprn'];
        const trustCompanyHouse = req.body['trust-company-house'];
        
        // Store closure information
        const closureInfo = {
            trustWillClose: req.body['trust-will-close']
        };
        
        // Check if we're editing an existing trust
        if (editIndex !== undefined) {
            const actualEditIndex = parseInt(editIndex);
            
            // Update the existing trust with closure info
            if (req.session.data['outgoing-trusts'][actualEditIndex]) {
                req.session.data['outgoing-trusts'][actualEditIndex] = {
                    ...req.session.data['outgoing-trusts'][actualEditIndex],
                    ...closureInfo
                };
            }
        } else {
            // Find the trust by name and update it with closure info
            const trustIndex = req.session.data['outgoing-trusts'].findIndex(trust => 
                trust.name === trustName && 
                trust.ukprn === trustUkprn && 
                trust.companyHouseNumber === trustCompanyHouse
            );
            
            if (trustIndex !== -1) {
                req.session.data['outgoing-trusts'][trustIndex] = {
                    ...req.session.data['outgoing-trusts'][trustIndex],
                    ...closureInfo
                };
            }
        }
        
        // Redirect to board resolution page
        if (editIndex !== undefined) {
            return res.redirect(`outgoing-trusts-board-resolution?edit=${editIndex}`);
        } else {
            // For new entries, also redirect to board resolution page
            return res.redirect('outgoing-trusts-board-resolution');
        }
    });

    // GET handler for outgoing trusts board resolution
    router.get('/' + version + '/outgoing-trusts-board-resolution', function (req, res) {
        const editIndex = req.query.edit;
        
        res.render(version + '/outgoing-trusts-board-resolution', {
            data: req.session.data,
            editIndex: editIndex
        });
    });

    // POST handler for outgoing trusts board resolution
    router.post('/' + version + '/outgoing-trusts-board-resolution-handler', function (req, res) {
        // Handle file upload for board resolution
        if (req.files && req.files['board-resolution-file']) {
            const uploadedFile = req.files['board-resolution-file'];
            
            // Initialize files array if it doesn't exist
            if (!req.session.data['board-resolution-files']) {
                req.session.data['board-resolution-files'] = [];
            }
            
            // Add the new file to the array
            req.session.data['board-resolution-files'].push({
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.mimetype
            });
            
            // Set success flag for banner
            req.session.data['file-upload-success'] = true;
            
            // Clear deletion success flag
            req.session.data['file-delete-success'] = false;
            delete req.session.data['deleted-file-name'];
            
            // In a real application, you would save the file to a secure location
            // For this prototype, we'll just store the file information
        }
        
        // Redirect to the board resolution page to show the file table
        res.redirect('outgoing-trusts-board-resolution');
    });

    // POST handler for clearing board resolution upload success flag
    router.post('/' + version + '/clear-board-resolution-upload-success-flag', function (req, res) {
        req.session.data['file-upload-success'] = false;
        res.status(200).json({ success: true });
    });

    // POST handler for clearing board resolution delete success flag
    router.post('/' + version + '/clear-board-resolution-delete-success-flag', function (req, res) {
        req.session.data['file-delete-success'] = false;
        delete req.session.data['deleted-file-name'];
        res.status(200).json({ success: true });
    });

    // GET handler for downloading board resolution files
    router.get('/' + version + '/download-board-resolution-file/:index', function (req, res) {
        const fileIndex = parseInt(req.params.index);
        
        if (req.session.data['board-resolution-files'] && req.session.data['board-resolution-files'][fileIndex]) {
            const file = req.session.data['board-resolution-files'][fileIndex];
            
            // Set headers for file download
            res.setHeader('Content-Type', file.type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            
            // For prototype purposes, create a simple text response
            // In a real application, this would serve the actual file from storage
            res.send(`This is a prototype file download for: ${file.name}\n\nFile size: ${(file.size / 1024 / 1024).toFixed(2)} MB\nFile type: ${file.type}\n\nThis is a simulated file download for demonstration purposes.`);
        } else {
            res.status(404).send('File not found');
        }
    });

    // POST handler for deleting board resolution files
    router.post('/' + version + '/delete-board-resolution-file', function (req, res) {
        const fileIndex = parseInt(req.body['file-index']);
        
        if (req.session.data['board-resolution-files'] && req.session.data['board-resolution-files'][fileIndex]) {
            // Get the file name before removing it for the success message
            const deletedFileName = req.session.data['board-resolution-files'][fileIndex].name;
            
            // Remove the file at the specified index
            req.session.data['board-resolution-files'].splice(fileIndex, 1);
            
            // Set success flag for deletion banner
            req.session.data['file-delete-success'] = true;
            req.session.data['deleted-file-name'] = deletedFileName;
            
            // Clear upload success flag
            req.session.data['file-upload-success'] = false;
        }
        
        // Redirect back to the board resolution page
        res.redirect('outgoing-trusts-board-resolution');
    });

    // GET handler for outgoing trusts stakeholder engagement consultation
    router.get('/' + version + '/outgoing-trusts-stakeholder-engagement', function (req, res) {
        const editIndex = req.query.edit;
        
        // Initialize default value
        let stakeholderEngagementConsultation = '';
        
        // If editing, get existing value from the trust
        if (editIndex !== undefined && req.session.data['outgoing-trusts']) {
            const trust = req.session.data['outgoing-trusts'][parseInt(editIndex)];
            if (trust) {
                stakeholderEngagementConsultation = trust.stakeholderEngagementConsultation || '';
            }
        }
        
        res.render(version + '/outgoing-trusts-stakeholder-engagement', {
            data: {
                ...req.session.data,
                'stakeholder-engagement-consultation': stakeholderEngagementConsultation
            },
            editIndex: editIndex
        });
    });

    // POST handler for outgoing trusts stakeholder engagement consultation
    router.post('/' + version + '/outgoing-trusts-stakeholder-engagement-handler', function (req, res) {
        const editIndex = req.body['edit-index'];
        const trustName = req.body['trust-name'];
        const trustUkprn = req.body['trust-ukprn'];
        const trustCompanyHouse = req.body['trust-company-house'];
        
        // Store stakeholder engagement consultation information
        const stakeholderInfo = {
            stakeholderEngagementConsultation: req.body['stakeholder-engagement-consultation']
        };
        
        // Check if we're editing an existing trust
        if (editIndex !== undefined) {
            const actualEditIndex = parseInt(editIndex);
            
            // Update the existing trust with stakeholder engagement consultation info
            if (req.session.data['outgoing-trusts'][actualEditIndex]) {
                req.session.data['outgoing-trusts'][actualEditIndex] = {
                    ...req.session.data['outgoing-trusts'][actualEditIndex],
                    ...stakeholderInfo
                };
            }
        } else {
            // Find the trust by name and update it with stakeholder engagement consultation info
            const trustIndex = req.session.data['outgoing-trusts'].findIndex(trust => 
                trust.name === trustName && 
                trust.ukprn === trustUkprn && 
                trust.companyHouseNumber === trustCompanyHouse
            );
            
            if (trustIndex !== -1) {
                req.session.data['outgoing-trusts'][trustIndex] = {
                    ...req.session.data['outgoing-trusts'][trustIndex],
                    ...stakeholderInfo
                };
            }
        }
        
        // Redirect based on the answer
        if (req.body['stakeholder-engagement-consultation'] === 'No') {
            // If No, redirect to explanation page
            if (editIndex !== undefined) {
                return res.redirect(`outgoing-trusts-stakeholder-engagement-explanation?edit=${editIndex}`);
            } else {
                return res.redirect('outgoing-trusts-stakeholder-engagement-explanation');
            }
        } else {
            // If Yes, redirect to consultation results page
            if (editIndex !== undefined) {
                return res.redirect(`outgoing-trusts-consultation-results?edit=${editIndex}`);
            } else {
                return res.redirect('outgoing-trusts-consultation-results');
            }
        }
    });

    // GET handler for outgoing trusts stakeholder engagement explanation
    router.get('/' + version + '/outgoing-trusts-stakeholder-engagement-explanation', function (req, res) {
        const editIndex = req.query.edit;
        
        // Initialize default value
        let stakeholderEngagementExplanation = '';
        
        // If editing, get existing value from the trust
        if (editIndex !== undefined && req.session.data['outgoing-trusts']) {
            const trust = req.session.data['outgoing-trusts'][parseInt(editIndex)];
            if (trust) {
                stakeholderEngagementExplanation = trust.stakeholderEngagementExplanation || '';
            }
        }
        
        res.render(version + '/outgoing-trusts-stakeholder-engagement-explanation', {
            data: {
                ...req.session.data,
                'stakeholder-engagement-explanation': stakeholderEngagementExplanation
            },
            editIndex: editIndex
        });
    });

    // POST handler for outgoing trusts stakeholder engagement explanation
    router.post('/' + version + '/outgoing-trusts-stakeholder-engagement-explanation-handler', function (req, res) {
        const editIndex = req.body['edit-index'];
        const trustName = req.body['trust-name'];
        const trustUkprn = req.body['trust-ukprn'];
        const trustCompanyHouse = req.body['trust-company-house'];
        
        // Store stakeholder engagement explanation information
        const explanationInfo = {
            stakeholderEngagementExplanation: req.body['stakeholder-engagement-explanation']
        };
        
        // Check if we're editing an existing trust
        if (editIndex !== undefined) {
            const actualEditIndex = parseInt(editIndex);
            
            // Update the existing trust with explanation info
            if (req.session.data['outgoing-trusts'][actualEditIndex]) {
                req.session.data['outgoing-trusts'][actualEditIndex] = {
                    ...req.session.data['outgoing-trusts'][actualEditIndex],
                    ...explanationInfo
                };
            }
        } else {
            // Find the trust by name and update it with explanation info
            const trustIndex = req.session.data['outgoing-trusts'].findIndex(trust => 
                trust.name === trustName && 
                trust.ukprn === trustUkprn && 
                trust.companyHouseNumber === trustCompanyHouse
            );
            
            if (trustIndex !== -1) {
                req.session.data['outgoing-trusts'][trustIndex] = {
                    ...req.session.data['outgoing-trusts'][trustIndex],
                    ...explanationInfo
                };
            }
        }
        
        // Redirect to outgoing trusts summary
            return res.redirect('outgoing-trusts-summary');
    });

    // GET handler for outgoing trusts consultation results
    router.get('/' + version + '/outgoing-trusts-consultation-results', function (req, res) {
        const editIndex = req.query.edit;
        
        res.render(version + '/outgoing-trusts-consultation-results', {
            data: req.session.data,
            editIndex: editIndex
        });
    });

    // POST handler for outgoing trusts consultation results
    router.post('/' + version + '/outgoing-trusts-consultation-results-handler', function (req, res) {
        // Handle file upload for consultation results
        if (req.files && req.files['consultation-results-file']) {
            const uploadedFile = req.files['consultation-results-file'];
            
            // Initialize files array if it doesn't exist
            if (!req.session.data['consultation-results-files']) {
                req.session.data['consultation-results-files'] = [];
            }
            
            // Add the new file to the array
            req.session.data['consultation-results-files'].push({
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.mimetype
            });
            
            // Set success flag for banner
            req.session.data['file-upload-success'] = true;
            
            // Clear deletion success flag
            req.session.data['file-delete-success'] = false;
            delete req.session.data['deleted-file-name'];
            
            // In a real application, you would save the file to a secure location
            // For this prototype, we'll just store the file information
        }
        
        // Redirect to the consultation results page to show the file table
        res.redirect('outgoing-trusts-consultation-results');
    });

    // POST handler for clearing consultation results upload success flag
    router.post('/' + version + '/clear-consultation-results-upload-success-flag', function (req, res) {
        req.session.data['file-upload-success'] = false;
        res.status(200).json({ success: true });
    });

    // POST handler for clearing consultation results delete success flag
    router.post('/' + version + '/clear-consultation-results-delete-success-flag', function (req, res) {
        req.session.data['file-delete-success'] = false;
        delete req.session.data['deleted-file-name'];
        res.status(200).json({ success: true });
    });

    // GET handler for downloading consultation results files
    router.get('/' + version + '/download-consultation-results-file/:index', function (req, res) {
        const fileIndex = parseInt(req.params.index);
        
        if (req.session.data['consultation-results-files'] && req.session.data['consultation-results-files'][fileIndex]) {
            const file = req.session.data['consultation-results-files'][fileIndex];
            
            // Set headers for file download
            res.setHeader('Content-Type', file.type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            
            // For prototype purposes, create a simple text response
            // In a real application, this would serve the actual file from storage
            res.send(`This is a prototype file download for: ${file.name}\n\nFile size: ${(file.size / 1024 / 1024).toFixed(2)} MB\nFile type: ${file.type}\n\nThis is a simulated file download for demonstration purposes.`);
        } else {
            res.status(404).send('File not found');
        }
    });

    // POST handler for deleting consultation results files
    router.post('/' + version + '/delete-consultation-results-file', function (req, res) {
        const fileIndex = parseInt(req.body['file-index']);
        
        if (req.session.data['consultation-results-files'] && req.session.data['consultation-results-files'][fileIndex]) {
            // Get the file name before removing it for the success message
            const deletedFileName = req.session.data['consultation-results-files'][fileIndex].name;
            
            // Remove the file at the specified index
            req.session.data['consultation-results-files'].splice(fileIndex, 1);
            
            // Set success flag for deletion banner
            req.session.data['file-delete-success'] = true;
            req.session.data['deleted-file-name'] = deletedFileName;
            
            // Clear upload success flag
            req.session.data['file-upload-success'] = false;
        }
        
        // Redirect back to the consultation results page
        res.redirect('outgoing-trusts-consultation-results');
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
            case 'risks':
                redirectUrl = 'risks-summary';
                break;
            case 'reason-and-benefits-academies':
                redirectUrl = 'reason-and-benefits-academies';
                break;
            case 'reason-and-benefits-trust':
                redirectUrl = 'reason-and-benefits-trust';
                break;
            case 'school-improvement':
                redirectUrl = 'school-improvement';
                break;
            case 'high-quality-and-inclusive-education':
                redirectUrl = 'high-quality-and-inclusive-education';
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
        
        // Check if we have a success message for changes saved
        const changesSaved = req.session.data['risks-changes-saved'];
        // Clear it from session immediately
        delete req.session.data['risks-changes-saved'];
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.risks) {
            const owners = Array.isArray(req.session.data.taskOwners.risks) 
                ? req.session.data.taskOwners.risks 
                : [req.session.data.taskOwners.risks];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/risks-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            changesSaved: changesSaved
        });
    });

    // POST handler for risks summary
    router.post('/' + version + '/risks-summary', function (req, res) {
        // Check if this is the due diligence form submission
        if (req.body['risks-due-diligence']) {
            // Save the due diligence data to session
            req.session.data['risks-due-diligence'] = req.body['risks-due-diligence'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // Redirect to the risks summary page (GET)
            return res.redirect('risks-summary');
        }
        
        // Check if this is the pupil numbers form submission
        if (req.body['risks-pupil-numbers']) {
            // Save the pupil numbers data to session
            req.session.data['risks-pupil-numbers'] = req.body['risks-pupil-numbers'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // If the answer is "No", clear any existing pupil forecast data and go to summary
            if (req.body['risks-pupil-numbers'] === 'No') {
                req.session.data['risks-pupil-forecast'] = '';
                return res.redirect('risks-summary');
            }
            
            // If the answer is "Yes", go to the forecast question
            if (req.body['risks-pupil-numbers'] === 'Yes') {
                return res.redirect('risks-pupil-forecast');
            }
        }
        
        // Check if this is the pupil forecast form submission
        if (req.body['risks-pupil-forecast']) {
            // Save the pupil forecast data to session
            req.session.data['risks-pupil-forecast'] = req.body['risks-pupil-forecast'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // Redirect to the risks summary page (GET)
            return res.redirect('risks-summary');
        }
        
        // Check if this is the financial deficit form submission
        if (req.body['risks-financial-deficit']) {
            // Save the financial deficit data to session
            req.session.data['risks-financial-deficit'] = req.body['risks-financial-deficit'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // If the answer is "No", clear any existing financial forecast data and go to summary
            if (req.body['risks-financial-deficit'] === 'No') {
                req.session.data['risks-financial-forecast'] = '';
                return res.redirect('risks-summary');
            }
            
            // If the answer is "Yes", go to the financial forecast question
            if (req.body['risks-financial-deficit'] === 'Yes') {
                return res.redirect('risks-financial-forecast');
            }
        }
        
        // Check if this is the financial forecast form submission
        if (req.body['risks-financial-forecast']) {
            // Save the financial forecast data to session
            req.session.data['risks-financial-forecast'] = req.body['risks-financial-forecast'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // Redirect to the risks summary page (GET)
            return res.redirect('risks-summary');
        }
        
        // Check if this is the finances pooled form submission
        if (req.body['risks-finances-pooled']) {
            // Save the finances pooled data to session
            req.session.data['risks-finances-pooled'] = req.body['risks-finances-pooled'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // If the answer is "No", clear any existing reserves transfer data and go to summary
            if (req.body['risks-finances-pooled'] === 'No') {
                req.session.data['risks-reserves-transfer'] = '';
                return res.redirect('risks-summary');
            }
            
            // If the answer is "Yes", go to the reserves transfer question
            if (req.body['risks-finances-pooled'] === 'Yes') {
                return res.redirect('risks-reserves-transfer');
            }
        }
        
        // Check if this is the reserves transfer form submission
        if (req.body['risks-reserves-transfer']) {
            // Save the reserves transfer data to session
            req.session.data['risks-reserves-transfer'] = req.body['risks-reserves-transfer'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // Redirect to the risks summary page (GET)
            return res.redirect('risks-summary');
        }
        
        // Check if this is the other risks form submission
        if (req.body['risks-other-risks']) {
            // Save the other risks data to session
            req.session.data['risks-other-risks'] = req.body['risks-other-risks'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // If the answer is "No", clear any existing risk management data and go to summary
            if (req.body['risks-other-risks'] === 'No') {
                req.session.data['risks-risk-management'] = '';
                return res.redirect('risks-summary');
            }
            
            // If the answer is "Yes", go to the risk management question
            if (req.body['risks-other-risks'] === 'Yes') {
                return res.redirect('risks-risk-management');
            }
        }
        
        // Check if this is the risk management form submission
        if (req.body['risks-risk-management']) {
            // Save the risk management data to session
            req.session.data['risks-risk-management'] = req.body['risks-risk-management'];
            
            // Set success flag for banner
            req.session.data['risks-changes-saved'] = true;
            
            // Redirect to the risks summary page (GET)
            return res.redirect('risks-summary');
        }
        
        // Check if this is the completion checkbox form submission
        if (req.body['risks-status']) {
            // Save the checkbox state - using 'Complete' to match the form value
            req.session.data['risks-status'] = req.body['risks-status'] === 'Complete';
            
            // Go to application task list
            return res.redirect('application-task-list');
        }
        
        // Default fallback
        return res.redirect('risks-summary');
    });

    // POST handler for risks due diligence
    router.post('/' + version + '/risks-due-diligence', function (req, res) {
        // Save the due diligence data to session
        req.session.data['risks-due-diligence'] = req.body['risks-due-diligence'];
        
        // Redirect to the risks summary page
        res.redirect('risks-summary');
    });

    // GET handler for reason and benefits academies
    router.get('/' + version + '/reason-and-benefits-academies', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Check if we have a success message for changes saved
        const changesSaved = req.session.data['reason-and-benefits-changes-saved'];
        // Clear it from session immediately
        delete req.session.data['reason-and-benefits-changes-saved'];
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.['reason-and-benefits-academies']) {
            const owners = Array.isArray(req.session.data.taskOwners['reason-and-benefits-academies']) 
                ? req.session.data.taskOwners['reason-and-benefits-academies'] 
                : [req.session.data.taskOwners['reason-and-benefits-academies']];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/reason-and-benefits-academies', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            changesSaved: changesSaved
        });
    });

    // POST handler for reason and benefits academies strategic needs
    router.post('/' + version + '/reason-and-benefits-academies-summary', function (req, res) {
        // Save the strategic needs data to session
        req.session.data['reason-and-benefits-academies-strategic-needs'] = req.body['reason-and-benefits-academies-strategic-needs'];
        
        // Set success flag for banner
        req.session.data['reason-and-benefits-changes-saved'] = true;
        
        // Redirect to the reason and benefits academies summary page
        res.redirect('reason-and-benefits-academies');
    });

    // POST handler for reason and benefits academies maintain improve
    router.post('/' + version + '/reason-and-benefits-academies-maintain-improve-handler', function (req, res) {
        // Save the maintain improve data to session
        req.session.data['reason-and-benefits-academies-maintain-improve'] = req.body['reason-and-benefits-academies-maintain-improve'];
        
        // Set success flag for banner
        req.session.data['reason-and-benefits-changes-saved'] = true;
        
        // Redirect to the reason and benefits academies summary page
        res.redirect('reason-and-benefits-academies');
    });

    // POST handler for reason and benefits academies benefit trust
    router.post('/' + version + '/reason-and-benefits-academies-benefit-trust-handler', function (req, res) {
        // Save the benefit trust data to session
        req.session.data['reason-and-benefits-academies-benefit-trust'] = req.body['reason-and-benefits-academies-benefit-trust'];
        
        // Set success flag for banner
        req.session.data['reason-and-benefits-changes-saved'] = true;
        
        // Redirect to the reason and benefits academies summary page
        res.redirect('reason-and-benefits-academies');
    });

    // GET handler for reason and benefits trust
    router.get('/' + version + '/reason-and-benefits-trust', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Check if we have a success message for changes saved
        const changesSaved = req.session.data['reason-and-benefits-trust-changes-saved'];
        // Clear it from session immediately
        delete req.session.data['reason-and-benefits-trust-changes-saved'];
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.['reason-and-benefits-trust']) {
            const owners = Array.isArray(req.session.data.taskOwners['reason-and-benefits-trust']) 
                ? req.session.data.taskOwners['reason-and-benefits-trust'] 
                : [req.session.data.taskOwners['reason-and-benefits-trust']];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/reason-and-benefits-trust', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            changesSaved: changesSaved
        });
    });

    // POST handler for reason and benefits trust strategic needs
    router.post('/' + version + '/reason-and-benefits-trust-strategic-needs-handler', function (req, res) {
        // Save the strategic needs data to session
        req.session.data['reason-and-benefits-trust-strategic-needs'] = req.body['reason-and-benefits-trust-strategic-needs'];
        
        // Set success flag for banner
        req.session.data['reason-and-benefits-trust-changes-saved'] = true;
        
        // Redirect to the reason and benefits trust summary page
        res.redirect('reason-and-benefits-trust');
    });

    // POST handler for reason and benefits trust maintain improve
    router.post('/' + version + '/reason-and-benefits-trust-maintain-improve-handler', function (req, res) {
        // Save the maintain improve data to session
        req.session.data['reason-and-benefits-trust-maintain-improve'] = req.body['reason-and-benefits-trust-maintain-improve'];
        
        // Set success flag for banner
        req.session.data['reason-and-benefits-trust-changes-saved'] = true;
        
        // Redirect to the reason and benefits trust summary page
        res.redirect('reason-and-benefits-trust');
    });

    // POST handler for reason and benefits trust transfer type
    router.post('/' + version + '/reason-and-benefits-trust-transfer-type-handler', function (req, res) {
        // Save the transfer type data to session
        req.session.data['reason-and-benefits-trust-transfer-type'] = req.body['reason-and-benefits-trust-transfer-type'];
        
        // Set success flag for banner
        req.session.data['reason-and-benefits-trust-changes-saved'] = true;
        
        // Redirect to the reason and benefits trust summary page
        res.redirect('reason-and-benefits-trust');
    });

    // POST handler for high-quality and inclusive education quality
    router.post('/' + version + '/high-quality-and-inclusive-education-quality-handler', function (req, res) {
        // Save the quality data to session
        req.session.data['high-quality-and-inclusive-education-quality'] = req.body['high-quality-and-inclusive-education-quality'];
        
        // Set success flag for banner
        req.session.data['high-quality-and-inclusive-education-changes-saved'] = true;
        
        // Redirect to the high-quality and inclusive education summary page
        res.redirect('high-quality-and-inclusive-education');
    });

    // POST handler for high-quality and inclusive education inclusive
    router.post('/' + version + '/high-quality-and-inclusive-education-inclusive-handler', function (req, res) {
        // Save the inclusive data to session
        req.session.data['high-quality-and-inclusive-education-inclusive'] = req.body['high-quality-and-inclusive-education-inclusive'];
        
        // Set success flag for banner
        req.session.data['high-quality-and-inclusive-education-changes-saved'] = true;
        
        // Redirect to the high-quality and inclusive education summary page
        res.redirect('high-quality-and-inclusive-education');
    });

    // GET handler for high-quality and inclusive education summary
    router.get('/' + version + '/high-quality-and-inclusive-education', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Check if we have a success message for changes saved
        const changesSaved = req.session.data['high-quality-and-inclusive-education-changes-saved'];
        // Clear it from session immediately
        delete req.session.data['high-quality-and-inclusive-education-changes-saved'];
        
        // Load contributors from application data if not already in session
        if (application && application.contributors && (!req.session.data['contributors'] || req.session.data['contributors'].length === 0)) {
            req.session.data['contributors'] = application.contributors;
        }
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.['high-quality-and-inclusive-education']) {
            const owners = Array.isArray(req.session.data.taskOwners['high-quality-and-inclusive-education']) 
                ? req.session.data.taskOwners['high-quality-and-inclusive-education'] 
                : [req.session.data.taskOwners['high-quality-and-inclusive-education']];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/high-quality-and-inclusive-education', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            changesSaved: changesSaved
        });
    });

    // GET handler for school improvement
    router.get('/' + version + '/school-improvement', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Check if we have a success message for changes saved
        const changesSaved = req.session.data['school-improvement-changes-saved'];
        // Clear it from session immediately
        delete req.session.data['school-improvement-changes-saved'];
        
        // Load contributors from application data if not already in session
        if (application && application.contributors && (!req.session.data['contributors'] || req.session.data['contributors'].length === 0)) {
            req.session.data['contributors'] = application.contributors;
        }
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.['school-improvement']) {
            const owners = Array.isArray(req.session.data.taskOwners['school-improvement']) 
                ? req.session.data.taskOwners['school-improvement'] 
                : [req.session.data.taskOwners['school-improvement']];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/school-improvement', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            changesSaved: changesSaved
        });
    });

    // POST handler for school improvement model
    router.post('/' + version + '/school-improvement-model-handler', function (req, res) {
        // Save the school improvement model data to session
        req.session.data['school-improvement-model'] = req.body['school-improvement-model'];
        
        // Set success flag for banner
        req.session.data['school-improvement-changes-saved'] = true;
        
        // Redirect to the school improvement summary page
        res.redirect('school-improvement');
    });

    // GET handler for governance structure
    router.get('/' + version + '/governance-structure', function (req, res) {
        // Initialize application data if not exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'],
                contributors: []
            };
        }

        const ref = req.session.data.application.reference;
        const application = data.applications.find(app => app.reference === ref);
        
        // Check if we have a success message for changes saved
        const changesSaved = req.session.data['governance-structure-changes-saved'];
        // Clear it from session immediately
        delete req.session.data['governance-structure-changes-saved'];
        
        // Load contributors from application data if not already in session
        if (application && application.contributors && (!req.session.data['contributors'] || req.session.data['contributors'].length === 0)) {
            req.session.data['contributors'] = application.contributors;
        }
        
        // Process task owners
        let taskOwnerDisplay = 'Task owner: not assigned';
        if (req.session.data.taskOwners?.['governance-structure']) {
            const owners = Array.isArray(req.session.data.taskOwners['governance-structure']) 
                ? req.session.data.taskOwners['governance-structure'] 
                : [req.session.data.taskOwners['governance-structure']];
            
            if (owners.length > 0 && !owners.includes('_unchecked')) {
                taskOwnerDisplay = 'Assigned to: ' + owners.map(owner => {
                    const contributor = req.session.data['contributors'].find(c => c.email === owner);
                    return contributor ? contributor.name : owner;
                }).join(', ');
            }
        }
        
        res.render(version + '/governance-structure', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            changesSaved: changesSaved
        });
    });

    // POST handler for governance structure model
    router.post('/' + version + '/governance-structure-model-handler', function (req, res) {
        // Handle file upload for governance structure
        if (req.files && req.files['governance-structure-file']) {
            const uploadedFile = req.files['governance-structure-file'];
            
            // Initialize files array if it doesn't exist
            if (!req.session.data['governance-structure-files']) {
                req.session.data['governance-structure-files'] = [];
            }
            
            // Add the new file to the array
            req.session.data['governance-structure-files'].push({
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.mimetype
            });
            
            // Set success flag for banner
            req.session.data['file-upload-success'] = true;
            
            // Clear deletion success flag
            req.session.data['file-delete-success'] = false;
            delete req.session.data['deleted-file-name'];
            
            // In a real application, you would save the file to a secure location
            // For this prototype, we'll just store the file information
        }
        
        // Redirect to the governance structure model page to show the file table
        res.redirect('governance-structure-model');
    });

    // POST handler for clearing upload success flag
    router.post('/' + version + '/clear-upload-success-flag', function (req, res) {
        req.session.data['file-upload-success'] = false;
        res.status(200).json({ success: true });
    });

    // POST handler for clearing delete success flag
    router.post('/' + version + '/clear-delete-success-flag', function (req, res) {
        req.session.data['file-delete-success'] = false;
        delete req.session.data['deleted-file-name'];
        res.status(200).json({ success: true });
    });

    // GET handler for downloading governance structure files
    router.get('/' + version + '/download-governance-file/:index', function (req, res) {
        const fileIndex = parseInt(req.params.index);
        
        if (req.session.data['governance-structure-files'] && req.session.data['governance-structure-files'][fileIndex]) {
            const file = req.session.data['governance-structure-files'][fileIndex];
            
            // Set headers for file download
            res.setHeader('Content-Type', file.type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            
            // For prototype purposes, create a simple text response
            // In a real application, this would serve the actual file from storage
            res.send(`This is a prototype file download for: ${file.name}\n\nFile size: ${(file.size / 1024 / 1024).toFixed(2)} MB\nFile type: ${file.type}\n\nThis is a simulated file download for demonstration purposes.`);
        } else {
            res.status(404).send('File not found');
        }
    });

    // POST handler for deleting governance structure files
    router.post('/' + version + '/delete-governance-file', function (req, res) {
        const fileIndex = parseInt(req.body['file-index']);
        
        if (req.session.data['governance-structure-files'] && req.session.data['governance-structure-files'][fileIndex]) {
            // Get the file name before removing it for the success message
            const deletedFileName = req.session.data['governance-structure-files'][fileIndex].name;
            
            // Remove the file at the specified index
            req.session.data['governance-structure-files'].splice(fileIndex, 1);
            
            // Set success flag for deletion banner
            req.session.data['file-delete-success'] = true;
            req.session.data['deleted-file-name'] = deletedFileName;
            
            // Clear upload success flag
            req.session.data['file-upload-success'] = false;
        }
        
        // Redirect back to the governance structure model page
        res.redirect('governance-structure-model');
    });

    // POST handler for governance team confirmation
    router.post('/' + version + '/governance-team-confirmation-handler', function (req, res) {
        // Save the governance team confirmed data to session
        req.session.data['governance-team-confirmed'] = req.body['governance-team-confirmed'];
        
        // Set success flag for banner
        req.session.data['governance-structure-changes-saved'] = true;
        
        // If the answer is "No", go to the explanation page
        if (req.body['governance-team-confirmed'] === 'No') {
            return res.redirect('governance-team-explanation');
        }
        
        // If the answer is "Yes", go back to the governance structure summary
        if (req.body['governance-team-confirmed'] === 'Yes') {
            return res.redirect('governance-structure');
        }
        
        // Default fallback
        return res.redirect('governance-structure');
    });

    // POST handler for governance team explanation
    router.post('/' + version + '/governance-team-explanation', function (req, res) {
        // Save the governance team explanation data to session
        req.session.data['governance-team-explanation'] = req.body['governance-team-explanation'];
        
        // Redirect to the governance structure summary page
        res.redirect('governance-structure');
    });

    // GET handler for governance team explanation
    router.get('/' + version + '/governance-team-explanation', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['governance-team-explanation'];
        
        res.render(version + '/governance-team-explanation');
    });

    // GET handler for check your answers
    router.get('/' + version + '/check-your-answers', function (req, res) {
        // Ensure application data exists
        if (!req.session.data.application) {
            req.session.data.application = {
                reference: req.session.data['application-reference'] || 'Not set',
                leadApplicant: 'Not set',
                status: 'Draft'
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
        
        res.render(version + '/check-your-answers', {
            data: req.session.data,
            application: application || req.session.data.application
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
            },
            status: 'Signed'
        };
        
        // Check if we're updating an existing declaration
        const declarationIndex = req.body['declaration-index'];
        const trustName = req.session.data.selectedDeclarationTrust?.name;
        
        if (declarationIndex !== undefined && req.session.data['declarations'][declarationIndex]) {
            // Update existing declaration by index
            req.session.data['declarations'][declarationIndex] = declarationData;
        } else if (trustName && req.session.data['declarations']) {
            // Try to find existing declaration by trust name
            const existingIndex = req.session.data['declarations'].findIndex(declaration => 
                declaration.trust.name === trustName
            );
            
            if (existingIndex !== -1) {
                // Update existing declaration
                req.session.data['declarations'][existingIndex] = declarationData;
            } else {
                // Add new declaration to the array
                req.session.data['declarations'].push(declarationData);
            }
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
        const trustName = req.query.trust;
        let existingDeclaration = null;
        
        // If we have an index, find the declaration by index (for editing existing)
        if (declarationIndex !== undefined && req.session.data['declarations'] && req.session.data['declarations'][declarationIndex]) {
            existingDeclaration = req.session.data['declarations'][declarationIndex];
        }
        // If we have a trust name, find the declaration by trust name (for editing existing)
        else if (trustName && req.session.data['declarations']) {
            existingDeclaration = req.session.data['declarations'].find(declaration => 
                declaration.trust.name === trustName
            );
        }
        
        // Store the trust name in session for the form submission
        if (trustName) {
            req.session.data.selectedDeclarationTrust = {
                name: trustName,
                ref: '',
                companies: ''
            };
        }
        
        res.render(version + '/declaration-form', {
            data: req.session.data,
            existingDeclaration: existingDeclaration,
            declarationIndex: declarationIndex,
            trustName: trustName
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
        
        // Create unique list of outgoing trusts from academies
        let uniqueOutgoingTrusts = [];
        if (req.session.data['academies-to-transfer'] && req.session.data['academies-to-transfer'].length > 0) {
            const trustNames = req.session.data['academies-to-transfer'].map(academy => academy.academyTrust);
            uniqueOutgoingTrusts = [...new Set(trustNames)];
        }
        
        // Process incoming trust status
        let incomingTrustStatus = 'Not signed yet';
        if (req.session.data['declarations'] && req.session.data.selectedTrust) {
            const incomingDeclaration = req.session.data['declarations'].find(declaration => 
                declaration.trust.name === req.session.data.selectedTrust.name
            );
            if (incomingDeclaration) {
                incomingTrustStatus = incomingDeclaration.status || 'Signed';
            }
        }
        
        // Process outgoing trusts status
        let outgoingTrustsStatus = {};
        if (uniqueOutgoingTrusts.length > 0) {
            uniqueOutgoingTrusts.forEach(trustName => {
                const declaration = req.session.data['declarations'] ? req.session.data['declarations'].find(declaration => 
                    declaration.trust.name === trustName
                ) : null;
                outgoingTrustsStatus[trustName] = declaration ? (declaration.status || 'Signed') : 'Not signed yet';
            });
        }
        
        console.log('Debug - uniqueOutgoingTrusts:', uniqueOutgoingTrusts);
        console.log('Debug - outgoingTrustsStatus:', outgoingTrustsStatus);
        console.log('Debug - declarations:', req.session.data['declarations']);
        
        res.render(version + '/declaration-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            uniqueOutgoingTrusts: uniqueOutgoingTrusts,
            incomingTrustStatus: incomingTrustStatus,
            outgoingTrustsStatus: outgoingTrustsStatus
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

    // Members routes
    // GET handler for members summary
    router.get('/' + version + '/members-summary', function (req, res) {
        // Check if we have success messages
        const memberAdded = req.session.data['member-added'];
        const memberRemoved = req.session.data['member-removed'];
        const memberToRemoveAdded = req.session.data['member-to-remove-added'];
        const memberToRemoveRemoved = req.session.data['member-to-remove-removed'];
        
        // Clear success flags from session immediately
        delete req.session.data['member-added'];
        delete req.session.data['member-removed'];
        delete req.session.data['member-to-remove-added'];
        delete req.session.data['member-to-remove-removed'];
        
        res.render(version + '/members-summary', {
            data: req.session.data,
            memberAdded: memberAdded,
            memberRemoved: memberRemoved,
            memberToRemoveAdded: memberToRemoveAdded,
            memberToRemoveRemoved: memberToRemoveRemoved
        });
    });

    // GET handler for trustee summary
    router.get('/' + version + '/trustee-summary', function (req, res) {
        // Check if we have success messages
        const trusteeAdded = req.session.data['trustee-added'];
        const trusteeRemoved = req.session.data['trustee-removed'];
        const trusteeToRemoveAdded = req.session.data['trustee-to-remove-added'];
        const trusteeToRemoveRemoved = req.session.data['trustee-to-remove-removed'];
        
        // Clear success flags from session immediately
        delete req.session.data['trustee-added'];
        delete req.session.data['trustee-removed'];
        delete req.session.data['trustee-to-remove-added'];
        delete req.session.data['trustee-to-remove-removed'];
        
        res.render(version + '/trustee-summary', {
            data: req.session.data,
            trusteeAdded: trusteeAdded,
            trusteeRemoved: trusteeRemoved,
            trusteeToRemoveAdded: trusteeToRemoveAdded,
            trusteeToRemoveRemoved: trusteeToRemoveRemoved
        });
    });

    // GET handler for member-add - clear previous member data
    router.get('/' + version + '/member-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['member-full-name'];
        delete req.session.data['member-current-responsibilities'];
        delete req.session.data['member-future-role'];
        delete req.session.data['member-confirmed'];
        
        res.render(version + '/member-add');
    });

    // GET handler for member-to-remove-add - clear previous member data
    router.get('/' + version + '/member-to-remove-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['member-to-remove-full-name'];
        
        res.render(version + '/member-to-remove-add');
    });

    // Handle members summary form submission
    router.post('/' + version + '/members-summary', function (req, res) {
        // Handle completion status
        if (req.body['members-status'] !== undefined) {
            req.session.data['members-status'] = req.body['members-status'] === 'Complete';
        }

        // Handle member deletion confirmation
        if (req.body['confirm-delete-member'] !== undefined) {
            const confirmDelete = req.body['confirm-delete-member'];
            const memberIndex = parseInt(req.body['delete-member']);
            
            if (confirmDelete === 'yes' && req.session.data['members-to-add'] && req.session.data['members-to-add'][memberIndex]) {
                // Remove the member if confirmed
                const memberName = req.session.data['members-to-add'][memberIndex].name;
                req.session.data['members-to-add'].splice(memberIndex, 1);
                req.session.data['member-removed'] = memberName;
            }
            // If confirmDelete === 'no', do nothing - keep the member
        }

        // Handle member to remove deletion
        if (req.body['delete-member-to-remove'] !== undefined) {
            const memberIndex = parseInt(req.body['delete-member-to-remove']);
            if (req.session.data['members-to-remove'] && req.session.data['members-to-remove'][memberIndex]) {
                const memberName = req.session.data['members-to-remove'][memberIndex].name;
                req.session.data['members-to-remove'].splice(memberIndex, 1);
                req.session.data['member-to-remove-removed'] = memberName;
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

            // Set success flag for banner
            req.session.data['member-to-remove-added'] = fullName;

            // Clear the form field after storing the data
            delete req.session.data['member-to-remove-full-name'];
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
                    
                    // Set success flag for banner when member is fully added
                    req.session.data['member-added'] = fullName;
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

    // Handle member to remove deletion confirmation POST
    router.post('/' + version + '/confirm-delete-member-to-remove', function (req, res) {
        const confirmDelete = req.body['confirm-delete-member-to-remove'];
        const memberIndex = parseInt(req.body['delete-member-to-remove']);
        
        if (confirmDelete === 'yes' && req.session.data['members-to-remove'] && req.session.data['members-to-remove'][memberIndex]) {
            // Remove the member if confirmed
            const memberName = req.session.data['members-to-remove'][memberIndex].name;
            req.session.data['members-to-remove'].splice(memberIndex, 1);
            req.session.data['member-to-remove-removed'] = memberName;
        }
        // If confirmDelete === 'no', do nothing - keep the member
        
        res.redirect('members-summary');
    });

    // GET handler for trustee summary
    router.get('/' + version + '/trustee-summary', function (req, res) {
        // Check if we have success messages
        const trusteeAdded = req.session.data['trustee-added'];
        const trusteeRemoved = req.session.data['trustee-removed'];
        const trusteeToRemoveAdded = req.session.data['trustee-to-remove-added'];
        const trusteeToRemoveRemoved = req.session.data['trustee-to-remove-removed'];
        
        // Clear success flags from session immediately
        delete req.session.data['trustee-added'];
        delete req.session.data['trustee-removed'];
        delete req.session.data['trustee-to-remove-added'];
        delete req.session.data['trustee-to-remove-removed'];
        
        res.render(version + '/trustee-summary', {
            data: req.session.data,
            trusteeAdded: trusteeAdded,
            trusteeRemoved: trusteeRemoved,
            trusteeToRemoveAdded: trusteeToRemoveAdded,
            trusteeToRemoveRemoved: trusteeToRemoveRemoved
        });
    });

    // GET handler for trustee-add - clear previous trustee data
    router.get('/' + version + '/trustee-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['trustee-full-name'];
        delete req.session.data['trustee-current-responsibilities'];
        delete req.session.data['trustee-future-role'];
        delete req.session.data['trustee-confirmed'];
        delete req.session.data['trustee-local-governing-body'];
        
        res.render(version + '/trustee-add', {
            data: req.session.data
        });
    });

    // GET handler for trustee-to-remove-add - clear previous trustee data
    router.get('/' + version + '/trustee-to-remove-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['trustee-to-remove-full-name'];
        
        res.render(version + '/trustee-to-remove-add');
    });

    // Handle trustees summary form submission
    router.post('/' + version + '/trustee-summary', function (req, res) {
        // Handle completion status
        if (req.body['trustee-status'] !== undefined) {
            req.session.data['trustee-status'] = req.body['trustee-status'] === 'Complete';
        }

        // Handle trustee deletion confirmation
        if (req.body['confirm-delete-trustee'] !== undefined) {
            const confirmDelete = req.body['confirm-delete-trustee'];
            const trusteeIndex = parseInt(req.body['delete-trustee']);
            
            if (confirmDelete === 'yes' && req.session.data['trustees-to-add'] && req.session.data['trustees-to-add'][trusteeIndex]) {
                // Remove the trustee if confirmed
                const trusteeName = req.session.data['trustees-to-add'][trusteeIndex].name;
                req.session.data['trustees-to-add'].splice(trusteeIndex, 1);
                req.session.data['trustee-removed'] = trusteeName;
            }
            // If confirmDelete === 'no', do nothing - keep the trustee
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

            // Set success flag for banner
            req.session.data['trustee-to-remove-added'] = fullName;

            // Clear the form field after storing the data
            delete req.session.data['trustee-to-remove-full-name'];
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
                    
                    // Set success flag for banner when trustee is fully added
                    req.session.data['trustee-added'] = fullName;
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

    // Handle trustee to remove deletion confirmation POST
    router.post('/' + version + '/confirm-delete-trustee-to-remove', function (req, res) {
        const confirmDelete = req.body['confirm-delete-trustee-to-remove'];
        const trusteeIndex = parseInt(req.body['delete-trustee-to-remove']);
        
        if (confirmDelete === 'yes' && req.session.data['trustees-to-remove'] && req.session.data['trustees-to-remove'][trusteeIndex]) {
            // Remove the trustee if confirmed
            const trusteeName = req.session.data['trustees-to-remove'][trusteeIndex].name;
            req.session.data['trustees-to-remove'].splice(trusteeIndex, 1);
            req.session.data['trustee-to-remove-removed'] = trusteeName;
        }
        // If confirmDelete === 'no', do nothing - keep the trustee
        
        res.redirect('trustee-summary');
    });





    // POST handler for deleting board resolution files
    router.post('/' + version + '/delete-board-resolution-file', function (req, res) {
        const trustIndex = req.body['trust-index'];
        const fileIndex = parseInt(req.body['file-index']);
        
        if (trustIndex !== undefined) {
            const actualTrustIndex = parseInt(trustIndex);
            
            if (req.session.data['board-resolution-files'] && 
                req.session.data['board-resolution-files'][actualTrustIndex] && 
                req.session.data['board-resolution-files'][actualTrustIndex][fileIndex]) {
                // Get the file name before removing it for the success message
                const deletedFileName = req.session.data['board-resolution-files'][actualTrustIndex][fileIndex].name;
                
                // Remove the file at the specified index from the specific trust
                req.session.data['board-resolution-files'][actualTrustIndex].splice(fileIndex, 1);
                
                // Set success flag for deletion banner
                req.session.data['file-delete-success'] = true;
                req.session.data['deleted-file-name'] = deletedFileName;
                
                // Clear upload success flag
                req.session.data['file-upload-success'] = false;
            }
            
            // Redirect back to the board resolution page for the specific trust
            return res.redirect(`outgoing-trusts-board-resolution?edit=${actualTrustIndex}`);
        } else {
            // Fallback: handle deletion from general files array (backward compatibility)
            if (req.session.data['board-resolution-files'] && req.session.data['board-resolution-files'][fileIndex]) {
                // Get the file name before removing it for the success message
                const deletedFileName = req.session.data['board-resolution-files'][fileIndex].name;
                
                // Remove the file at the specified index
                req.session.data['board-resolution-files'].splice(fileIndex, 1);
                
                // Set success flag for deletion banner
                req.session.data['file-delete-success'] = true;
                req.session.data['deleted-file-name'] = deletedFileName;
                
                // Clear upload success flag
                req.session.data['file-upload-success'] = false;
            }
            
            // Redirect back to the board resolution page
            return res.redirect('outgoing-trusts-board-resolution');
        }
    });

    // INCOMING TRUST PROGRESSIVE ENHANCEMENT ROUTES
    
    // GET handler for incoming trust progressive enhancement summary
    router.get('/' + version + '/incoming-trust-progressive-enhancement-summary', function (req, res) {
        res.render(version + '/incoming-trust-progressive-enhancement-summary', {
            data: req.session.data
        });
    });

    // GET handler for incoming trust progressive enhancement search
    router.get('/' + version + '/incoming-trust-progressive-enhancement-search', function (req, res) {
        const editIndex = req.query.edit;
        
        console.log('Search route - trusts data:', data.trusts);
        console.log('Edit index:', editIndex);
        
        res.render(version + '/incoming-trust-progressive-enhancement-search', {
            data: req.session.data,
            trusts: data.trusts,
            editIndex: editIndex
        });
    });

    // GET handler for incoming trust progressive enhancement confirmation
    router.get('/' + version + '/incoming-trust-progressive-enhancement-confirmation', function (req, res) {
        const editIndex = req.query.edit;
        const selectedTrustName = req.query['incoming-trust-progressive-enhancement-search'];
        
        console.log('Confirmation route - query params:', req.query);
        console.log('Selected trust name:', selectedTrustName);
        
        if (!selectedTrustName) {
            console.log('No trust name found, redirecting to search');
            return res.redirect('incoming-trust-progressive-enhancement-search');
        }
        
        // Find the selected trust details from the data
        const selectedTrust = data.trusts.find(trust => trust.name === selectedTrustName);
        
        if (selectedTrust) {
            // Store the selected trust details in session for the confirmation page
            req.session.data['selected-progressive-enhancement-trust-name'] = selectedTrust.name;
            req.session.data['selected-progressive-enhancement-trust-ukprn'] = selectedTrust.ukprn;
            req.session.data['selected-progressive-enhancement-trust-company-house'] = selectedTrust.companyHouseNumber;
            
            res.render(version + '/incoming-trust-progressive-enhancement-confirmation', {
                data: req.session.data,
                trustName: selectedTrust.name,
                trustUkprn: selectedTrust.ukprn,
                trustCompanyHouse: selectedTrust.companyHouseNumber,
                editIndex: editIndex
            });
        } else {
            // If trust not found, redirect back to search
            return res.redirect('incoming-trust-progressive-enhancement-search');
        }
    });

    // POST handler for incoming trust progressive enhancement confirmation
    router.post('/' + version + '/incoming-trust-progressive-enhancement-confirmation-handler', function (req, res) {
        const trustConfirmed = req.body['trust-confirmed'];
        const editIndex = req.body['edit'];
        
        if (trustConfirmed === 'Yes') {
            // Store the selected trust in session
            req.session.data['progressive-enhancement-selected-trust'] = {
                name: req.session.data['selected-progressive-enhancement-trust-name'],
                ukprn: req.session.data['selected-progressive-enhancement-trust-ukprn'],
                companyHouseNumber: req.session.data['selected-progressive-enhancement-trust-company-house']
            };
            
            // Clear the temporary selection data
            delete req.session.data['selected-progressive-enhancement-trust-name'];
            delete req.session.data['selected-progressive-enhancement-trust-ukprn'];
            delete req.session.data['selected-progressive-enhancement-trust-company-house'];
            
            // Redirect back to summary page
            return res.redirect('incoming-trust-progressive-enhancement-summary');
        } else {
            // If not confirmed, go back to search
            return res.redirect('incoming-trust-progressive-enhancement-search');
        }
    });

    // ACADEMIES PROGRESSIVE ENHANCEMENT ROUTES
    
    // GET handler for academies progressive enhancement search
    router.get('/' + version + '/academies-to-transfer-search-progressive', function (req, res) {
        console.log('Academies search route - academies data:', data.academies);
        
        res.render(version + '/academies-to-transfer-search-progressive', {
            data: req.session.data,
            academies: data.academies
        });
    });

    // GET handler for academies progressive enhancement confirmation
    router.get('/' + version + '/academies-to-transfer-confirmation-progressive', function (req, res) {
        const selectedAcademyName = req.query['academies-to-transfer-progressive-enhancement-search'];
        
        console.log('Academies confirmation route - query params:', req.query);
        console.log('Selected academy name:', selectedAcademyName);
        
        if (!selectedAcademyName) {
            console.log('No academy name found, redirecting to search');
            return res.redirect('academies-to-transfer-search-progressive');
        }
        
        // Find the selected academy details from the data
        const selectedAcademy = data.academies.find(academy => academy.name === selectedAcademyName);
        
        if (selectedAcademy) {
            // Store the selected academy details in session for the confirmation page
            req.session.data['selected-progressive-enhancement-academy-name'] = selectedAcademy.name;
            req.session.data['selected-progressive-enhancement-academy-urn'] = selectedAcademy.urn;
            req.session.data['selected-progressive-enhancement-academy-postcode'] = selectedAcademy.postcode;
            req.session.data['selected-progressive-enhancement-academy-trust'] = selectedAcademy.academyTrust;
            
            res.render(version + '/academies-to-transfer-confirmation-progressive', {
                data: req.session.data,
                academyName: selectedAcademy.name,
                academyUrn: selectedAcademy.urn,
                academyPostcode: selectedAcademy.postcode,
                academyTrust: selectedAcademy.academyTrust
            });
        } else {
            // If academy not found, redirect back to search
            return res.redirect('academies-to-transfer-search-progressive');
        }
    });

    // GET handler for academies progressive enhancement summary
    router.get('/' + version + '/academies-to-transfer-summary-progressive', function (req, res) {
        res.render(version + '/academies-to-transfer-summary-progressive', {
            data: req.session.data
        });
    });

    // POST handler for academies progressive enhancement confirmation
    router.post('/' + version + '/academies-to-transfer-confirmation-progressive-handler', function (req, res) {
        const academyConfirmed = req.body['confirm-academy'];
        
        if (academyConfirmed === 'yes') {
            // Store the selected academy in session
            req.session.data['progressive-enhancement-selected-academy'] = {
                name: req.session.data['selected-progressive-enhancement-academy-name'],
                urn: req.session.data['selected-progressive-enhancement-academy-urn'],
                postcode: req.session.data['selected-progressive-enhancement-academy-postcode'],
                academyTrust: req.session.data['selected-progressive-enhancement-academy-trust']
            };
            
            // Clear the temporary selection data
            delete req.session.data['selected-progressive-enhancement-academy-name'];
            delete req.session.data['selected-progressive-enhancement-academy-urn'];
            delete req.session.data['selected-progressive-enhancement-academy-postcode'];
            delete req.session.data['selected-progressive-enhancement-academy-trust'];
            
            // Store the academy details temporarily for the flow
            req.session.data['temp-academy-details'] = {
                name: req.session.data['progressive-enhancement-selected-academy'].name,
                urn: req.session.data['progressive-enhancement-selected-academy'].urn,
                postcode: req.session.data['progressive-enhancement-selected-academy'].postcode,
                academyTrust: req.session.data['progressive-enhancement-selected-academy'].academyTrust
            };

            // Redirect to proposed transfer date page
            return res.redirect('proposed-transfer-date-progressive');
        } else {
            // If not confirmed, go back to search
            return res.redirect('academies-to-transfer-search-progressive');
        }
    });

    // PROGRESSIVE ENHANCEMENT FLOW ROUTES
    
    // GET handler for proposed transfer date progressive
    router.get('/' + version + '/proposed-transfer-date-progressive', function (req, res) {
        res.render(version + '/proposed-transfer-date-progressive', {
            data: req.session.data
        });
    });

    // POST handler for proposed transfer date progressive
    router.post('/' + version + '/proposed-transfer-date-progressive-handler', function (req, res) {
        // Store the proposed transfer date
        const day = req.body['proposed-transfer-date-day'];
        const month = req.body['proposed-transfer-date-month'];
        const year = req.body['proposed-transfer-date-year'];
        
        req.session.data['proposed-transfer-date'] = {
            day: day,
            month: month,
            year: year
        };

        // Redirect to academy funding agreement page
        return res.redirect('academy-funding-agreement-progressive');
    });

    // GET handler for academy funding agreement progressive
    router.get('/' + version + '/academy-funding-agreement-progressive', function (req, res) {
        res.render(version + '/academy-funding-agreement-progressive', {
            data: req.session.data
        });
    });

    // POST handler for academy funding agreement progressive
    router.post('/' + version + '/academy-funding-agreement-progressive-handler', function (req, res) {
        const fundingAgreement = req.body['academy-funding-agreement'];
        
        // Store the funding agreement response
        req.session.data['academy-funding-agreement'] = fundingAgreement;

        if (fundingAgreement === 'yes') {
            // If Yes, go to diocesan consent page
            return res.redirect('diocesan-consent-progressive');
        } else {
            // If No, go to academy operating differently page
            return res.redirect('academy-operating-differently-progressive');
        }
    });

    // GET handler for diocesan consent progressive
    router.get('/' + version + '/diocesan-consent-progressive', function (req, res) {
        res.render(version + '/diocesan-consent-progressive', {
            data: req.session.data
        });
    });

    // POST handler for diocesan consent progressive
    router.post('/' + version + '/diocesan-consent-progressive-handler', function (req, res) {
        const diocesanConsent = req.body['diocesan-consent'];
        
        // Store the diocesan consent response
        req.session.data['diocesan-consent'] = diocesanConsent;

        if (diocesanConsent === 'yes') {
            // If Yes, go to upload consent page
            return res.redirect('upload-consent-progressive');
        } else {
            // If No, add academy to list and go to summary
            addAcademyToTransferList(req);
            return res.redirect('academies-to-transfer-summary-progressive');
        }
    });

    // GET handler for academy operating differently progressive
    router.get('/' + version + '/academy-operating-differently-progressive', function (req, res) {
        res.render(version + '/academy-operating-differently-progressive', {
            data: req.session.data
        });
    });

    // POST handler for academy operating differently progressive
    router.post('/' + version + '/academy-operating-differently-progressive-handler', function (req, res) {
        const operatingDifferently = req.body['academy-operating-differently'];
        
        // Store the operating differently response
        req.session.data['academy-operating-differently'] = operatingDifferently;

        // Add academy to list and go to summary
        addAcademyToTransferList(req);
        return res.redirect('academies-to-transfer-summary-progressive');
    });

    // GET handler for upload consent progressive
    router.get('/' + version + '/upload-consent-progressive', function (req, res) {
        res.render(version + '/upload-consent-progressive', {
            data: req.session.data
        });
    });

    // POST handler for upload consent progressive
    router.post('/' + version + '/upload-consent-progressive-handler', function (req, res) {
        // Handle file upload for consent
        if (req.files && req.files['consent-file']) {
            const uploadedFile = req.files['consent-file'];
            
            // Initialize consent files array if it doesn't exist
            if (!req.session.data['consent-files']) {
                req.session.data['consent-files'] = [];
            }
            
            // Add the new file to the array
            req.session.data['consent-files'].push({
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.mimetype
            });
            
            // Set success flag for banner
            req.session.data['file-upload-success'] = true;
            
            // Clear deletion success flag
            req.session.data['file-delete-success'] = false;
            delete req.session.data['deleted-file-name'];
        }
        
        // Redirect back to the upload consent page to show the file table
        res.redirect('upload-consent-progressive');
    });

    // POST handler for continuing directly from upload consent progressive (adds academy to list)
    router.post('/' + version + '/upload-consent-progressive-continue-direct', function (req, res) {
        // Add academy to list and go to summary
        addAcademyToTransferList(req);
        return res.redirect('academies-to-transfer-summary-progressive');
    });



    // POST handler for deleting consent files (progressive enhancement)
    router.post('/' + version + '/delete-consent-file-progressive', function (req, res) {
        const fileIndex = parseInt(req.body['file-index']);
        
        if (req.session.data['consent-files'] && req.session.data['consent-files'][fileIndex]) {
            // Get the file name before removing it for the success message
            const deletedFileName = req.session.data['consent-files'][fileIndex].name;
            
            // Remove the file at the specified index
            req.session.data['consent-files'].splice(fileIndex, 1);
            
            // Set success flag for deletion banner
            req.session.data['file-delete-success'] = true;
            req.session.data['deleted-file-name'] = deletedFileName;
            
            // Clear upload success flag
            req.session.data['file-upload-success'] = false;
        }
        
        // Redirect back to the upload consent page
        res.redirect('upload-consent-progressive');
    });

    // GET handler for downloading consent files (progressive enhancement)
    router.get('/' + version + '/download-consent-file-progressive/:index', function (req, res) {
        const fileIndex = parseInt(req.params.index);
        
        if (req.session.data['consent-files'] && req.session.data['consent-files'][fileIndex]) {
            const file = req.session.data['consent-files'][fileIndex];
            
            // Set headers for file download
            res.setHeader('Content-Type', file.type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            
            // For prototype purposes, create a simple text response
            // In a real application, this would serve the actual file from storage
            res.send(`This is a prototype file download for: ${file.name}\n\nFile size: ${(file.size / 1024 / 1024).toFixed(2)} MB\nFile type: ${file.type}\n\nThis is a simulated file download for demonstration purposes.`);
        } else {
            res.status(404).send('File not found');
        }
    });

    // POST handler for clearing upload success flag (progressive enhancement)
    router.post('/' + version + '/clear-upload-success-flag-progressive', function (req, res) {
        delete req.session.data['file-upload-success'];
        res.status(200).json({ success: true });
    });

    // POST handler for clearing delete success flag (progressive enhancement)
    router.post('/' + version + '/clear-delete-success-flag-progressive', function (req, res) {
        delete req.session.data['file-delete-success'];
        delete req.session.data['deleted-file-name'];
        res.status(200).json({ success: true });
    });

    // POST handler for clearing upload success flag (progressive enhancement)
    router.post('/' + version + '/clear-upload-success-flag-progressive', function (req, res) {
        delete req.session.data['file-upload-success'];
        res.status(200).json({ success: true });
    });

    // POST handler for clearing delete success flag (progressive enhancement)
    router.post('/' + version + '/clear-delete-success-flag-progressive', function (req, res) {
        delete req.session.data['file-delete-success'];
        delete req.session.data['deleted-file-name'];
        res.status(200).json({ success: true });
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
            },
            status: 'Signed'
        };
        
        // Check if we're updating an existing declaration
        const declarationIndex = req.body['declaration-index'];
        const trustName = req.session.data.selectedDeclarationTrust?.name;
        
        if (declarationIndex !== undefined && req.session.data['declarations'][declarationIndex]) {
            // Update existing declaration by index
            req.session.data['declarations'][declarationIndex] = declarationData;
        } else if (trustName && req.session.data['declarations']) {
            // Try to find existing declaration by trust name
            const existingIndex = req.session.data['declarations'].findIndex(declaration => 
                declaration.trust.name === trustName
            );
            
            if (existingIndex !== -1) {
                // Update existing declaration
                req.session.data['declarations'][existingIndex] = declarationData;
            } else {
                // Add new declaration to the array
                req.session.data['declarations'].push(declarationData);
            }
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
        const trustName = req.query.trust;
        let existingDeclaration = null;
        
        // If we have an index, find the declaration by index (for editing existing)
        if (declarationIndex !== undefined && req.session.data['declarations'] && req.session.data['declarations'][declarationIndex]) {
            existingDeclaration = req.session.data['declarations'][declarationIndex];
        }
        // If we have a trust name, find the declaration by trust name (for editing existing)
        else if (trustName && req.session.data['declarations']) {
            existingDeclaration = req.session.data['declarations'].find(declaration => 
                declaration.trust.name === trustName
            );
        }
        
        // Store the trust name in session for the form submission
        if (trustName) {
            req.session.data.selectedDeclarationTrust = {
                name: trustName,
                ref: '',
                companies: ''
            };
        }
        
        res.render(version + '/declaration-form', {
            data: req.session.data,
            existingDeclaration: existingDeclaration,
            declarationIndex: declarationIndex,
            trustName: trustName
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
        
        // Create unique list of outgoing trusts from academies
        let uniqueOutgoingTrusts = [];
        if (req.session.data['academies-to-transfer'] && req.session.data['academies-to-transfer'].length > 0) {
            const trustNames = req.session.data['academies-to-transfer'].map(academy => academy.academyTrust);
            uniqueOutgoingTrusts = [...new Set(trustNames)];
        }
        
        // Process incoming trust status
        let incomingTrustStatus = 'Not signed yet';
        if (req.session.data['declarations'] && req.session.data.selectedTrust) {
            const incomingDeclaration = req.session.data['declarations'].find(declaration => 
                declaration.trust.name === req.session.data.selectedTrust.name
            );
            if (incomingDeclaration) {
                incomingTrustStatus = incomingDeclaration.status || 'Signed';
            }
        }
        
        // Process outgoing trusts status
        let outgoingTrustsStatus = {};
        if (uniqueOutgoingTrusts.length > 0) {
            uniqueOutgoingTrusts.forEach(trustName => {
                const declaration = req.session.data['declarations'] ? req.session.data['declarations'].find(declaration => 
                    declaration.trust.name === trustName
                ) : null;
                outgoingTrustsStatus[trustName] = declaration ? (declaration.status || 'Signed') : 'Not signed yet';
            });
        }
        
        console.log('Debug - uniqueOutgoingTrusts:', uniqueOutgoingTrusts);
        console.log('Debug - outgoingTrustsStatus:', outgoingTrustsStatus);
        console.log('Debug - declarations:', req.session.data['declarations']);
        
        res.render(version + '/declaration-summary', {
            data: req.session.data,
            taskOwnerDisplay: taskOwnerDisplay,
            uniqueOutgoingTrusts: uniqueOutgoingTrusts,
            incomingTrustStatus: incomingTrustStatus,
            outgoingTrustsStatus: outgoingTrustsStatus
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

    // Members routes
    // GET handler for members summary
    router.get('/' + version + '/members-summary', function (req, res) {
        // Check if we have success messages
        const memberAdded = req.session.data['member-added'];
        const memberRemoved = req.session.data['member-removed'];
        const memberToRemoveAdded = req.session.data['member-to-remove-added'];
        const memberToRemoveRemoved = req.session.data['member-to-remove-removed'];
        
        // Clear success flags from session immediately
        delete req.session.data['member-added'];
        delete req.session.data['member-removed'];
        delete req.session.data['member-to-remove-added'];
        delete req.session.data['member-to-remove-removed'];
        
        res.render(version + '/members-summary', {
            data: req.session.data,
            memberAdded: memberAdded,
            memberRemoved: memberRemoved,
            memberToRemoveAdded: memberToRemoveAdded,
            memberToRemoveRemoved: memberToRemoveRemoved
        });
    });

    // GET handler for trustee summary
    router.get('/' + version + '/trustee-summary', function (req, res) {
        // Check if we have success messages
        const trusteeAdded = req.session.data['trustee-added'];
        const trusteeRemoved = req.session.data['trustee-removed'];
        const trusteeToRemoveAdded = req.session.data['trustee-to-remove-added'];
        const trusteeToRemoveRemoved = req.session.data['trustee-to-remove-removed'];
        
        // Clear success flags from session immediately
        delete req.session.data['trustee-added'];
        delete req.session.data['trustee-removed'];
        delete req.session.data['trustee-to-remove-added'];
        delete req.session.data['trustee-to-remove-removed'];
        
        res.render(version + '/trustee-summary', {
            data: req.session.data,
            trusteeAdded: trusteeAdded,
            trusteeRemoved: trusteeRemoved,
            trusteeToRemoveAdded: trusteeToRemoveAdded,
            trusteeToRemoveRemoved: trusteeToRemoveRemoved
        });
    });

    // GET handler for member-add - clear previous member data
    router.get('/' + version + '/member-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['member-full-name'];
        delete req.session.data['member-current-responsibilities'];
        delete req.session.data['member-future-role'];
        delete req.session.data['member-confirmed'];
        
        res.render(version + '/member-add');
    });

    // GET handler for member-to-remove-add - clear previous member data
    router.get('/' + version + '/member-to-remove-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['member-to-remove-full-name'];
        
        res.render(version + '/member-to-remove-add');
    });

    // Handle members summary form submission
    router.post('/' + version + '/members-summary', function (req, res) {
        // Handle completion status
        if (req.body['members-status'] !== undefined) {
            req.session.data['members-status'] = req.body['members-status'] === 'Complete';
        }

        // Handle member deletion confirmation
        if (req.body['confirm-delete-member'] !== undefined) {
            const confirmDelete = req.body['confirm-delete-member'];
            const memberIndex = parseInt(req.body['delete-member']);
            
            if (confirmDelete === 'yes' && req.session.data['members-to-add'] && req.session.data['members-to-add'][memberIndex]) {
                // Remove the member if confirmed
                const memberName = req.session.data['members-to-add'][memberIndex].name;
                req.session.data['members-to-add'].splice(memberIndex, 1);
                req.session.data['member-removed'] = memberName;
            }
            // If confirmDelete === 'no', do nothing - keep the member
        }

        // Handle member to remove deletion
        if (req.body['delete-member-to-remove'] !== undefined) {
            const memberIndex = parseInt(req.body['delete-member-to-remove']);
            if (req.session.data['members-to-remove'] && req.session.data['members-to-remove'][memberIndex]) {
                const memberName = req.session.data['members-to-remove'][memberIndex].name;
                req.session.data['members-to-remove'].splice(memberIndex, 1);
                req.session.data['member-to-remove-removed'] = memberName;
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

            // Set success flag for banner
            req.session.data['member-to-remove-added'] = fullName;

            // Clear the form field after storing the data
            delete req.session.data['member-to-remove-full-name'];
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
                    
                    // Set success flag for banner when member is fully added
                    req.session.data['member-added'] = fullName;
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

    // Handle member to remove deletion confirmation POST
    router.post('/' + version + '/confirm-delete-member-to-remove', function (req, res) {
        const confirmDelete = req.body['confirm-delete-member-to-remove'];
        const memberIndex = parseInt(req.body['delete-member-to-remove']);
        
        if (confirmDelete === 'yes' && req.session.data['members-to-remove'] && req.session.data['members-to-remove'][memberIndex]) {
            // Remove the member if confirmed
            const memberName = req.session.data['members-to-remove'][memberIndex].name;
            req.session.data['members-to-remove'].splice(memberIndex, 1);
            req.session.data['member-to-remove-removed'] = memberName;
        }
        // If confirmDelete === 'no', do nothing - keep the member
        
        res.redirect('members-summary');
    });

    // GET handler for trustee summary
    router.get('/' + version + '/trustee-summary', function (req, res) {
        // Check if we have success messages
        const trusteeAdded = req.session.data['trustee-added'];
        const trusteeRemoved = req.session.data['trustee-removed'];
        const trusteeToRemoveAdded = req.session.data['trustee-to-remove-added'];
        const trusteeToRemoveRemoved = req.session.data['trustee-to-remove-removed'];
        
        // Clear success flags from session immediately
        delete req.session.data['trustee-added'];
        delete req.session.data['trustee-removed'];
        delete req.session.data['trustee-to-remove-added'];
        delete req.session.data['trustee-to-remove-removed'];
        
        res.render(version + '/trustee-summary', {
            data: req.session.data,
            trusteeAdded: trusteeAdded,
            trusteeRemoved: trusteeRemoved,
            trusteeToRemoveAdded: trusteeToRemoveAdded,
            trusteeToRemoveRemoved: trusteeToRemoveRemoved
        });
    });

    // GET handler for trustee-add - clear previous trustee data
    router.get('/' + version + '/trustee-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['trustee-full-name'];
        delete req.session.data['trustee-current-responsibilities'];
        delete req.session.data['trustee-future-role'];
        delete req.session.data['trustee-confirmed'];
        delete req.session.data['trustee-local-governing-body'];
        
        res.render(version + '/trustee-add', {
            data: req.session.data
        });
    });

    // GET handler for trustee-to-remove-add - clear previous trustee data
    router.get('/' + version + '/trustee-to-remove-add', function (req, res) {
        // Clear form fields to ensure clean state when entering input fields
        delete req.session.data['trustee-to-remove-full-name'];
        
        res.render(version + '/trustee-to-remove-add');
    });

    // Handle trustees summary form submission
    router.post('/' + version + '/trustee-summary', function (req, res) {
        // Handle completion status
        if (req.body['trustee-status'] !== undefined) {
            req.session.data['trustee-status'] = req.body['trustee-status'] === 'Complete';
        }

        // Handle trustee deletion confirmation
        if (req.body['confirm-delete-trustee'] !== undefined) {
            const confirmDelete = req.body['confirm-delete-trustee'];
            const trusteeIndex = parseInt(req.body['delete-trustee']);
            
            if (confirmDelete === 'yes' && req.session.data['trustees-to-add'] && req.session.data['trustees-to-add'][trusteeIndex]) {
                // Remove the trustee if confirmed
                const trusteeName = req.session.data['trustees-to-add'][trusteeIndex].name;
                req.session.data['trustees-to-add'].splice(trusteeIndex, 1);
                req.session.data['trustee-removed'] = trusteeName;
            }
            // If confirmDelete === 'no', do nothing - keep the trustee
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

            // Set success flag for banner
            req.session.data['trustee-to-remove-added'] = fullName;

            // Clear the form field after storing the data
            delete req.session.data['trustee-to-remove-full-name'];
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
                    
                    // Set success flag for banner when trustee is fully added
                    req.session.data['trustee-added'] = fullName;
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

    // Handle trustee to remove deletion confirmation POST
    router.post('/' + version + '/confirm-delete-trustee-to-remove', function (req, res) {
        const confirmDelete = req.body['confirm-delete-trustee-to-remove'];
        const trusteeIndex = parseInt(req.body['delete-trustee-to-remove']);
        
        if (confirmDelete === 'yes' && req.session.data['trustees-to-remove'] && req.session.data['trustees-to-remove'][trusteeIndex]) {
            // Remove the trustee if confirmed
            const trusteeName = req.session.data['trustees-to-remove'][trusteeIndex].name;
            req.session.data['trustees-to-remove'].splice(trusteeIndex, 1);
            req.session.data['trustee-to-remove-removed'] = trusteeName;
        }
        // If confirmDelete === 'no', do nothing - keep the trustee
        
        res.redirect('trustee-summary');
    });





    // POST handler for deleting board resolution files
    router.post('/' + version + '/delete-board-resolution-file', function (req, res) {
        const trustIndex = req.body['trust-index'];
        const fileIndex = parseInt(req.body['file-index']);
        
        if (trustIndex !== undefined) {
            const actualTrustIndex = parseInt(trustIndex);
            
            if (req.session.data['board-resolution-files'] && 
                req.session.data['board-resolution-files'][actualTrustIndex] && 
                req.session.data['board-resolution-files'][actualTrustIndex][fileIndex]) {
                // Get the file name before removing it for the success message
                const deletedFileName = req.session.data['board-resolution-files'][actualTrustIndex][fileIndex].name;
                
                // Remove the file at the specified index from the specific trust
                req.session.data['board-resolution-files'][actualTrustIndex].splice(fileIndex, 1);
                
                // Set success flag for deletion banner
                req.session.data['file-delete-success'] = true;
                req.session.data['deleted-file-name'] = deletedFileName;
                
                // Clear upload success flag
                req.session.data['file-upload-success'] = false;
            }
            
            // Redirect back to the board resolution page for the specific trust
            return res.redirect(`outgoing-trusts-board-resolution?edit=${actualTrustIndex}`);
        } else {
            // Fallback: handle deletion from general files array (backward compatibility)
            if (req.session.data['board-resolution-files'] && req.session.data['board-resolution-files'][fileIndex]) {
                // Get the file name before removing it for the success message
                const deletedFileName = req.session.data['board-resolution-files'][fileIndex].name;
                
                // Remove the file at the specified index
                req.session.data['board-resolution-files'].splice(fileIndex, 1);
                
                // Set success flag for deletion banner
                req.session.data['file-delete-success'] = true;
                req.session.data['deleted-file-name'] = deletedFileName;
                
                // Clear upload success flag
                req.session.data['file-upload-success'] = false;
            }
            
            // Redirect back to the board resolution page
            return res.redirect('outgoing-trusts-board-resolution');
        }
    });

    // INCOMING TRUST PROGRESSIVE ENHANCEMENT ROUTES
    
    // GET handler for incoming trust progressive enhancement summary
    router.get('/' + version + '/incoming-trust-progressive-enhancement-summary', function (req, res) {
        res.render(version + '/incoming-trust-progressive-enhancement-summary', {
            data: req.session.data
        });
    });

    // GET handler for incoming trust progressive enhancement search
    router.get('/' + version + '/incoming-trust-progressive-enhancement-search', function (req, res) {
        const editIndex = req.query.edit;
        
        console.log('Search route - trusts data:', data.trusts);
        console.log('Edit index:', editIndex);
        
        res.render(version + '/incoming-trust-progressive-enhancement-search', {
            data: req.session.data,
            trusts: data.trusts,
            editIndex: editIndex
        });
    });

    // GET handler for incoming trust progressive enhancement confirmation
    router.get('/' + version + '/incoming-trust-progressive-enhancement-confirmation', function (req, res) {
        const editIndex = req.query.edit;
        const selectedTrustName = req.query['incoming-trust-progressive-enhancement-search'];
        
        console.log('Confirmation route - query params:', req.query);
        console.log('Selected trust name:', selectedTrustName);
        
        if (!selectedTrustName) {
            console.log('No trust name found, redirecting to search');
            return res.redirect('incoming-trust-progressive-enhancement-search');
        }
        
        // Find the selected trust details from the data
        const selectedTrust = data.trusts.find(trust => trust.name === selectedTrustName);
        
        if (selectedTrust) {
            // Store the selected trust details in session for the confirmation page
            req.session.data['selected-progressive-enhancement-trust-name'] = selectedTrust.name;
            req.session.data['selected-progressive-enhancement-trust-ukprn'] = selectedTrust.ukprn;
            req.session.data['selected-progressive-enhancement-trust-company-house'] = selectedTrust.companyHouseNumber;
            
            res.render(version + '/incoming-trust-progressive-enhancement-confirmation', {
                data: req.session.data,
                trustName: selectedTrust.name,
                trustUkprn: selectedTrust.ukprn,
                trustCompanyHouse: selectedTrust.companyHouseNumber,
                editIndex: editIndex
            });
        } else {
            // If trust not found, redirect back to search
            return res.redirect('incoming-trust-progressive-enhancement-search');
        }
    });

    // POST handler for incoming trust progressive enhancement confirmation
    router.post('/' + version + '/incoming-trust-progressive-enhancement-confirmation-handler', function (req, res) {
        const trustConfirmed = req.body['trust-confirmed'];
        const editIndex = req.body['edit'];
        
        if (trustConfirmed === 'Yes') {
            // Store the selected trust in session
            req.session.data['progressive-enhancement-selected-trust'] = {
                name: req.session.data['selected-progressive-enhancement-trust-name'],
                ukprn: req.session.data['selected-progressive-enhancement-trust-ukprn'],
                companyHouseNumber: req.session.data['selected-progressive-enhancement-trust-company-house']
            };
            
            // Clear the temporary selection data
            delete req.session.data['selected-progressive-enhancement-trust-name'];
            delete req.session.data['selected-progressive-enhancement-trust-ukprn'];
            delete req.session.data['selected-progressive-enhancement-trust-company-house'];
            
            // Redirect back to summary page
            return res.redirect('incoming-trust-progressive-enhancement-summary');
        } else {
            // If not confirmed, go back to search
            return res.redirect('incoming-trust-progressive-enhancement-search');
        }
    });









}