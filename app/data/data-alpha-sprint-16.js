module.exports = {
    'academies': [
        {
            name: "St George's Primary Academy",
            urn: "123456",
            postcode: "SW1A 1AA",
            academyTrust: "London Education Trust"
        },
        {
            name: "Hammersmith Primary Academy",
            urn: "123457",
            postcode: "W6 7BS",
            academyTrust: "London Education Trust"
        },
        {
            name: "Riverside Primary Academy",
            urn: "123458",
            postcode: "SE1 7PB",
            academyTrust: "London Education Trust"
        },
        {
            name: "Oak Tree Primary Academy",
            urn: "123459",
            postcode: "E1 6AN",
            academyTrust: "London Education Trust"
        },
        {
            name: "Meadowbrook Primary Academy",
            urn: "123460",
            postcode: "N1 9GU",
            academyTrust: "Northern Learning Trust"
        },
        {
            name: "Sunnydale Primary Academy",
            urn: "123461",
            postcode: "NW1 4RY",
            academyTrust: "Northern Learning Trust"
        },
        {
            name: "Greenfield Primary Academy",
            urn: "123462",
            postcode: "EC1A 1BB",
            academyTrust: "Northern Learning Trust"
        },
        {
            name: "Valley Primary Academy",
            urn: "123463",
            postcode: "SW19 5AE",
            academyTrust: "Southern Multi-Academy Trust"
        },
        {
            name: "Hillside Primary Academy",
            urn: "123464",
            postcode: "W1D 3AF",
            academyTrust: "Southern Multi-Academy Trust"
        },
        {
            name: "Brookside Primary Academy",
            urn: "123465",
            postcode: "SE10 8EW",
            academyTrust: "Southern Multi-Academy Trust"
        }
    ],
    'members': [
        {
            name: "John Smith",
            role: "Chair of Trustees",
            email: "john.smith@example.com"
        },
        {
            name: "Sarah Johnson",
            role: "Vice Chair",
            email: "sarah.johnson@example.com"
        },
        {
            name: "Michael Brown",
            role: "Trustee",
            email: "michael.brown@example.com"
        },
        {
            name: "Emma Wilson",
            role: "Trustee",
            email: "emma.wilson@example.com"
        },
        {
            name: "David Thompson",
            role: "Trustee",
            email: "david.thompson@example.com"
        },
        {
            name: "Lisa Davis",
            role: "Trustee",
            email: "lisa.davis@example.com"
        },
        {
            name: "Robert Miller",
            role: "Trustee",
            email: "robert.miller@example.com"
        },
        {
            name: "Jennifer Garcia",
            role: "Trustee",
            email: "jennifer.garcia@example.com"
        }
    ],
    'applications': [
        {
            'reference': "240315-ABC34",
            'dateStarted': "15 March 2025",
            'status': "Not submitted",
            'leadApplicant': "Arden Laney",
            'taskOwners': {
                'academies': "",
                'incomingTrust': "",
                'finance': "",
                'declaration': ""
            },
            'contributors': [
                {
                    name: "Arden Laney",
                    email: "arden.laney@test.org"
                }
            ]
        },
        {
            'reference': "240315-XYZ45",
            'dateStarted': "15 March 2025",
            'status': "Not submitted",
            'leadApplicant': "Arden Laney",
            'taskOwners': {
                'academies': ["arden.laney@test.org"],
                'incomingTrust': ["john.smith@test.org"],
                'finance': ["sarah.johnson@test.org"],
                'declaration': ""
            },
            'contributors': [
                {
                    name: "Arden Laney",
                    email: "arden.laney@test.org"
                },
                {
                    name: "John Smith",
                    email: "john.smith@test.org"
                },
                {
                    name: "Sarah Johnson",
                    email: "sarah.johnson@test.org"
                }
            ],
            'academies-to-transfer': ["123456", "123457"],
            'academies-to-transfer-status': true,
            'incoming-trust-status': false,
            'finance-status': false
        }
    ]
}