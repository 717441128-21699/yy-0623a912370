import { Router, type Request, type Response } from 'express';
import { db } from '../db/index.js';
import type { Application, ApplicationCreateInput, User } from '../../shared/index.js';

const router = Router();

interface ApplicationRow {
  id: string;
  fleet_id: string;
  user_id: string;
  preferred_roles: string;
  red_flags: string;
  acceptable_end_time: string;
  willing_to_waitlist: number;
  status: string;
  status_timeline: string;
  viewed_at: string | null;
  applicant_note: string;
  host_note: string;
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

interface TimelineEntry {
  status: string;
  timestamp: string;
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

function mapApplicationRow(row: ApplicationRow, user?: User): Application {
  return {
    id: row.id,
    fleetId: row.fleet_id,
    userId: row.user_id,
    user,
    preferredRoles: JSON.parse(row.preferred_roles || '[]'),
    redFlags: JSON.parse(row.red_flags || '[]'),
    acceptableEndTime: row.acceptable_end_time,
    willingToWaitlist: row.willing_to_waitlist === 1,
    status: row.status as Application['status'],
    statusTimeline: JSON.parse(row.status_timeline || '[]'),
    viewedAt: row.viewed_at,
    applicantNote: row.applicant_note || '',
    hostNote: row.host_note || '',
    createdAt: row.created_at,
  };
}

router.post('/:fleetId/applications', (req: Request, res: Response): void => {
  const { fleetId } = req.params;
  const input = req.body as ApplicationCreateInput;

  if (!input.userId || !input.acceptableEndTime) {
    res.status(400).json({ success: false, error: 'Missing required fields' });
    return;
  }

  try {
    const fleet = db.prepare('SELECT * FROM fleets WHERE id = ?').get(fleetId);
    if (!fleet) {
      res.status(404).json({ success: false, error: 'Fleet not found' });
      return;
    }

    const existing = db.prepare('SELECT id FROM applications WHERE fleet_id = ? AND user_id = ?').get(fleetId, input.userId);
    if (existing) {
      res.status(409).json({ success: false, error: 'Already applied' });
      return;
    }

    const id = `a${Date.now()}`;
    const createdAt = new Date().toISOString();
    const timeline: TimelineEntry[] = [{ status: 'pending', timestamp: createdAt }];

    db.prepare(
      `INSERT INTO applications (id, fleet_id, user_id, preferred_roles, red_flags, acceptable_end_time, willing_to_waitlist, status, status_timeline, viewed_at, applicant_note, host_note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, '', ?)`
    ).run(
      id,
      fleetId,
      input.userId,
      JSON.stringify(input.preferredRoles || []),
      JSON.stringify(input.redFlags || []),
      input.acceptableEndTime,
      input.willingToWaitlist ? 1 : 0,
      'pending',
      JSON.stringify(timeline),
      input.applicantNote || '',
      createdAt
    );

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const applicationRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow;
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(input.userId) as UserRow;
    const user = mapUserRow(userRow, reviewRows);
    const application = mapApplicationRow(applicationRow, user);

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ success: false, error: 'Failed to create application' });
  }
});

router.get('/:fleetId/applications', (req: Request, res: Response): void => {
  const { fleetId } = req.params;

  try {
    const fleet = db.prepare('SELECT * FROM fleets WHERE id = ?').get(fleetId);
    if (!fleet) {
      res.status(404).json({ success: false, error: 'Fleet not found' });
      return;
    }

    const applicationRows = db.prepare('SELECT * FROM applications WHERE fleet_id = ? ORDER BY created_at DESC').all(fleetId) as ApplicationRow[];
    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];

    const applications: Application[] = applicationRows.map((row) => {
      const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id) as UserRow;
      const user = mapUserRow(userRow, reviewRows);
      return mapApplicationRow(row, user);
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

router.put('/:id/view', (req: Request, res: Response): void => {
  const { id } = req.params;

  try {
    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow | undefined;
    if (!application) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    if (!application.viewed_at) {
      const now = new Date().toISOString();
      db.prepare('UPDATE applications SET viewed_at = ? WHERE id = ?').run(now, id);
    }

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const applicationRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow;
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(applicationRow.user_id) as UserRow;
    const user = mapUserRow(userRow, reviewRows);
    const updatedApplication = mapApplicationRow(applicationRow, user);

    res.json({ success: true, data: updatedApplication });
  } catch (error) {
    console.error('Error marking application as viewed:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as viewed' });
  }
});

router.put('/:id/status', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, hostNote } = req.body as { status: string; hostNote?: string };

  if (!status || !['pending', 'approved', 'rejected', 'waitlisted'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status' });
    return;
  }

  try {
    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow | undefined;
    if (!application) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    const now = new Date().toISOString();
    const timeline: TimelineEntry[] = JSON.parse(application.status_timeline || '[]');
    timeline.push({ status, timestamp: now });

    const noteUpdate = hostNote !== undefined ? ', host_note = ?' : '';
    const noteParams = hostNote !== undefined ? [hostNote] : [];

    db.prepare(
      `UPDATE applications SET status = ?, status_timeline = ?${noteUpdate} WHERE id = ?`
    ).run(...[status, JSON.stringify(timeline), ...noteParams, id] as never[]);

    if (status === 'approved') {
      db.prepare('UPDATE fleets SET current_players = current_players + 1 WHERE id = ?').run(application.fleet_id);
      db.prepare("UPDATE fleets SET status = 'full' WHERE id = ? AND current_players >= total_players").run(application.fleet_id);
    }

    if (status === 'rejected' && application.status === 'approved') {
      db.prepare('UPDATE fleets SET current_players = MAX(1, current_players - 1) WHERE id = ?').run(application.fleet_id);
      db.prepare("UPDATE fleets SET status = 'recruiting' WHERE id = ? AND current_players < total_players").run(application.fleet_id);
    }

    if (!application.viewed_at) {
      db.prepare('UPDATE applications SET viewed_at = ? WHERE id = ?').run(now, id);
    }

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const applicationRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow;
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(applicationRow.user_id) as UserRow;
    const user = mapUserRow(userRow, reviewRows);
    const updatedApplication = mapApplicationRow(applicationRow, user);

    res.json({ success: true, data: updatedApplication });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, error: 'Failed to update application status' });
  }
});

router.put('/:id/host-note', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { hostNote } = req.body as { hostNote: string };

  try {
    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow | undefined;
    if (!application) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    db.prepare('UPDATE applications SET host_note = ? WHERE id = ?').run(hostNote || '', id);

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const applicationRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow;
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(applicationRow.user_id) as UserRow;
    const user = mapUserRow(userRow, reviewRows);
    const updatedApplication = mapApplicationRow(applicationRow, user);

    res.json({ success: true, data: updatedApplication });
  } catch (error) {
    console.error('Error updating host note:', error);
    res.status(500).json({ success: false, error: 'Failed to update host note' });
  }
});

router.post('/host/:hostId/mark-viewed', (req: Request, res: Response): void => {
  const { hostId } = req.params;
  const { fleetId } = req.body as { fleetId?: string };

  try {
    const now = new Date().toISOString();
    if (fleetId) {
      db.prepare(
        "UPDATE applications SET viewed_at = ? WHERE fleet_id = ? AND viewed_at IS NULL AND user_id IN (SELECT id FROM applications WHERE fleet_id = ?)"
      ).run(now, fleetId, fleetId);
      db.prepare(
        "UPDATE applications SET viewed_at = ? WHERE fleet_id = ? AND viewed_at IS NULL"
      ).run(now, fleetId);
    } else {
      const fleetRows = db.prepare('SELECT id FROM fleets WHERE host_id = ?').all(hostId) as { id: string }[];
      for (const fleet of fleetRows) {
        db.prepare(
          "UPDATE applications SET viewed_at = ? WHERE fleet_id = ? AND viewed_at IS NULL"
        ).run(now, fleet.id);
      }
    }

    res.json({ success: true, data: { updated: true } });
  } catch (error) {
    console.error('Error marking applications as viewed:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as viewed' });
  }
});

router.get('/host/:hostId', (req: Request, res: Response): void => {
  const { hostId } = req.params;

  try {
    const fleetRows = db.prepare('SELECT id, script_name, status, current_players, total_players FROM fleets WHERE host_id = ? ORDER BY created_at DESC').all(hostId) as { id: string; script_name: string; status: string; current_players: number; total_players: number }[];

    const result = fleetRows.map((fleet) => {
      const appRows = db.prepare('SELECT * FROM applications WHERE fleet_id = ? ORDER BY created_at DESC').all(fleet.id) as ApplicationRow[];
      const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];

      const applications = appRows.map((row) => {
        const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id) as UserRow;
        const user = mapUserRow(userRow, reviewRows);
        return mapApplicationRow(row, user);
      });

      return {
        fleetId: fleet.id,
        scriptName: fleet.script_name,
        fleetStatus: fleet.status,
        currentPlayers: fleet.current_players,
        totalPlayers: fleet.total_players,
        applications,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching host applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch host applications' });
  }
});

export default router;
