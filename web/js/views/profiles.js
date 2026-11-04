// "Who's watching?": picking a profile when the app starts, like Nuvio's TV app.

import { h, clear, icon, img } from '../core/dom.js';
import { focus } from '../core/focus.js';
import { bridge } from '../core/bridge.js';
import { settings } from '../core/store.js';
import { isSignedIn, cachedProfiles, pullProfiles, activeProfileIndex, verifyProfilePin, getServer } from '../services/account.js';
import { promptDialog, toast } from '../components/ui.js';

// Per app run: switching profile reloads the page, which shouldn't ask again.
const PICKED_KEY = 'nuvio:profilePicked';

export function profileName(profile) {
  return profile.name || `Profile ${profile.profile_index}`;
}

function avatarColor(profile) {
  const color = profile.avatar_color_hex || profile.avatarColorHex || '';
  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : '#2f6fed';
}

function avatarImageUrl(profile) {
  const direct = profile.avatar_url || profile.avatarUrl;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  // Nuvio's preset avatars are stored as PNG objects in the server's public avatars bucket.
  const id = profile.avatar_id || profile.avatarId;
  const server = id && getServer();
  if (!server || !id) return null;
  const name = String(id).trim().replace(/^\/+/, '');
  if (!name || name.includes('..')) return null;
  const assetPath = name.split('/').map(encodeURIComponent).join('/');
  const filename = name.split('/').pop();
  return `${server.backendUrl}/storage/v1/object/public/avatars/${filename.includes('.') ? assetPath : `${assetPath}.png`}`;
}

/** A profile's round avatar, with its initials kept as a fallback if the image is unavailable. */
export function profileAvatar(profile, cls) {
  const url = avatarImageUrl(profile);
  return h('span', { class: ['profile-avatar', cls], style: { background: avatarColor(profile) } },
    profileName(profile).trim().charAt(0).toUpperCase() || '?',
    url ? img(url, { class: 'profile-avatar-image', alt: '', onError: (event) => event.currentTarget.remove() }) : null);
}

/** Whether to ask now: at a fresh start, signed in, with more than one profile. */
export function shouldAskProfile() {
  if (!settings.get('askProfileAtLaunch') || !isSignedIn() || cachedProfiles().length < 2) return false;
  try {
    return !sessionStorage.getItem(PICKED_KEY);
  } catch {
    return false;
  }
}

export function rememberProfilePicked() {
  try {
    sessionStorage.setItem(PICKED_KEY, '1');
  } catch {}
}

/** Asks for a locked profile's PIN. Resolves true when the profile may be used. */
export async function unlockProfile(profile) {
  if (!profile.pin_enabled) return true;
  const pin = await promptDialog({ title: `PIN for ${profileName(profile)}`, label: 'PIN', kind: 'password', confirmLabel: 'Unlock' });
  if (!pin) return false;
  try {
    const result = await verifyProfilePin(profile.profile_index, pin);
    if (result.unlocked) return true;
    toast(result.message || (result.retryAfter ? `Too many tries. Wait ${result.retryAfter}s.` : 'Wrong PIN'), { kind: 'error' });
  } catch (error) {
    toast(`Couldn't check the PIN: ${error.message}`, { kind: 'error' });
  }
  return false;
}

/** Shows the profile picker. Resolves with the chosen profile's index. */
export function whoIsWatching() {
  return new Promise((resolve) => {
    let popScope = null;
    let busy = false;
    let exitArmedAt = 0;
    const grid = h('div', { class: 'profile-grid' });
    const el = h('div', { class: 'profile-picker' },
      img('assets/wordmark.png', { class: 'profile-wordmark', alt: 'Nuvio', loading: 'eager' }),
      h('h1', null, 'Who\'s watching?'),
      grid,
      h('p', { class: 'settings-hint' }, 'Turn this off in Settings → Account.'));

    const finish = (index) => {
      rememberProfilePicked();
      if (popScope) popScope();
      el.classList.remove('show');
      setTimeout(() => el.remove(), 250);
      resolve(index);
    };

    async function pick(profile) {
      if (busy) return;
      busy = true;
      try {
        if (await unlockProfile(profile)) finish(profile.profile_index);
      } finally {
        busy = false;
      }
    }

    function render(profiles) {
      const focused = focus.current && grid.contains(focus.current) ? focus.current.dataset.profile : String(activeProfileIndex());
      clear(grid);
      for (const profile of profiles) {
        grid.appendChild(h('button', {
          class: 'profile-tile focusable',
          type: 'button',
          dataset: { profile: String(profile.profile_index) },
          onClick: () => pick(profile),
        },
        profileAvatar(profile),
        h('span', { class: 'profile-name' }, profileName(profile)),
        profile.pin_enabled ? h('span', { class: 'profile-lock' }, icon('lock'), 'PIN') : null));
      }
      return grid.querySelector(`[data-profile="${focused}"]`) || grid.firstChild;
    }

    const initial = render(cachedProfiles());
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    popScope = focus.pushScope(el, {
      initial,
      onBack: () => {
        // Like Home: a second press leaves the app.
        if (bridge.native) {
          if (Date.now() - exitArmedAt < 2500) bridge.send('app.exit');
          else {
            exitArmedAt = Date.now();
            toast('Press back again to exit');
          }
        }
        return true;
      },
    });

    // Names, colours and locks may have changed on another device.
    pullProfiles().then((fresh) => {
      if (!el.isConnected || busy || !fresh.length) return;
      const again = render(fresh);
      if (again) focus.set(again);
    }).catch(() => {});
  });
}
