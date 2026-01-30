```javascript
/**
 * Prepare mass email with Cal.com booking link
 * Format: https://cal.com/izzydevbuilds/appointment-with-dr.-jennifer?slot=2025-10-31T09:00:00.000Z
 */

const webhookData = $('Webhook Trigger').first().json.body;
const waitlistPatients = $input.all();

// DEBUG: Log what we received from the webhook
console.log('🔍 DEBUG: Webhook data received:', JSON.stringify(webhookData, null, 2));

// Extract all emails for BCC (using correct field name from your Google Sheet)
const emails = waitlistPatients.map(p => p.json["Email Address"]).filter(Boolean);

// Use the ISO time format directly from webhook
const isoTimeFormat = webhookData.isoTimeFormat; // e.g., "2025-11-05T15:58:27.125Z"
const doctorName = webhookData.doctorName;
const appointmentType = webhookData.appointmentType;
const reason = webhookData.reason || "cancelled";

console.log(`🔍 DEBUG: Using ISO time format: ${isoTimeFormat}`);
console.log(`🔍 DEBUG: Doctor: ${doctorName}, Type: ${appointmentType}, Reason: ${reason}`);

const reasonText = reason === "rescheduled"
  ? "has been RESCHEDULED and this slot"
  : "has been CANCELLED and this slot";

// Use isoTimeFormat directly for Cal.com slot parameter
let slotISO = "";
let readableDate = "";
let readableTime = "";

try {
  if (isoTimeFormat) {
    slotISO = isoTimeFormat; // Use as-is for Cal.com URL

    // Create readable date/time for email display
    const dateObj = new Date(isoTimeFormat);

    // Format date: "October 31, 2025"
    readableDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format time: "3:45 PM"
    readableTime = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    console.log(`✅ Parsed ISO time successfully - Date: ${readableDate}, Time: ${readableTime}`);
  } else {
    console.error('⚠️ WARNING: isoTimeFormat is missing from webhook data');
    slotISO = ""; // Fallback to no pre-fill
    readableDate = "TBD";
    readableTime = "TBD";
  }
} catch (error) {
  console.error(`❌ Error parsing ISO time format: ${error.message}`);
  slotISO = ""; // Fallback to no pre-fill
  readableDate = "TBD";
  readableTime = "TBD";
}

// Build Cal.com booking URL
const calcomBaseUrl = "https://cal.com/izzydevbuilds/appointment-with-dr.-jennifer";
const calcomBookingUrl = slotISO
  ? `${calcomBaseUrl}?slot=${encodeURIComponent(slotISO)}`
  : calcomBaseUrl; // Fallback to generic URL if parsing fails

console.log(`📅 Cal.com booking URL: ${calcomBookingUrl}`);

return [{
  json: {
    bccEmails: emails.join(", "),
    slotDate: readableDate,
    slotTime: readableTime,
    slotDoctor: doctorName,
    slotType: appointmentType,
    reasonText: reasonText,
    waitlistCount: emails.length,
    calcomBookingUrl: calcomBookingUrl,
    slotISO: slotISO, // Include raw ISO format for debugging
    webhookData: webhookData
  }
}];
```


this `timeStr` (e.g 09:45:00) and `dateStr` (e.g 14/11/2025) are currently being used to calculate the `slotTime` and `slotDate`. and this is causing it to render inaccurate time. use the `isoTimeFormat` (e.g 2025-11-05T15:58:27.125Z) instead to give a accurate time slot