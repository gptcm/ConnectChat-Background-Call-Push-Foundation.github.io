# ConnectChat Background Call Push – Integration Notes

This update adds service-worker handling for FCM `incoming_call` data messages and Answer/Decline notification actions. It is a **foundation**, not a complete background calling implementation.

## Required FCM data payload

Send a data-only FCM message to the callee device token(s), for example:

```json
{
  "message": {
    "token": "FCM_DEVICE_TOKEN",
    "data": {
      "type": "incoming_call",
      "mode": "audio",
      "callId": "YOUR_CALL_SESSION_ID",
      "title": "Roney is calling",
      "body": "Incoming voice call",
      "url": "/?callId=YOUR_CALL_SESSION_ID"
    },
    "android": { "priority": "high", "ttl": "45s" },
    "webpush": { "headers": { "Urgency": "high", "TTL": "45" } }
  }
}
```

Use `mode: "video"` and suitable title/body for video calls. Do not put Firebase service-account credentials in frontend files or this ZIP.

## Important integration still required

The existing app starts WebRTC calls by sending an offer through its Supabase Realtime call channel. That channel is not a durable background wake-up mechanism. Your server must also send the FCM data message when an authenticated caller creates an incoming-call session, and must send a cancellation/end event when the caller hangs up or the call expires. The current app's call flow has not been changed to invoke such a server endpoint because a secure call-session endpoint and its database/signaling contract must be implemented together.

The notification actions open/focus ConnectChat with `incomingCall=answer` or `incomingCall=decline` query parameters. The page must validate the live call session and then perform the actual WebRTC accept/decline flow. This ZIP does not yet wire those query parameters into the call state machine; the user must not be shown as connected merely by tapping Answer.

## Sound and platform limitations

A service worker cannot reliably play an arbitrary looping audio file while the site is closed. Browser/OS notification sound is controlled by device notification settings and may be silent. `requireInteraction` keeps a call notification visible where supported; it does not guarantee a ringtone. Reliable full-screen incoming-call UI and background ringtone generally require a native Android/iOS app with platform call APIs (e.g. Android Telecom/CallStyle or iOS PushKit/CallKit, subject to platform rules). On the web, push delivery also depends on permission, installed/eligible browser support, power/network settings, and the device being online.

## Deploy

1. Deploy the updated `sw.js` with the site.
2. Ensure the FCM web-push setup and device-token registration already work.
3. Implement the secure server-side call-session trigger and client-side URL action handling described above before relying on Answer/Decline.
4. Test with the site closed on each target browser/device.

Never upload a Firebase service-account JSON key to GitHub or Cloudflare static assets. Store it only as a server-side Supabase secret.
