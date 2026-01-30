NB:I'm using a differnt google sheet called `Medical_Workflow` now

here's the new structure fields for the google sheet

```Appointment_Uid	Date	Time	Patient_Name	Patient_Phone	Patient_Email	Doctor_Name	Appointment_Type	Status	48hr_Reminder_Sent	24hr_Reminder_Sent	2hr_Reminder_Sent	Confirmed_At	Confirmed_Via	Cancelled_At	Cancelled_Via	Cancellation_Reason	Rescheduled_At	Rescheduled_Via	Staff_Alerted	ISO_Time_Format
```

here's how i set up the sheet in my user submit cal.com form -> automatically google sheet user row created workflow

```json
{
  "nodes": [
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
        384,
        128
      ],
      "id": "fab77a57-a811-483e-a2e8-9c52a939ecb8",
      "name": "Append row in sheet",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "Y1gwrwMbRjL3iOV9",
          "name": "Google Sheets account"
        }
      }
    }
  ],
  "connections": {},
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "7b3125be3eb2b56ab7606a684daa96104964f42d4c53676367f2a84787aca813"
  }
}
```

Now update all the workflow you created to work with this new update