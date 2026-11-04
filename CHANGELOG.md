# Changelog

A release's notes come from its section here (the heading must match the tag), and the app shows them when it offers the update.

## v1.4.0
- **Xbox playback:** clear the VLC video surface when a source changes so a previous stream's last frame cannot remain over the new stream's audio.
- **Xbox scrolling:** defer off-screen Home rows, add-on cards and menu items to reduce unnecessary WebView layout and painting.
- **Account sign-out:** remove the active profile's cached add-ons on sign-out; keep the local library and device integrations such as TorBox.
- **Playback startup:** keep the loading screen until LibVLC creates a video output with real dimensions. If audio starts but video output does not appear within 20 seconds, show an error with a path to another source.
- **Stream selection:** choose manual selection, automatic first playable source, or an automatic regex match; configure how long addons have to respond. If automatic playback cannot start, the source list remains available.
- **Custom stream badges:** import up to three Nuvio-compatible badge JSON sets and show their names, images and colors on matching streams.
- **Controller actions:** hold A on a title card to open its actions, including library, watched and Continue Watching options.
- **Sources:** the player always opens the complete source list, including torrent results and playback started from Continue Watching.
- **Automatic recovery:** on a failed stream, try up to three alternative sources, preferring HDR/SDR over Dolby Vision. Torrentio results can resolve through a connected TorBox account when cached. The source picker remains available if none work.
- **HTTP streams:** report unknown file lengths correctly to LibVLC and accept ranged responses whose total length is unknown.
- Record the video codec in the local playback log for future format diagnosis.

## v1.3.0
- **Jellyfin and Emby:** add your server in Settings → Integrations (Quick Connect or username and password). Its libraries become rows on Home and are searchable, and its files play here directly in their original quality, also listed among your other streams for the same title. Resume points and watched marks come in from the server, and what you watch here goes back to it.
- **Trakt:** connect with a code in Settings → Integrations. What you play is scrobbled, your Trakt history and paused progress come into watched marks and Continue Watching, your watchlist and recommendations are rows on Home, and watched marks you set here go to Trakt.

## v1.2.0
- **Who's watching?** When your Nuvio account has several profiles, the app asks who's watching when it starts, with the PIN for locked profiles. You can turn this off in Settings → Account.
- **Update notices:** the app tells you when a newer release is out, with a QR code to the download. Settings → About → Check for updates checks right away.
- **View log** in Settings → About shows the app's log on the TV, for this session and the last one.
- Sync only fetches what changed since the last sync, like Nuvio's own apps.

## v1.1.0
- Sign in to Nuvio with a code (scan the QR code with your phone) or with email.
- Import addons, library and Continue Watching from a Stremio account.
- Built-in debrid: play torrent results through TorBox, Real-Debrid or Premiumize.
- Cast photos and "More like this" with a TMDB key.
- Gentler sync: progress is sent at most once a minute, and the app backs off when the server is busy.
- The controller pointer is off on Xbox; the D-pad moves the highlight.

## v1.0.0
- First release: Nuvio's layout for the TV, Stremio addons, and VLC playback for MKV, HEVC, Dolby Vision/HDR and lossless audio.
