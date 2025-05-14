module.exports = {
    'academies': [
        {
            name: "St George's Primary Academy",
            urn: "123456",
            postcode: "SW1A 1AA"
        },
        {
            name: "Hammersmith Primary Academy",
            urn: "123457",
            postcode: "W6 7BS"
        },
        {
            name: "Riverside Primary Academy",
            urn: "123458",
            postcode: "SE1 7PB"
        },
        {
            name: "Oak Tree Primary Academy",
            urn: "123459",
            postcode: "E1 6AN"
        },
        {
            name: "Meadowbrook Primary Academy",
            urn: "123460",
            postcode: "N1 9GU"
        },
        {
            name: "Sunnydale Primary Academy",
            urn: "123461",
            postcode: "NW1 4RY"
        },
        {
            name: "Greenfield Primary Academy",
            urn: "123462",
            postcode: "EC1A 1BB"
        },
        {
            name: "Valley Primary Academy",
            urn: "123463",
            postcode: "SW19 5AE"
        },
        {
            name: "Hillside Primary Academy",
            urn: "123464",
            postcode: "W1D 3AF"
        },
        {
            name: "Brookside Primary Academy",
            urn: "123465",
            postcode: "SE10 8EW"
        }
    ],
    'applications': [
        {
            'reference': "240315-ABC34",
            'dateStarted': "15/03/2024",
            'status': "Not submitted",
            'leadApplicant': "Zara Laney",
            'taskOwners': {
                'academies': "",
                'incomingTrust': "",
                'finance': ""
            },
            'contributors': [
                {
                    name: "Zara Laney",
                    email: "zara.laney@education.gov.uk"
                }
            ]
        },
        {
            'reference': "240315-XYZ45",
            'dateStarted': "15/03/2024",
            'status': "Not submitted",
            'leadApplicant': "John Smith",
            'taskOwners': {
                'academies': "sarah.johnson@education.gov.uk",
                'incomingTrust': "michael.brown@education.gov.uk",
                'finance': ""
            },
            'contributors': [
                {
                    name: "John Smith",
                    email: "john.smith@education.gov.uk"
                },
                {
                    name: "Sarah Johnson",
                    email: "sarah.johnson@education.gov.uk"
                },
                {
                    name: "Michael Brown",
                    email: "michael.brown@education.gov.uk"
                }
            ],
            'academies-to-transfer': ["123457"]
        }
    ]
}