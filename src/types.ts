export interface ActionItem {
  task: string;
  owner: string;
  deadline: string;
  priority: "low" | "medium" | "high";
}

export interface MeetingAnalysis {
  summary: string;
  key_points: string[];
  action_items: ActionItem[];
  follow_up_email: string;
  sentiment: string;
  meeting_topics: string[];
}

export interface EmailAnalysis {
  subject: string;
  body: string;
}
