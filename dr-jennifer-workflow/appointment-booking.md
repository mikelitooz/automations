```json
{
  "nodes": [
    {
      "parameters": {
        "jsCode": "// Get input data (Cal.com webhook usually sends an array)\nconst data = items[0].json;\n\n// Extract doctor name from eventTitle\n// e.g. \"Appointment with Dr. Jennifer\"\nconst doctorMatch = data.eventTitle.match(/Dr\\.?\\s*\\w+/i);\nconst doctorName = doctorMatch ? doctorMatch[0].trim() : \"Unknown Doctor\";\n\n// Format start time\nconst startTime = new Date(data.startTime);\n\n// ISO format with timezone offset (good for scheduling triggers)\nconst machineReadableTime = startTime.toISOString();\n\nconst start = new Date(data.startTime);\nconst humanDate = start.toLocaleDateString('en-US', {\n  weekday: 'long',\n  month: 'long',\n  day: 'numeric',\n});\nconst humanTime = start.toLocaleTimeString('en-US', {\n  hour: '2-digit',\n  minute: '2-digit',\n});\n\n// Extract appointment type if available, fallback to \"Consultation\"\nconst appointmentType = data.responses.appointmentType.value || \"Consultation\";\n\n// Return both formats for flexibility\nreturn [\n  {\n    json: {\n      Date: humanDate,\n      Time: humanTime,\n      doctorName,\n      machineReadableTime,\n      appointmentType,\n    }\n  }\n];\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -496,
        432
      ],
      "id": "e29570b9-1235-4465-bda0-e9b22aa397fb",
      "name": "format date and time to human readable format"
    },
    {
      "parameters": {
        "events": [
          "BOOKING_CREATED"
        ],
        "options": {}
      },
      "type": "n8n-nodes-base.calTrigger",
      "typeVersion": 2,
      "position": [
        -704,
        432
      ],
      "id": "027132b5-6977-41e6-bce4-1b4eaf9e3a6f",
      "name": "Cal.com Trigger",
      "webhookId": "5e72403a-30a9-4bfd-bb3b-f7663ed7bc84",
      "credentials": {
        "calApi": {
          "id": "0kClI1PjxBFDOm6a",
          "name": "Cal account"
        }
      }
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y",
          "mode": "list",
          "cachedResultName": "Medical_Workflow",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y/edit#gid=0"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "Appointment_Uid": "={{ $('Cal.com Trigger').item.json.uid }}",
            "Date": "={{ $json.Date }}",
            "Time": "={{ $json.Time }}",
            "ISO_Time_Format": "={{ $('Cal.com Trigger').item.json.startTime }}",
            "Patient_Name": "={{ $('Cal.com Trigger').item.json.attendees[0].name }}",
            "Patient_Email": "={{ $('Cal.com Trigger').item.json.attendees[0].email }}",
            "Patient_Phone": "={{ $('Cal.com Trigger').item.json.attendees[0].phoneNumber }}",
            "Doctor_Name": "={{ $json.doctorName }}",
            "Appointment_Type": "={{ $('Cal.com Trigger').item.json.userFieldsResponses.appointmentType.value }}",
            "Status": "Pending",
            "48hr_Reminder_Sent": "FALSE",
            "24hr_Reminder_Sent": "FALSE",
            "2hr_Reminder_Sent": "FALSE"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "Appointment_Uid",
              "displayName": "Appointment_Uid",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Date",
              "displayName": "Date",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Time",
              "displayName": "Time",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Patient_Name",
              "displayName": "Patient_Name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Patient_Phone",
              "displayName": "Patient_Phone",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Patient_Email",
              "displayName": "Patient_Email",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Doctor_Name",
              "displayName": "Doctor_Name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Appointment_Type",
              "displayName": "Appointment_Type",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Status",
              "displayName": "Status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "48hr_Reminder_Sent",
              "displayName": "48hr_Reminder_Sent",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "24hr_Reminder_Sent",
              "displayName": "24hr_Reminder_Sent",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "2hr_Reminder_Sent",
              "displayName": "2hr_Reminder_Sent",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Confirmed_At",
              "displayName": "Confirmed_At",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Confirmed_Via",
              "displayName": "Confirmed_Via",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Cancelled_At",
              "displayName": "Cancelled_At",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Cancelled_Via",
              "displayName": "Cancelled_Via",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Cancellation_Reason",
              "displayName": "Cancellation_Reason",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Rescheduled_At",
              "displayName": "Rescheduled_At",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Rescheduled_Via",
              "displayName": "Rescheduled_Via",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Staff_Alerted",
              "displayName": "Staff_Alerted",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "ISO_Time_Format",
              "displayName": "ISO_Time_Format",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        -288,
        432
      ],
      "id": "fab77a57-a811-483e-a2e8-9c52a939ecb8",
      "name": "Append row in sheet",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "Gu4sptcmPE5XoUXG",
          "name": "Google Sheets account"
        }
      }
    },
    {
      "parameters": {
        "content": "**PATIENTS BOOK APPOINTMENT VIA CAL.COM AND THE GOOGLE SHEET IS AUTOMATICALLY POPULATED WITH THEIR DATA** ",
        "height": 272,
        "width": 912
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        -912,
        336
      ],
      "typeVersion": 1,
      "id": "5f86e065-d3ae-4d26-a072-7a1ce7dd7d19",
      "name": "Sticky Note1"
    }
  ],
  "connections": {
    "format date and time to human readable format": {
      "main": [
        [
          {
            "node": "Append row in sheet",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Cal.com Trigger": {
      "main": [
        [
          {
            "node": "format date and time to human readable format",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "format date and time to human readable format": [
      {
        "Date": "Friday, October 31",
        "Time": "03:45 PM",
        "doctorName": "Dr. Jennifer",
        "machineReadableTime": "2025-10-31T15:45:00.000Z",
        "appointmentType": "Consultation"
      }
    ],
    "Cal.com Trigger": [
      {
        "triggerEvent": "BOOKING_CREATED",
        "createdAt": "2025-10-30T23:02:34.593Z",
        "bookerUrl": "https://cal.com",
        "title": "Appointment with Dr. Jennifer between Izzy Dev and Lisa P Huston",
        "startTime": "2025-10-31T15:45:00Z",
        "endTime": "2025-10-31T16:00:00Z",
        "additionalNotes": "",
        "type": "appointment-with-dr.-jennifer",
        "description": "Appointment with Dr. Jennifer",
        "eventTypeId": 3783211,
        "hideCalendarNotes": false,
        "hideCalendarEventDetails": false,
        "hideOrganizerEmail": false,
        "schedulingType": null,
        "seatsPerTimeSlot": null,
        "seatsShowAttendees": true,
        "seatsShowAvailabilityCount": true,
        "customReplyToEmail": null,
        "disableRescheduling": false,
        "disableCancelling": false,
        "organizer": {
          "id": 1880671,
          "name": "Izzy Dev",
          "email": "chiizzy12a@gmail.com",
          "username": "izzydevbuilds",
          "timeZone": "Africa/Lagos",
          "language": {
            "locale": "en"
          },
          "timeFormat": "h:mma",
          "utcOffset": 60
        },
        "attendees": [
          {
            "email": "izzydevbuilds@gmail.com",
            "name": "Lisa P Huston",
            "phoneNumber": "+17062745479",
            "firstName": "",
            "lastName": "",
            "timeZone": "Africa/Lagos",
            "language": {
              "locale": "en"
            },
            "utcOffset": 60
          }
        ],
        "customInputs": {},
        "responses": {
          "name": {
            "label": "your_name",
            "value": "Lisa P Huston",
            "isHidden": false
          },
          "email": {
            "label": "email_address",
            "value": "izzydevbuilds@gmail.com",
            "isHidden": false
          },
          "attendeePhoneNumber": {
            "label": "phone_number",
            "value": "+17062745479",
            "isHidden": false
          },
          "location": {
            "label": "location",
            "value": {
              "value": "1600 Pennsylvania Avenue NW, Washington, D.C. 20500. ",
              "optionValue": ""
            },
            "isHidden": false
          },
          "title": {
            "label": "what_is_this_meeting_about",
            "isHidden": true
          },
          "notes": {
            "label": "additional_notes",
            "isHidden": true
          },
          "guests": {
            "label": "additional_guests",
            "value": [],
            "isHidden": true
          },
          "rescheduleReason": {
            "label": "reason_for_reschedule",
            "isHidden": true
          },
          "appointmentType": {
            "label": "Appointment Type",
            "value": "Consultation",
            "isHidden": false
          }
        },
        "userFieldsResponses": {
          "appointmentType": {
            "label": "Appointment Type",
            "value": "Consultation",
            "isHidden": false
          }
        },
        "location": "1600 Pennsylvania Avenue NW, Washington, D.C. 20500. ",
        "destinationCalendar": [
          {
            "id": 923367,
            "integration": "google_calendar",
            "externalId": "chiizzy12a@gmail.com",
            "primaryEmail": "chiizzy12a@gmail.com",
            "userId": 1880671,
            "eventTypeId": null,
            "credentialId": 1471831,
            "createdAt": "2025-10-30T13:45:46.463Z",
            "updatedAt": "2025-10-30T13:45:46.463Z",
            "delegationCredentialId": null,
            "domainWideDelegationCredentialId": null
          }
        ],
        "iCalUID": "wRfLonh68vsBTj7z54FRuc@Cal.com",
        "iCalSequence": 0,
        "requiresConfirmation": false,
        "oneTimePassword": null,
        "uid": "wRfLonh68vsBTj7z54FRuc",
        "appsStatus": [
          {
            "appName": "google-calendar",
            "type": "google_calendar",
            "success": 1,
            "failures": 0,
            "errors": [],
            "warnings": []
          }
        ],
        "eventTitle": "Appointment with Dr. Jennifer",
        "eventDescription": "Appointment with Dr. Jennifer",
        "price": 0,
        "currency": "usd",
        "length": 15,
        "bookingId": 12294431,
        "metadata": {},
        "status": "ACCEPTED"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "7b3125be3eb2b56ab7606a684daa96104964f42d4c53676367f2a84787aca813"
  }
}
```