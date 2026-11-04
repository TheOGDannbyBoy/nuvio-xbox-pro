// Shared "go to" actions used by several screens.

import { router } from '../core/router.js';
import { settings } from '../core/store.js';
import { choicePanel, toast } from '../components/ui.js';
import { inLibrary, toggleLibrary } from './library.js';
import { isWatched, markWatched, dismissContinueWatching } from './progress.js';

export function openTitle(meta) {
  router.go(`details/${meta.type}/${encodeURIComponent(meta.id)}`, { preview: meta });
}

/** Controller long-press / context menu for a movie or series card. */
export async function openTitleActions(meta, { continueEntry = null } = {}) {
  const saved = inLibrary(meta.id);
  const watched = isWatched(meta.id);
  const action = await choicePanel({
    title: meta.name || 'Options',
    items: [
      { label: 'Open details', value: 'details' },
      { label: saved ? 'Remove from Library' : 'Add to Library', value: 'library' },
      { label: watched ? 'Mark unwatched' : 'Mark watched', value: 'watched' },
      continueEntry && !continueEntry.nextUp && { label: 'Start from beginning', value: 'restart' },
      continueEntry && { label: 'Remove from Continue Watching', value: 'continue-remove' },
    ].filter(Boolean),
  });
  if (action === 'details') openTitle(meta);
  else if (action === 'library') {
    toast(toggleLibrary(meta) ? 'Added to your library' : 'Removed from your library');
  } else if (action === 'watched') {
    markWatched(meta.id, null, null, !watched, { title: meta.name || '', type: meta.type });
    toast(watched ? 'Marked unwatched' : 'Marked watched');
  } else if (action === 'continue-remove') {
    dismissContinueWatching(meta.id);
    toast('Removed from Continue Watching');
  } else if (action === 'restart' && continueEntry) {
    resumeEntry(continueEntry, { restart: true });
  }
}

/** Opens the stream list for a movie (video null) or an episode. */
export function playVideo(meta, video, options = {}) {
  const videoId = video ? video.id : meta.id;
  router.go(`streams/${meta.type}/${encodeURIComponent(meta.id)}/${encodeURIComponent(videoId)}`, { meta, video, ...options });
}

/** Continue Watching: play the next episode, or resume with the last stream if we have it. */
export function resumeEntry(entry, { restart = false } = {}) {
  const meta = {
    id: entry.contentId,
    type: entry.contentType,
    name: entry.title,
    poster: entry.poster,
    background: entry.background,
    logo: entry.logo,
  };
  if (entry.nextUp && entry.next) {
    playVideo(meta, entry.next);
    return;
  }
  const video = entry.season != null
    ? { id: entry.videoId, season: entry.season, episode: entry.episode, name: entry.episodeTitle, thumbnail: entry.thumbnail }
    : null;
  if (!restart && settings.get('rememberLastStream') && entry.stream && entry.stream.url) {
    router.go('player', { meta, video, stream: entry.stream, fallbackToStreams: true });
    return;
  }
  playVideo(meta, video, { restart });
}
