# Incoming call ringtone update

This update adds separate per-browser voice/video ringtone preferences in Settings and a Test button for each. Incoming calls trigger a repeating Web Audio ringtone while the ConnectChat page is running and the browser permits audio playback. It stops when the call is answered, declined, ended, or the caller hangs up.

## Important browser limitation
A normal website cannot guarantee continuous custom ringing when its page is closed or suspended. Web Push can display an incoming-call notification in the background, but background audio and true call-style full-screen incoming-call UI are restricted by browsers and operating systems. For reliable native incoming-call behavior, build platform-specific Android/iOS apps (Android foreground service/full-screen intent; iOS PushKit/CallKit, subject to Apple's requirements).

## Deploy
Deploy the `connectchat` folder as the site root. Keep Firebase Admin/service-account credentials out of this ZIP and out of browser files. Store server credentials only as Supabase Edge Function secrets. The existing FCM push Edge Function remains separate; this change does not implement background call push delivery or native call answering.
