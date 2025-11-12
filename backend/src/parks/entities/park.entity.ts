import { PackMember, PackStatus } from '@prisma/client';

export class Park {
  id: string;
  name: string;
  contribution: number;
  targetAmount: number;
  totalMembers: number;
  currentRound: number;
  status: PackStatus;
  members?: PackMember[];
  createdAt: Date;
}
