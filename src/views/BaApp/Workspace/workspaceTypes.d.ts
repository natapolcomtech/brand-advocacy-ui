interface Team {
    id: number;
    name: string;
    is_active: number;
    is_delete: number;
    is_default: boolean | null;
  }
  
  interface TeamBrandAdvocacy {
    id: number;
    team_id: number;
    brand_advocacy_id: number;
    is_active: number;
    is_delete: number;
    team: Team;
  }
  
  interface BrandAdvocacy {
    id: number;
    candidate_id: number;
    candidate_review_id: number;
    point: number;
    buzzebees_ref_id: number;
    is_active: number;
    is_delete: number;
    is_review: number;
    teamBrandAdvocacy: TeamBrandAdvocacy[];
  }
  
  interface Child {
    id: number;
    candidate_id: number;
    nickname: string;
    firstname: string;
    lastname: string;
    gender: string;
    birthdate: string;
    is_active: number;
    is_delete: number;
  }
  
  interface Brand {
    id: number;
    name: string;
    is_active: number;
    is_delete: number;
  }
  
  interface Formula {
    id: number;
    name: string;
    description: string | null;
    brand_id: number;
    is_active: number;
    is_delete: number;
    brand: Brand;
  }
  
  interface CandidateFormula {
    id: number;
    candidate_id: number;
    formula_id: number;
    is_active: number;
    is_delete: number;
    formula: Formula;
  }
  
export  interface Candidate {
    id: number;
    nickname: string;
    firstname: string;
    lastname: string;
    gender: string;
    email: string;
    facebook: string;
    telephone: string;
    line: string;
    birthdate: string;
    address: string | null;
    is_contactable_telephone: number;
    is_contactable_sms: number;
    occupation: string;
    is_active: number;
    is_delete: number;
    is_review: number;
    latest_review_date: string;
    picked_by: number;
    brandAdvocacys: BrandAdvocacy[];
    childrens: Child[];
    candidateReviews: any[]; // Define appropriately if structure is known
    candidateFormulas: CandidateFormula[];
  }