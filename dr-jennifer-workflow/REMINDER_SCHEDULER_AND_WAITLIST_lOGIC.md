Here is a summary of how the n8n Scheduler — Time-Based Triggers works

Create three independent time triggers relative to startTime:

a. 48h Before Trigger

➡️ Connect to 48h Reminder Email Node
➡️ Then → Wait for Response (Gmail Trigger)
➡️ Then → Update Sheet (Confirmed? / Cancelled / Reschedule)
➡️ If Cancelled → Trigger Waitlist Email Flow

b. 24h Before Trigger

➡️ Check “Confirmed?” (Google Sheets > Lookup Row)
➡️ If Confirmed? = No → Send Reminder + Warning Email
➡️ If Confirmed? = Yes → Send Simple Reminder

c. 2h Before Trigger

➡️ Check “Confirmed?” again
➡️ If Yes → Send Final Reminder Email
➡️ If No →

Update Sheet (Status = Cancelled)

Trigger Waitlist Notification

First YES Reply → Assign Slot → Update Sheet



N.B: DONT CREATE THIS WORKFLOW YET, I JUST WANT YOU TO HAVE AN UNDERSTANDING OF THE BIGGER PICTURE

Here is a summary of how the waitlist works based on our plan.

---
### How a Patient Joins the Waitlist

A patient joins the waitlist when they need an appointment sooner than what is available on the public calendar.

1.  **Sign-Up:** They fill out a simple "Join Waitlist" form (a Google Form) on the clinic's website with their name, email, and phone number.
2.  **Automatic Entry:** An n8n workflow instantly takes their submission and adds them to the `Waitlist` tab in the master Google Sheet. This process is fully automated.

---
### How a Waitlist Slot is Filled

The system is designed to be a fast, "first come, first served" process to ensure cancelled slots are filled immediately.

1.  **A Slot Opens:** When a patient cancels their appointment, the automation marks that time slot as `AVAILABLE` in the `Appointments` sheet.
2.  **Mass Notification:** This action immediately triggers a notification email that is sent to **everyone** on the waitlist. The email clearly states the doctor, date, and time of the opening.
3.  **First Reply Wins:** The very first person to reply to that email with "YES" claims the appointment.
4.  **System Updates:** The n8n workflow automatically:
    * **Updates** the `Appointments` sheet, replacing `AVAILABLE` with the new patient's details and setting the status to `✅ Confirmed`.
    * **Sends** a confirmation email to the successful patient.
    * **Removes** that patient from the `Waitlist` sheet.