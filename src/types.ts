export interface Project {
  id: number;
  createdAt: Date | null;
  userFid: string;
  ethAddress: string;
  ecosystem: string;
  projectName: string;
  websiteUrl: string | null;
  twitterUrl: string | null;
  githubUrl: string | null;
  logoUrl: string | null;
  projectUid?: string | null | undefined;
}

export interface Contribution {
  id?: number;
  userFid: string;
  projectName: string;
  contribution: string;
  ecosystem: string;
  desc: string;
  link: string;
  easUid?: string | null | undefined;
  ethAddress?: string;
  createdAt?: Date | null;
}

export interface NewProject {
  userFid: string;
  ethAddress: string;
  projectName: string;
  websiteUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  id?: number;
  ecosystem: string;
  projectUid?: string | null | undefined;
  logoUrl?: string;
  createdAt?: Date;
}

export interface NewContribution {
  id: number;
  userFid: string;
  projectName: string;
  contribution: string;
  desc: string;
  link: string;
  ecosystem: string;
  easUid?: string;
  ethAddress: string;
  createdAt: Date;
}

export interface NewUser {
  fid: string;
  username: string;
  ethaddress?: string;
  id?: number;
  createdAt?: Date;
}

export type User = {
  id: number;
  fid: string;
  username: string;
  ethaddress: string | null;
  createdAt: Date | null;
};

export interface NewContributionAttestation {
  id: number;
  userFid: string;
  projectName: string;
  contribution: string;
  ecosystem: string;
  attestationUID: string;
  attesterAddy: string;
  attestationType: string;
  feedback: string | null;
  createdAt: Date;
}

export interface ContributionAttestation {
  id: number;
  userFid: string;
  projectName: string | undefined;
  contribution: string;
  ecosystem: string | undefined;
  attestationUID: string;
  attesterAddy: string;
  attestationType: string;
  feedback: string | null;
  createdAt: Date;
}

export type Attestation = {
  id: number;
  userFid: string;
  projectName: string;
  contribution: string;
  ecosystem: string;
  attestationUID: string;
  attesterAddy: string;
  attestationType: string;
  feedback: string | null;
  createdAt: Date | null;
};
