import { db } from './index.js';

export function initMockData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Mock data already exists, skipping initialization');
    return;
  }

  const users = [
    { id: 'current-user', nickname: '匿名玩家', avatar: '🎭', reputation: 100, hosted_count: 0, ghost_count: 0, play_styles: JSON.stringify([]) },
    { id: 'u1', nickname: '推理迷小王', avatar: '🕵️', reputation: 95, hosted_count: 12, ghost_count: 0, play_styles: JSON.stringify(['硬核推理', '本格']) },
    { id: 'u2', nickname: '情感水龙头', avatar: '🎭', reputation: 88, hosted_count: 8, ghost_count: 1, play_styles: JSON.stringify(['情感沉浸', '古风']) },
    { id: 'u3', nickname: '恐怖坦克', avatar: '👻', reputation: 92, hosted_count: 15, ghost_count: 0, play_styles: JSON.stringify(['恐怖惊悚', '变格']) },
    { id: 'u4', nickname: '欢乐喜剧人', avatar: '🎪', reputation: 90, hosted_count: 6, ghost_count: 2, play_styles: JSON.stringify(['欢乐撕逼', '机制']) },
    { id: 'u5', nickname: '剧本杀老炮', avatar: '🎩', reputation: 98, hosted_count: 30, ghost_count: 0, play_styles: JSON.stringify(['硬核推理', '机制阵营']) },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (id, nickname, avatar, reputation, hosted_count, ghost_count, play_styles) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const userTransaction = db.transaction((userList: typeof users) => {
    for (const user of userList) {
      insertUser.run(user.id, user.nickname, user.avatar, user.reputation, user.hosted_count, user.ghost_count, user.play_styles);
    }
  });

  userTransaction(users);
  console.log(`Inserted ${users.length} users`);

  const fleets = [
    { id: 'f0_old', script_name: '《过期旧车》', is_city_limited: 0, script_type: '硬核推理', atmosphere: '硬核推理', city: '上海', district: '静安区', location: '过期测试点', start_time: '2026-06-15 19:00', total_players: 6, current_players: 3, host_id: 'u1', roles: JSON.stringify(['角色A', '角色B', '角色C', '角色D', '角色E', '角色F']), status: 'recruiting', notes: '过期车辆，用于测试雷达不匹配' },
    { id: 'f1', script_name: '《持斧奥夫》', is_city_limited: 1, script_type: '硬核推理', atmosphere: '硬核推理', city: '上海', district: '静安区', location: '南京西路某店', start_time: '2026-06-21 19:00', total_players: 6, current_players: 4, host_id: 'u1', roles: JSON.stringify(['角色A', '角色B', '角色C', '角色D', '角色E', '角色F']), status: 'recruiting', notes: '硬核本，需要有推理基础的玩家' },
    { id: 'f2', script_name: '《苍岐》', is_city_limited: 1, script_type: '情感沉浸', atmosphere: '情感沉浸', city: '上海', district: '徐汇区', location: '徐家汇某店', start_time: '2026-06-22 14:00', total_players: 6, current_players: 3, host_id: 'u2', roles: JSON.stringify(['角色1', '角色2', '角色3', '角色4', '角色5', '角色6']), status: 'recruiting', notes: '古风情感本，备好纸巾' },
    { id: 'f3', script_name: '《青山》', is_city_limited: 0, script_type: '恐怖惊悚', atmosphere: '恐怖惊悚', city: '北京', district: '朝阳区', location: '三里屯某店', start_time: '2026-06-21 20:00', total_players: 6, current_players: 5, host_id: 'u3', roles: JSON.stringify(['角色A', '角色B', '角色C', '角色D', '角色E', '角色F']), status: 'recruiting', notes: '有单人搜证，胆小勿入' },
    { id: 'f4', script_name: '《搞钱》', is_city_limited: 0, script_type: '欢乐撕逼', atmosphere: '欢乐撕逼', city: '上海', district: '黄浦区', location: '人民广场某店', start_time: '2026-06-27 18:30', total_players: 8, current_players: 5, host_id: 'u4', roles: JSON.stringify(['角色1', '角色2', '角色3', '角色4', '角色5', '角色6', '角色7', '角色8']), status: 'recruiting', notes: '欢乐机制本，适合新手' },
    { id: 'f5', script_name: '《七月的少年》', is_city_limited: 1, script_type: '硬核推理', atmosphere: '硬核推理', city: '深圳', district: '南山区', location: '科技园某店', start_time: '2026-06-28 13:00', total_players: 6, current_players: 2, host_id: 'u5', roles: JSON.stringify(['角色A', '角色B', '角色C', '角色D', '角色E', '角色F']), status: 'recruiting', notes: '硬核天花板，时长较长' },
    { id: 'f6', script_name: '《无间冬夏》', is_city_limited: 1, script_type: '情感沉浸', atmosphere: '情感沉浸', city: '广州', district: '天河区', location: '珠江新城某店', start_time: '2026-06-22 19:30', total_players: 6, current_players: 4, host_id: 'u2', roles: JSON.stringify(['角色1', '角色2', '角色3', '角色4', '角色5', '角色6']), status: 'recruiting', notes: '现代情感本，立意深刻' },
  ];

  const insertFleet = db.prepare(
    'INSERT INTO fleets (id, script_name, is_city_limited, script_type, atmosphere, city, district, location, start_time, total_players, current_players, host_id, roles, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const fleetTransaction = db.transaction((fleetList: typeof fleets) => {
    for (const fleet of fleetList) {
      insertFleet.run(
        fleet.id, fleet.script_name, fleet.is_city_limited, fleet.script_type, fleet.atmosphere,
        fleet.city, fleet.district, fleet.location, fleet.start_time, fleet.total_players,
        fleet.current_players, fleet.host_id, fleet.roles, fleet.status, fleet.notes
      );
    }
  });

  fleetTransaction(fleets);
  console.log(`Inserted ${fleets.length} fleets`);

  const reviews = [
    { id: 'r1', from_user_id: 'u2', to_user_id: 'u1', fleet_id: 'f1', rating: 5, comment: '节奏把控很好，DM专业，体验超棒！' },
    { id: 'r2', from_user_id: 'u3', to_user_id: 'u1', fleet_id: 'f1', rating: 5, comment: '逻辑清晰，车友都很在线，硬核天花板' },
    { id: 'r3', from_user_id: 'u4', to_user_id: 'u2', fleet_id: 'f2', rating: 4, comment: '情感本首选，哭崩了，氛围营造到位' },
  ];

  const insertReview = db.prepare(
    'INSERT INTO reviews (id, from_user_id, to_user_id, fleet_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const reviewTransaction = db.transaction((reviewList: typeof reviews) => {
    for (const review of reviewList) {
      insertReview.run(review.id, review.from_user_id, review.to_user_id, review.fleet_id, review.rating, review.comment);
    }
  });

  reviewTransaction(reviews);
  console.log(`Inserted ${reviews.length} reviews`);

  const subscriptions = [
    { id: 's1', user_id: 'u1', script_name: '《持斧奥夫》', city: '上海', notify_browser: 1, notify_site: 1 },
    { id: 's2', user_id: 'u3', script_name: '《青山》', city: '北京', notify_browser: 1, notify_site: 1 },
  ];

  const insertSubscription = db.prepare(
    'INSERT INTO radar_subscriptions (id, user_id, script_name, city, notify_browser, notify_site) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const subscriptionTransaction = db.transaction((subList: typeof subscriptions) => {
    for (const sub of subList) {
      insertSubscription.run(sub.id, sub.user_id, sub.script_name, sub.city, sub.notify_browser, sub.notify_site);
    }
  });

  subscriptionTransaction(subscriptions);
  console.log(`Inserted ${subscriptions.length} radar subscriptions`);

  console.log('Mock data initialization complete');
}

export default initMockData;
