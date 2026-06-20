import { Router, type Request, type Response } from 'express';
import { db } from '../db/index.js';
import type { Fleet, User, FleetCreateInput } from '../../shared/index.js';

const router = Router();

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

router.get('/', (req: Request, res: Response): void => {
  const { city, district, type, time } = req.query;

  let sql = 'SELECT * FROM fleets WHERE status = ?';
  const params: (string | number)[] = ['recruiting'];

  if (city && typeof city === 'string' && city !== '全部') {
    sql += ' AND city = ?';
    params.push(city);
  }

  if (district && typeof district === 'string' && district !== '全部') {
    sql += ' AND district = ?';
    params.push(district);
  }

  if (type && typeof type === 'string' && type !== '全部') {
    sql += ' AND script_type = ?';
    params.push(type);
  }

  if (time && typeof time === 'string' && time !== '全部') {
    sql += ' AND start_time LIKE ?';
    params.push(`%${time}%`);
  }

  sql += ' ORDER BY start_time ASC';

  try {
    const fleetRows = db.prepare(sql).all(...params) as FleetRow[];
    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];

    const fleets: Fleet[] = fleetRows.map((row) => {
      const hostRow = db.prepare('SELECT * FROM users WHERE id = ?').get(row.host_id) as UserRow;
      const host = mapUserRow(hostRow, reviewRows);
      return mapFleetRow(row, host);
    });

    res.json({ success: true, data: fleets });
  } catch (error) {
    console.error('Error fetching fleets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch fleets' });
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;

  try {
    const fleetRow = db.prepare('SELECT * FROM fleets WHERE id = ?').get(id) as FleetRow | undefined;

    if (!fleetRow) {
      res.status(404).json({ success: false, error: 'Fleet not found' });
      return;
    }

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const hostRow = db.prepare('SELECT * FROM users WHERE id = ?').get(fleetRow.host_id) as UserRow;
    const host = mapUserRow(hostRow, reviewRows);
    const fleet = mapFleetRow(fleetRow, host);

    res.json({ success: true, data: fleet });
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch fleet' });
  }
});

router.post('/', (req: Request, res: Response): void => {
  const input = req.body as FleetCreateInput;

  if (!input.scriptName || !input.scriptType || !input.city || !input.startTime || !input.totalPlayers || !input.hostId) {
    res.status(400).json({ success: false, error: 'Missing required fields' });
    return;
  }

  try {
    const id = `f${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(
      `INSERT INTO fleets (id, script_name, is_city_limited, script_type, atmosphere, city, district, location, start_time, total_players, current_players, host_id, roles, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      input.scriptName,
      input.isCityLimited ? 1 : 0,
      input.scriptType,
      input.atmosphere || '',
      input.city,
      input.district || '',
      input.location || '',
      input.startTime,
      input.totalPlayers,
      1,
      input.hostId,
      JSON.stringify(input.roles || []),
      'recruiting',
      input.notes || '',
      createdAt
    );

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const fleetRow = db.prepare('SELECT * FROM fleets WHERE id = ?').get(id) as FleetRow;
    const hostRow = db.prepare('SELECT * FROM users WHERE id = ?').get(input.hostId) as UserRow;
    const host = mapUserRow(hostRow, reviewRows);
    const fleet = mapFleetRow(fleetRow, host);

    res.status(201).json({ success: true, data: fleet });
  } catch (error) {
    console.error('Error creating fleet:', error);
    res.status(500).json({ success: false, error: 'Failed to create fleet' });
  }
});

export default router;
