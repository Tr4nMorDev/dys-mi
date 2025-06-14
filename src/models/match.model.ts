import { PrismaClient, Match, MatchStatus } from "../generated/prisma/client";

const prisma = new PrismaClient();

type CreateMatchInput = {
  player1Id: number;
  player2Id?: number;
  status?: MatchStatus;
  matchedAt?: Date;
};

type UpdateMatchInput = Partial<CreateMatchInput>;

class MatchModel {
  // Tạo match mới
  async create(data: CreateMatchInput): Promise<Match> {
    return await prisma.match.create({ data });
  }

  // Tìm match theo ID
  async findById(id: number): Promise<Match | null> {
    return await prisma.match.findUnique({ where: { id } });
  }

  // Tìm match đang chờ của 1 player
  async findWaitingByPlayer(player1Id: number): Promise<Match | null> {
    return await prisma.match.findFirst({
      where: {
        player1Id,
        status: "waiting",
      },
    });
  }

  // Cập nhật match
  async update(id: number, data: UpdateMatchInput): Promise<Match> {
    return await prisma.match.update({
      where: { id },
      data,
    });
  }

  // Xoá match
  async delete(id: number): Promise<Match> {
    return await prisma.match.delete({
      where: { id },
    });
  }

  // Tìm tất cả match
  async findAll(): Promise<Match[]> {
    return await prisma.match.findMany();
  }
}

export default new MatchModel();
