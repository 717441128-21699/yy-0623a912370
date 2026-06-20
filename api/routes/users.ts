import { Router, type Request, type Response } from 'express';
import { db } from '../db/index.js';
import type { User } from '../../shared/index.js';

const router = Router();

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

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;

  try {
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;

    if (!userRow) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const reviewRows = db.prepare('SELECT * FROM reviews').all() as ReviewRow[];
    const user = mapUserRow(userRow, reviewRows);

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

export default router;
