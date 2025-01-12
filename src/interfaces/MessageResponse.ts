export default interface MessageResponse {
  message: string;
  response?: any;
  error?: any;
}

export interface DependabotResponse {
  id: number;
  user_name: string;
  project_name: string;
  url: string;
  success: boolean;
}
