import { Router, type Request, type Response } from 'express';
import { db } from '../db/index.js';
import type { RadarSubscription, FleetMatch, RadarSubscriptionCreateInput, Fleet, User } from '../../shared/index.js';

const router = Router();

interface SubscriptionRow {
  id: string;
  user_id: string;
  script_name: string;
  city: string;
  notify_browser: number;
  notify_site: number;
  created_at: string;
}

interface MatchRow {
  id: string;
  subscription_id: string;
  fleet_id: string;
  is_read: number;
  matched_at: string;
}

interface FleetRow {
  id: string;
  script_name: string;
  is_city_limited: number;
  script_type: string;
  atmosphere: string;
  city: string;
  district: string;
  location: string;
  start_time: string;
  total_players: number;
  current_players: number;
  host_id: string;
  roles: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface UserRow {
  id: string;
  nickname: string;
  avatar: string;
  reputation: number;
  hosted_count: number;
  ghost_count: number;
  play_styles: string;
  created_at: string;
}

interface ReviewRow {
  id: string;
  from_user_id: string;
  to_user_id: string;
  fleet_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

function mapUserRow(row: UserRow, reviews: ReviewRow[]): User {
  const userReviews = reviews
    .filter((r) => r.to_user_id === row.id)
    .map((r) => {
      const fromUser = db.prepare('SELECT nickname, avatar FROM users WHERE id = ?').get(r.from_user_id) as { nickname: string; avatar: string } | undefined;
      const fleet = db.prepare('SELECT script_name FROM fleets WHERE id = ?').get(r.fleet_id) as { script_name: string } | undefined;
      return {
        id: r.id,
        fromUserId: r.from_user_id,
        fromUserName: fromUser?.nickname || '',
        fromUserAvatar: fromUser?.avatar || '',
        rating: r.rating,
        comment: r.comment,
        fleetId: r.fleet_id,
        fleetName: fleet?.script_name || '',
        createdAt: r.created_at,
      };
    });

  return {
    id: row.id,
    nickname: row.nickname,
    avatar: row.avatar,
    reputation: row.reputation,
    hostedCount: row.hosted_count,
    ghostCount: row.ghost_count,
    playStyles: JSON.parse(row.play_styles || '[]'),
    reviews: userReviews,
  };
}

function mapFleetRow(row: FleetRow, host: User): Fleet {
  return {
    id: row.id,
    scriptName: row.script_name,
    isCityLimited: row.is_city_limited === 1,
    scriptType: row.script_type,
    atmosphere: row.atmosphere,
    city: row.city,
    district: row.district,
    location: row.location,
    startTime: row.start_time,
    totalPlayers: row.total_players,
    currentPlayers: row.current_players,
    hostId: row.host_id,
    host,
    roles: JSON.parse(row.roles || '[]'),
    status: row.status as Fleet['status'],
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapSubscriptionRow(row: SubscriptionRow): RadarSubscription {
  return {
    id: row.id,
    userId: row.user_id,
    scriptName: row.script_name,
    city: row.city,
    notifyBrowser: row.notify_browser === 1,
    notifySite: row.notify_site === 1,
    createdAt: row.created_at,
  };
}

function parseFleetTime(timeStr: string): Date {
  const isoMatch = timeStr.match(/^\d{4}-\d{2}-\d{2}T/);
  if (isoMatch) return new Date(timeStr);
  const parts = timeStr.split(/[- :]/);
  if (parts.length >= 5) {
    return new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
      parseInt(parts[3]),
      parseInt(parts[4])
    );
  }
  return new Date(timeStr);
}

function isFleetInFuture(fleet: FleetRow): boolean {
  const fleetDate = parseFleetTime(fleet.start_time);
  const now = new Date();
  return fleetDate > now;
}

function checkAndCreateMatches() {
  const subscriptions = db.prepare('SELECT * FROM radar_subscriptions').all() as SubscriptionRow[];
  const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];

  for (const sub of subscriptions) {
    const fleets = db.prepare(
      "SELECT * FROM fleets WHERE city = ? AND script_name = ? AND status = 'recruiting'"
    ).all(sub.city, sub.script_name) as FleetRow[];

    for (const fleet of fleets) {
      if (!isFleetInFuture(fleet)) continue;

      const existingMatch = db.prepare(
        'SELECT * FROM fleet_matches WHERE subscription_id = ? AND fleet_id = ?'
      ).get(sub.id, fleet.id);

      if (!existingMatch) {
        const matchId = `m${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.prepare(
          'INSERT INTO fleet_matches (id, subscription_id, fleet_id, is_read, matched_at) VALUES (?, ?, ?, 0, ?)'
        ).run(matchId, sub.id, fleet.id, new Date().toISOString());
      }
    }
  }
}

router.get('/subscriptions', (req: Request, res: Response): void => {
  try {
    const rows = db.prepare('SELECT * FROM radar_subscriptions ORDER BY created_at DESC').all() as SubscriptionRow[];
    const subscriptions: RadarSubscription[] = rows.map(mapSubscriptionRow);
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
  }
});

router.post('/subscriptions', (req: Request, res: Response): void => {
  const input = req.body as RadarSubscriptionCreateInput;

  if (!input.userId || !input.scriptName || !input.city) {
    res.status(400).json({ success: false, error: 'Missing required fields' });
    return;
  }

  try {
    const id = `s${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO radar_subscriptions (id, user_id, script_name, city, notify_browser, notify_site, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      input.userId,
      input.scriptName,
      input.city,
      input.notifyBrowser ? 1 : 0,
      input.notifySite ? 1 : 0,
      createdAt
    );

    checkAndCreateMatches();

    const row = db.prepare('SELECT * FROM radar_subscriptions WHERE id = ?').get(id) as SubscriptionRow;
    const subscription = mapSubscriptionRow(row);

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to create subscription' });
  }
});

router.delete('/subscriptions/:id', (req: Request, res: Response): void => {
  const { id } = req.params;

  try {
    const subscription = db.prepare('SELECT * FROM radar_subscriptions WHERE id = ?').get(id);
    if (!subscription) {
      res.status(404).json({ success: false, error: 'Subscription not found' });
      return;
    }

    db.prepare('DELETE FROM fleet_matches WHERE subscription_id = ?').run(id);
    db.prepare('DELETE FROM radar_subscriptions WHERE id = ?').run(id);

    res.json({ success: true, data: { success: true } });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to delete subscription' });
  }
});

router.get('/matches', (req: Request, res: Response): void => {
  try {
    checkAndCreateMatches();

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const matchRows = db.prepare('SELECT * FROM fleet_matches ORDER BY matched_at DESC').all() as MatchRow[];
    const subRows = db.prepare('SELECT * FROM radar_subscriptions').all() as SubscriptionRow[];
    const subMap = new Map(subRows.map((s) => [s.id, mapSubscriptionRow(s)]));

    const matches: FleetMatch[] = [];
    for (const row of matchRows) {
      const fleetRow = db.prepare('SELECT * FROM fleets WHERE id = ?').get(row.fleet_id) as FleetRow | undefined;
      if (!fleetRow || !isFleetInFuture(fleetRow)) continue;
      const hostRow = db.prepare('SELECT * FROM users WHERE id = ?').get(fleetRow.host_id) as UserRow;
      const host = mapUserRow(hostRow, reviewRows);
      const fleet = mapFleetRow(fleetRow, host);
      const subscription = subMap.get(row.subscription_id);
      matches.push({
        id: row.id,
        subscriptionId: row.subscription_id,
        subscription,
        fleet,
        matchedAt: row.matched_at,
        isRead: row.is_read === 1,
      });
    }

    res.json({ success: true, data: matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch matches' });
  }
});

router.put('/matches/:id/read', (req: Request, res: Response): void => {
  const { id } = req.params;

  try {
    const match = db.prepare('SELECT * FROM fleet_matches WHERE id = ?').get(id);
    if (!match) {
      res.status(404).json({ success: false, error: 'Match not found' });
      return;
    }

    db.prepare('UPDATE fleet_matches SET is_read = 1 WHERE id = ?').run(id);

    res.json({ success: true, data: { success: true } });
  } catch (error) {
    console.error('Error marking match as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark match as read' });
  }
});

export default router;
