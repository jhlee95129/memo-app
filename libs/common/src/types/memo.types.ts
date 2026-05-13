export interface MemoResponse {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
