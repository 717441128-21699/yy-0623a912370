export interface User {
  id: string;
  nickname: string;
  avatar: string;
  reputation: number;
  hostedCount: number;
  ghostCount: number;
  playStyles: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  rating: number;
  comment: string;
  fleetId: string;
  fleetName: string;
  createdAt: string;
}

export interface Fleet {
  id: string;
  scriptName: string;
  isCityLimited: boolean;
  scriptType: string;
  atmosphere: string;
  city: string;
  district: string;
  location: string;
  startTime: string;
  totalPlayers: number;
  currentPlayers: number;
  hostId: string;
  host: User;
  roles: string[];
  status: 'recruiting' | 'full' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  fleetId: string;
  userId: string;
  user?: User;
  preferredRoles: string[];
  redFlags: string[];
  acceptableEndTime: string;
  willingToWaitlist: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  createdAt: string;
}

export interface RadarSubscription {
  id: string;
  userId: string;
  scriptName: string;
  city: string;
  notifyBrowser: boolean;
  notifySite: boolean;
  createdAt: string;
}

export interface FleetMatch {
  id: string;
  subscriptionId: string;
  subscription?: RadarSubscription;
  fleet: Fleet;
  matchedAt: string;
  isRead: boolean;
}

export interface FleetCreateInput {
  scriptName: string;
  isCityLimited: boolean;
  scriptType: string;
  atmosphere: string;
  city: string;
  district: string;
  location: string;
  startTime: string;
  totalPlayers: number;
  roles: string[];
  notes?: string;
  hostId: string;
}

export interface ApplicationCreateInput {
  fleetId: string;
  userId: string;
  preferredRoles: string[];
  redFlags: string[];
  acceptableEndTime: string;
  willingToWaitlist: boolean;
}

export interface RadarSubscriptionCreateInput {
  userId: string;
  scriptName: string;
  city: string;
  notifyBrowser: boolean;
  notifySite: boolean;
}

export const SCRIPT_TYPES = [
  '硬核推理',
  '情感沉浸',
  '恐怖惊悚',
  '欢乐撕逼',
  '机制阵营',
  '古风',
  '本格',
  '变格',
] as const;

export const ATMOSPHERE_TYPES = [
  '硬核推理',
  '情感沉浸',
  '恐怖惊悚',
  '欢乐撕逼',
  '机制阵营',
  '轻松休闲',
] as const;

export const RED_FLAGS = [
  '反串',
  '恐怖',
  '情感',
  '喝酒',
  '熬夜',
  '长时间',
  '密室',
  '单人搜证',
] as const;

export const CITIES = [
  '上海',
  '北京',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '南京',
  '武汉',
  '重庆',
  '西安',
] as const;

export const DISTRICTS: Record<string, string[]> = {
  '上海': ['静安区', '徐汇区', '黄浦区', '长宁区', '浦东新区', '虹口区'],
  '北京': ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区'],
  '广州': ['天河区', '越秀区', '海珠区', '番禺区', '白云区'],
  '深圳': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
  '杭州': ['西湖区', '上城区', '拱墅区', '滨江区', '余杭区'],
  '成都': ['锦江区', '青羊区', '武侯区', '高新区', '成华区'],
  '南京': ['鼓楼区', '秦淮区', '建邺区', '玄武区', '栖霞区'],
  '武汉': ['江汉区', '武昌区', '洪山区', '江岸区', '硚口区'],
  '重庆': ['渝中区', '江北区', '南岸区', '九龙坡区', '沙坪坝区'],
  '西安': ['碑林区', '雁塔区', '莲湖区', '新城区', '未央区'],
};
