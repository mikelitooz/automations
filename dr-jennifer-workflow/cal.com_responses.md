Booking Response

```json
[
  {
    "triggerEvent": "BOOKING_CREATED",
    "createdAt": "2025-11-04T21:39:41.319Z",
    "bookerUrl": "https://cal.com",
    "title": "Appointment with Dr. Jennifer between Izzy Dev and Chinwuba Israel chukwudi",
    "startTime": "2025-11-18T09:30:00Z",
    "endTime": "2025-11-18T09:45:00Z",
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
        "name": "Chinwuba Israel chukwudi",
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
        "value": "Chinwuba Israel chukwudi",
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
        "value": "Follow-up",
        "isHidden": false
      }
    },
    "userFieldsResponses": {
      "appointmentType": {
        "label": "Appointment Type",
        "value": "Follow-up",
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
    "iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com",
    "iCalSequence": 0,
    "requiresConfirmation": false,
    "oneTimePassword": null,
    "uid": "3LpAwYNWsfRYM1qcxtYeUZ",
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
    "bookingId": 12439850,
    "metadata": {},
    "status": "ACCEPTED"
  }
]
```

Reschedule Response

```json
[
  {
    "triggerEvent": "BOOKING_RESCHEDULED",
    "createdAt": "2025-11-04T21:41:50.930Z",
    "bookerUrl": "https://cal.com",
    "title": "Appointment with Dr. Jennifer between Izzy Dev and Chinwuba Israel chukwudi",
    "startTime": "2025-11-20T10:15:00Z",
    "endTime": "2025-11-20T10:30:00Z",
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
        "name": "Chinwuba Israel chukwudi",
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
        "value": "Chinwuba Israel chukwudi",
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
        "value": "Follow-up",
        "isHidden": false
      }
    },
    "userFieldsResponses": {
      "appointmentType": {
        "label": "Appointment Type",
        "value": "Follow-up",
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
    "iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com",
    "iCalSequence": 1,
    "requiresConfirmation": false,
    "oneTimePassword": null,
    "uid": "cp96d6UZfisqb5MqJSTMbj",
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
    "bookingId": 12439935,
    "rescheduleId": 12439850,
    "rescheduleUid": "3LpAwYNWsfRYM1qcxtYeUZ",
    "rescheduleStartTime": "2025-11-18T09:30:00Z",
    "rescheduleEndTime": "2025-11-18T09:45:00Z",
    "metadata": {},
    "status": "ACCEPTED"
  }
]
```

Cancelled Response

```json
[
  {
    "triggerEvent": "BOOKING_CANCELLED",
    "createdAt": "2025-11-04T21:42:53.861Z",
    "bookerUrl": "https://cal.com",
    "title": "Appointment with Dr. Jennifer between Izzy Dev and Chinwuba Israel chukwudi",
    "length": 15,
    "type": "appointment-with-dr.-jennifer",
    "additionalNotes": "",
    "description": "Appointment with Dr. Jennifer",
    "customInputs": {},
    "eventTypeId": 3783211,
    "userFieldsResponses": {
      "appointmentType": {
        "label": "Appointment Type",
        "value": "Follow-up",
        "isHidden": false
      }
    },
    "responses": {
      "name": {
        "label": "your_name",
        "value": "Chinwuba Israel chukwudi",
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
          "value": "inPerson",
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
        "value": "Follow-up",
        "isHidden": false
      }
    },
    "startTime": "2025-11-20T10:15:00+00:00",
    "endTime": "2025-11-20T10:30:00+00:00",
    "organizer": {
      "id": 1880671,
      "username": "izzydevbuilds",
      "email": "chiizzy12a@gmail.com",
      "name": "Izzy Dev",
      "timeZone": "Africa/Lagos",
      "timeFormat": "h:mma",
      "language": {
        "locale": "en"
      },
      "utcOffset": 60
    },
    "attendees": [
      {
        "name": "Chinwuba Israel chukwudi",
        "email": "izzydevbuilds@gmail.com",
        "timeZone": "Africa/Lagos",
        "phoneNumber": "+17062745479",
        "language": {
          "locale": "en"
        },
        "utcOffset": 60
      }
    ],
    "uid": "cp96d6UZfisqb5MqJSTMbj",
    "bookingId": 12439935,
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
    "cancellationReason": "",
    "seatsPerTimeSlot": null,
    "seatsShowAttendees": false,
    "iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com",
    "iCalSequence": 2,
    "hideOrganizerEmail": false,
    "customReplyToEmail": null,
    "eventTitle": "Appointment with Dr. Jennifer",
    "eventDescription": "Appointment with Dr. Jennifer",
    "requiresConfirmation": null,
    "price": null,
    "currency": "usd",
    "status": "CANCELLED"
  }
]
```

Confirmed Booking Response

```json
{
  "status": "success",
  "data": {
    "id": 12467473,
    "uid": "khRRUmiQaEHsJ16LuEn5wQ",
    "title": "Appointment with Dr. Jennifer between Izzy Dev and Alpha Juno",
    "description": "",
    "hosts": [
      {
        "id": 1880671,
        "name": "Izzy Dev",
        "email": "chiizzy12a@gmail.com",
        "username": "izzydevbuilds",
        "timeZone": "Africa/Lagos"
      }
    ],
    "status": "accepted",
    "rescheduledByEmail": null,
    "rescheduledToUid": "rvjegHnt2pZvXxACWZo883",
    "start": "2025-11-06T14:30:00.000Z",
    "end": "2025-11-06T14:45:00.000Z",
    "duration": 15,
    "eventTypeId": 3783211,
    "eventType": { "id": 3783211, "slug": "appointment-with-dr.-jennifer" },
    "meetingUrl": "1600 Pennsylvania Avenue NW, Washington, D.C. 20500. ",
    "location": "1600 Pennsylvania Avenue NW, Washington, D.C. 20500. ",
    "absentHost": false,
    "createdAt": "2025-11-05T15:53:23.308Z",
    "updatedAt": "2025-11-05T22:14:46.842Z",
    "metadata": {},
    "rating": null,
    "icsUid": "khRRUmiQaEHsJ16LuEn5wQ@Cal.com",
    "attendees": [
      {
        "name": "Alpha Juno",
        "email": "alphajuno4@gmail.com",
        "timeZone": "Africa/Lagos",
        "language": "en",
        "absent": false,
        "phoneNumber": "+16692215958"
      }
    ],
    "guests": [],
    "bookingFieldsResponses": {
      "email": "alphajuno4@gmail.com",
      "attendeePhoneNumber": "+16692215958",
      "name": "Alpha Juno",
      "guests": [],
      "location": { "value": "inPerson", "optionValue": "" },
      "appointmentType": "Consultation"
    }
  }
}
```
