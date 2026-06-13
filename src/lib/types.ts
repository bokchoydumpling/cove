export type Profession =
  | "Software Engineer"
  | "Designer"
  | "Marketer"
  | "Founder"
  | "Artist"
  | "Musician"
  | "Photographer"
  | "Student"
  | "Nonprofit"
  | "Writer"
  | "Food Creator"
  | "Fitness";

export type Interest =
  | "AI"
  | "Startups"
  | "Coffee"
  | "Fitness"
  | "Books"
  | "Fashion"
  | "Photography"
  | "Music"
  | "Volunteering"
  | "Hiking"
  | "Food"
  | "Local Events"
  | "Art"
  | "Film"
  | "Sustainability"
  | "Gaming"
  | "Travel"
  | "Cooking"
  | "Design";

export type LookingFor =
  | "Friends"
  | "Collaborators"
  | "Community"
  | "Creative Feedback"
  | "Mentorship"
  | "Coffee Chats"
  | "Project Partners";

export type Availability =
  | "Open to Meet"
  | "Open to Chat"
  | "Attending Events"
  | "Exploring"
  | "Just Browsing";

export type VisibilityState =
  | "Visible to Everyone"
  | "Friends Only"
  | "Event Only"
  | "Hidden";

export type VouchType =
  | "Met IRL"
  | "Great Collaborator"
  | "Community Builder"
  | "Creative Inspiration";

export type ShowcaseCategory =
  | "Software"
  | "Photography"
  | "Art"
  | "Music"
  | "Nonprofit"
  | "Marketing"
  | "Writing"
  | "Design"
  | "Food"
  | "Fitness";

export type ShowcaseReaction = "collab" | "inspired" | "feedback";

export type BadgeType =
  | "first_event_hosted"
  | "connector"
  | "hundred_days"
  | "circle_founder"
  | "vouched_ten"
  | "seven_day_streak"
  | "thirty_day_streak"
  | "hundred_day_streak"
  | "community_pillar"
  | "early_member"
  | "showcase_star";

export type ForumPostCategory = "Question" | "Discussion" | "Resource" | "Event";

export type EventCategory =
  | "Coffee Chat"
  | "Meetup"
  | "Workshop"
  | "Volunteer"
  | "Hike"
  | "Coworking"
  | "Happy Hour"
  | "Dinner"
  | "Talk"
  | "Social";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NeighborhoodZone {
  id: string;
  name: string;
  city: string;
  center: Coordinates;
}

export interface Vouch {
  id: string;
  giverId: string;
  giverName: string;
  giverAvatar: string;
  type: VouchType;
  note?: string;
  createdAt: string;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  category: ShowcaseCategory;
  coverImage: string;
  description: string;
  link?: string;
  reactions: {
    collab: number;
    inspired: number;
    feedback: number;
  };
  createdAt: string;
}

export interface Badge {
  type: BadgeType;
  earnedAt: string;
  label: string;
  emoji: string;
}

export interface CommunityScore {
  builder: number;
  connector: number;
  neighbor: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  profession: Profession;
  neighborhood: string;
  city: string;
  bio: string;
  personalityPrompt: string;
  currentlyInto: string;
  currentlyIntoUpdatedAt: string;
  interests: Interest[];
  lookingFor: LookingFor[];
  availability: Availability;
  coordinates: Coordinates;
  visibilityState: VisibilityState;
  communityScore: CommunityScore;
  badges: Badge[];
  streakCount: number;
  lastActive: string;
  showcaseItems: ShowcaseItem[];
  vouches: Vouch[];
  circleIds: string[];
  eventIds: string[];
  joinedAt: string;
  isCurrentUser?: boolean;
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  upvotes: number;
  createdAt: string;
  replies?: ForumReply[];
}

export interface ForumPost {
  id: string;
  circleId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  body: string;
  category: ForumPostCategory;
  upvotes: number;
  replies: ForumReply[];
  createdAt: string;
  isPinned?: boolean;
}

export interface CircleMember {
  userId: string;
  role: "admin" | "moderator" | "member";
  joinedAt: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  emoji: string;
  category: string;
  memberCount: number;
  members: CircleMember[];
  posts: ForumPost[];
  neighborhood: string;
  city: string;
  createdAt: string;
  isPublic: boolean;
  tags: string[];
}

export interface EventAttendee {
  userId: string;
  name: string;
  avatar: string;
  rsvpAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: EventCategory;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  date: string;
  time: string;
  endTime?: string;
  neighborhood: string;
  address: string;
  city: string;
  maxAttendees?: number;
  attendees: EventAttendee[];
  circleId?: string;
  coordinates: Coordinates;
  createdAt: string;
  tags: string[];
  isFeatured?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  type: "direct" | "circle" | "event";
  name: string;
  avatar?: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface ActivityItem {
  id: string;
  type:
    | "new_neighbor"
    | "new_showcase"
    | "new_event"
    | "new_circle"
    | "currently_into"
    | "vouch"
    | "streak_milestone"
    | "event_rsvp";
  actorId: string;
  actorName: string;
  actorAvatar: string;
  content: string;
  targetId?: string;
  targetName?: string;
  createdAt: string;
}

export interface MapFilter {
  professions: Profession[];
  interests: Interest[];
  lookingFor: LookingFor[];
  availability: Availability[];
  distance: string;
}
